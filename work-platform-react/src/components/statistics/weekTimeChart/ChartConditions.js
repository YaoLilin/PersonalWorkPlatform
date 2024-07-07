import FieldLabel from "../../../util/FieldLabel";
import {DatePicker, Select, Space} from "antd";
import React, {useEffect, useState} from "react";
import ProjectBrowser from "../../public/projectBrowser";
import TypeSelector from "../../public/TypeSelector";

const ChartConditions = ({onChange}) => {
    const [selectedDateRange, setSelectedDateRange] = useState(0);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);
    const [selectedCountType, setSelectedCountType] = useState(0);
    const [selectedProject, setSelectedProject] = useState([]);
    const [selectedType, setSelectedType] = useState([]);

    const handleConditionChange = ({
                                       dateRangeType, startDate, endDate, countType, project,type
                                   }) => {
        onChange({
            selectedDateRange : dateRangeType !== undefined ? dateRangeType : selectedDateRange,
            customStartDate : startDate !== undefined ? startDate : customStartDate,
            customEndDate: endDate !== undefined ? endDate : customEndDate,
            selectedCountType : countType !== undefined ? countType : selectedCountType,
            selectedProject : project !== undefined ? project : selectedProject.map(i => i.id).join(','),
            selectedType : type !== undefined ? type : selectedType
        });
    }

    const handleDateChange = (value) => {
        if (value !== 3) {
            handleConditionChange({
                selectedDateRange: value
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

    const handleCountTypeChange = (value) => {
        setSelectedCountType(value);
    }

    const handleProjectChange = (data) => {
        setSelectedProject(data);
        handleConditionChange({project: data.map(i => i.id).join(',')});
    }

    const handleTypeChange = (value) => {
        setSelectedType(value);
        handleConditionChange({type: value});
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
            <div style={{display: 'flex', gap: 20}}>
                <FieldLabel name={'统计纬度'}>
                    <Select style={{width: '100px'}}
                            size={"small"}
                            value={selectedCountType}
                            onChange={handleCountTypeChange}>
                        <Select.Option value={0}>项目</Select.Option>
                        <Select.Option value={1}>类型</Select.Option>
                    </Select>
                </FieldLabel>
                {selectedCountType === 0 &&
                    <FieldLabel name={'项目'}>
                        <ProjectBrowser value={selectedProject}
                                        multiple
                                        onChange={handleProjectChange} />
                    </FieldLabel>
                }
                {selectedCountType === 1 &&
                    <FieldLabel name={'类型'}>
                       <TypeSelector multiple
                                     value={selectedType}
                                     allowClear
                                     style={{width:180}}
                                     onChange={handleTypeChange}/>
                    </FieldLabel>
                }
            </div>
        </div>
    )
}

export default ChartConditions;