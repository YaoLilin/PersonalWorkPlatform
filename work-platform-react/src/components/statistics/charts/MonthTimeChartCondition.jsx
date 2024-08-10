import FieldLabel from "../../ui/FieldLabel";
import {Select, Space,DatePicker} from "antd";
import {useState} from "react";
import CommonCondition from "./CommonCondition";

const MonthTimeChartCondition = ({onChange,defaultMonth = 4,monthItems = []}) => {
    const [selectedDateRange, setSelectedDateRange] = useState(defaultMonth);
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

    const monthAllOptions = [
        {value: 6, label: '近1月'},
        {value: 7, label: '近2月'},
        {value: 8, label: '近3月'},
        {value: 4, label: '近6月'},
        {value: 5, label: '近12月'},
        {value: 3, label: '自定义'}
    ];
    const monthOptions = monthItems.length > 0 ?
        monthAllOptions.filter(i => monthItems.includes(i.value)) : monthAllOptions;

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12}}>
            <div style={{display: 'flex', gap: 20}}>
                <FieldLabel name={'选择月份'}>
                    <Space direction="horizontal" size={12}>
                        <Select value={selectedDateRange} onChange={handleDateRangeChange} size={"small"}
                                style={{width: 100}}>
                            {
                                monthOptions.map(i => (
                                    <Select.Option key={i.value} value={i.value}>{i.label}</Select.Option>
                                ))
                            }
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
    );
}

export default MonthTimeChartCondition;