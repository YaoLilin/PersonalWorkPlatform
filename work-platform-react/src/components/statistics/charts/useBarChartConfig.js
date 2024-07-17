
const useBarChartConfig = (data) => {
    return  {
        data,
        xField: 'xname',
        yField: 'value',
        colorField:'type',
        stack: {
            groupBy: ['x', 'series'],
            series: false,
        },
        axis:{
            x:{
                style: {
                    labelTransform: 'rotate(0)',
                }
            }
        },
        scale:{
            y:{
                domainMax: 1000,
            }
        },
        tooltip:{
            items: [
                {
                    field:'value',
                    valueFormatter: (value)=>`${value} 分钟`
                }
            ],
        },
        style:{
            radiusTopLeft: 8,
            radiusTopRight: 8,
            maxWidth: 30
        }
    };
}

export default useBarChartConfig;