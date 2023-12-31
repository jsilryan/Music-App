import React from "react";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { Link, useNavigate} from 'react-router-dom'
import FormControlLabel from '@mui/material/FormControlLabel';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { Collapse } from "@mui/material"


export default function CreateRoom(props) {
    const navigate = useNavigate() 
    const defaultProps = {
        votesToSkip : 2,
        guestCanPause : true,
        update : false,
        roomCode: null,
        updateCallback : () => {}
    }
    //Multiply 1 * 8 pixels; so if 2 then 16 pixels
    const [roomDetails, setRoomDetails] = React.useState({
        guestCanPause: defaultProps.guestCanPause,
        votesToSkip: defaultProps.votesToSkip
    })

    const [msg, setMsg] = React.useState({
        errorMsg : "",
        successMsg : ""
    })

    const title = props.update ? "Update Room" : "Create Room"

    const [hostNum, setHostNum] = React.useState()
    const [toCopy, setToCopy] = React.useState(false)
    const [code, setCode] = React.useState()

    const [clipboardState, setClipboardState] = React.useState(false)
    
    function handleChange (event) {
        const {name, value} = event.target
        setRoomDetails (
            prevData => {
                return {
                    ...prevData,
                    [name] : name === "guestCanPause" ? value === "true" ? true : false : value
                }
            }
        )
    }

    function goBack() {
        setToCopy(false)
        setClipboardState(false)
    }

   function handleSubmit(event) {
        event.preventDefault()
        const requestOptions = {
            method : "POST",
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify ({
                votes_to_skip: roomDetails.votesToSkip,
                guest_can_pause: roomDetails.guestCanPause
            })
        }
        fetch ("http://localhost:8000/api/create-room", requestOptions)
            .then (
                (response) => response.json()
            )
            .then ((data) => {
                console.log(data)
                setHostNum(data.host)
                setCode(data.code)
                setToCopy(true)
            })
   }

   function handleUpdate (event) {
        event.preventDefault()
        const newRequestOptions = {
            method : "PATCH",
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify ({
                votes_to_skip: roomDetails.votesToSkip,
                guest_can_pause: roomDetails.guestCanPause,
                code: props.roomCode
            })
        }
        console.log(newRequestOptions)
        fetch ("http://localhost:8000/api/update-room", newRequestOptions)
            .then (
                (response) => {
                    if (response.ok) {
                        let successMsg = "Room updated successfully."
                        setMsg (
                            prevData => {
                                return {
                                    ...prevData,
                                    successMsg: successMsg
                                    
                                }
                            }
                        )

                    } else {
                        let errorMsg = "Error updating room."
                        setMsg (
                            prevData => {
                                return {
                                    ...prevData,
                                    errorMsg: errorMsg
                                    
                                }
                            }
                        )
                    }
                }
            )
            .then ((data) => {
                console.log(data)
            })
   }

   function goToRoom() {
        setClipboardState(true)
        navigate(`/room/${code}`)
   }

   React.useEffect(
    () => {
        if (!props.update) {
            console.log(toCopy)
            const stringifiedHostNum = JSON.stringify(hostNum)
            localStorage.setItem('HostNum', stringifiedHostNum)
            let cuhostNum = localStorage.getItem("HostNum")
            console.log(cuhostNum)
        }
    }, [hostNum]
   )

    return (
        <Grid container spacing = {1} alignItems="center" justifyContent="center">
            {/*12 is the max number*/}
            { 
            !toCopy ?
            <div>
                {
                    props.update &&
                    <Grid item xs = {12} align = "center">
                        <Collapse in = {
                            msg.errorMsg != "" || msg.successMsg != "" 
                        }>
                            {msg.successMsg}
                        </Collapse>
                    </Grid>
                }
                <Grid item xs = {12} align = "center">
                    <Typography component = "h4" variant = "h4">
                        {title}
                    </Typography>
                </Grid>
                <Grid item xs = {12} align = "center">
                    <FormControl component = "fieldset">
                        <FormHelperText>
                            <div align = 'center'>
                                Guest Control of Playback State
                            </div>
                        </FormHelperText>
                        <RadioGroup 
                            row 
                            defaultValue="true"
                            name = "guestCanPause"
                            onChange = {handleChange}
                        >
                            <FormControlLabel 
                                value = 'true' 
                                control = {<Radio color = "primary" />}
                                label = "Play/Pause"
                                labelPlacement="bottom"
                            />
                            <FormControlLabel 
                                value = 'false' 
                                control = {<Radio color = "secondary" style={{ color: '#fc2647' }}/>}
                                label = "No Control"
                                labelPlacement="bottom"
                                name = "guestCanPause"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs = {12} align = 'center'>
                    <FormControl>
                        <TextField 
                            required = {true} 
                            type = 'number'
                            name = 'votesToSkip'
                            onChange = {handleChange}
                            defaultValue = {defaultProps.votesToSkip}
                            inputProps = {{
                                min: 1,
                                style: {textAlign: "center"}
                            }} 
                        /> {/*Accepts a Javascript object hence 2 brackets */}
                        <FormHelperText>
                            <div align = 'center'>
                                Votes Required To Skip Song
                            </div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                
                {
                !props.update ? 
                <div>
                    <Grid item xs={12} align = "center">
                        <Button 
                            color = "primary" 
                            variant = "contained"
                            onClick = {handleSubmit}
                        >
                            Create a Room
                        </Button>
                    </Grid>
                    <br></br>
                    <Grid item xs={12} align = "center">
                        <Link to = '/' >
                            <Button 
                                color = "secondary" 
                                variant = "contained" 
                                style={{ backgroundColor: '#fc2647' }}
                            >
                                Back
                            </Button>
                        </Link>
                    </Grid>
                </div>
                :
                <Button 
                    color = "primary" 
                    variant = "contained"
                    onClick = {handleUpdate}
                >
                    Update Room
                </Button>
                }
            </div>
            :
            <div className = 'center'>
                <Grid item xs = {12} align = "center">
                    <h2>Copy the key below and use it to enter when joining a room as the host.</h2>
                    <CopyToClipboard 
                        text = {hostNum}
                        onCopy = {goToRoom}
                    >
                        <Grid item xs={12} align = "center">
                            <Button 
                                color = "primary" 
                                variant = "contained"
                            >
                                {hostNum}
                            </Button>
                        </Grid>
                    </CopyToClipboard>
                    {clipboardState && (
                        <span style = {{color : "green"}}>
                            <br />
                            Copied
                        </span>
                    )}
                    <h2>Paste it here</h2>
                    <TextField />
                </Grid>
                <br />
                <Grid item xs={12} align = "center">
                    <Button 
                        color = "secondary" 
                        variant = "contained" 
                        style={{ backgroundColor: '#fc2647' }}
                        onClick = {goBack}
                    >
                        Back
                    </Button>
                </Grid>
            </div>
            }
        </Grid>
    )
}

/* constructor (props) {
        super(props);
        this.state = {
            guestCanPause : true,
            votesToSkip: this.defaultVotes
        };
        this.handleSubmit = this.handleSubmit.bind(this); //Allows me to use this. in when defining the function
} */