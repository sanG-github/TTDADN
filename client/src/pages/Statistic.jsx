import React from 'react'
import  { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, CartesianGrid, XAxis, YAxis ,AreaChart,  Tooltip,Area } from 'recharts';
import { BarChart, Bar, Legend} from 'recharts';
import '../styles/Statistic.css'
// import { Doughnut, Pie} from 'react-chartjs-2';
import { addDays } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';  
import 'animate.css'
import ErrorPage from './ErrorPage';


// Data pattern for Pie Chart
// const data =
// {
//     labels: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'],
//     datasets:[
//       {
//         label:'Population',
//         data:[
//           617594,
//           181045,
//           153060,
//           106519,
//           105162,
//           95072
//         ],
//         backgroundColor:[
//           'rgba(255, 99, 132, 0.6)',
//           'rgba(54, 162, 235, 0.6)',
//           'rgba(255, 206, 86, 0.6)',
//           'rgba(75, 192, 192, 0.6)',
//           'rgba(153, 102, 255, 0.6)',
//           'rgba(255, 159, 64, 0.6)',
//           'rgba(255, 99, 132, 0.6)'
//         ]
//       }
//     ]
//   }

// Data pattern for Rechart.org
// const temp1 = [
//     {name: 'Thứ 2', uv: 34, amt: 55},
// ]



function Statistic() {

    const [temp,setTemp] = useState([]);
    const [moisture,setMoisture] = useState([]);
    const [humidity,setHumidity] = useState([]);
    const [state, setState] = useState([
        {
          startDate: addDays(new Date(), -7),
          endDate: new Date(),
          key: 'selection'
        }
      ]);

    const [statusCode, setStatusCode] = useState(200);

    useEffect(() => {
        var endDate = addDays(state[0].endDate, 1)
        axios.get(`http://localhost:3001/statistic/temperature?from=${state[0].startDate.toString()}&to=${endDate.toString()}`).then((response) => {
            console.log(response.data);
            var arr = [];
            response.data.forEach((datum) => {
                arr.push({
                    name : `Ngày ${datum.date}`,
                    uv : datum.record,
                    amt : 55
                })
            })
            setTemp(arr)
            setStatusCode(200);
        })
        .catch((err) => {
            setStatusCode(0);
        })
    },[state]);

    useEffect(() => {
        var endDate = addDays(state[0].endDate, 1)
        axios.get(`http://localhost:3001/statistic/moisture?from=${state[0].startDate.toString()}&to=${endDate.toString()}`).then((response) => {
            console.log(response.data);
            var arr = [];
            response.data.forEach(datum => {
                arr.push({
                    name : `Ngày ${datum.date}`,
                    uv : datum.record,
                    amt : 1023
                })
            })
            setMoisture(arr)
            setStatusCode(200);
        })
        .catch((err) => {
            setStatusCode(0);
        })
    },[state]);

    useEffect(() => {
        var endDate = addDays(state[0].endDate, 1)
        axios.get(`http://localhost:3001/statistic/humidity?from=${state[0].startDate.toString()}&to=${endDate.toString()}`).then((response) => {
            console.log(response.data);
            var arr = [];
            response.data.forEach(datum => {
                arr.push({
                    name : `Ngày ${datum.date}`,
                    uv : datum.record,
                    amt : 100
                })
            })
            setHumidity(arr)
            setStatusCode(200);
        })
        .catch((err) => {
            setStatusCode(0);
        })
    },[state]);

    function handleSelectDate(item){
        setState([item.selection])
        if(state[0].startDate){
            console.log(state[0].startDate.getDate().toString())
        }
    }

    if(statusCode !== 200){
        return <ErrorPage />
    }

    return (
        <div className="Statistic">

            <div className="title">Thống kê tuần vừa qua</div>

            <div className="Inner">
                <div className="ChartBlock">
                    <div className="Chart animate__animated animate__fadeInRight" style={{animationDelay: "0.4s"}}>
                        <LineChart width={750} height={300} data={temp} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <Line type="monotone" dataKey="uv" stroke="#e3242b" />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <XAxis dataKey="name" />
                                <YAxis />
                        </LineChart>
                        <div className="title">Biểu độ nhiệt độ trung bình</div>
                    </div>
                    
                    <div className="Chart animate__animated animate__fadeInRight animate__delay-2s" style={{animationDelay: "0.6s"}}>
                        <AreaChart
                                width={750}
                                height={300}
                                data={moisture}
                                syncId="anyId"
                                margin={{
                                top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                            }}
                        >
                            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="uv" stroke="#82ca9d" fill="#45b6f2" />
                        </AreaChart>
                        <div className="title">Biểu đồ độ ẩm đất trung bình</div>
                    </div>

                    <div className="Chart animate__animated animate__fadeInRight animate__delay-3s" style={{animationDelay: "0.8s"}}>
                    <BarChart
                            width={750}
                            height={300}
                            data={humidity}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="uv" fill="#8884d8" />
                        </BarChart>
                        <div className="title">Biểu đồ độ ẩm không khí trung bình</div>
                    </div>
                </div>

                <div className="">
                    <div className="Datepicker animate__animated animate__fadeInUp">
                        <DateRange
                            onChange={item => handleSelectDate(item)}
                            months={1}
                            ranges={state}
                            direction="horizontal"
                        />
                    </div>
                </div>
            </div>
            {/* <div className="PieChart">
                <Doughnut data={data}/>
            </div> */}
        </div>
    )
}

export default Statistic
