import {
    CheckCircleOutlined,
    FundViewOutlined,
    InfoCircleOutlined,
    ProjectOutlined,
    SisternodeOutlined, UserOutlined
} from '@ant-design/icons';
import {Avatar, Button, Dropdown, Layout, Menu, Popover, theme} from 'antd';
import 'moment/locale/zh-cn';
import React, {useContext, useEffect, useState} from 'react';
import {Link, Outlet, ScrollRestoration, useLocation, useNavigate} from "react-router-dom";
import './App.css';
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn';
import updateLocale from 'dayjs/plugin/updateLocale';
import {Content} from "antd/lib/layout/layout";
import weekday from 'dayjs/plugin/weekday';
import {UserContext} from "./provider/UserProvider";
import HeadImage from "./components/user/HeadImage";

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
    const {pathname} = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const {token: {colorBgContainer}} = theme.useToken();
    const [paddingLeft, setPaddingLeft] = useState(200);
    const selectedKey = getSelectedKey(pathname);
    useEffect(() => {
        document.title = import.meta.env.VITE_TITLE;
    }, []);
    const navigate = useNavigate();

    let defaultOpenKey;
    if (pathname.startsWith('/weeks') || pathname.startsWith('/months') || pathname.startsWith('/chart')) {
        defaultOpenKey = 'count';
    }
    if (pathname.startsWith('/goal')) {
        defaultOpenKey = 'goal';
    }

    return (
        <div>
            <Layout>
                {/*左侧导航栏*/}
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => {
                    setCollapsed(value);
                    setPaddingLeft(value ? 80 : 200);
                }}
                       style={{
                           paddingTop: "20px",
                           overflow: 'auto',
                           height: '100vh',
                           position: 'fixed',
                           left: 0,
                           top: 0,
                           bottom: 0,
                       }}>
                    <HeadImage size={collapsed ? 40 : 55}/>
                    <Menu theme="light"
                          className={'mt-2'}
                          style={{borderInlineEnd: ''}}
                          selectedKeys={[selectedKey]}
                          defaultOpenKeys={[defaultOpenKey]}
                          mode="inline"
                          items={items}
                          onClick={({key}) => navigate(key)}/>
                </Sider>
                <Content style={{padding: 20, minHeight: '100vh', marginLeft: paddingLeft}} key={pathname}>
                    <Outlet/>
                </Content>
            </Layout>
            <ScrollRestoration
                getKey={(location, matches) => {
                    return location.pathname;
                }}
            />
        </div>
    );
};

export default App;
