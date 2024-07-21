import FieldLabel from "../../../util/FieldLabel";
import {Select, Space,DatePicker} from "antd";
import {useState} from "react";
import CommonCondition from "./CommonCondition";

const MonthTimeChartCondition = ({onChange}) => {
    const [selectedDateRange, setSelectedDateRange] = useState(4);
    const [selectedStartMonth, setSelectedStartMonth] = useState(null);
    const [selectedEndMonth, setSelectedEndMonth] = useState(null);
    const [selectedCountType, setSelectedCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedType, setSelectedType] = useState([]);

    const handleConditionChange = ({
                                       dateRangeType, startDate, endDate, countType,projects,types
                                   }) => {
        onChange({
            dateRangeType : dateRangeType !== undefined ? dateRangeType : selectedDateRange,
            startDate : startDate  ? startDate : selectedStartMonth,
            endDate: endDate ? endDate : selectedEndMonth,
            countType : countType !== undefined ? countType : selectedCountType,
            projects : projects ? projects : selectedProject,
            types : types ? types : selectedType
        });
    }

    const handleCommonConditionChange = ({countType,projects,types}) =>{
        setSelectedCountType(countType);
        setSelectedProject(projects);
        setSelectedType(types);
        handleConditionChange({countType,projects,types});
    }

    const handleDateRangeChange = (value) => {
        setSelectedDateRange(value);
        if (value !== 3) {
            handleConditionChange({dateRangeType: value});
        }
    }

    const handleCustomDateChange = ([startMonth, endMonth])=>{
        if (startMonth && endMonth) {
            const startDate =  startMonth.format('YYYY-MM-DD');
            const endDate = endMonth.format('YYYY-MM-DD');
            setSelectedStartMonth(startDate);
            setSelectedEndMonth(endDate);
            handleConditionChange({startDate,endDate});
        }
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12}}>
            <div style={{display: 'flex', gap: 20}}>
                <FieldLabel name={'选择月份'}>
                    <Space direction="horizontal" size={12}>
                        <Select value={selectedDateRange} onChange={handleDateRangeChange} size={"small"}
                                style={{width: 100}}>
                            <Select.Option value={4}>近6月</Select.Option>
                            <Select.Option value={5}>近12月</Select.Option>
                            <Select.Option value={3}>自定义</Select.Option>
                        </Select>
                        {selectedDateRange === 3 && (
                            <DatePicker.RangePicker
                                picker={'month'}
                                size={"small"}
                                onCalendarChange={handleCustomDateChange}
                            />
                        )}
                    </Space>
                </FieldLabel>
            </div>
            <CommonCondition onChange={handleCommonConditionChange}/>
        </div>
    )
}

export default MonthTimeChartCondition;