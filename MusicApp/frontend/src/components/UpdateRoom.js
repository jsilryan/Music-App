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
import Alert from "@mui/lab/Alert"


export default function UpdateRoom(props) {
    const navigate = useNavigate() 

    let hostNum = localStorage.getItem('HostNum')
    const [newHostNum, setNewHostNum] = React.useState(() => JSON.parse(hostNum) || [])

    //Multiply 1 * 8 pixels; so if 2 then 16 pixels
    const [roomDetails, setRoomDetails] = React.useState({
        guestCanPause: props.guestCanPause,
        votesToSkip: props.votesToSkip
    })

    const [msg, setMsg] = React.useState({
        errorMsg : "",
        successMsg : ""
    })

    const title = props.update ? "Update Room" : "Create Room"

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

    React.useEffect (
        () => {
            console.log(props.roomCode)
        }, [roomDetails]
    )

   function handleUpdate (event) {
        event.preventDefault()
        const requestOptions = {
            method : "PATCH",
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify ({
                votes_to_skip: roomDetails.votesToSkip,
                guest_can_pause: roomDetails.guestCanPause,
                code: props.roomCode
            })
        }
        fetch (`http://localhost:8000/api/update-room?key=${newHostNum}`, requestOptions)
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
            <div>
                <Grid item xs = {12} align = "center">
                    <Collapse in = {
                        msg.errorMsg != "" || msg.successMsg != "" 
                    }>
                        {
                            msg.successMsg != "" ?
                            (
                                <Alert severity = "success"
                                    onClose = {() => {
                                        setMsg (
                                            prevData => {
                                                return {
                                                    ...prevData,
                                                    successMsg: ""
                                                    
                                                }
                                            }
                                        )
                                    }}
                                >{msg.successMsg}</Alert>
                            ) 
                            :
                            (
                                <Alert severity = "error"
                                    onClose = {() => {
                                        setMsg (
                                            prevData => {
                                                return {
                                                    ...prevData,
                                                    errorMsg: ""
                                                    
                                                }
                                            }
                                        )
                                    }}
                                >{msg.errorMsg}</Alert>
                            ) 
                        }
                    </Collapse>
                </Grid>
                
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
                            defaultValue={props.guestCanPause}
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
                            defaultValue = {props.votesToSkip}
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
  
                <Button 
                    color = "primary" 
                    variant = "contained"
                    onClick = {handleUpdate}
                >
                    Update Room
                </Button>
                
            </div>
        </Grid>
    )
}
