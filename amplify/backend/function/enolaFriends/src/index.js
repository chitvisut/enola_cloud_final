const AWS = require('aws-sdk');

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const method = event.httpMethod;
    console.log(method);
    
    async function getUser() {
        const docClient = new AWS.DynamoDB.DocumentClient();
        const body = JSON.parse(event.body);
        const queryStringParameters = event.queryStringParameters
        console.log(body);
        const params = {
        TableName: "enolaUserProfile",
          Key: {
            email: queryStringParameters.email,
          },
        };
        
      try {
        const data = await docClient.get(params).promise()
        const resItem = data.Item
        if(!resItem) {
          console.log("user not found")
          return "user not found"
        } else {
          console.log("found")
          console.log(resItem)
          return resItem
        }
      } catch (err) {
        return err
      }
    }
    
    async function updateFriend() {
      const docClient = new AWS.DynamoDB.DocumentClient();
      const body = JSON.parse(event.body);
      console.log(body);
      const params = {
        TableName: "enolaUserProfile",
        Key: {
          email: body.target
        },
        UpdateExpression: "SET #col = :x",
        ExpressionAttributeNames: {
                    '#col': body.updatefield       
                },
        ExpressionAttributeValues: {
            ":x": JSON.stringify(body.newValue),
        },
        ReturnValues: "UPDATED_NEW"
        };
        
      try {
        console.log(params)
        await docClient.update(params).promise();
        return "update complete"
      } catch (err) {
        console.log(err)
        console.log("test2")
        return err;
      }
    }
        
    if (method == "GET") {
       try {
        const data = await getUser()
        console.log(data)
        const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
            body: JSON.stringify(data),
          };
          console.log("get success")
          return res
      } catch (err) {
        return err
      }
    } else if (method == "POST") {
      try {
        await updateFriend()
        const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: "update Success",
          };
          console.log("Post success")
          return res
      }  catch (err) {
        return err
      }
    }
    
}
