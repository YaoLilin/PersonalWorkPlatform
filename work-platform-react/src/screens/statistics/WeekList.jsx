import {Button} from "antd";
import {useLoaderData, useNavigate} from "react-router-dom";
import WeekCard from "../../components/statistics/list/WeekCard";
import {WeeksApi} from "../../request/weeksApi";
import ListTitle from "../../components/ui/ListTitle";
import {useMemo} from "react";

export async function loader() {
    return await WeeksApi.getWeekList({});
}

const WeekList =  () => {
    const navigate = useNavigate();
    const data = useLoaderData();
    const cardMap = useMemo(()=>{
        const cardMap = new Map();
        data.forEach(week => {
            const date = new Date(week.date);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            // 生成每个月的周记录集合
            if (cardMap.has(year +''+month)) {
                const weekList = cardMap.get(year + '' + month);
                weekList.push(week);
            } else {
                const weekList = [week];
                cardMap.set(year + '' + month, weekList);
            }
        });
        return cardMap;
    },[data])

    const getWeekCard = (cardMap) => {
        const cards = [];
        cardMap.forEach((value, key) => {
            const box =
                <div key={key} style={{marginTop:20}}>
                    <ListTitle title={key.substring(4, 6)+'月'} littleTitle={key.substring(0, 4)+'年'}/>
                    <div style={{display: "flex",flexFlow:'row wrap'}}>
                        {
                            value.map(item => {
                                return (<div style={{marginTop:'20px'}}>
                                    <WeekCard data={item} key={item.id}/>
                                </div>)
                            })
                        }
                    </div>
                </div>
            cards.push(box);
        });
        return cards;
    }

    return (
        <div style={{height:'100%',overflowY:'auto'}}>
            <Button type={"primary"} onClick={() => {
                navigate("form/add")
            }} style={{width: '100px', float: "right", marginRight: '5%'}}>添加</Button>
            <div style={{paddingTop: 30}}>
                {getWeekCard(cardMap).map(item => item)}
            </div>
        </div>
    )
}

export default WeekList;
