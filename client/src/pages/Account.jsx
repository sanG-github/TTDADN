import "../styles/Account.css";
import React, { useState } from "react";
import { notification } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import Axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faLeaf} from "@fortawesome/free-solid-svg-icons";

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
                    "Something happened!",
                    response.data.message,
                    false
                );
            else {
                openNotification(
                    "Register successfully!",
                    `Hello new user: ${username}`,
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
                    "Something happened!",
                    response.data.message,
                    false
                );
            else {
                openNotification(
                    "Login successfully!",
                    `Welcome back ${response.data[0].username}`,
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
                <h2>Sign Up!</h2>
                <fieldset>
                    <legend>Create Account</legend>
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
                <button onClick={(e) => handleSignUp(e)}>Submit</button>
                <button type="button" onClick={() => setCurentView("logIn")}>
                    Have an Account?
                </button>
            </form>
        );
    };

    const LogInForm = () => {
        return (
            <form>
                <div className="Header" style={{color: "black"}}><FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes Garden</div>
                <h2>Welcome Back!</h2>
                <fieldset>
                    <legend>Log In</legend>
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
                                Forgot Password?
                            </a>
                        </li>
                    </ul>
                </fieldset>
                <button onClick={(e) => handleLogIn(e)}>Login</button>
                <button type="button" onClick={() => setCurentView("signUp")}>
                    Create an Account
                </button>
            </form>
        );
    };

    const PWResetForm = () => {
        return (
            <form>
                <div className="Header" style={{color: "black"}}><FontAwesomeIcon icon={faLeaf} /> Smart Tomatoes Garden</div>
                <h2>Reset Password</h2>
                <fieldset>
                    <legend>Password Reset</legend>
                    <ul>
                        <li>
                            <em>A reset link will be sent to your inbox!</em>
                        </li>
                        <li>
                            <label for="email">Email:</label>
                            <input type="email" id="email" required />
                        </li>
                    </ul>
                </fieldset>
                <button>Send Reset Link</button>
                <button type="button" onClick={() => setCurentView("logIn")}>
                    Go Back
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
