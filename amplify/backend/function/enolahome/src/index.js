
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const method = event.httpMethod;
    console.log(method);
        
    async function getHomeProfile(){
      const queryStringParameters = event.queryStringParameters
      console.log("my param :" + queryStringParameters.email);
       const params = {
        TableName: "enolaUserProfile",
          Key: {
            email: queryStringParameters.email,
          },
        };
        
      try {
        const data = await docClient.get(params).promise()
        const resItem = data.Item
        console.log(resItem.email)
        if(!resItem.email) {
          console.log("user not found")
        } else {
          console.log("found")
        }
        return resItem
      } catch (err) {
        return err
      }
    }
    
  async function initiateProfile(){
      const body = JSON.parse(event.body);
      console.log(body);
       const params = {
        TableName: "enolaUserProfile",
          Item: {
            email: body.email,
            username: body.username,
            enola: body.mode,
            comments: body.comments,
            location: JSON.stringify(body.location),
            image: body.image,
            friends: JSON.stringify([])
          },
        };
        
      try {
        await docClient.put(params).promise();
      } catch (err) {
        return err;
      }
    }
    
  async function updateLocation(){
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
            ":x": JSON.stringify(body.location),
        },
        ReturnValues: "UPDATED_NEW"
        };
        
      try {
        console.log(params)
        await docClient.update(params).promise();
        console.log("test1")
        return "update complete"
      } catch (err) {
        console.log(err)
        console.log("test2")
        return err;
  }}
  
  async function getAllData() {
      const docClient = new AWS.DynamoDB.DocumentClient();

      const params = {
        TableName : 'enolaUserProfile'
      }
      
      try {
        const data = await docClient.scan(params).promise()
        return data
      } catch (err) {
        return err
      }
    }
    
  if (method == "GET") {
    if (event.queryStringParameters) {
       try {
        const data = await getHomeProfile()
        console.log(data)
        const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: JSON.stringify(data),
          };
          return res
      } catch (err) {
        return err
      }
    } else {
        try {
        console.log("Get ALL")
        const data = await getAllData()
        console.log(data)
        const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: JSON.stringify(data),
          };
          console.log("get all success")
          return res
      } catch (err) {
        return err
      }
    }
    } else if (method == "POST") {
      try {
          await initiateProfile()
          const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: "initiateProfile success",
          };
          return res
        } catch (err) {
          return err
       }
    } else if (method == "PUT") {
      try {
          await updateLocation()
          const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: "Update Location success",
          };
          return res
        } catch (err) {
          return err
       }
    }
}