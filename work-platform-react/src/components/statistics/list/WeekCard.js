import {useNavigate} from "react-router-dom";
import DateUtil from "../../../util/DateUtil";
import InfoCard from "./InfoCard";
import dayjs from "dayjs";

export default (props) => {
    const {data} = props;
    const {date : startDate} = data;
    const navigate = useNavigate();
    const endDate = dayjs(startDate).add(6,'day').format('YYYY-MM-DD');
    const weekNumber = dayjs(startDate).week();

    const title = <>
                    <span style={{fontSize: "1.5em"}}>{weekNumber}周</span>
                    <span>&nbsp;&nbsp;{startDate}&nbsp;{endDate}</span>
                </>

    const onClickCard =(id)=>{
        navigate('form/'+id)
    }

    return (
        <InfoCard onClick={onClickCard} title={title} data={data}/>
    )
}