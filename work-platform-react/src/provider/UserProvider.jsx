
import {createContext, useState} from "react";
import UserUtil from "../util/UserUtil";

const UserContext = createContext();

// Provider 组件
const UserProvider = ({ children }) => {
    const [user, setUser] = useState(()=>{
        return UserUtil.getUserData();
    });

    return (
        <UserContext.Provider value={{user,setUser}}>
            {children}
        </UserContext.Provider>
    );
};

export {UserContext,UserProvider};
