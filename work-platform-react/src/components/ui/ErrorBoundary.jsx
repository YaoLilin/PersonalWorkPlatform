import {useRouteError} from "react-router-dom";

function ErrorBoundary() {
    let error = useRouteError();
    const status = error?.status;
    // 接口返回未授权错误不处理，交给接口拦截去处理
    if (status === 401 || status === 403 ) {
        return;
    }
    console.error(error);
    // Uncaught ReferenceError: path is not defined
    const renderStackMessage = (stack)=>{
        if (stack) {
            return stack.split('\n').map(i => <p style={{fontSize:14}}>{i}</p>);
        }
        return null;
    }

    return (
        <div style={{color: '#4d2723', padding: 20}}>
            <div style={{
                padding: 20,
                backgroundColor: '#F9ECEB',
                borderRadius: 12
            }}>
                <p style={{fontSize: '2em'}}>页面出现错误</p>
                <div style={{fontSize: '1.4em'}}>
                    <p>{error.message}</p>
                    {renderStackMessage(error.stack)}
                    <p>{error.data}</p>
                    <p>status:{error.status}</p>
                </div>

            </div>
        </div>)

}

export default ErrorBoundary;
