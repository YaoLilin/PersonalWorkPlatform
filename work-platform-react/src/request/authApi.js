import {get,post,put,del} from './http'

const getRSAPublicKey = () => get('/api/auth/rsa/public-key');
const login = params => post('/api/auth/login',params);
const logout = () => post('/api/auth/logout');

const apis ={
    getRSAPublicKey,
    login,
    logout
}

export {apis as AuthApi};
