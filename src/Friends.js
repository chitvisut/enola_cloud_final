import React, { useState } from "react"
import { Amplify, API, Auth } from "aws-amplify";
import awsExports from "./aws-exports";

Amplify.configure(awsExports)
API.configure(awsExports)

const myAPI = "enolafinal"
const path = "/friends"


function Friends() {

    const [email, setEmail] = useState("")
    const [addMail, setAddMail] = useState("")
    const [addAlert, setAddAlert] = useState("")

    function onAddMail(e) {
        setAddMail(e.target.value)
    }

    async function getUserFriendList(email) {
        const myInit = {
            queryStringParameters: {
                email: email
            }
        }
        let data = await API.get(myAPI, path + "/" + email, myInit)
            .then(res => {
                console.log("This is res :"+ res)
                // check exist
                if (res === "user not found") {
                    setAddAlert(res)
                    return "user not found"
                } else {
                    setAddAlert("add friend success")
                    console.log(addAlert)
                    console.log("This a res from get methods" + res)
                    // if exist add req to target
                    const friendList = JSON.parse(res.friends)
                    console.log("This a friendlist from get methods" + res.friends)
                    console.log(friendList)
                   return friendList
                }
                })
            .catch(err => {
                console.log(err)
            })
        console.log("this is data sent :" + data )
        return data
    }

    async function updateUserFriendList(email, friendList) {
        const myInit = {
            body: {
                target: email,
                updatefield: "friends",
                newValue: friendList
            }
        }
        let data = await API.post(myAPI, path + "/" + email, myInit)
        .then(res => {
            console.log("send new friend list to DB")
            return res
        }).catch(err => {
            console.log(err)
            return err
        })
        return data
    }

    async function submitAddmail(e) {
        await Auth.currentSession().then((user) => {
            setEmail(user.idToken.payload.email)
        })
        if (email === addMail) {
            setAddAlert("add friend success")
            return console.log(addAlert)
        }
        e.preventDefault()
        let data = await getUserFriendList(addMail)
        console.log("This is data recieve : " + data)

        if (data) {
            if (data === "user not found") {
                return console.log("user not found noting is submit!")
            } else if (data.includes(email)) {
                console.log("email :" + email)
                return console.log("be friend already!")
            } else {
                // add to target
                console.log("test1 :" + data)
                console.log("test1.1 :" + email)
                data.push(email)
                console.log("test2 :" + data)
                let res = await updateUserFriendList(addMail, data)
                console.log(res)
                data = await getUserFriendList(email)
                // add to user
                data.push(addMail)
                res = await updateUserFriendList(email, data)
                return console.log(res)
            }
        } else {
            return console.log("please try again")
        }
    }

        return(
            <div onSubmit={(e)=>submitAddmail(e)}>
                <h1>This is Friend Page</h1>
                <h2>Add your enola friends</h2>
                <form>
                    <input placeholder="email" name="addMail" type="text" value={addMail} onChange={onAddMail}/>
                    <button type="submit">Add</button>
                    <p>{addAlert}</p>
                </form>
            </div>
        )
    }

export default Friends