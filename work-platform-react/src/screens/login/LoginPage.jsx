
import React, {useContext, useState} from 'react';
import './loginPage.css'
import {Button, Input} from "antd";
import {ThemeContext, ThemProvider} from "../../provider/ThemProvider";
import {Link} from "react-router-dom";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        // 这里可以添加登录逻辑
        console.log('Username:', username, 'Password:', password);
    };

    return (
        <div className={'login-container'}>
            <p className={'title'}>个人工作平台</p>
            <div className={'login-form'}>
                <form onSubmit={handleLogin}>
                    <h1 style={{color:'#30a1f7'}}>登陆</h1>
                    <div style={{padding:'10px 0'}}>
                        <Input placeholder={'请输入用户名'}/>
                    </div>
                    <div style={{padding:'10px 0'}}>
                        <Input.Password placeholder={'请输入密码'} />
                    </div>
                    <div>
                        <Link to={'#'}>忘记密码</Link>
                    </div>
                    <div style={{paddingTop:'30px'}}>
                        <Button >登陆</Button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default LoginPage;
