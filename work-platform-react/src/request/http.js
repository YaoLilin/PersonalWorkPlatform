import axios from "axios";

// 默认请求地址前缀
axios.defaults.baseURL ='http://localhost:8080';
// 超时时间
axios.defaults.timeout =10000;
// 默认post请求头参数
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

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

