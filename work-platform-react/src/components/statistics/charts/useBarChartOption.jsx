
const useBarChartOption = (data =[], categories=[],xName=[],defaultMaxValue = 1000, unit = '分钟') => {
    // ECharts 配置
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter :(params)=>{
                // 不显示系列的值为0的数据
                let html = '';
                // params数组每个元素表示一个系列
                params.forEach(item =>{
                    if (item.seriesName === '全部' || item.value === 0) {
                        return;
                    }
                    html+='<div style="font-size: 12px;display: flex;align-items: center">';
                    html+= item.marker;
                    html+= `<div style="padding: 0 10px 0 10px;display: inline-block;width: 120px;white-space: nowrap;
                            text-overflow:ellipsis;overflow: hidden">
                                ${item.seriesName} 
                            </div>
                            <span> ${item.value} ${unit} </span>`;
                    html+='</div>'
                });
                return html ? `<div>${html}</div>` : null;
            }
        },
        legend: {
            data: categories
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: xName,
                axisTick: {
                    alignWithLabel: true,
                },
                axisLine: { // 隐藏轴线
                    show: false
                },
                axisLabel: {
                    rotate: xName.length > 5 ? 45 :0
                }
            },
        ],
        yAxis:{
            max:defaultMaxValue,
            scale: true,
        },
        series: data
    };
}

export default useBarChartOption;
