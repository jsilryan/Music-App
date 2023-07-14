import React from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Grid, Typography, useThemeProps } from "@mui/material"
import { Link } from 'react-router-dom'

export default function RoomJoin() {
    const [roomData, setRoomData] = React.useState({
        roomCode : "",
        error: ""
    })
    let hostNum = localStorage.getItem('HostNum')
    const [newHostNum, setNewHostNum] = React.useState(() => JSON.parse(hostNum) || [])

    const navigate = useNavigate() 

    function handleChange (event) {
        const {name, value} = event.target
        setRoomData (
            prevData => {
                return {
                    ...prevData,
                    [name]: value
                }
            }
        )
    }

    function clickRoomButton () {
        console.log(newHostNum)
        let requestOptions
        if (newHostNum) {
            requestOptions = {
                method : "POST",
                headers: {"Content-Type": "application/json"},
                body : JSON.stringify({
                    code : roomData.roomCode,
                    key : newHostNum
                })
            }
        }
        else {
            requestOptions = {
                method : "POST",
                headers: {"Content-Type": "application/json"},
                body : JSON.stringify({
                    code : roomData.roomCode
                })
            }
        }

        fetch('http://localhost:8000/api/join-room', requestOptions)
            .then((res) => {
                if (res.ok) {
                    return res.json()
                    
                } else {
                    setRoomData (
                        prevData => {
                            return {
                                ...prevData,
                                error : "Room not found."
                            }
                        }
                    )
                }
            })
            .then((data) => {
                console.log(data);
                if (data && data.key) { // Check if data and data.key are defined
                  const stringifiedHostNum = JSON.stringify(data.key);
                  localStorage.setItem('HostNum', stringifiedHostNum);
                  const stringifiedCode= JSON.stringify(roomData.roomCode);
                  localStorage.setItem('Code', stringifiedCode);
                  console.log(localStorage.getItem("HostNum"))
                  navigate(`/room/${roomData.roomCode}`);
                }
                else {
                    console.log("Data is undefined or does not have the 'key' property.");
                  }
            })
            .catch (
                (error) => {
                    console.log(error)
                }
            )
    }

    return (
        <Grid container spacing = {1} > 
             <Grid item xs = {12} align = "center">
                <Typography variant = "h4" component = "h4">
                    Join a Room
                </Typography>
             </Grid>
             <Grid item xs = {12} align = "center">
                <TextField 
                    name = "roomCode"
                    error = {roomData.error}
                    label = "Code"
                    placeholder="Enter a Room Code"
                    value = {roomData.roomCode}
                    helperText = {roomData.error}
                    variant="outlined"
                    onChange = {handleChange}
                />
             </Grid>
             <Grid item xs = {12} align = "center">
                <Button 
                    variant = "contained"
                    color = "primary"
                    onClick = {clickRoomButton}
                >
                    Enter Room
                </Button>
             </Grid>
             <Grid item xs = {12} align = "center">
                <Link to = "/">
                    <Button 
                        variant = "contained"
                        color = "secondary"
                        style={{ backgroundColor: '#fc2647' }}
                    >
                        Back
                    </Button>
                </Link>
             </Grid>
        </Grid>
    )
}

/*
    constructor (props){
        super(props);
        this.state = {
            roomCode : "".
            error : ""
        }
        this.handleChange = this.handleChange.bind(this) or onChange ={() => {
            .....
        }}
        this.clickRoomButton = this.clickRoomButton.bind(this)
    }

    <TextField 
        error = {this.state.error}
        value = {this.state.roomCode}
        onChange = {this.handleChange}
    />
*/