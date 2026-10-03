import {Tag} from "antd";

/**
 * 统计结果中的清单标识。
 *
 * @returns {JSX.Element} 与周详情一致的清单标签。
 */
const ChecklistTag = () => (
    <Tag style={{display: 'inline-flex', alignItems: 'center', flexShrink: 0, marginLeft: 6, marginRight: 0, fontSize: 10,
        color: '#1677ff', background: '#fff', borderColor: '#e6e6e6', borderRadius: 8}}>清单</Tag>
);

export default ChecklistTag;
