import React, { useEffect, useState } from "react";
import { Amplify, API, Auth } from "aws-amplify";
import awsExports from "./aws-exports";

Amplify.configure(awsExports)
API.configure(awsExports)

const myAPI = "enolafinal"
const path = "/users"

function Users() {

    useEffect(()=>{
        Auth.currentSession().then((user)=>{
            setEmail(user.idToken.payload.email)
        })
        getUserProfile()
    })

    //loaded user profile
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [mode, setMode] = useState("")
    const [comments, setComments] = useState("")
    const [image, setImage] = useState("")

    async function getUserProfile() {
        // e.preventDefault()

        Auth.currentSession().then((user) => {
            setEmail(user.idToken.payload.email)
        })

        const myInit = {
            queryStringParameters: {
                email: email
            }
        }

        await API.get(myAPI, path + "/" + email, myInit)
        .then(res => {
            console.log("This is res :"+ res)
            console.log(res.comments)
                setUsername(res.username)
                setMode(res.mode)
                setComments(res.comments)
                setImage(res.image)
            })
    
        .catch(err => {
            console.log(err)
        })
    }

    const [updateUsername, setUpdateUsername] = useState("")
    const [updateMode, setUpdateMode] = useState("")
    const [updateComments, setUpdateComments] = useState("")

    async function updateUser(e) {
        // let userId = e.input
        e.preventDefault()
        const myInit = {
            body: {
                email: email,
                username: updateUsername,
                mode: updateMode,
                comments: updateComments
            }
        }
        await API.post(myAPI, path + "/" + email, myInit)
            .then(res => {
                console.log(res)

            })
            .catch(err => {
                console.log(err)
            })

            setUsername(updateUsername)
            setComments(updateComments)
    }

    function onUpdateUsername(e) {
        setUpdateUsername(e.target.value)
    }

    function onUpdateMode(e) {
        setUpdateMode(e.target.value)
    }

    function onUpdateComments(e) {
        setUpdateComments(e.target.value)
    }




    //////////////////////upload image//////////////////////////////////
    const [imageFile, setImageFile] = useState("")

    function onSelectFile(e){
        setImageFile(e.target.files[0])
    }

    const convertToBase64 = (file) => {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            }
        })
    }

    async function uploadFile(e) {
        e.preventDefault()
        const file = imageFile
        const convertedFile = await convertToBase64(file);
        console.log(convertedFile)
        const imgExt = file.name.slice(file.name.indexOf("."),file.name.length)
        const fileName = "profile" + file.name.slice(file.name.indexOf("."),file.name.length)
        const myInit = {
            body: {
                email: email,
                image: convertedFile,
                imageName: fileName
            },}

        const index = email.indexOf("@")
        const mailName = email.slice(0,index)
        const mailProvider = email.slice(index+1,email.length)
        const imageURL = ("https://enola-s3.s3.ap-southeast-1.amazonaws.com/"+ mailName + "%40" + mailProvider + "/profile" + imgExt)
        setImage(imageURL)
            
        await API.post(myAPI, path + "/" + email, myInit)
            .then(res => {
                console.log(res)
                console.log(file.name)
            })
            .catch(err => {
                console.log(err)
            })

        const myInit2 = {
            body: {
                email: email,
                image: imageURL
            }
        }

        await API.put(myAPI, path + "/" + email, myInit2)
        .then(res => {
            console.log("Update image in dynamoDB")
            })
        .catch(err => {
            console.log(err)
        })
    }
    console.log(image)
    //////////////////////end//////////////////////////////////

    return(

        <div>
            <h1>This is a User Page</h1>
            <br/>
            <h2>Your Current Profile</h2>
            <img className='circle-img' src={image} alt="myimage"></img>
            <h2>{username}</h2>
            <h2>{comments}</h2>
            <br/>
            <h2>Update Profile</h2>
            <form onSubmit={(e)=>updateUser(e)}>
                <p>Username</p>
                <input placeholder="username" name="username" type="text" value={updateUsername} onChange={onUpdateUsername}/>
                <br/>
                <p>Mode</p>
                <input placeholder="mode" name="mode" type="text" value={updateMode} onChange={onUpdateMode}/>
                <br/>
                <p>Comments</p>
                <input placeholder="comments" name="comment" type="text" value={updateComments} onChange={onUpdateComments}/>
                <br/>
                <br/>
                <button type="submit">update</button>
            </form>
            <form onSubmit={(e)=>uploadFile(e)}>
                <h3>Upload Image</h3>
                <input placeholder="image" name="image" type="file" accept="image/*" onChange={onSelectFile}/>
                <button type="submit">upload</button>
            </form>
            <br/>
        </div>
    )
}

export default Users
