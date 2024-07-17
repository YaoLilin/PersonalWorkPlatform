import FieldLabel from "../../../util/FieldLabel";
import {DatePicker, Select, Space} from "antd";
import React, {useEffect, useState} from "react";
import ProjectBrowser from "../../public/projectBrowser";
import TypeSelector from "../../public/TypeSelector";
import useCommonCondition from "./useCommonCondition";

const WeekTimeChartConditions = ({onChange}) => {
    const [selectedDateRange, setSelectedDateRange] = useState(0);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const {commonConditionCom,selectedCountType,selectedProject,selectedType} = useCommonCondition();

    const handleConditionChange = ({
                                           dateRangeType, startDate, endDate, countType,projects,types
                                   }) => {
        onChange({
            selectedDateRange : dateRangeType !== undefined ? dateRangeType : selectedDateRange,
            customStartDate : startDate !== undefined ? startDate : customStartDate,
            customEndDate: endDate !== undefined ? endDate : customEndDate,
            selectedCountType : countType !== undefined ? countType : selectedCountType,
            selectedProjects : projects !== undefined ? projects : selectedProject.map(i => i.key),
            selectedTypes : types !== undefined ? types : selectedType.map(i => i.key)
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

    const handleCustomDateChange = (dates) => {
        if (dates && dates.length === 2) {
            let startDate = null;
            let endDate = null;
            if (dates[0]) {
                startDate = dates[0].day(1).format('YYYY-MM-DD');
                setCustomStartDate(startDate);
            }
            if (dates[1]) {
                endDate = dates[1].day(1).format('YYYY-MM-DD');
                setCustomEndDate(endDate);
            }
            if (startDate && endDate) {
                handleConditionChange({startDate,endDate});
            }
        }
    };

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
            {commonConditionCom}
        </div>
    )
}

export default WeekTimeChartConditions;