import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis ,AreaChart,  Tooltip,Area,} from 'recharts';
import '../styles/Statistic.css'

const temp = [
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
    return (
        <div className="Statistic">
            <div className="title">Thống kê tuần vừa qua</div>

            <div>Biểu độ nhiệt độ trung bình</div>
            <LineChart width={600} height={300} data={temp} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="uv" stroke="#e3242b" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
            </LineChart>


            <div>Biểu đồ độ ẩm đất trung bình</div>
            <AreaChart
                width={500}
                height={200}
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
    )
}

export default Statistic
