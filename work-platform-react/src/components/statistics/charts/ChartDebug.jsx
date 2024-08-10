import {Column} from "@ant-design/charts";
import {useState} from "react";


const data1 = [
    {xname:'2024-01', value: 10},
    {xname:'2024-02', value: 10},
    {xname:'2024-03', value: 10}
]

const data2 = [
    {xname:'2024-01', value: 10},
    {xname:'2024-03', value: 10}
]

const ChartDebug = () => {
    const [state, setState] = useState(true);

    const chartData = state ? data1 : data2;
    const config = {
        data:chartData,
        xField: 'xname',
        yField: 'value',
        colorField:'xname',
        style:{
            radiusTopLeft: 8,
            radiusTopRight: 8,
            maxWidth: 30
        },
    };
    return (
        <div style={{height: 300}}>
            <div onClick={()=>{
                setState(!state);
            }}>更改数据</div>
            <Column {...config} />
        </div>
    )
}

export default ChartDebug;