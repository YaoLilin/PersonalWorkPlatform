import {useEffect, useState} from "react";
import {getHiddenTimeRange, getHiddenTimeRangeStorageKey, toTimePickerValue} from "../utils/scheduleUtils";

/**
 * 管理用户隐藏时间段的本地保存与编辑。
 *
 * @param {{userName: string, messageApi: Object}} options 用户与消息依赖
 * @returns {Object} 隐藏时间段状态和操作
 */
export function useHiddenTimeRange({userName, messageApi}) {
    const [range, setRange] = useState(() => getHiddenTimeRange(userName));
    const [editor, setEditor] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    /**
     * 用户切换时，重新读取该用户保存的隐藏时间段设置。
     */
    useEffect(() => setRange(getHiddenTimeRange(userName)), [userName]);
    const save = () => {
        if (!editor) {
            localStorage.removeItem(getHiddenTimeRangeStorageKey(userName));
            setRange(null);
            setIsOpen(false);
            return;
        }
        const [start, end] = editor;
        if (!start.isBefore(end)) {
            messageApi.error("隐藏时间段的结束时间必须晚于开始时间");
            return;
        }
        const value = {start: start.format("HH:mm"), end: end.format("HH:mm"), enabled: true};
        localStorage.setItem(getHiddenTimeRangeStorageKey(userName), JSON.stringify(value));
        setRange(value);
        setIsOpen(false);
    };
    const open = () => {
        setEditor(range ? [toTimePickerValue(range.start), toTimePickerValue(range.end)] : null);
        setIsOpen(true);
    };
    const setEnabled = (enabled) => {
        if (!range) return;
        const value = {...range, enabled};
        localStorage.setItem(getHiddenTimeRangeStorageKey(userName), JSON.stringify(value));
        setRange(value);
    };
    return {range, editor, setEditor, isOpen, open, close: () => setIsOpen(false), save, setEnabled};
}
