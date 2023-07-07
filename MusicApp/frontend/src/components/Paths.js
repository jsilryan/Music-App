import React from "react";
import RoomJoin from './RoomJoinPage';
import CreateRoom from './CreateRoom';
import { BrowserRouter as Router,
    Switch, Route, Link, Redirect, Routes} from "react-router-dom"
import Home from "./Home";
import Room from "./Room"

export default function Paths() {
    return ( 
        <Router>
            <div>
                <Routes>
                    <Route path = '/' element = {<Home />} exact/>
                    <Route path = 'join' element = {<RoomJoin />} />
                    <Route path = 'create' element = {<CreateRoom />} />
                    <Route path = '/room/:roomCode' element = {<Room />} />
                </Routes>
            </div>
        </Router>
    )
}