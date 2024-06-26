import dayjs from "dayjs";

const getWeekRange = (weekNumber,year)=>{
    if (!weekNumber || !year) {
        return {};
    }
    const date = dayjs().year(year).week(weekNumber).day(1);
    const endDate = date.date(date.date() + 6);
    return{
        startDate : date.format('YYYY-MM-DD'),
        endDate : endDate.format('YYYY-MM-DD')
    }
}

const getWeekRangeByDate = (date)=>{
    if (!date){
        return '';
    }
    const startDate = dayjs(date);
    const endDate = startDate.add(6,'day');
    return{
        startDate : startDate.format('YYYY-MM-DD'),
        endDate : endDate.format('YYYY-MM-DD')
    }
}

const DateUtil = {
    getWeekRange,
    getWeekRangeByDate
}

export default DateUtil