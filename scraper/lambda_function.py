import os
import requests
import json
import random
import time
from datetime import datetime
from datetime import timezone # Added for non-deprecated UTC time

# Import boto3 for AWS services
import boto3
# Initialize AWS DynamoDB (Boto3 will pick up credentials from the Lambda environment)
dynamodb = boto3.resource('dynamodb')
client = boto3.client('dynamodb') # Client is used for the batch_get_item call

# --- CONFIGURATION (Must be set as Lambda Environment Variables) ---

# Your GNews API Key 
GNEWS_API_KEY = os.environ.get('GNEWS_API_KEY', 'YOUR_GNEWS_API_KEY')
# DynamoDB Table Name 
DYNAMO_TABLE_NAME = os.environ.get('DYNAMO_TABLE_NAME', 'NewsTable')

# Your Gemini API Key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '') 
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

# --- CORE API FUNCTIONS ---

def safe_api_request(url, headers, params, max_retries=3):
    """
    Handles API requests with basic retries for transient errors (5xx) 
    and checks for client errors (4xx).
    """
    for attempt in range(max_retries):
        try:
            # Determine if it's a POST (for Gemini) or GET (for GNews)
            if headers.get('Content-Type') == 'application/json':
                response = requests.post(url, headers=headers, data=params, timeout=15)
            else:
                response = requests.get(url, headers=headers, params=params, timeout=15)
                
            response.raise_for_status() # Raise exception for 4XX or 5XX status codes
            return response
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP Error (Attempt {attempt + 1}): {e}")
            
            # Print raw error content for debugging
            print(f"Raw Error Content: {response.text}")

            if response.status_code == 429:
                # Use exponential backoff for rate limiting
                delay = 2 ** attempt + random.uniform(0, 1)
                print(f"⚠️ Rate limit hit. Waiting {delay:.2f} seconds.")
                if attempt < max_retries - 1:
                    time.sleep(delay)
                    continue
            
            # For 400/403/other persistent errors, re-raise immediately
            raise
        except requests.exceptions.RequestException as e:
            # Connection errors, timeouts, etc.
            print(f"❌ Request Error (Attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt + random.uniform(0, 1))
                continue
            raise
    
    raise Exception(f"Failed to complete request after {max_retries} attempts.")


def get_ai_summary(article_title, article_description, max_chars=500):
    """
    Uses the Gemini API to generate a concise summary of the article content, 
    strictly limited to the specified character count.
    """
    print(f"   -> Generating AI summary (Max {max_chars} chars)...")

    full_text = f"Title: {article_title}\n\nDescription: {article_description}"
    
    # System Instruction: Enforce the character limit and persona
    system_prompt = (
        """
        ********************************************************************************
        *                                                                              *
        *                        PROFESSIONAL NEWS SUMMARIZER PROMPT                  *
        *                                                                              *
        * You are being assigned the task of acting as an expert, professional-level   *
        * news summarizer. Your role is to read and understand the provided text with  *
        * utmost care, extract the most essential information, and produce a summary  *
        * that captures all critical details, while maintaining strict conciseness.    *
        *                                                                              *
        * REQUIREMENTS AND GUIDELINES:                                                *
        *                                                                              *
        * 1. OBJECTIVE AND NEUTRAL:                                                    *
        *    - Your summary must be completely factual, objective, and neutral in tone.*
        *    - Avoid any opinions, personal commentary, or interpretations.           *
        *    - Do not embellish, speculate, or infer beyond what is present in the text.*
        *                                                                              *
        * 2. CONCISENESS:                                                              *
        *    - The summary MUST be strictly limited to {max_chars} characters,         *
        *      including spaces, punctuation, and special characters.                  *
        *    - Do not exceed this limit under any circumstances.                       *
        *    - Focus on brevity without sacrificing clarity or essential information.  *
        *                                                                              *
        * 3. COMPLETENESS:                                                             *
        *    - Include all key facts, figures, dates, locations, names, events, and    *
        *      outcomes that are present in the original text.                         *
        *    - Ensure that the summary can stand alone and be fully understood without *
        *      reference to the original text.                                         *
        *                                                                              *
        * 4. STRUCTURE AND STYLE:                                                      *
        *    - Write in clear, professional, and polished language.                    *
        *    - Prefer active voice where appropriate, but clarity takes precedence.    *
        *    - Avoid repetition, filler words, or unnecessary modifiers.               *
        *    - Maintain logical flow: lead with the most important facts first.        *
        *                                                                              *
        * 5. FORMATTING:                                                               *
        *    - Do NOT include a title, headline, greeting, salutation, or any preamble.*
        *    - Provide only the summary text.                                          *
        *    - Avoid line breaks unless absolutely necessary for clarity.              *
        *                                                                              *
        * 6. OUTPUT RESTRICTIONS:                                                      *
        *    - The output should be exactly one concise paragraph.                     *
        *    - Do not add lists, bullet points, or any non-standard formatting.        *
        *    - Do not include explanations, notes, or any meta text.                   *
        *                                                                              *
        * 7. ATTENTION TO DETAIL:                                                      *
        *    - Carefully read the entire input text before summarizing.                *
        *    - Ensure all numbers, dates, names, and other critical details are correct.*
        *    - Double-check the character count to strictly adhere to {max_chars}.     *
        *                                                                              *
        * 8. SUMMARY EXAMPLES (FOR GUIDANCE ONLY):                                     *
        *    - If the text reports an event, summarize the who, what, when, where,     *
        *      why, and how in as few words as possible.                                *
        *    - Do not omit essential facts in the pursuit of brevity.                  *
        *                                                                              *
        * FINAL INSTRUCTIONS:                                                          *
        *    - Read the provided text carefully.                                       
        *    - Extract all key information without adding anything new.                 
        *    - Compose a concise, fully self-contained summary.                         
        *    - Ensure it does not exceed {max_chars} characters.                        
        *    - Output ONLY the summary text.                                           
        *                                                                              *
        ********************************************************************************
        """
    )
    
    user_query = f"Please provide the summary for the following article text:\n\n{full_text}"

    # Payload for POST request
    payload = json.dumps({
        "contents": [{ "parts": [{ "text": user_query }] }],
        "systemInstruction": { "parts": [{ "text": system_prompt }] },
    })
    
    api_url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"

    try:
        response = safe_api_request(
            api_url, 
            {'Content-Type': 'application/json'}, 
            payload, 
            max_retries=3 
        )
        
        result = response.json()
        generated_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'AI summary failed.')
        
        # Final safety check truncation
        final_summary = generated_text[:max_chars]
        
        return final_summary

    except Exception as e:
        return f"[Error: Failed to summarize article. {e}]"

def batch_check_existing(article_urls, table_name):
    """
    Return a set of article URLs that already exist in DynamoDB.
    This assumes 'url' is the table's Partition Key.
    
    FIX: Uses ExpressionAttributeNames because 'url' is a DynamoDB reserved word 
    when used in a ProjectionExpression.
    """
    if not article_urls:
        return set()

    # DynamoDB client expects key structure for BatchGetItem
    keys = [{'url': {'S': url}} for url in article_urls]
    existing_urls = set()

    try:
        response = client.batch_get_item(
            RequestItems={
                table_name: {
                    'Keys': keys,
                    # FIX: Use ExpressionAttributeNames and ExpressionAttributeNames 
                    # to project the 'url' attribute without using the reserved keyword directly.
                    'ProjectionExpression': '#u',
                    'ExpressionAttributeNames': {'#u': 'url'} 
                }
            }
        )

        for item in response.get('Responses', {}).get(table_name, []):
            # The item key will still be 'url' when reading the result
            existing_urls.add(item['url']['S'])

        unprocessed = response.get('UnprocessedKeys', {})
        if unprocessed:
            print(f"⚠️ Unprocessed keys found: {unprocessed}")

        return existing_urls
    except Exception as e:
        print(f"❌ DynamoDB Batch check error: {e}")
        return set()


def lambda_handler(event, context):
    """
    AWS Lambda handler function. Fetches news and stores unique articles in DynamoDB.
    Now includes logic to paginate if initial results are duplicates.
    """
    topic = event.get('topic', "natural disaster OR climate change")
    
    # NOTE: This line requires the Lambda execution role to have DynamoDB permissions
    news_table = dynamodb.Table(DYNAMO_TABLE_NAME)

    GNEWS_URL = "https://gnews.io/api/v4/search"
    
    # Constants for pagination control
    page = 1
    MAX_PAGES = 5
    TOTAL_SAVED_COUNT = 0
    
    if GNEWS_API_KEY == 'YOUR_GNEWS_API_KEY':
        print("❌ ERROR: GNEWS_API_KEY is not configured.")
        return {"status": "error", "message": "GNews API Key is missing."}

    print(f"🔍 Starting news search for '{topic}'. Max pages to check: {MAX_PAGES}")

    while page <= MAX_PAGES:
        print(f"\n--- Checking Page {page}/{MAX_PAGES} ---")

        params = {
            "q": topic, 
            "lang": "en", 
            "country": "world", 
            "max": 10,  # Max articles per page (GNews free tier max is 10)
            "token": GNEWS_API_KEY,
            "page": page  # Pagination parameter
        }

        try:
            response = safe_api_request(GNEWS_URL, {}, params)
            data = response.json()
            articles = data.get('articles', [])
            
            if not articles:
                print(f"⚠️ No articles returned from GNews on page {page}. Ending search.")
                break # Break if GNews returns no articles (reached the end)

            # --- DUPLICATE CHECK ---
            article_urls = [article["url"] for article in articles]
            existing_urls = batch_check_existing(article_urls, DYNAMO_TABLE_NAME)
            print(f"Page {page}: Found {len(existing_urls)} existing articles (out of {len(articles)} total).")

            saved_count_on_page = 0
            
            for i, article in enumerate(articles):
                article_url = article['url']

                if article_url in existing_urls:
                    continue

                print(f"  -> Processing Article {i+1} on Page {page}: {article.get('title', 'N/A')}")
                
                # Use the description field to generate the AI summary
                description = article.get('description', 'No source description.')
                summary = get_ai_summary(article.get('title', ''), description)
                
                # Prepare item for DynamoDB. 'url' is the Partition Key.
                item = {
                    'url': article_url, 
                    'title': article.get('title'),
                    'summary': summary,
                    'source_description': description, # <-- ADDED: Original short description
                    'raw_content_snippet': article.get('content', 'No content snippet available.'), # <-- ADDED: Raw content field (often a longer snippet)
                    'source': article.get('source', {}).get('name'),
                    'published_at': article.get('publishedAt'),
                    'inserted_at': datetime.now(timezone.utc).isoformat()
                }

                # Save to DynamoDB
                news_table.put_item(Item=item)
                saved_count_on_page += 1
                TOTAL_SAVED_COUNT += 1
                print(f"  ✅ Saved new article to DynamoDB: {article['title']}")
            
            # --- PAGINATION LOGIC CHECK ---
            if saved_count_on_page > 0:
                print(f"✅ Found {saved_count_on_page} new articles on page {page}. Stopping pagination to avoid excessive calls.")
                break # Found new data, successfully executed the purpose, so stop here.
            else:
                print(f"🛑 Page {page} yielded only duplicates. Moving to next page.")
                page += 1
                
        except Exception as e:
            print(f"❌ Error during search on page {page}: {e}")
            break # Stop searching on error
        
    return {"status": "success", "count": TOTAL_SAVED_COUNT, "topic": topic, "pages_checked": page}


# --- MAIN EXECUTION (for local testing without full AWS setup) ---

if __name__ == "__main__":
    
    # ------------------------------------------------------------------
    # NOTE: This section MOCKS environment variables for local testing.
    # ------------------------------------------------------------------
    
    # Mock the environment variables 
    os.environ['GNEWS_API_KEY'] = 'MOCK_GNEWS_KEY' 
    os.environ['GEMINI_API_KEY'] = 'MOCK_GEMINI_KEY' 
    os.environ['DYNAMO_TABLE_NAME'] = 'NewsTable' 

    print("🧪 Running local test. DynamoDB interactions will require local AWS setup (e.g., moto, DynamoDB local).")

    mock_event = {'topic': "natural disaster OR climate change"}
    mock_context = {}
    
    result = lambda_handler(mock_event, mock_context)
    print("\n--- Lambda Result ---")
    print(json.dumps(result, indent=2))
