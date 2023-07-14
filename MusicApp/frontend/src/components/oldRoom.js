import React from "react";
import { useParams } from "react-router-dom";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { Link } from 'react-router-dom'
import FormControlLabel from '@mui/material/FormControlLabel';

export default function Room (props) {
    const [roomDetails, setRoomDetails] = React.useState({
        guestCanPause: false,
        votesToSkip: 2,
        isHost: false
    })
    const [hostNum, setHostNum]= React.useState()
    const [confirmHost, setConfirmHost] = React.useState(false)
    const { roomCode } = useParams()
    const [address, setAddress] = React.useState('')
    const [newHostNum, setNewHostNum] = React.useState(() => JSON.parse(localStorage.getItem('HostNum')) || [])
    
    function createAddress () {
        if (roomCode && hostNum) {
            const newAddress = 'http://localhost:8000/api/get-room' + '?code=' + roomCode + '&key=' + hostNum
            setAddress(newAddress)
            setConfirmHost(true)
        }
    }
    function noAddressKey () {
        if (roomCode) {
            let newAddress
            newAddress = 'http://localhost:8000/api/get-room' + '?code=' + roomCode 
            setAddress(newAddress)
            setConfirmHost(true)
        }
    }

    function getRoomDetails() {
        fetch(address)
            .then((res) => 
                res.json() //Assumes what comes after the arrow function is what will be returned if there no {} 
            )
            .then ((data) => {
                console.log(data)
                setRoomDetails({
                    guestCanPause: data.guest_can_pause,
                    votesToSkip: data.votes_to_skip,
                    isHost: data.is_host
                })
            })
    }
    React.useEffect(
        () => {
            getRoomDetails()
            console.log(roomDetails)
        }, [confirmHost]
    )
    function handleChange (event) {
        const {name, value} = event.target
        setHostNum (value)
    }

    return (
        <div>
            {
                !confirmHost ?
                <Grid container spacing = {1}>
                    <Grid item xs = {12} align = 'center'>
                        <FormControl>
                            <TextField 
                                type = 'text'
                                name = 'hostNum'
                                onChange = {handleChange}
                                placeholder="Enter the Session Key"
                                inputProps = {{
                                    style: {textAlign: "center"}
                                }} 
                            /> {/*Accepts a Javascript object hence 2 brackets */}
                            <FormHelperText>
                                <div align = 'center'>
                                    Enter session key if host.
                                </div>
                            </FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} align = "center">
                        <Button 
                            color = "primary" 
                            variant = "contained"
                            onClick = {createAddress}
                        >
                            Click to confirm the Key
                        </Button>
                    </Grid>
                    <br></br>
                    <Grid item xs={12} align = "center">
                        <Button 
                            color = "secondary" 
                            variant = "contained" 
                            style={{ backgroundColor: '#fc2647' }}
                            onClick = {noAddressKey} 
                        >
                            Click if No Key
                        </Button>
                    </Grid>
                </Grid>
                :
                <Grid container spacing = {1}>
                    <Grid item xs = {12} align = "center">
                        <Typography variant = "h4" component = "h4">
                            Code: {roomCode}
                        </Typography>
                    </Grid>
                    <Grid item xs = {12} align = "center">
                        <Typography variant = "h6" component = "h4">
                            Votes: {roomCode && roomDetails.votesToSkip}
                        </Typography>
                    </Grid>
                    <Grid item xs = {12} align = "center">
                        <Typography variant = "h6" component = "h4">
                            Guest Can Pause: {roomDetails.guestCanPause && roomDetails.guestCanPause.toString()}
                        </Typography>
                    </Grid>
                    <Grid item xs = {12} align = "center">
                        <Typography variant = "h6" component = "h4">
                            Host: {roomDetails && roomDetails.isHost.toString()}
                        </Typography>
                    </Grid>
                    <Grid item xs = {12} align = "center">
                        <Link to = "/">
                            <Button 
                                variant = "contained"
                                color = "secondary"
                                style={{ backgroundColor: '#fc2647' }}
                            >
                                Leave Room
                            </Button>
                        </Link>                        
                    </Grid>
                </Grid>
                // <div>
                //     <h3>{roomCode}</h3>
                //     <p>Votes: {roomCode && roomDetails.votesToSkip}</p>
                //     <p>Guest Can Pause: {roomDetails.guestCanPause && roomDetails.guestCanPause.toString()}</p>
                //     <p>Host: {roomDetails && roomDetails.isHost.toString()}</p>
                // </div>
            }

        </div>
    )
}  