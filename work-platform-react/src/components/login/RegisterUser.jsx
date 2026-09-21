// import Back from '../../assets/icons/back.svg'
import BackIcon from '@/assets/icons/back.svg?react';
import React, {useContext, useEffect} from "react";
import {Button, Form, Input} from "antd";
import {AuthApi} from "@/request/authApi";
import UserUtil from "@/util/UserUtil";
import {MessageContext} from "@/provider/MessageProvider";
import {UserContext} from "@/provider/UserProvider";
import {useNavigate} from "react-router-dom";
import JSEncrypt from "jsencrypt";

const encryptor = new JSEncrypt();

/**
 * 用户注册表单。
 *
 * @param {{onClickBack?: Function, style?: Object}} props 返回登录页回调及可选的外部样式。
 * @returns {JSX.Element} 注册表单。
 */
const RegisterUser = ({
                          onClickBack = () => {
                          }, style = {}
                      }) => {
    // 初始化注册所需的 RSA 公钥，确保密码提交前完成加密。
    useEffect(() => {
        AuthApi.getRSAPublicKey().then(result => {
            encryptor.setPublicKey(result);
        });
    }, []);
    const messageApi = useContext(MessageContext);
    const {setUser} = useContext(UserContext);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleResister = (values) => {
        const {name, loginName, email, password} = values;
        AuthApi.register({name, loginName, email, password: password ? encryptor.encrypt(password) : ''})
            .then(result => {
                const {token, user} = result;
                UserUtil.setUserLocalData(JSON.stringify(user), token);
                setUser(user);
                navigate('/');
            }).catch(() => {
            messageApi.error('注册失败', 3);
        });
    }

    return (
        <div>
            <div>
                <BackIcon style={{width: 40, height: 40, cursor: "pointer"}} onClick={onClickBack}/>
            </div>
            <Form onFinish={handleResister}
                  form={form}
                  labelCol={{span: 24}}
                  labelGutter={16}
                  labelAlign={'right'}
                  style={{width: 250, ...style}}>
                <h2 className="auth-form__title">注册</h2>
                <Form.Item label={'用户名'} name={'name'} className={'pt-2 mb-2'}
                           rules={[{required: true, message: '请输入用户名'}]}>
                    <Input/>
                </Form.Item>
                <Form.Item label={'登录名'} name={'loginName'} className={'mb-2'}
                           rules={[{required: true, message: '请输入登录名'}]}>
                    <Input/>
                </Form.Item>
                <Form.Item label={'邮箱'} name={'email'} className={'mb-2'}
                           rules={[{required: true, message: '请输入邮箱地址'}, {
                               type: 'email',
                               message: '请输入正确的邮箱地址'
                           }]}>
                    <Input />
                </Form.Item>
                <Form.Item label={'密码'}
                           name={'password'}
                           className={'mb-2'}
                           rules={[{required: true, message: '请输入密码'},]}>
                    <Input.Password/>
                </Form.Item>
                <Form.Item label={'再次输入密码'}
                           name={'checkPassword'}
                           dependencies={['password']}
                           rules={[{required: true, message: '请确认密码'},
                               ({getFieldValue}) => ({
                                   validator(_, value) {
                                       if (!value || getFieldValue('password') === value) {
                                           return Promise.resolve();
                                       }
                                       return Promise.reject(new Error('与前面输入的密码不一致'));
                                   },
                               }),]}>
                    <Input.Password/>
                </Form.Item>
                <div className={'pt-6'}>
                    <Button className="auth-form__submit-button" type={'primary'} htmlType="submit">注册</Button>
                </div>
            </Form>
        </div>
    )
}

export default RegisterUser;
