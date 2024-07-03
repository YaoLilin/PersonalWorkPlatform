import {useRouteError} from "react-router-dom";

function ErrorBoundary() {
    let error = useRouteError();
    console.error(error);
    // Uncaught ReferenceError: path is not defined
    return (
        <div style={{color: '#ff1616', padding: 20}}>
            <div style={{
                padding: 20,
                backgroundColor: '#fce0cf',
                borderRadius: 12
            }}>
                <p style={{fontSize: '2em'}}>页面出现错误</p>
                <div style={{fontSize: '1.4em'}}>
                    <p>{error.message}</p>
                    <p>{error.data}</p>
                    <p>status:{error.status}</p>
                </div>

            </div>
        </div>)

}

export default ErrorBoundary;