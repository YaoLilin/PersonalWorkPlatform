
import { Chart } from '@antv/g2';
import PropTypes from "prop-types";

const PieChart = ({data,style})=>{
    // data item : {item:text,count:number}
    let allTime= 0;
    data.forEach(i => allTime += i.count);
    data.forEach(i => i.percent = Number((i.count / allTime*100).toFixed(0)));

    const rendChart = ()=>{
        const chart = new Chart({
            container: 'chart-container',
            autoFit:true
        });

        chart.coordinate({ type: 'theta', outerRadius: 0.8 });

        chart
            .interval()
            .data(data)
            .transform({ type: 'stackY' })
            .encode('y', 'percent')
            .encode('color', 'item')
            .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
            .label({
                position: 'outside',
                text: (data) => `${data.item}: ${data.percent}%`,
            })
            .tooltip((data) => ({
                name: data.item,
                value: `${data.percent}%`,
            }));

        chart.render();
    }

    return <div id='chart-container' ref={()=>rendChart()} style={{...style}}>
    </div>
}

PieChart.defaultProps = {
    data : [],
    style: {}
}
PieChart.prototype = {
    data : PropTypes.array.isRequired
}

export default PieChart;