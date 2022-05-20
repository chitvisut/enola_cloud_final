import React, { useEffect, useState } from 'react';
import './App.css';
import { Amplify, Auth, API } from "aws-amplify"
import awsExports from "./aws-exports"
import { createMap, drawPoints} from 'maplibre-gl-js-amplify'; //drawPoints
import "maplibre-gl/dist/maplibre-gl.css"
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import "maplibre-gl-js-amplify/dist/public/amplify-geocoder.css";
import { Button } from '@mui/material';


Amplify.configure(awsExports)
API.configure(awsExports)

const myAPI = "enolafinal"
const path = "/home"

async function signOut() {
  try {
    await Auth.signOut()
  } catch (error) {
    console.log("error signing out", error)
  }
  window.location.reload(false)
}

async function initializeMap(location, points) {
    const el = document.createElement("div");
    el.setAttribute("id", "map");
    document.body.appendChild(el)

    const map = await createMap({
        container: "map", // An HTML Element or HTML element ID to render the map in https://maplibre.org/maplibre-gl-js-docs/api/map/
        center: location, // center in New York
        zoom: 11,
    })
    map.on("load", function () {
      drawPoints("mySourceName", // Arbitrary source name
          points, // An array of coordinate data, an array of Feature data, or an array of [NamedLocations](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/types.ts#L8)
          map,
          {
              showCluster: true,
              unclusteredOptions: {
                  showMarkerPopup: true,
              },
              clusterOptions: {
                  showCount: true,
              },
          }
      );
    });

    // map.addControl(createAmplifyGeocoder());
    return map;
  }


function Home() {

    const [myLocation, setMyLocation ] = useState([0,0])
    // const [updateLo, setUpdateLo ] = useState([0,0])
    const [userEmail, setUserEmail] = useState("")
    const [userProfile, setUserProfile] = useState("")
    const [allPoints, setAllPoints] = useState("")
    const [allCards, setAllCards] = useState([])


    var options = {
        enableHighAccuracy: true,
        maximumAge: 0
      };

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      }
      
    async function getMyPosition() {
        await navigator.geolocation.getCurrentPosition((pos)=>{
            setMyLocation([pos.coords.longitude, pos.coords.latitude])
            console.log("myLocation : " + myLocation)
        }, error, options)}


    async function getAllData() {
        console.log(userProfile.friends)
        const myInit = {
            body: {
            }
        }
        let data = await API.get(myAPI, path + "/" + userEmail, myInit)
            .then(res => {
                    console.log(res)
                    return res
                })
            .catch(err => {
                console.log(err)
            })
        setAllPoints(data.Items)

        return data.Items
    }

    function filterData(data) {
        setAllPoints([{
            coordinates: userProfile.location,
            title: userProfile.username,
            address: userProfile.comments
        }])
        setAllCards([])
        console.log("allData Before")
        console.log(allPoints)
        const friends = userProfile.friends
        data.map((user, idx) => {
            if (friends.includes(user.email) && user.enola === "true") {
                setAllPoints((prev)=>{
                    return (
                        [...prev,
                            {
                                coordinates: JSON.parse(user.location),
                                title: user.username,
                                address: user.comments
                            }
                        ]
                    )
                    })
                console.log("set card data")
                setAllCards((prev)=>{
                    return (
                        [...prev,
                            {
                                key: allCards.length,
                                username: user.username,
                                image: user.image,
                                comments: user.comments
                            }
                        ]
                    )
                    })
                console.log("allData After")
                console.log(allCards)
                return console.log(allPoints)
                } else {
                return false
            }
        })
    }

    async function showFriends() {
        const data = await getAllData()
        filterData(data)
    }

    async function updateDBLocation() {
        getMyPosition()
        await Auth.currentSession().then((user) => {
            setUserEmail(user.idToken.payload.email)
        })
        const myInit = {
            body: {
                target: userEmail,
                updatefield: "location",
                location: myLocation
            }
        }
        await API.put(myAPI, path + "/" + userEmail, myInit)
        .then(res => {
            console.log(res)

        })
        .catch(err => {
            console.log(err)
        })
    }
    
    async function getUserData(email) {
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
                    return "user not found"
                } else {
                    console.log("This a res from get methods" + res)
                    // if exist add req to target
                    const userData = res
                    console.log(userData)
                    return userData
                }
                })
            .catch(err => {
                console.log(err)
            })
        console.log("this is data sent :" + data )
        return data
    }
    
    async function initUser() {
        getMyPosition()
        console.log("init user!")
        const index = userEmail.indexOf("@")
        const mailName = userEmail.slice(0,index)
        const myInit = {
        body: {
            email: userEmail,
            username: mailName,
            mode: "true",
            comments: "I'm new to Enola",
            location: myLocation,
            image: "no image",
        }
    }

        await API.post(myAPI, path + "/" + userEmail, myInit)
        .then(res => {
            console.log("This is res :"+ res)
            console.log(res.comments)
            if (!res.email) {
                API.post(myAPI, path + "/" + userEmail, myInit).then(res => {
                    console.log(res)
                    setUserProfile(myInit.body)
                }).catch(err => {
                    console.log(err)
                })
            } else {
                console.log(res)
                // setUserProfile(res)
            }
        })
        .catch(err => {
            console.log(err)
        })
        
    }

    // updateLocation()

    async function getHomeProfile() {
        await Auth.currentSession().then((user) => {
            setUserEmail(user.idToken.payload.email)
        })

        const data = await getUserData(userEmail)
        console.log("test test " + data.email)
        
        if (!data.email) {
            await initUser()
            const redata = await getUserData(userEmail)
            console.log("result from re")
            return redata
        } else {
            console.log("hi")
            return data
        }
    }

    async function updatePage(){
        await getMyPosition().then(()=>{
            if (myLocation[0]!==0) {
                updateDBLocation()
            }})

        let data = await getUserData(userEmail)
        setUserProfile({
            email: data.email,
            username: data.username,
            comments: data.comments,
            enola: data.enola,
            location: JSON.parse(data.location),
            friends: JSON.parse(data.friends),
            image:  data.image
        })
    }

    useEffect(() => {
        getHomeProfile()
        initializeMap(myLocation, allPoints);
      },);

    return(
        <div>
            <h1>{userProfile.username} </h1>

            <img className='circle-img' src={userProfile.image} alt="please upload profile pic"></img>
            <ul id="locations">
                {allCards.map((user)=><li className="friendlist"><img className='circle-img-sm' src={user.image} alt="please upload profile pic"></img><b>{user.username}</b></li>)}
            </ul> 
            <div id="map"></div>
            <Button variant="contained" onClick={updatePage}>update page</Button>
            <Button variant="contained" onClick={showFriends}>Scan</Button>
            <Button variant="contained" onClick={signOut}>Sign out</Button>
        </div>
    )
}

export default Home