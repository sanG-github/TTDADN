import "../styles/Account.css";
import React, { useState } from "react";
import { notification } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import Axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

Axios.defaults.withCredentials = true;

const openNotification = (message, description, isOk) => {
    let icon;
    if (!isOk)
        icon = <SmileOutlined rotate={180} style={{ color: "#eb2f96" }} />;
    else icon = <SmileOutlined style={{ color: "#108ee9" }} />;

    notification.open({
        message,
        description,
        icon,
    });
};

const Account = (props) => {
    const [currentView, setCurentView] = useState("logIn");

    const handleSignUp = (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const password2 = document.getElementById("password2").value;

        Axios.post(`http://localhost:3001/api/register`, {
            username,
            password,
            password2,
        }).then((response) => {
            if (response.data.message)
                openNotification(
                    "Đã có lỗi xảy ra.",
                    response.data.message,
                    false
                );
            else {
                openNotification(
                    "Đặng ký thành công",
                    `Xin chào, ${username}`,
                    true
                );
                setCurentView("logIn");
            }
            console.log(response);
        });
    };

    const handleLogIn = (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        Axios.post(`http://localhost:3001/api/login`, {
            username,
            password,
        }).then((response) => {
            if (response.data.message)
                openNotification(
                    "Đã có lỗi xảy ra.",
                    response.data.message,
                    false
                );
            else {
                openNotification(
                    "Đăng nhập thành công",
                    `Chào mừng đã trở lại ${response.data[0].username}`,
                    true
                );
                props.setLoggedIn(true);
            }
        });
    };

    const SignUpForm = () => {
        return (
            <form>
                <div className="Header" style={{color: "black"}}><FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes Garden</div>
                <h2>Đăng ký</h2>
                <fieldset>
                    <legend>Tạo tài khoản</legend>
                    <ul>
                        <li>
                            <label>Username:</label>
                            <input type="text" id="username" required />
                        </li>
                        <li>
                            <label>Password:</label>
                            <input type="password" id="password" required />
                        </li>
                        <li>
                            <label>Re-enter password:</label>
                            <input type="password" id="password2" required />
                        </li>
                    </ul>
                </fieldset>
                <button onClick={(e) => handleSignUp(e)}>Tạo</button>
                <button type="button" onClick={() => setCurentView("logIn")}>
                    Đăng nhập
                </button>
            </form>
        );
    };

    const LogInForm = () => {
        return (
            <form>
                <div className="Header" style={{color: "black"}}><FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes Garden</div>
                <h2>Chào mừng đã chở lại Vườn!</h2>
                <fieldset>
                    <legend>Đăng nhập</legend>
                    <ul>
                        <li>
                            <label for="username">Username:</label>
                            <input type="text" id="username" required />
                        </li>
                        <li>
                            <label for="password">Password:</label>
                            <input type="password" id="password" required />
                        </li>
                        <li>
                            <i />
                            <a
                                onClick={() => setCurentView("PWReset")}
                                href="#"
                            >
                                Quên mật khẩu ?
                            </a>
                        </li>
                    </ul>
                </fieldset>
                <button onClick={(e) => handleLogIn(e)}>Đăng nhập</button>
                <button type="button" onClick={() => setCurentView("signUp")}>
                    Tạo tài khoản mới
                </button>
            </form>
        );
    };

    const PWResetForm = () => {
        return (
            <form>
                <div className="Header" style={{color: "black"}}><FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes Garden</div>
                <h2>Đặt lại mật khẩu</h2>
                <fieldset>
                    <legend>Đặt lại mật khẩu</legend>
                    <ul>
                        <li>
                            <em>Đường link đặt lại mật khẩu đã được gữi đến mail của bạn</em>
                        </li>
                        <li>
                            <label for="email">Email:</label>
                            <input type="email" id="email" required />
                        </li>
                    </ul>
                </fieldset>
                <button>Gữi link đặt lại mật khẩu</button>
                <button type="button" onClick={() => setCurentView("logIn")}>
                    Quay lại
                </button>
            </form>
        );
    };

    const render = () => {
        switch (currentView) {
            case "signUp":
                return <SignUpForm />;
            case "logIn":
                return <LogInForm />;
            case "PWReset":
                return <PWResetForm />;
            default:
                break;
        }
    };

    return <section id="entry-page">{render()}</section>;
};

export default Account;
