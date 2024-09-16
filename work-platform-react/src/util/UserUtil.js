
const setUserLocalData = (userObjJson,jwtToken)=>{
    localStorage.setItem('authToken', jwtToken);
    localStorage.setItem('user', userObjJson);
}

const getUserData = ()=>{
    if (localStorage.getItem('user') != null) {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch (e) {
            console.error("无法从本地存储中解析用户信息")
        }
    }
    return null;
}

const cleanUserLocalData = ()=>{
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

const UserUtil = {
    setUserLocalData,
    getUserData,
    cleanUserLocalData
}

export default UserUtil;
