import {Button, Form, Input} from "antd";
import {Link, useNavigate} from "react-router-dom";
import React, {useContext, useEffect, useState} from "react";
import {UserContext} from "@/provider/UserProvider";
import {MessageContext} from "@/provider/MessageProvider";
import {AuthApi} from "../../request/authApi";
import UserUtil from "../../util/UserUtil";
import JSEncrypt from "jsencrypt";
const encryptor = new JSEncrypt();

/**
 * 登录表单。
 *
 * @param {{onClickRegister: Function, style?: Object}} props 注册切换回调及可选的外部样式。
 * @returns {JSX.Element} 登录表单。
 */
const LoginForm = ({onClickRegister,style})=>{
    // 初始化登录所需的 RSA 公钥，确保密码提交前完成加密。
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
            <h2 className="auth-form__title">登录</h2>
            <Form.Item name={'username'} className={'pt-7'} rules={[{required: true, message: '请输入用户名'}]}>
                <Input placeholder={'请输入用户名'}/>
            </Form.Item>
            <Form.Item name={'password'} className={'m-0'} rules={[{required: true, message: '请输入密码'}]}>
                <Input.Password className="auth-form__password" placeholder={'请输入密码'}/>
            </Form.Item>
            <div className="auth-form__links">
                <a href={'#'} onClick={onClickRegister}>注册</a>
                <Link to={'#'}>忘记密码</Link>
            </div>
            <div className="auth-form__submit">
                <Button className="auth-form__submit-button" type={'primary'} htmlType="submit"
                        loading={loading}>登陆</Button>
            </div>
        </Form>
    )
}

export default LoginForm;
