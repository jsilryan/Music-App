import React from "react";
import { BrowserRouter as Router,
    Switch, Route, Link, useNavigate, Routes} from "react-router-dom"

import { Grid, Button, ButtonGroup, Typography} from "@mui/material"

export default function Home(props) {

    let hostNum = localStorage.getItem('HostNum')
    const [newHostNum, setNewHostNum] = React.useState(() => JSON.parse(hostNum) || [])
    let hostCode = localStorage.getItem('Code')
    const [newCode, setNewCode] = React.useState(() => JSON.parse(hostCode) || [])
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);

    React.useEffect(() => {

        fetch('http://localhost:8000/api/user-in-room' + '?key=' + newHostNum + '&code=' + newCode)
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.code) {
                navigate(`/room/${data.code}`)
            }
        });
    
    }, [newHostNum, newCode]);  

    React.useEffect(
        () => {
            const authKey = urlParams.get('authKey');
            const stringifiedAuthKey = JSON.stringify(authKey)
            localStorage.setItem("SpotifyKey", stringifiedAuthKey)
        },[urlParams]
    )


    return (
        <Grid container spacing = {3}>
            <Grid xs = {12} item align = "center">
                <Typography variant = "h3" compact = "h3">
                    House Jam
                </Typography>
            </Grid>
            <Grid xs = {12} item align = "center">
                {/*Button group aligns the 2 buttons horizontally 
                - DisableElevation removes the shadow
                - Variant = "contained" aligns them horizontally*/}
                <ButtonGroup 
                    disableElevation 
                    variant = "contained"
                    color = "primary"
                >
                    <Link to = '/join'>
                        <Button
                            color = "primary"
                        >
                            Join a Room
                        </Button>
                    </Link>
                    <Link to = '/create'>
                        <Button
                            color = "secondary"
                            style={{ backgroundColor: '#fc2647' }}
                        >
                            Create a Room
                        </Button>
                    </Link>
                </ButtonGroup>
            </Grid>
        </Grid>
    )
}