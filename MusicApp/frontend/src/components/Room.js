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
import { useNavigate } from "react-router-dom";
import UpdateRoom from "./UpdateRoom";
import MusicPlayer from "./MusicPlayer";

export default function Room (props) {
    const [roomDetails, setRoomDetails] = React.useState({
        guestCanPause: false,
        votesToSkip: 2,
        isHost: false,
        showSettings: false,
        spotifyAuthenticated: false,
        song: {}
    })
    const navigate = useNavigate() 
    const [settings, setSettings]= React.useState()
    const [confirmHost, setConfirmHost] = React.useState(false)
    const { roomCode } = useParams()
    const [address, setAddress] = React.useState('')
    let hostNum = localStorage.getItem('HostNum')
    const [newHostNum, setNewHostNum] = React.useState(() => JSON.parse(hostNum) || [])
    let spotifyKey = localStorage.getItem("SpotifyKey")
    const [newSpotifyKey, setSpotifyKey] = React.useState(() => JSON.parse(spotifyKey) || [])

    React.useEffect(
        () => {
            const interval = setInterval(getCurrentSong, 1000)
            return () => clearInterval(interval)
        },[]
    )

    function createAddress () {
        if (roomCode && newHostNum) {
            const newAddress = 'http://localhost:8000/api/get-room' + '?code=' + roomCode + '&key=' + newHostNum
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
            .then((res) => {
                if (!res.ok) {
                    props.clearCode()
                    navigate('/')
                }
                return res.json() //Assumes what comes after the arrow function is what will be returned if there no {} 
            })
            .then ((data) => {
                console.log(data)
                setRoomDetails({
                    guestCanPause: data.guest_can_pause,
                    votesToSkip: data.votes_to_skip,
                    isHost: data.is_host
                })
                if (data.is_host) {
                    authenticateSpotify()
                }
            })
    }

    function authenticateSpotify() {
        let link = 'http://localhost:8000/spotify/is-authenticated'
        let modifiedLink = link + '?key=' + newSpotifyKey
        fetch(newSpotifyKey && modifiedLink)
            .then ((res) => res.json())
            .then ((data) => {
                setRoomDetails(
                    prevData => {
                        return { 
                            ...prevData,
                            spotifyAuthenticated: data.status
                        }
                    }
                )
                console.log(data.status)
                if (!data.status){
                    fetch('http://localhost:8000/spotify/get-auth-url')
                        .then((res) => res.json())
                        .then ((data) => {
                            console.log(data.url)
                            window.location.replace(data.url) //Redirect to Spotify authentication page                        })
                            
                        })
                }
            })
    }

    function leaveButton() {
        let requestOptions
        if (newHostNum) {
            requestOptions = {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({
                    key : newHostNum
                })
            }
        }
        else {
            requestOptions = {
                method : "POST",
                headers : {"Content-Type" : "application/json"}
            }
        }
        fetch('/api/leave-room', requestOptions)
            .then ((_res) => {
                localStorage.removeItem('HostNum');
                localStorage.removeItem('Code');
                localStorage.removeItem('SpotifyKey')
                props.clearCode()
                navigate('/')
            })
    }

    function getCurrentSong() {
        let url = `http://localhost:8000/spotify/current-song?key=${newSpotifyKey}`
        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    return {}
                }
                else if (res.status === 204) {
                    return {};
                }
                else {
                    return res.json()
                }
            })
            .then ((data) => {          
                setRoomDetails (
                    prevData => {
                        return {
                            ...prevData,
                            song : data
                        }
                    }
                )
                console.log(data)
            }

            )
    }

    React.useEffect(
        () => {
            console.log(newHostNum)
            if (newHostNum){
                createAddress()
            }
            else {
                noAddressKey()
            }
            console.log(roomDetails)
        }, [newHostNum]
    )
    React.useEffect(
        () => {
            console.log(address)
            if (address)
            {
                getRoomDetails()
                getCurrentSong()
                console.log(roomDetails)
            }
        }, [address]
    )

    function updateShowSettings(value) {
        setRoomDetails (prevData => {
            return {
                ...prevData,
                showSettings : value
            }
        })
    }

    return (
        <div>
            { 
            !roomDetails.showSettings ?
            <Grid container spacing = {1}>
                <Grid item xs = {12} align = "center">
                    <Typography variant = "h4" component = "h4">
                        Code: {roomCode}
                    </Typography>
                </Grid>
            
                {
                    roomDetails.song ?
                    <MusicPlayer song = {roomDetails.song}/> /* {...this.state.song} */
                    :
                    <Grid item xs = {12} align = "center">
                        <Typography variant = "h5" component = "h5">
                            No Song yet.
                        </Typography>
                    </Grid>
                }
                
                {
                    roomDetails.isHost && 
                    <Grid item xs = {12} align = "center">
                        <Button 
                            variant = "contained" 
                            color = "primary"
                            onClick={() => updateShowSettings(true)}>
                                Settings
                            </Button>
                    </Grid>
                }
                
                <Grid item xs = {12} align = "center">
                    <Button 
                        variant = "contained"
                        color = "secondary"
                        style={{ backgroundColor: '#fc2647' }}
                        onClick = {leaveButton}
                    >
                        Leave Room
                    </Button>                  
                </Grid>
            </Grid>
            :
            <Grid container spacing={1} alignItems="center" justifyContent="center">
                <Grid item xs = {12} align = "center">
                    <UpdateRoom 
                        update={true} 
                        votesToSkip={roomDetails.votesToSkip} 
                        guestCanPause={roomDetails.guestCanPause}
                        roomCode = {roomCode} 
                    />
                    <br></br>
                    <Button 
                            align = "center"
                            variant = "contained"
                            color = "secondary"
                            style={{ backgroundColor: '#fc2647' }}
                            onClick={() => {
                                updateShowSettings(false);
                                getRoomDetails();
                            }}
                        >
                            Close
                    </Button>
                </Grid>
            </Grid>
            }
        </div>
    )
}  