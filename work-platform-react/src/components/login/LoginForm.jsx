import {Button, Form, Input} from "antd";
import {Link, useNavigate} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "@/provider/UserProvider";
import {MessageContext} from "@/provider/MessageProvider";
import {AuthApi} from "../../request/authApi";
import UserUtil from "../../util/UserUtil";
import JSEncrypt from "jsencrypt";
const encryptor = new JSEncrypt();

const LoginForm = ({onClickRegister,style})=>{
    useEffect(()=>{
        AuthApi.getRSAPublicKey().then(result =>{
            encryptor.setPublicKey(result);
        });
    },[]);
    const [loading, setLoading] = useState(false);
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();
    const messageApi = useContext(MessageContext);

    const handleLogin = async ({username, password}) => {
        setLoading(true);
        const params = {
            loginName: username,
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

    return(
        <Form onFinish={handleLogin} style={{...style}}>
            <h1 className={'text-2xl text-blue-500 text-center'}>登陆</h1>
            <Form.Item name={'username'} className={'pt-7'} rules={[{required: true, message: '请输入用户名'}]}>
                <Input placeholder={'请输入用户名'}/>
            </Form.Item>
            <Form.Item name={'password'} className={'m-0'} rules={[{required: true, message: '请输入密码'}]}>
                <Input.Password placeholder={'请输入密码'}/>
            </Form.Item>
            <div className={'pt-4 text-blue-500 overflow-hidden'}>
                <a href={'#'} className={'block float-left'} onClick={onClickRegister}>注册</a>
                <Link to={'#'} className={'block float-right'}>忘记密码</Link>
            </div>
            <div className={'pt-10'}>
                <Button className={'w-full'} type={'primary'} htmlType="submit"
                        loading={loading}>登陆</Button>
            </div>
        </Form>
    )
}

export default LoginForm;
