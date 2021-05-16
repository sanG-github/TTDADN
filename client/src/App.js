import React, { useState ,useEffect} from "react";
import axios from "axios";
import 'antd/dist/antd.css';
import "./App.css";
import { Table, Tag, Space } from 'antd';
const { Column, ColumnGroup } = Table;
require("dotenv").config();

function App() {
    const [feeds, setFeeds] = useState([]);

    useEffect(() => {
      axios
            .get("http://localhost:3001/getAllFeeds")
            .then((res) => {
                setFeeds(res.data);
                console.log(res.data)
            })
            .catch((err) => console.log(err));
    });
    

    const onChangeFeed = (type, feedName, value, innerText) => {
        
        console.log(type, feedName, value, innerText);
        var nextValue;
        if (type === "toggle") nextValue = innerText;
        else {
            if (innerText === "+") nextValue = parseInt(value) + 1;
            else nextValue = parseInt(value) - 1;
        }

        console.log(feedName, nextValue);

        axios
            .post("http://localhost:3001/changeFeed", {
                data: { feedName: feedName, value: nextValue },
            })
            .then((res) => console.log(res.data))
            .catch((err) => console.log(err));
    };

    return (
        <div className="App">

  
            <div className="wrapper">
  
                <ul className="list-group">
                    { feeds ? <li>
                            {feeds.last_value}
                        </li> : ""
                    
                    // <Table dataSource={feeds}>
                    //   <Column title="Module" dataIndex="key" key="key" />
                    //   <Column title="Value" dataIndex="last_value" key="last_value" />
                  
                    //   {/* <Column
                    //     title="Action"
                    //     key="action"
                    //     render={(text, record) => (
                    //       <Space size="middle">
                    //         <a>Invite {record.lastName}</a>
                    //         <a>Delete</a>
                    //       </Space>
                    //     )}
                    //   /> */}
                    // </Table> : ""
                        
                    }
                </ul>
            </div>
        </div>
    );
}

export default App;
