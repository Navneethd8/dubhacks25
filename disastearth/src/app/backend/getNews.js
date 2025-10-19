const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const params = {
        TableName: 'NewsTable'
    };

    try {
        const data = await dynamoDB.scan(params).promise();  // Fetch all items
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*" // Allow React frontend to fetch
            },
            body: JSON.stringify(data.Items)
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
