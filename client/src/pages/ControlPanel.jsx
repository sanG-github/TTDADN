import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import "../styles/ControlPanel.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Card } from "antd";
import { Switch } from "antd";
import { io } from "socket.io-client";
import { Select } from "antd";
import { Slider } from "antd";
import { Input } from "antd";
import { Button } from "antd";
import { Table } from "antd";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import "animate.css";
import ErrorPage from "./ErrorPage";
import { SmileOutlined } from "@ant-design/icons";
import { notification } from "antd";
// import Record from "./Record";
const { Column } = Table;
const { Option } = Select;
const { Search } = Input;

require("dotenv").config();

const socket = io("http://localhost:3001", {
    transports: ["websocket"],
    extraHeaders: {
        "my-custom-header": "1234", // WARN: this will be ignored in a browser
    },
});

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

function publishData(datum, value) {
    var server = "";

    if (datum.feedName === "RELAY") {
        server = "CSE_BBC1";
    } else {
        server = "CSE_BBC";
    }

    socket.emit(
        "changeFeedData",
        `{
        "topic":"${server}/feeds/${datum.feed}",
        "message":{
            "id":"${datum.id}",
            "name":"${datum.feedName}",
            "data":"${value}",
            "unit":"${datum.unit === undefined ? "" : datum.unit}"
        }
    }`
    );
    console.log("Success");
}

function Led({ datum }) {
    function onChange(value) {
        //publish
        publishData(datum, value);
    }

    return (
        <Card
            title={datum.name}
            style={{ width: 300, margin: "10px 10px", borderRadius: "20px" }}
        >
            <p>ID thi???t b???: {datum.id}</p>
            <p>Tr???ng th??i: {datum.status}</p>
            <span>Ch???n :</span>
            <Select
                defaultValue={datum.last_values}
                onChange={(value) => onChange(value)}
                style={{ width: 100, margin: "0 20px" }}
            >
                <Option value="2">Xanh</Option>
                <Option value="1">?????</Option>
                <Option value="0">T???t</Option>
            </Select>
        </Card>
    );
}

function Speaker({ datum }) {
    const [value, setValue] = useState(0);

    function onClick(e) {
        // publish
        publishData(datum, value);
    }
    function onChange(value) {
        setValue(value);
    }

    return (
        <Card
            title={datum.name}
            extra=""
            style={{ width: 300, margin: "10px 10px", borderRadius: "20px" }}
        >
            <p>ID thi???t b???: {datum.id}</p>
            <p>Tr???ng th??i: {datum.status}</p>
            <p>??m l?????ng</p>
            <Slider
                defaultValue={datum.last_values}
                min={0}
                max={1023}
                onChange={(value) => onChange(value)}
            />
            <Button type="primary" onClick={(e) => onClick(e)}>
                Nh???p
            </Button>
        </Card>
    );
}

function LCD({ datum }) {
    const [state, setState] = useState("");

    function onSearch(value) {
        // if (value.length < 12) {
        //     publishData(datum, value);
        // }

        publishData(datum, value);
    }

    function onChange(e) {
        if (e.target.value.length >= 12) {
            setState("Kh??ng v?????t qu?? 12 k?? t???");
        } else {
            setState("");
        }
    }

    return (
        <Card
            title={datum.name}
            style={{ width: 300, margin: "10px 10px", borderRadius: "20px" }}
        >
            <p>ID thi???t b???: {datum.id}</p>
            <p>Tr???ng th??i: {datum.status}</p>
            <Search
                placeholder={datum.last_values}
                allowClear
                enterButton="Nh???p"
                size="large"
                onSearch={(value) => onSearch(value)}
                onChange={(e) => onChange(e)}
            />
            <p>{state}</p>
        </Card>
    );
}

function WaterPump({ datum }) {
    const [value, setValue] = useState(0);

    return (
        <Card
            title={datum.name}
            extra={
                <Switch
                    defaultChecked={datum.last_values === "1"}
                    value={value}
                    onChange={(checked) => {
                        console.log(checked);
                        const data = checked ? 1 : 0;
                        publishData(datum, data);
                        setValue(data);
                    }}
                />
            }
            style={{ width: 300, margin: "10px 10px", borderRadius: "20px" }}
        >
            <p>ID thi???t b???: {datum.id}</p>
            <p>Tr???ng th??i: {datum.status}</p>
        </Card>
    );
}

function Engine({ datum }) {
    const [value, setValue] = useState(125);
    const [direction, setDirection] = useState(
        datum.last_values >= 0 ? true : false
    );

    function onClick(e) {
        // publish
        publishData(datum, direction === true ? value : -value);
    }

    function handleChange(checked) {
        setValue(checked);
    }

    function switchDirection() {
        setDirection(!direction);
    }

    return (
        <Card
            title={datum.name}
            style={{ width: 300, margin: "10px 10px", borderRadius: "20px" }}
        >
            <p>ID thi???t b???: {datum.id}</p>
            <p>Tr???ng th??i: {datum.status}</p>
            <p>
                Chi???u quay :{" "}
                {direction
                    ? "Thu???n chi???u kim ?????ng h???"
                    : "Ng?????c chi???u kim ?????ng h???"}
            </p>
            <p>
                ?????i chi???u
                <span>
                    <Switch
                        defaultChecked={direction}
                        value={direction}
                        style={{ margin: "0 20px" }}
                        onChange={switchDirection}
                    />
                </span>
            </p>
            <p>T???c ????? quay</p>
            <Slider
                defaultValue={Math.abs(datum.last_values)}
                min={0}
                max={255}
                onChange={handleChange}
            />
            <Button type="primary" onClick={(e) => onClick(e)}>
                Nh???p
            </Button>
        </Card>
    );
}

function ControlPanel() {
    const [data, setData] = useState([]);
    const [constrains, setConstrains] = useState([]);
    const [open, setOpen] = useState(false);
    const [openAdd, setOpenAdd] = useState(false);
    const [item, setItem] = useState({});
    const [statusCode, setStatusCode] = useState(200);

    let name, type, feedName, feed, zoneId;

    //C??c function ????? UPDATE r??n bu???c m???i xu???ng database
    const handleClickOpen = (record) => {
        console.log("open");
        setItem(record);
        setOpen(true);
    };

    const handleClick = () => {
        setOpenAdd(!openAdd);
    };

    const handleClose = () => {
        console.log("close");
        setOpen(false);
    };

    const handleSubmit = () => {
        console.log(item);
        axios
            .post("http://localhost:3001/setConstrain", item)
            .then((res) => {
                if (res.status === 200) {
                    openNotification(
                        "C???p nh???t r??ng bu???c th??ng s??? m???i",
                        `Successful`,
                        true
                    );
                } else {
                    openNotification("???? c?? l???i x???y!", `Fail`, false);
                }
            })
            .catch((err) => {
                openNotification("???? c?? l???i x???y!", `Fail`, false);
            });
        setTimeout(handleClose, 1000);
    };

    const handleSubmitNewDevice = () => {
        const newDevice = {
            name: name,
            type: type,
            feed: feed,
            feedName: feedName,
            zoneId: zoneId,
        };

        console.log(newDevice);

        axios
            .post("http://localhost:3001/addNewDevice", newDevice)
            .then((res) => {
                if (res.data.statusCode === 200) {
                    // console.log("success");
                    openNotification(
                        "Th??m thi???t b??? m???i th??nh c??ng",
                        `${res.data.message}`,
                        true
                    );
                } else {
                    console.log("fail");
                    openNotification(
                        "???? c?? l???i x???y!",
                        `${res.data.message}`,
                        false
                    );
                }
            })
            .catch((err) => {
                openNotification("???? c?? l???i x???y!", ``, false);
            });
        setTimeout(handleClose, 1000);
    };

    const handleChangeUpper = (e) => {
        setItem({
            id: item.id,
            type: item.type,
            upper_bound: parseInt(e.target.value),
            lower_bound: parseInt(item.lower_bound),
        });
    };

    const handleChangeLower = (e) => {
        setItem({
            id: item.id,
            type: item.type,
            upper_bound: parseInt(item.upper_bound),
            lower_bound: parseInt(e.target.value),
        });
    };

    const handleChange = (e, typeChange) => {
        switch (typeChange) {
            case "name":
                name = e.target.value;
                break;
            case "type":
                type = e.target.value;
                break;
            case "feedName":
                feedName = e.target.value;
                break;
            case "feed":
                feed = e.target.value;
                break;
            case "zone":
                zoneId = e.target.value;
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        axios
            .get(`http://localhost:3001/device`)
            .then((response) => {
                console.log(response.data);
                setData(response.data);
                setStatusCode(200);
            })
            .catch((err) => setStatusCode(0));

        axios
            .get(`http://localhost:3001/constrain`)
            .then((response) => {
                setConstrains(response.data);
                setStatusCode(200);
            })
            .catch((err) => setStatusCode(0));
    }, [open]);

    // const changeFeedData = (checked) => {

    //
    //     socket.emit(
    //         "changeFeedData",
    //         `{
    //         "topic":"quan260402/feeds/bk-iot-light",
    //         "message":{
    //             "id":"13",
    //             "name":"LIGHT",
    //             "data":"X",
    //             "unit":""
    //         }
    //     }`
    //     );
    // };

    if (statusCode !== 200) {
        return <ErrorPage />;
    }

    return (
        <div className="ControlPanel">
            <div className="title">B???ng ??i???u khi???n thi???t b???</div>
            <div className="ControlPanel__Button">
                Th??m thi???t b??? m???i :
                <Button
                    style={{ margin: "0 10px" }}
                    onClick={() => handleClick()}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            </div>
            <div className="Device-block">
                {data &&
                    data
                        .filter((datum) => datum.type === "output")
                        .map((datum, id) => {
                            switch (datum.feedName) {
                                case "LED":
                                    return (
                                        <div
                                            className="animate__animated animate__fadeInDown"
                                            style={{
                                                animationDelay: `${id * 0.1}s`,
                                            }}
                                        >
                                            <Led datum={datum} />
                                        </div>
                                    );

                                case "LCD":
                                    return (
                                        <div
                                            className="animate__animated animate__fadeInDown"
                                            style={{
                                                animationDelay: `${id * 0.1}s`,
                                            }}
                                        >
                                            <LCD datum={datum} />
                                        </div>
                                    );

                                case "RELAY":
                                    return (
                                        <div
                                            className="animate__animated animate__fadeInDown"
                                            style={{
                                                animationDelay: `${id * 0.1}s`,
                                            }}
                                        >
                                            <WaterPump datum={datum} />
                                        </div>
                                    );

                                case "DRV_PWM":
                                    return (
                                        <div
                                            className="animate__animated animate__fadeInDown"
                                            style={{
                                                animationDelay: `${id * 0.1}s`,
                                            }}
                                        >
                                            <Engine datum={datum} />
                                        </div>
                                    );

                                case "SPEAKER":
                                    return (
                                        <div
                                            className="animate__animated animate__fadeInDown"
                                            style={{
                                                animationDelay: `${id * 0.1}s`,
                                            }}
                                        >
                                            <Speaker datum={datum} />
                                        </div>
                                    );

                                default:
                                    return <div></div>;
                            }
                        })}
            </div>

            {
                //Table hi???n th??? c??c r??n bu???c
            }
            <div className="title">Th??ng s??? r??ng bu???c</div>
            <div>
                <Table dataSource={constrains}>
                    <Column title="ID" dataIndex="id" key="id" />
                    <Column
                        title="Th??ng s??? r??ng bu???c"
                        dataIndex="type"
                        key="type"
                    />
                    <Column
                        title="Ch???n d?????i"
                        dataIndex="lower_bound"
                        key="lower_bound"
                    />
                    <Column
                        title="Ch???n tr??n"
                        dataIndex="upper_bound"
                        key="upper_bound"
                    />
                    <Column
                        title="Ch???nh s???a"
                        render={(text, record) => {
                            return (
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={() => handleClickOpen(record)}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                            );
                        }}
                    />
                </Table>
            </div>

            {
                // Dialog ????? edit r??ng bu???c
            }
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Thay ?????i r??ng bu???c
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Nh???p th??ng s??? r??n bu???c m???i cho {item.type}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Ch???n tr??n m???i"
                        type="text"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChangeUpper(e)}
                        defaultValue={item.upper_bound}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="Ch???n d?????i m???i"
                        type="text"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChangeLower(e)}
                        defaultValue={item.lower_bound}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Thay ?????i
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openAdd}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    Th??m thi???t b??? m???i
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Nh???p th??ng s??? c???a thi???t b??? m???i.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="T??n thi???t b???"
                        type="text"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChange(e, "name")}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="Lo???i thi???t b???"
                        type="text"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChange(e, "type")}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="T??n Feed c???a thi???t b???"
                        type="text"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChange(e, "feedName")}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="T??n Feed c???a thi???t b??? ??? tr??n Adafruit"
                        type="text"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChange(e, "feed")}
                    />
                    <TextField
                        margin="dense"
                        id="name"
                        label="Zone ID"
                        type="number"
                        fullWidth
                        style={{ margin: "10px 0px" }}
                        onChange={(e) => handleChange(e, "zone")}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClick()} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleSubmitNewDevice()}
                        color="primary"
                    >
                        Thay ?????i
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ControlPanel;
