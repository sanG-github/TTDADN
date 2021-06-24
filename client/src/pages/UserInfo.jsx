import React from "react";
// import { useSelector } from "react-redux";
import "../styles/UserInfo.css";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { SmileOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { Button } from "@material-ui/core";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
    },
    "& label.Mui-focused": {
        color: "red",
    },
    margin: {
        margin: theme.spacing(1),
    },
    withoutLabel: {
        marginTop: theme.spacing(10),
    },
    textField: {
        width: "75%",
    },
}));

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

function UserInfo() {
    const classes = useStyles();
    const [values, setValues] = React.useState({
        amount: "",
        weight: "",
        weightRange: "",
        password: "",
        new_password: "",
        new_password_confirm: "",
        showPassword: false,
        showNewPassword: false,
        showNewPasswordConfirm: false,
    });

    const handleChange = (prop) => (event) => {
        setValues({ ...values, [prop]: event.target.value });
    };

    const handleClickShowPassword = (prop) => (event) => {
        setValues({ ...values, [prop]: !values[prop] });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSetPassword = () => {
        axios
            .post("http://localhost:3001/api/setPassword", {
                username: window.localStorage.getItem("username"),
                password: values.password,
                new_password: values.new_password,
                new_password_confirm: values.new_password_confirm,
            })
            .then((res) => {
                openNotification(res.data.message, "", res.data.code === 200);
                console.log(res);
            })
            .catch((err) => {
                console.error(err);
            });
    };

    return (
        <div>
            <div className="title">Thay đổi mật khẩu</div>

            <div className="UserBlock-wrapper">
                <div className="UserBlock-inner">
                    <div className="FormBlock">
                        <div className="FormTitle title">Mật khẩu cũ</div>
                        <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                        >
                            <InputLabel htmlFor="outlined-adornment-password">
                                Mật khẩu cũ
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={values.showPassword ? "text" : "password"}
                                value={values.password}
                                onChange={handleChange("password")}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword(
                                                "showPassword"
                                            )}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge="end"
                                        >
                                            {values.showPassword ? (
                                                <Visibility />
                                            ) : (
                                                <VisibilityOff />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                labelWidth={90}
                            />
                        </FormControl>
                    </div>
                    <div className="FormBlock">
                        <div className="FormTitle title">Mật khẩu mới</div>
                        <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                        >
                            <InputLabel htmlFor="outlined-adornment-password">
                                Mật khẩu mới
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={
                                    values.showNewPassword ? "text" : "password"
                                }
                                value={values.new_password}
                                onChange={handleChange("new_password")}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword(
                                                "showNewPassword"
                                            )}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge="end"
                                        >
                                            {values.showNewPassword ? (
                                                <Visibility />
                                            ) : (
                                                <VisibilityOff />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                labelWidth={100}
                            />
                        </FormControl>
                    </div>
                    <div className="FormBlock">
                        <div className="FormTitle title">Nhập lại mật khẩu</div>
                        <FormControl
                            className={clsx(classes.margin, classes.textField)}
                            variant="outlined"
                        >
                            <InputLabel htmlFor="outlined-adornment-password">
                                Nhập lại mật khẩu
                            </InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={
                                    values.showNewPasswordConfirm
                                        ? "text"
                                        : "password"
                                }
                                value={values.new_password_confirm}
                                onChange={handleChange("new_password_confirm")}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword(
                                                "showNewPasswordConfirm"
                                            )}
                                            onMouseDown={
                                                handleMouseDownPassword
                                            }
                                            edge="end"
                                        >
                                            {values.showNewPasswordConfirm ? (
                                                <Visibility />
                                            ) : (
                                                <VisibilityOff />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                labelWidth={130}
                            />
                        </FormControl>
                    </div>

                    <div>
                        <Button
                            onClick={() => handleSetPassword()}
                            style={{
                                backgroundColor: "#3abb67",
                                color: "white",
                                padding: "10px",
                            }}
                        >
                            Đổi mật khẩu
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserInfo;
