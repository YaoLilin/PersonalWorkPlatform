import FieldLabel from "../../ui/FieldLabel";
import {DatePicker, Select, Space} from "antd";
import React, {useState} from "react";
import CommonCondition from "./CommonCondition";

const WeekTimeChartConditions = ({onChange}) => {
    const [selectedDateRange, setSelectedDateRange] = useState(0);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [selectedCountType, setSelectedCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedType, setSelectedType] = useState([]);

    const handleConditionChange = ({
                                           dateRangeType, startDate, endDate, countType,projects,types
                                   }) => {
        onChange({
            dateRangeType : dateRangeType !== undefined ? dateRangeType : selectedDateRange,
            startDate : startDate !== undefined ? startDate : customStartDate,
            endDate: endDate !== undefined ? endDate : customEndDate,
            countType : countType !== undefined ? countType : selectedCountType,
            projects : projects ? projects : selectedProject,
            types : types ? types : selectedType
        });
    }

    const handleDateChange = (value) => {
        if (value !== 3) {
            handleConditionChange({
                dateRangeType: value
            });
        }
        setSelectedDateRange(value);
    };

    const handleCustomDateChange = ([startWeek,endWeek]) => {
        if (startWeek && endWeek) {
            let startDate = startWeek.day(1).format('YYYY-MM-DD');
            let endDate = endWeek.day(1).format('YYYY-MM-DD');
            setCustomStartDate(startDate);
            setCustomEndDate(endDate);
            handleConditionChange({startDate,endDate});
        }
    };

    const handleCommonConditionChange = ({countType,projects,types}) =>{
        setSelectedCountType(countType);
        setSelectedProject(projects);
        setSelectedType(types);
        handleConditionChange({countType,projects,types});
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12}}>
            <div style={{display: 'flex', gap: 20}}>
                <FieldLabel name={'选择日期'}>
                    <Space direction="horizontal" size={12}>
                        <Select value={selectedDateRange} onChange={handleDateChange} size={"small"}
                                style={{width: 100}}>
                            <Select.Option value={0}>近4周</Select.Option>
                            <Select.Option value={1}>近12周</Select.Option>
                            <Select.Option value={2}>近半年</Select.Option>
                            <Select.Option value={3}>自定义日期</Select.Option>
                        </Select>
                        {selectedDateRange === 3 && (
                            <DatePicker.RangePicker
                                picker={'week'}
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

export default WeekTimeChartConditions;