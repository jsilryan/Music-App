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


export default function CreateRoom() {
    const navigate = useNavigate() 
    let defaultVotes = 2;
    //Multiply 1 * 8 pixels; so if 2 then 16 pixels
    const [roomDetails, setRoomDetails] = React.useState({
        guestsCanPause: true,
        votesToSkip: defaultVotes
    })

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
                    [name] : name === "guestsCanPause" ? value === "true" ? true : false : value
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
                guest_can_pause: roomDetails.guestsCanPause
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

   function goToRoom() {
        setClipboardState(true)
        navigate(`/room/${code}`)
   }

   React.useEffect(
    () => {
        console.log(toCopy)
    }, [toCopy]
   )

    return (
        <Grid container spacing = {1}>
            {/*12 is the max number*/}
            { 
            !toCopy ?
            <div>
                <Grid item xs = {12} align = "center">
                    <Typography component = "h4" variant = "h4">
                        Create a Room
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
                            name = "guestsCanPause"
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
                                name = "guestsCanPause"
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
                            defaultValue = {defaultVotes}
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