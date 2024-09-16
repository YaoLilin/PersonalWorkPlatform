import './App.css';
import ReactDOM from "react-dom/client";
import React from "react";
import {createBrowserRouter, RouterProvider, ScrollRestoration} from "react-router-dom";
import App from "./app";
import ProjectList, {loader as projectsLoader} from "./screens/project/List";
import {loader as typeLoader, TypeEditPage} from "./screens/type/EditPage";
import WeekList, {loader as weekListLoader} from "./screens/statistics/WeekList";
import WeekForm, {loader as stFormLoader} from "./screens/statistics/WeekForm";
import ProjectCreate from "./screens/project/CreateForm";
import ProjectEdit, {loader as editProjectLoader} from "./screens/project/EditForm";
import ProblemLib, {loader as problemLoader} from "./screens/problem/List";
import MonthList, {loader as monthListLoader} from "./screens/statistics/MonthList";
import MonthForm, {loader as monthFormLoader} from "./screens/statistics/MonthForm";
import WeekGoalList, {loader as weekGoalListLoader} from "./screens/goal/WeekGoalList";
import MonthGoalList, {loader as monthGoalListLoader} from "./screens/goal/MonthGoalList";
import ChartPage from "./screens/statistics/ChartPage";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LoginPage, {loader as userLoader} from "./screens/login/LoginPage";
import zhCN from "antd/locale/zh_CN";
import {ConfigProvider} from "antd";
import {ThemProvider} from "./provider/ThemProvider";
import {MessageProvider} from "./provider/MessageProvider";
import {UserProvider} from "./provider/UserProvider";


const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        errorElement: <ErrorBoundary/>,
        children: [
            {
                path: 'projects',
                element: <ProjectList/>,
                loader: projectsLoader,
            },
            {
                path: '',
                element: <ProjectList/>,
                loader: projectsLoader,
            },
            {
                path: 'type',
                element: <TypeEditPage/>,
                loader: typeLoader,
            },
            {
                path: 'problems',
                element: <ProblemLib/>,
                loader: problemLoader,
            },
            {
                path: 'addProject',
                element: <ProjectCreate/>,
            },
            {
                path: 'project/:id',
                element: <ProjectEdit/>,
                loader: editProjectLoader,
            },
            {
                path: 'weeks',
                element: <WeekList/>,
                loader: weekListLoader,
            },
            {
                path: 'months',
                element: <MonthList/>,
                loader: monthListLoader,
            },
            {
                path: 'chart',
                element: <ChartPage/>
            },
            {
                path: 'months/form/:monthId',
                element: <MonthForm/>,
                loader: monthFormLoader,
            },
            {
                path: 'weeks/form/add',
                element: <WeekForm isFormCreate/>,
                loader: stFormLoader,
            },
            {
                path: 'weeks/form/:weekId',
                element: <WeekForm/>,
                loader: stFormLoader,
            },
            {
                path: 'goal/weeks',
                element: <WeekGoalList/>,
                loader: weekGoalListLoader
            },
            {
                path: 'goal/months',
                element: <MonthGoalList/>,
                loader: monthGoalListLoader
            }
        ]
    },
    {
        path: '/login',
        element: <LoginPage/>,
        errorElement: <ErrorBoundary/>,
        loader: userLoader
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ConfigProvider locale={zhCN}
                        theme={{
                            components: {
                                Layout: {
                                    siderBg: '#fff',
                                    triggerBg: '#67b3fb'
                                },
                            },
                        }}>
            <ThemProvider>
                <MessageProvider>
                    <UserProvider>
                        <RouterProvider router={router}/>
                    </UserProvider>
                </MessageProvider>
            </ThemProvider>
        </ConfigProvider>
    </React.StrictMode>
);

