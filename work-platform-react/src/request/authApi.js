import {get,post,put,del} from './http'

const getRSAPublicKey = () => get('/api/auth/rsa/public-key');
const login = params => post('/api/auth/login',params);

const apis ={
    getRSAPublicKey,
    login
}

export {apis as AuthApi};
