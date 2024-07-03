import {Button, Tag} from "antd";
import {MonthsApi} from "../../request/monthsApi";
import {useLoaderData, useNavigate} from "react-router-dom";
import InfoCard from "../../components/statistics/list/InfoCard";
import ListTitle from "../../components/ui/ListTitle";
import {useContext} from "react";
import {MessageContext} from "../../provider/MessageProvider";
import handleLoaderError from "../../util/handleLoaderError";

export async function loader() {
    try {
        return await MonthsApi.getMonthList({});
    } catch (e) {
        handleLoaderError(e);
    }
}

const MonthList = ()=>{
    const data = useLoaderData();
    const navigate = useNavigate();
    const messageApi = useContext(MessageContext);
    // 对月份记录按年来分组
    const cardMap = new Map();
    data.forEach(month => {
        const year = month.year;
        if (cardMap.has(year)) {
            const monthList = cardMap.get(year);
            monthList.push(month);
        }else {
            const monthList = [month];
            cardMap.set(year, monthList);
        }
    });

    const bottomFlag =<Tag color={'red'}
                           style={{position:'absolute',bottom:'30px',right:"20px",fontSize:'1em'}}>
                            未总结
                      </Tag>

    const getCards = (cardMap) => {
        const cards = [];
        cardMap.forEach((value, key) => {
            const box =
                <div key={key}>
                    <ListTitle title={key+'年'}/>
                    <div style={{padding: "20px 0", display: "flex"}}>
                        {
                            value.map(item => {
                                return <InfoCard  key={item.id}
                                                  title={<span style={{fontSize: "1.5em"}}>{item.month}月</span>}
                                                  data={item}
                                                  bottomFlag={!item.isSummarize ? bottomFlag : null}
                                                  onClick={id => navigate('form/'+id)}
                                />
                            })
                        }
                    </div>
                </div>
            cards.push(box);
        });
        return cards;
    }

    const reCount =()=>{
        MonthsApi.reCount().then(()=>{
            messageApi.success("重新统计成功",5);
            window.setTimeout(()=>window.location.reload(),1000);
        }).catch(()=>{
            messageApi.error("重新统计失败",5);
        })
    }

    return (
        <div>
            <Button style={{width: '100px', float: "right", marginRight: '5%'}}
                    onClick={() => reCount()} >重新统计</Button>
            <div style={{paddingTop: 30}}>
                {getCards(cardMap).map(item => item)}
            </div>
        </div>
    )
}

export default MonthList;