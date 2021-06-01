import "../styles/Logout.css";
import React from "react";
import Button from "@material-ui/core/Button";
import axios from "axios";
import { useHistory } from "react-router-dom";

const Logout = () => {
    let history = useHistory();

    const handleCancel = () => {
        history.push("/");
    };

    const handleLogout = async function () {
        await axios.get("http://localhost:3001/api/logout");
        window.location.href = "/account";
    };

    return (
        <div className="Logout__wrapper">
            <h1>Bạn muốn đăng xuất?</h1>
            <div>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleCancel()}
                >
                    Hủy bỏ
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleLogout()}
                >
                    Xác nhận
                </Button>
            </div>
        </div>
    );
};

export default Logout;
