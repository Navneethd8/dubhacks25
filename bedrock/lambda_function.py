import boto3
import json
import re
from decimal import Decimal  # for DynamoDB numeric fields

# Initialize AWS clients
ddb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')
table = ddb.Table('NewsTable')


def extract_json(completion: str, fallback_location="Unknown") -> dict:
    """
    Extract the first valid JSON object from model output text.
    Handles comments, backticks, extra text.
    """
    # Remove common comment markers and backticks
    cleaned = re.sub(r'(```|```json|/\*|\*/)', '', completion, flags=re.MULTILINE).strip()

    # Search for first JSON object {...}
    match = re.search(r'\{.*?\}', cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # fallback if nothing works
    return {
        "location": fallback_location,
        "support_level": "Unknown",
        "confidence": 0.0,
        "priority_needs": [],
        "people_affected": 0
    }


def lambda_handler(event, context):
    """
    Triggered by DynamoDB stream events on NewsTable.
    When a new article is inserted or modified, analyze it using Bedrock (Meta Llama 3)
    and update the same table with disaster support classification.
    """
    print("📥 Received event:", json.dumps(event))

    if 'Records' not in event:
        print("⚠️ No Records found in event")
        return {"status": "no_records"}

    for record in event['Records']:
        if record.get('eventName') not in ('INSERT', 'MODIFY'):
            continue  # handle both INSERT and MODIFY events

        new_image = record.get('dynamodb', {}).get('NewImage', {})

        url = new_image.get('url', {}).get('S')
        title = new_image.get('title', {}).get('S', '')
        content = new_image.get('content', {}).get('S') or new_image.get('summary', {}).get('S', '')
        location = new_image.get('location', {}).get('S', 'Unknown')

        if not url:
            print("⚠️ Skipping record with missing URL")
            continue

        print(f"📰 Processing article: {title} ({url})")

        # --------------------------
        # Construct Bedrock prompt
        # --------------------------
        prompt = f"""

            You are a disaster response analyst AI. Your goal is to read a news article and extract actionable information for disaster response. You should focus on providing **objective, evidence-based assessments** derived from the article.

            Article title: {title} Article content: {content}
            **Key Objectives:**

            1. Identify the **most relevant location** where the disaster is affecting people.
            2. Assess the **severity of support needed** and classify it into one of four levels:

            * Minimal Support: Minor disruptions, limited impact, basic local assistance may be sufficient.
            * Moderate Support: Noticeable impact, some infrastructure affected, humanitarian assistance may be required.
            * High Support: Significant damage, multiple services disrupted, urgent assistance needed.
            * Emergency/Critical Support: Severe damage, widespread impact, immediate intervention required to save lives.
            3. Determine the **top 3 urgent needs** such as food, water, medical care, shelter, rescue, communication, or electricity.
            4. Estimate the **number of people affected**, using explicit data if given, or reasonable approximation if not.
            5. Assign a **confidence score (0-1)** reflecting how certain you are about your assessment.

            **Guiding Principles:**

            * Only use **information explicitly stated or strongly implied** in the article.
            * If there is uncertainty, make the **best estimate** and reflect uncertainty in the confidence score.
            * Focus on clarity and specificity; avoid vague responses like "help needed."
            * Use context clues from the article: numbers, affected areas, descriptions of damage, quotes from officials, or mentions of casualties.

            ---

            **Step-by-Step Instructions:**

            1. **Location Detection:**

            * Look for city, region, district, or country names.
            * Prioritize the location that is central to the disaster impact.
            * If multiple locations are mentioned, choose the one most strongly affected.

            2. **Support Level Classification:**

            * Analyze descriptions of damage, casualties, displacement, or disruption.
            * Map the severity description to one of the four support levels listed.

            3. **Priority Needs Estimation:**

            * Identify what people urgently require to survive or recover.
            * List only the top 3 most critical needs.

            4. **People Affected Estimation:**

            * Use explicit numbers in the article if available.
            * If no exact numbers, infer based on context (e.g., "hundreds displaced," "entire village evacuated").

            5. **Confidence Scoring:**

            * 1.0: Article provides clear, explicit evidence.
            * 0.7-0.9: Evidence is strong but partially inferred.
            * 0.4-0.6: Moderate uncertainty, multiple interpretations possible.
            * <0.4: Highly uncertain, very limited information.

            **Example 1:**

            *Title:* "Floods Devastate Riverside Town"
            *Content:* "Heavy rains caused the Riverside River to overflow, flooding homes. Around 2,000 residents have been evacuated. Emergency shelters are overwhelmed."

            *Analysis (JSON output):*

            ```json
            {
                "location": "Riverside Town",
                "support_level": "High Support",
                "confidence": 0.9,
                "priority_needs": ["shelter", "food", "medical care"],
                "people_affected": 2000
            }
            ```

            **Example 2:**

            *Title:* "Minor Snowstorm Hits Northern Hamlet"
            *Content:* "The snowstorm caused minor travel delays. No injuries reported."

            *Analysis (JSON output):*

            ```json
            {
                "location": "Northern Hamlet",
                "support_level": "Minimal Support",
                "confidence": 0.95,
                "priority_needs": ["road clearance", "heating", "food"],
                "people_affected": 50
            }
            ```

            ---

            Respond only in JSON like this:
            {{
                "location": "<detected or given location>",
                "support_level": "<one of the above>",
                "confidence": <number between 0 and 1>,
                "priority_needs": ["need1", "need2", "need3"],
                "people_affected": <estimated number>
            }}

            **Additional Guidelines:**

            * Do not include any explanation, text, or commentary outside the JSON.
            * Ensure the JSON is **syntactically valid** and complete.
            * If the article does not mention a location or numbers, leave location empty or make your best estimate and set a lower confidence score.
            * Prioritize **accuracy, relevance, and evidence-based reasoning**.
            * Respond quickly, as if preparing actionable intelligence for disaster response teams.

            """

        # --------------------------
        # Bedrock Model Inference
        # --------------------------
        try:
            response = bedrock.invoke_model(
                modelId="meta.llama3-8b-instruct-v1:0",
                body=json.dumps({
                    "prompt": prompt,
                    "max_gen_len": 512,
                    "temperature": 0.7,
                    "top_p": 0.9
                }),
                contentType="application/json",
                accept="application/json"
            )

            model_output = response["body"].read()
            output_json = json.loads(model_output)
            completion = (output_json.get("generation") or output_json.get("completion") or "").strip()

            # --------------------------
            # Extract JSON safely
            # --------------------------
            parsed = extract_json(completion, fallback_location=location)

            # Ensure defaults
            parsed.setdefault('location', location)
            parsed.setdefault('support_level', 'Unknown')
            parsed.setdefault('confidence', 0.0)
            parsed.setdefault('priority_needs', [])
            parsed.setdefault('people_affected', 0)

            # Convert numeric values safely
            try:
                parsed['confidence'] = float(parsed['confidence'])
            except (ValueError, TypeError):
                parsed['confidence'] = 0.0

            try:
                parsed['people_affected'] = int(parsed['people_affected'])
            except (ValueError, TypeError):
                parsed['people_affected'] = 0

            print("🔹 Bedrock raw output:", completion)
            print("🔹 Parsed Bedrock output:", parsed)

        except Exception as e:
            print(f"❌ Bedrock error: {e}")
            parsed = {
                "location": location,
                "support_level": "Unknown",
                "confidence": 0.0,
                "priority_needs": [],
                "people_affected": 0
            }

        # --------------------------
        # Update DynamoDB
        # --------------------------
        try:
            confidence_decimal = Decimal(str(parsed.get("confidence", 0.0)))
            support_level = parsed.get("support_level") or "Unknown"
            detected_location = parsed.get("location") or location
            priority_needs = parsed.get("priority_needs") or []
            people_affected = parsed.get("people_affected") or 0

            table.update_item(
                Key={"url": url},
                UpdateExpression="""
                    SET support_level = :s,
                        confidence = :c,
                        detected_location = :l,
                        priority_needs = :p,
                        people_affected = :a
                """,
                ExpressionAttributeValues={
                    ":s": support_level,
                    ":c": confidence_decimal,
                    ":l": detected_location,
                    ":p": priority_needs,
                    ":a": people_affected
                },
            )
            print(f"✅ Updated article {url} with {parsed}")
        except Exception as e:
            print(f"❌ DynamoDB update failed: {e}")

    return {"status": "processed", "records": len(event.get("Records", []))}
