import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import "../styles/ControlPanel.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import { Card } from "antd";
import { Switch } from "antd";
import { io } from "socket.io-client";
import { Select } from "antd";
import { Slider } from "antd";
import { Input } from "antd";
import { Button } from "antd";
import { Table} from 'antd';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import 'animate.css'
import ErrorPage from "./ErrorPage";
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

function Led({datum}){

    function onChange(value){
        //publish
        publishData(datum, value);
    }

    return (
        <Card title={datum.name} style={{ width: 300, margin: "10px 10px" ,borderRadius: "20px"}}>
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <span>Chọn :</span>
            <Select
                defaultValue="2"
                onChange={(value) => onChange(value)}
                style={{ width: 100, margin: "0 20px" }}
            >
                <Option value="2">Xanh</Option>
                <Option value="1">Đỏ</Option>
                <Option value="0">Tắt</Option>
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
            style={{ width: 300, margin: "10px 10px" , borderRadius: "20px"}}
        >
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <p>Âm lượng</p>
            <Slider
                defaultValue={500}
                min={0}
                max={1023}
                onChange={(value) => onChange(value)}
            />
            <Button type="primary" onClick={(e) => onClick(e)}>
                Nhập
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
            setState("Không vượt quá 12 ký tự");
        } else {
            setState("");
        }
    }

    return (
        <Card
            title={datum.name}
            extra={
                <Switch
                    defaultChecked
                    onChange={(checked, event) => {
                        onChange(checked, event, datum);
                    }}
                />
            }
            style={{ width: 300, margin: "10px 10px" , borderRadius: "20px"}}
        >
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <Search
                placeholder="Nhập chuỗi kí tự"
                allowClear
                enterButton="Nhập"
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
                    defaultChecked
                    onChange={(checked) => {
                        const data = checked ? 1 : 0;
                        setValue(data);
                        publishData(datum, value);
                    }}
                />
            }
            style={{ width: 300, margin: "10px 10px" , borderRadius: "20px"}}
        >
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
        </Card>
    );
}

function Engine({ datum }) {
    const [value, setValue] = useState(125);
    const [direction, setDirection] = useState(true);

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
            extra={
                <Switch
                    defaultChecked
                    onChange={(checked) => {
                        handleChange(checked);
                    }}
                />
            }
            style={{ width: 300, margin: "10px 10px" , borderRadius: "20px"}}
        >
            <p>ID thiết bị: {datum.id}</p>
            <p>{datum.status}</p>
            <p>
                Chiều quay :{" "}
                {direction === true
                    ? "Thuận chiều kim đồng hồ"
                    : "Ngược chiều kim đồng hồ"}{" "}
            </p>
            <p>
                {" "}
                Đổi chiều
                <span>
                    <Switch
                        value={direction}
                        style={{ margin: "0 20px" }}
                        onChange={switchDirection}
                    />
                </span>
            </p>
            <p>Tốc độ quay</p>
            <Slider
                defaultValue={0}
                min={0}
                max={255}
                onChange={handleChange}
            />
            <Button type="primary" onClick={(e) => onClick(e)}>
                Nhập
            </Button>
        </Card>
    );
}

function ControlPanel() {
    const [data, setData] = useState([]);
    const [constrains, setConstrains] = useState([]);
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState({});
    const [statusCode, setStatusCode] = useState(200);
   
    //Các function để UPDATE ràn buộc mới xuống database
    const handleClickOpen = (record) => {
        console.log("open")
        setItem(record)
        setOpen(true);
    };

    const handleClose = () => {
        console.log("close")
        setOpen(false);
    };

    const handleSubmit = () => {
        console.log(item)
        axios.post("http://localhost:3001/setConstrain", item)
        .then((res) => {
            if (res.status === 200) {
                console.log("success");
            }
        })
        .catch((err) => {
            console.log("fail");
        });
        setTimeout ( handleClose,1000);
        
        
    };

    const handleChangeUpper = (e)=>{
        setItem(
            {
                id : item.id,
                type : item.type,
                upper_bound : parseInt(e.target.value),
                lower_bound : parseInt(item.lower_bound)
            }
        )
    }

    const handleChangeLower = (e)=>{
        setItem(
            {
                id : item.id,
                type : item.type,
                upper_bound : parseInt(item.upper_bound),
                lower_bound : parseInt(e.target.value)
            }
        )

    }

    useEffect(() => {
        axios.get(`http://localhost:3001/`).then((response) => {
            setStatusCode(response.data.code);
        })
        .catch((err) => {
            setStatusCode(0);
        })

        axios.get(`http://localhost:3001/device`).then((response) => {
            setData(response.data);
        });

        axios.get(`http://localhost:3001/constrain`).then((response) => {
            setConstrains(response.data);
        });

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

    if(statusCode !== 200){
        return <ErrorPage />
    }

    return (
        <div>
            <div className="title">Bảng điều khiển thiết bị</div>
            <div className="Device-block">
                {data &&
                    data
                        .filter((datum) => datum.type === "output")
                        .map((datum,id) => {
                            switch (datum.feedName) {
                                case "LED":
                                    return <div className="animate__animated animate__fadeInDown" style={{animationDelay: `${id*0.1}s`}}><Led datum={datum} /></div>
                                    
                                case "LCD":
                                    return <div className="animate__animated animate__fadeInDown" style={{animationDelay: `${id*0.1}s`}}><LCD datum={datum} /></div>
                                    
                                case "RELAY":
                                    return <div className="animate__animated animate__fadeInDown" style={{animationDelay: `${id*0.1}s`}}><WaterPump datum={datum} /></div>
                               
                                case "DRV_PWM":
                                    return <div className="animate__animated animate__fadeInDown" style={{animationDelay: `${id*0.1}s`}}><Engine datum={datum} /></div>
                                    
                                case "SPEAKER":
                                    return <div className="animate__animated animate__fadeInDown" style={{animationDelay: `${id*0.1}s`}}><Speaker datum={datum} /></div>
                      
                                default:
                                    return <div></div>
                            }
                        })}
            </div>

            {
                //Table hiển thị các ràn buộc
            }
            <div className="title">Thông số ràng buộc</div>
            <div>
                <Table dataSource={constrains} >
                    <Column title="ID" dataIndex="id" key="id" />
                    <Column title="Thông số ràng buộc" dataIndex="type" key="type" />
                    <Column title="Chặn dưới" dataIndex="lower_bound" key="lower_bound" />
                    <Column title="Chặn trên" dataIndex="upper_bound" key="upper_bound" />
                    <Column title="Chỉnh sửa" render={(text, record) => {
                        
                        return (
                            <Button variant="outlined" color="primary" onClick={()=>handleClickOpen(record)}>
                                <FontAwesomeIcon icon={faEdit}/>
                            </Button>
                        )
                    }}/>
                </Table>
            </div>

            {// Dialog để edit ràng buộc
            }
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Thay đổi ràng buộc</DialogTitle>
                <DialogContent>
                <DialogContentText>
                    Nhập thông số ràn buộc mới cho {item.type}
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Chặn trên mới"
                    type="text"
                    fullWidth
                    style={{margin: "10px 0px"}}
                    onChange={(e) => handleChangeUpper(e)}
                    defaultValue={item.upper_bound}
                />
                <TextField
                    margin="dense"
                    id="name"
                    label="Chặn dưới mới"
                    type="text"
                    fullWidth
                    style={{margin: "10px 0px"}}
                    onChange={(e) => handleChangeLower(e)}
                    defaultValue={item.lower_bound}
                />
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Thay đổi
                </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}


export default ControlPanel;
