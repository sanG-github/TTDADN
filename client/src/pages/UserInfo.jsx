import React from 'react'
import { useSelector } from "react-redux";

function UserInfo() {

    const username = useSelector((state) => state.username);
    
    return (
        <div>
            <div className="title">User Infor</div>
            <p>{username}</p>


        </div>
    )
}

export default UserInfo
