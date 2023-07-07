import React from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Grid, Typography, useThemeProps } from "@mui/material"
import { Link } from 'react-router-dom'

export default function RoomJoin() {
    const [roomData, setRoomData] = React.useState({
        roomCode : "",
        error: ""
    })
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
        const requestOptions = {
            method : "POST",
            headers: {"Content-Type": "application/json"},
            body : JSON.stringify({
                code : roomData.roomCode
            })
        }
        fetch('http://localhost:8000/api/join-room', requestOptions)
            .then((res) => {
                if (res.ok) {
                    navigate(`/room/${roomData.roomCode}`)
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