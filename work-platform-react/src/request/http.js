import axios from "axios";

// 默认请求地址前缀
// 超时时间
axios.defaults.timeout =10000;
// 默认post请求头参数
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

// 拦截接口请求
axios.interceptors.request.use(
    (config) => {
        if (config.url.includes("/auth/login") || config.url.includes("/auth/register")
            || config.url.includes("/auth/rsa")) {
            return config;
        }
        // 向请求中添加授权token
        config.headers.token = localStorage.getItem('authToken');
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 接口返回未授权拦截，跳转到登录页面
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.config.url.includes("/auth/login")){
                return Promise.reject(error);
            }
            // 如果请求被服务器处理了，但返回了错误状态码
            switch (error.response.status) {
                case 401:
                case 403:
                    // 重定向到登录页面
                    window.location.href = '/login';
                    break;
                default:
                    // 其他错误处理
                    return Promise.reject(error);
            }
        } else {
            // 处理请求未被服务器处理的情况
            return Promise.reject(error);
        }
    }
);

export function get(url,resourceId,params){
    url = replaceResIdToUrl(url,resourceId);
    return new Promise((resolve,reject)=>{
        axios.get(url,{
            params:params
        }).then(res =>{
            resolve(res.data);
        }).catch(err =>{
            console.error('请求失败：'+err);
            reject(err.data)
        })
    });
}

export function post(url,params){
    return new Promise((resolve,reject)=>{
        axios.post(url,params).then(res=>{
            resolve(res.data);
        }).catch(err=>{
            console.error('请求失败：'+err);
            reject(err);
        })
    });
}

export function put(url,resourceId,params){
    url = replaceResIdToUrl(url,resourceId);
    return new Promise((resolve,reject)=>{
        axios.put(url,params).then(res=>{
            resolve(res.data);
        }).catch(err=>{
            console.error('请求失败：'+err);
            reject(err);
        })
    });
}

export function del(url,resourceId,params){
    url = replaceResIdToUrl(url,resourceId);
    return new Promise((resolve,reject)=>{
        axios.delete(url,params).then(res=>{
            resolve(res.data);
        }).catch(err=>{
            console.error('请求失败：'+err);
            reject(err);
        })
    });
}

/**
 * 将资源id放到请求路径内，如果路径没有"{id}"则直接将资源id添加到路径后，否则将"{id}"替换为资源id
 * @param url 请求路径
 * @param resourceId 资源id
 */
function replaceResIdToUrl(url,resourceId) {
    if (resourceId){
        if (url.includes('{id}')) {
            url = url.replace('{id}',resourceId);
        } else {
            url = url + '/' + resourceId;
        }
    }
    return url;
}

