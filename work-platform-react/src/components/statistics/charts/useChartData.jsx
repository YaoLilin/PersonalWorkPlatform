
const useChartData = (apiData =[])=>{
    // 获取所有类型名称
    const xName = [];
    const categories = [];
    const seriesData = [];
    apiData.forEach(i => {
        i.items.forEach(it => {
            const seriesDataItem = seriesData.find(s => s.name === it.name);
            if (!seriesDataItem) {
                categories.push(it.name);
                seriesData.push({
                    name: it.name,
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    barMaxWidth:40,
                })
            }
        });
        xName.push(i.date);
    });

    seriesData.forEach(s =>{
        const data = [];
        apiData.forEach(i =>{
           const item = i.items.find(it => it.name === s.name);
           data.push(item ? item.value : 0)
        });
        s.data = data;
    });
    const totalData = xName.map(i => 0);
    // 为每个数据项添加合计，显示在柱子顶部
    seriesData.push({
        name: '全部',
        type: 'bar',
        stack: 'total',
        data: totalData, // 初始化为0，因为我们将使用labelFormatter计算总和
        itemStyle: {
            color: 'transparent' // 使这个系列的柱子透明
        },
        label: {
            show: true, // 显示 label
            position: 'top',
            formatter: function (params) {
                // 获取当前数据项的索引
                const index = params.dataIndex;
                // 计算所有堆叠系列在当前数据项上的总和
                let total = 0;
                for (let i = 0; i < seriesData.length - 1; i++) {
                    total += seriesData[i].data[index];
                }
                return total; // 返回总和
            }
        }
    });
    return {seriesData, xName,categories}
}

export default useChartData;