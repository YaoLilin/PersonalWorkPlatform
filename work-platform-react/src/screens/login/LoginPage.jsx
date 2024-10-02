import React, {useContext, useState} from 'react';
import {Button, Form, Input} from "antd";
import {Link, useLoaderData, useNavigate} from "react-router-dom";
import {AuthApi} from "../../request/authApi";
import JSEncrypt from 'jsencrypt';
import {MessageContext, MessageProvider} from "../../provider/MessageProvider";
import {UserContext} from "../../provider/UserProvider";
import UserUtil from "../../util/UserUtil";
import LoginForm from "../../components/login/LoginForm";
import RegisterUser from "../../components/login/RegisterUser";

const encryptor = new JSEncrypt();

export async function loader(params) {
    return await AuthApi.getRSAPublicKey();
}


function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);

    return (
        <div className={'h-screen flex flex-row-reverse items-center bg-blue-100'}>
            <MessageProvider>
                <p className={'fixed text-5xl top-1/3 text-blue-500 left-32'}>个人工作平台</p>
                <div className={'bg-white mr-60 p-10 rounded-xl shadow-xl'}
                     style={{maxWidth:330,maxHeight:800}}>
                    {
                        isRegister ? <RegisterUser onClickBack={() => setIsRegister(false)} /> :
                            <LoginForm onClickRegister={() => setIsRegister(true)}/>
                    }
                </div>
            </MessageProvider>
        </div>
    );
}

export default LoginPage;
