import React, {useState} from 'react';
import {AuthApi} from "../../request/authApi";
import JSEncrypt from 'jsencrypt';
import {MessageProvider} from "../../provider/MessageProvider";
import LoginForm from "../../components/login/LoginForm";
import RegisterUser from "../../components/login/RegisterUser";

const encryptor = new JSEncrypt();

export async function loader(params) {
    return await AuthApi.getRSAPublicKey();
}


function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);

    return (
        <main className="auth-page">
            <MessageProvider>
                <section className="auth-page__intro">
                    <p>PERSONAL WORKSPACE</p>
                    <h1>个人工作平台</h1>
                    <span>专注于重要的事，清晰地规划每一天。</span>
                </section>
                <div className="auth-page__card">
                    {
                        isRegister ? <RegisterUser onClickBack={() => setIsRegister(false)} /> :
                            <LoginForm onClickRegister={() => setIsRegister(true)}/>
                    }
                </div>
            </MessageProvider>
        </main>
    );
}

export default LoginPage;
