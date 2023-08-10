import React from "react";
import { Grid, Typography, Card, IconButton, LinearProgress, IconButtongress } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipNextIcon from '@mui/icons-material/SkipNext'

export default function MusicPlayer (props) {
    let song_progress = props.song && (props.song.time / props.song.duration) * 100

    let hostNum = localStorage.getItem('HostNum')
    const [newHostNum, setNewHostNum] = React.useState(() => JSON.parse(hostNum) || [])
    let spotifyKey = localStorage.getItem("SpotifyKey")
    const [newSpotifyKey, setSpotifyKey] = React.useState(() => JSON.parse(spotifyKey) || [])

    function skipSong() {
        const requestOptions = {
            method : "POST",
            headers: {
                "Content-Type" : "application/json"
            }
        }
        let url = `http://localhost:8000/spotify/skip?key=${newHostNum}&authKey=${newSpotifyKey}`
        fetch(url, requestOptions)
    }

    function pauseSong() {
        const requestOptions = {
            method : "PUT",
            headers: {
                "Content-Type" : "application/json"
            }
        }
        let url = `http://localhost:8000/spotify/pause?key=${newHostNum}&authKey=${newSpotifyKey}`
        fetch(url, requestOptions)
    }

    function playSong() {
        const requestOptions = {
            method : "PUT",
            headers: {
                "Content-Type" : "application/json"
            }
        }
        let url = `http://localhost:8000/spotify/play?key=${newHostNum}&authKey=${newSpotifyKey}`
        fetch(url, requestOptions)
    }

    return (
        props.song ?
        <div>
            <Card>
                <Grid container alignItems='center'>
                    <Grid item align="center" xs={4}> {/*xs = 4 Takes up 1/3 of the grid */}
                        <img src={props.song.image_url} height="100%" width="100%" />
                    </Grid>
                    <Grid item align="center" xs={8}> {/*xs = 8 Takes up 2/3 of the grid */}
                        <Typography component="h5" variant="h5">
                            {props.song.title}    
                        </Typography> 
                        <Typography color="textSecondary" variant="subtitle1">
                            {props.song.artist}    
                        </Typography>
                        <div>
                            <IconButton onClick={props.song.is_playing ? pauseSong : playSong }> {/** Create an icon inside the IconButton tag and add an onClick on the IconButton itself */}
                                {props.song.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton onClick={() => skipSong()}>
                                <SkipNextIcon />
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>
                <LinearProgress variant="determinate" value = {song_progress} />
            </Card>
        </div>
        :
        <div>
            <Card>
                <Grid container alignItems='center'>
                    <Grid item align="center" xs={12}>
                        <Typography component="h5" variant="h5" align="center">
                            Please wait as the Spotify loads.    
                        </Typography> 
                    </Grid>
                </Grid>
            </Card>
        </div>
    )
}