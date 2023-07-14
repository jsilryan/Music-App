import React from "react";
import RoomJoin from './RoomJoinPage';
import CreateRoom from './CreateRoom';
import { BrowserRouter as Router,
    Switch, Route, Link, useNavigate, Routes} from "react-router-dom"
import Home from "./Home";
import Room from "./Room"

export default function Paths() {
    const [roomCode, setRoomCode] = React.useState(null)
 
    function clearCode () {
        setRoomCode(null)
    }

    return ( 
        <Router>
            <div>
                <Routes>
                    <Route path = '/' element = {<Home roomCode = {roomCode}/>} exact />
                    <Route path = 'join' element = {<RoomJoin />} />
                    <Route path = 'create' element = {<CreateRoom />} />
                    <Route path = '/room/:roomCode' element = {<Room clearCode = {clearCode} />} />
                </Routes>
            </div>
        </Router>
    )
}