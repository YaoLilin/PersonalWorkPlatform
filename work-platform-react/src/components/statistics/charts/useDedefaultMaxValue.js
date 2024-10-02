const useDefaultMaxValue = (apiData=[],defaultMaxValue = 100) => {
    const maxValue = Math.max(...apiData.map(i =>{
        return   i.items.reduce((sum,i1) => sum + i1.value,0);
    }),0);
    if (maxValue > defaultMaxValue) {
        defaultMaxValue = (maxValue + maxValue / 10).toFixed(0);
    }
    return defaultMaxValue;
}

export default useDefaultMaxValue;
