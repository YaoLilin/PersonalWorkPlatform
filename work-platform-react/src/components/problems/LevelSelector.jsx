import {Select} from "antd";
import React from "react";

const LevelSelector = ({value,onSelect})=>{

    return (
        <div style={{display: 'flex'}}>
            <div style={{width: 200}}>
                <Select options={[
                    {
                        value: 1,
                        label: '低',
                    },
                    {
                        value: 2,
                        label: '高',
                    },
                ]}
                        value={value}
                        onSelect={onSelect}
                        style={{width: 80}}
                />
            </div>
        </div>
    )
}

export default LevelSelector;