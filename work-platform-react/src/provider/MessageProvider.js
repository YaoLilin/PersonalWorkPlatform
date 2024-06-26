
import {createContext} from "react";
import { message } from 'antd';

// 创建 MessageContext
const MessageContext = createContext();

// Provider 组件
const MessageProvider = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage();

    return (
        <MessageContext.Provider value={messageApi}>
            {contextHolder}
            {children}
        </MessageContext.Provider>
    );
};

export {MessageContext,MessageProvider};