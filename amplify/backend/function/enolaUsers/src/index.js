const AWS = require('aws-sdk');
const s3 = new AWS.S3();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    const method = event.httpMethod;
    console.log(method);
    const reqBody = JSON.parse(event.body)
        
    async function updateProfile(){
      const docClient = new AWS.DynamoDB.DocumentClient();
      const body = JSON.parse(event.body);
      console.log(body);
       const params = {
        TableName: "enolaUserProfile",
        Key: {
          email: body.email
        },
        UpdateExpression: "SET username = :x, enola = :y, comments = :z",
  
        ExpressionAttributeValues: {
            ":x": body.username,
            ":y": body.mode,
            ":z": body.comments
        },
        ReturnValues: "UPDATED_NEW"
        };
        
      try {
        console.log(params)
        await docClient.update(params).promise();
        console.log("test")
      } catch (err) {
        console.log(err)
        console.log("test2")
        return err;
      }
    }
    
    async function updateImageDB(){
      const docClient = new AWS.DynamoDB.DocumentClient();
      const body = JSON.parse(event.body);
      console.log(body);
       const params = {
        TableName: "enolaUserProfile",
        Key: {
          email: body.email
        },
        UpdateExpression: "SET image = :x",
  
        ExpressionAttributeValues: {
            ":x": body.image,
        },
        ReturnValues: "UPDATED_NEW"
        };
        
      try {
        console.log(params)
        await docClient.update(params).promise();
        console.log("test")
      } catch (err) {
        console.log(err)
        console.log("test2")
        return err;
      }
    }
    
    async function uploadImage(){
      const params = {
          Bucket: "enola-s3",
          Key: (reqBody.email + "/" + reqBody.imageName),
          Body: new Buffer.from(reqBody.image.replace(/^data:image\/\w+;base64,/, ""), 'base64'),
          }
        
      try {
        const data = await s3.putObject(params).promise();
        console.log(data)
        return data
      } catch (err) {
        return err;
      }
    }
    
    async function getItem(){
      const docClient = new AWS.DynamoDB.DocumentClient();
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
        if(!resItem) {
          console.log("user not found")
        } else {
          console.log("found")
        }
        return resItem
      } catch (err) {
        return err
      }
    }
    
    
    if (method == "POST") {
      if (reqBody.imageName) {
        console.log("Upload Image")
        try {
          const data = await uploadImage()
          console.log(data)
          const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: "success",
          };
          return res
        } catch (err) {
          return err
       }
      } else {
      try {
          await updateProfile()
          const res = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }, 
              body: "update profile success",
          };
          console.log("update profile success")
          return res
        } catch (err) {
          return err
       }
      }
    } else if (method == "GET") {
       try {
        const data = await getItem()
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
  
    } else if (method == "PUT") {
       try {
        const data = await updateImageDB()
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
    }
    
}

        
