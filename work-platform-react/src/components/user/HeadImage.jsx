import {Avatar, Popover} from "antd";
import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {UserContext} from "../../provider/UserProvider";
import {AuthApi} from "../../request/authApi";
import UserUtil from "../../util/UserUtil";

/**
 * 用户头像
 */
const HeadImage = ({size = 55}) => {
    const {user,setUser} = useContext(UserContext);

    function getChineseName(name) {
        if (name.length > 2) {
            return name.slice(1, 3);
        } else if (name.length === 2) {
            return name.slice(0, 2);
        } else {
            return name[0];
        }
    }

    function getEnglishName(name) {
        if (name.length <= 5) {
            return name;
        }
        const parts = name.split(' ');
        if (parts.length > 1) {
            // 如果是全名，则返回姓氏部分
            if (parts[1].length <= 5) {
                return parts[1];
            }
            return parts[0].substring(0,5);
        } else {
            // 如果只有一个单词，则返回这个单词的前两个字母
            if (name.length <= 5) {
                return name;
            }
            return name.substring(0,5);
        }
    }

    const  getHeadText = () =>{
        if (!user) {
            return '?';
        }
        const name = user.name;
        if (!name) return '?';
        // 如果用户名称是中文，则取姓名部分
        const chineseRegex = /[\u4e00-\u9fa5]/;
        if (chineseRegex.test(name)){
            return getChineseName(name);
        }
        return getEnglishName(name);
    }

    const userMenu = ()=>{
        return(
            <div>
                <p className={'text-xl text-gray-500'}>
                    姚礼林
                </p>
                <p className={'mt-2'}>
                    <Link>用户设置</Link>
                </p>
                <p>
                    <span className={'text-red-500 hover:text-red-600 cursor-pointer'} onClick={()=>{
                        localStorage.setItem("user", null);
                        AuthApi.logout().then(()=>{
                            UserUtil.cleanUserLocalData();
                            window.location.href = '/login';
                        })
                    }}>退出登陆</span>
                </p>
            </div>
        )
    }
    return (
        <div className={'text-center'}>
            <Popover content={userMenu()}
                     trigger="click"
                     placement="right">
                <Avatar size={size} className={'bg-blue-500 cursor-pointer'}>
                    {getHeadText()}
                </Avatar>
            </Popover>
        </div>
    )
}

export default HeadImage;
