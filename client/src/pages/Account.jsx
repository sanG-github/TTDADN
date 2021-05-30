import "../styles/Account.css";
import React, { useState } from "react";

const Account = () => {
    const [currentView, setCurentView] = useState("logIn");

    const handleSignUp = (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const password2 = document.getElementById("password2").value;

        console.log(username, password, password2);
    };

    const handleLogIn = (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        console.log(username, password);
    };

    const SignUpForm = () => {
        return (
            <form>
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
