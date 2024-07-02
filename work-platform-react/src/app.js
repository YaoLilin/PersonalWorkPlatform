import {
    CheckCircleOutlined,
    FundViewOutlined,
    InfoCircleOutlined,
    ProjectOutlined,
    SisternodeOutlined
} from '@ant-design/icons';
import {ConfigProvider, Layout, Menu, theme} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'moment/locale/zh-cn';
import {useEffect, useState} from 'react';
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import './App.css';
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn';
import updateLocale from 'dayjs/plugin/updateLocale';
import {MessageProvider} from "./provider/MessageProvider";
import {ThemProvider} from "./provider/ThemProvider";

const weekday = require('dayjs/plugin/weekday')
dayjs.extend(weekday)
dayjs.extend(updateLocale);
dayjs.updateLocale('zh-cn', {
    weekStart: 1,
});

const {Sider} = Layout;

function getItem(label, path, icon, children) {
    return {
        key: path,
        icon,
        children,
        label,
    };
}

const items = [
    getItem('项目', '/projects', <ProjectOutlined style={{fontSize: '1.2em'}}/>),
    getItem('类型', '/type', <SisternodeOutlined style={{fontSize: '1.2em'}}/>),
    getItem('问题库', '/problems', <InfoCircleOutlined style={{fontSize: '1.2em'}}/>),
    getItem('工作统计', 'count', <FundViewOutlined style={{fontSize: '1.2em'}}/>, [
        getItem('周统计', '/weeks'),
        getItem('月统计', '/months'),
        getItem('统计图表', '/chart'),
    ]),
    getItem('目标', 'goal', <CheckCircleOutlined style={{fontSize: '1.2em'}}/>, [
        getItem('周目标', '/goal/weeks'),
        getItem('月目标', '/goal/months'),
    ]),
];

const getSelectedKey = (pathname) => {
    let defaultSelectedKey;
    if (pathname || pathname.startsWith('/projects')) {
        defaultSelectedKey = '/projects';
    }
    if (pathname.startsWith('/type')) {
        defaultSelectedKey = '/type';
    }
    if (pathname.startsWith('/problems')) {
        defaultSelectedKey = '/problems';
    }
    if (pathname.startsWith('/projects')) {
        defaultSelectedKey = '/projects';
    }
    if (pathname.startsWith('/weeks')) {
        defaultSelectedKey = '/weeks';
    }
    if (pathname.startsWith('/months')) {
        defaultSelectedKey = '/months';
    }
    if (pathname.startsWith('/chart')) {
        defaultSelectedKey = '/chart';
    }
    if (pathname.startsWith('/goal/months')) {
        defaultSelectedKey = '/goal/months';
    }
    if (pathname.startsWith('/goal/weeks')) {
        defaultSelectedKey = '/goal/weeks';
    }
    return defaultSelectedKey;
}

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState();
    const {token: {colorBgContainer}} = theme.useToken();
    const {pathname} = useLocation();
    useEffect(() => {
        document.title = "个人工作平台";
        setSelectedKey(getSelectedKey(pathname));
    }, [pathname])
    const navigate = useNavigate();

    let defaultOpenKey;
    if (pathname.startsWith('/weeks') || pathname.startsWith('/months') || pathname.startsWith('/chart')) {
        defaultOpenKey = 'count';
    }
    if (pathname.startsWith('/goal')) {
        defaultOpenKey = 'goal';
    }

    return (
        <>
            <ConfigProvider locale={zhCN}>
                <ThemProvider>
                    <MessageProvider>
                        <Layout
                            style={{
                                minHeight: '100vh',
                            }}
                        >
                            {/*左侧导航栏*/}
                            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
                                   style={{background: "#fff", paddingTop: "20px"}}>
                                <Menu theme="light"
                                      style={{borderInlineEnd: ''}}
                                      selectedKeys={[selectedKey]}
                                      defaultOpenKeys={[defaultOpenKey]}
                                      mode="inline"
                                      items={items}
                                      onClick={({key}) => navigate(key)}/>
                            </Sider>
                            <Layout className="site-layout">
                                <Outlet/>
                            </Layout>
                        </Layout>
                    </MessageProvider>
                </ThemProvider>
            </ConfigProvider>
        </>
    );
};

export default App;