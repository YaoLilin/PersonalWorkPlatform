import React, {useContext, useState} from 'react';
import {Button, Form, Input} from "antd";
import {Link, useLoaderData, useNavigate} from "react-router-dom";
import {AuthApi} from "../../request/authApi";
import JSEncrypt from 'jsencrypt';
import {MessageContext, MessageProvider} from "../../provider/MessageProvider";
import {UserContext} from "../../provider/UserProvider";
import UserUtil from "../../util/UserUtil";

const encryptor = new JSEncrypt();

export async function loader(params) {
    return await AuthApi.getRSAPublicKey();
}


function LoginPage() {
    const publicKey = useLoaderData();
    encryptor.setPublicKey(publicKey);
    const [loading, setLoading] = useState(false);
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();
    const messageApi = useContext(MessageContext);

    const handleLogin = async ({username, password}) => {
        setLoading(true);
        const params = {
            name: username,
            password: password ? encryptor.encrypt(password) :''
        }
        AuthApi.login(params).then(data => {
            setLoading(false);
            const {token,user} = data;
            UserUtil.setUserLocalData(JSON.stringify(user), token);
            setUser(user);
            navigate('/');
        }).catch(e => {
            setLoading(false);
            const data = e.response?.data;
            if (!data) {
                messageApi.error('登陆失败', 3);
                return;
            }
            if (data.type === 'USER_OR_PASSWORD_ERROR') {
                messageApi.error('用户名或密码不正确', 3);
            } else {
                messageApi.error('登陆失败', 3);
            }
        });
    };

    return (
        <div className={'h-screen bg-blue-100'}>
            <MessageProvider>
                <p className={'fixed text-5xl top-1/3 text-blue-500 left-32'}>个人工作平台</p>
                <div className={'fixed bg-white right-1/4 top-1/4 p-10 rounded-xl shadow-xl'}>
                    <Form onFinish={handleLogin}>
                        <h1 className={'text-2xl text-blue-500 text-center'}>登陆</h1>
                        <Form.Item name={'username'} className={'pt-7'} rules={[{required: true, message: '请输入用户名'}]}>
                            <Input placeholder={'请输入用户名'}/>
                        </Form.Item>
                        <Form.Item name={'password'} className={'m-0'} rules={[{required: true, message: '请输入密码'}]}>
                            <Input.Password placeholder={'请输入密码'}/>
                        </Form.Item>
                        <div className={'pt-4 text-blue-500 overflow-hidden'}>
                            <a href={'#'} className={'block float-left'}>注册</a>
                            <Link to={'#'} className={'block float-right'}>忘记密码</Link>
                        </div>
                        <div className={'pt-10'}>
                            <Button className={'w-full'} type={'primary'} htmlType="submit"
                                    loading={loading}>登陆</Button>
                        </div>
                    </Form>
                </div>
            </MessageProvider>
        </div>
    );
}

export default LoginPage;
