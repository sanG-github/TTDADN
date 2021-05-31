import React from 'react'
import  { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, CartesianGrid, XAxis, YAxis ,AreaChart,  Tooltip,Area,ResponsiveContainer } from 'recharts';
import '../styles/Statistic.css'
import { Doughnut, Pie} from 'react-chartjs-2';

const data =
{
    labels: ['Boston', 'Worcester', 'Springfield', 'Lowell', 'Cambridge', 'New Bedford'],
    datasets:[
      {
        label:'Population',
        data:[
          617594,
          181045,
          153060,
          106519,
          105162,
          95072
        ],
        backgroundColor:[
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ]
      }
    ]
  }

const temp1 = [
    {name: 'Thứ 2', uv: 34, amt: 55},
    {name: 'Thứ 3', uv: 33, amt: 55},
    {name: 'Thứ 4', uv: 35, amt: 55},
    {name: 'Thứ 5', uv: 29, amt: 55},
    {name: 'Thứ 6', uv: 37, amt: 55},
    {name: 'Thứ 7', uv: 38, amt: 55},
    {name: 'Chủ nhật', uv: 35, amt: 55},
]

const moisture = [
    {name: 'Thứ 2', uv: 554, amt: 1023},
    {name: 'Thứ 3', uv: 640, amt: 1023},
    {name: 'Thứ 4', uv: 740, amt: 1023},
    {name: 'Thứ 5', uv: 700, amt: 1023},
    {name: 'Thứ 6', uv: 600, amt: 1023},
    {name: 'Thứ 7', uv: 690, amt: 1023},
    {name: 'Chủ nhật', uv: 650, amt: 1023},
]


function Statistic() {

    const [temp,setTemp] = useState([]);
    const [moisture,setMoisture] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/statistic/temperature').then((response) => {
            console.log(response.data);
            var arr = [];
            response.data.map(datum => {
                arr.push({
                    name : `Ngày ${datum.date}`,
                    uv : datum.record,
                    amt : 55
                })
            })
            setTemp(arr)
        })
    },[]);

    useEffect(() => {
        axios.get('http://localhost:3001/statistic/moisture').then((response) => {
            console.log(response.data);
            var arr = [];
            response.data.map(datum => {
                arr.push({
                    name : `Ngày ${datum.date}`,
                    uv : datum.record,
                    amt : 1023
                })
            })
            setMoisture(arr)
        })
    },[]);

    return (
        <div className="Statistic">
            <div className="title">Thống kê tuần vừa qua</div>

            <div>Biểu độ nhiệt độ trung bình</div>

            <div className="Chart">
            
            <LineChart width={750} height={300} data={temp} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="uv" stroke="#e3242b" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
            </LineChart>
            
            </div>
            


            <div>Biểu đồ độ ẩm đất trung bình</div>

            <div className="Chart">
            
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
            
            </div>

            <div className="PieChart">
                <Doughnut data={data}/>
            </div>
            
            
        </div>
    )
}

export default Statistic
