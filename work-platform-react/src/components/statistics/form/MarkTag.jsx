import {Tag} from "antd";
import React from "react";

const MarkTag = (props)=>{
    const {mark} = props;
    const getMarkColor = (mark) => {
        if (mark === 1) {
            return 'red';
        } else if (mark === 2) {
            return 'green';
        } else if (mark === 3){
            return 'blue';
        }
    }

    const getMarkText = (mark) => {
        if (mark === 1) {
            return '不合格';
        } else if (mark === 2) {
            return '合格';
        } else if (mark === 3) {
            return '优秀';
        } else {
            return '';
        }
    }

    return mark ? <Tag color={getMarkColor(mark)}>{getMarkText(mark)}</Tag> : null
}

export default MarkTag;