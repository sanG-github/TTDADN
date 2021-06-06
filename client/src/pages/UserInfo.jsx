import React from 'react'
import { useSelector } from "react-redux";

function UserInfo() {

    const username = useSelector((state) => state.username);
    return (
        <div>
            User Info
        </div>
    )
}

export default UserInfo
