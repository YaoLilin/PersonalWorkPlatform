import {Card,Flex} from "antd";

const ChartPage = () => {


    return (
        <Flex wrap gap="middle">
            <Card style={{width:500}} title={'每周利用时间统计'}/>
            <Card style={{width:500}} title={'每月利用时间统计'}/>
            <Card style={{width:500}} title={'利用时间占比'}/>
        </Flex>

    )
}

export default ChartPage;