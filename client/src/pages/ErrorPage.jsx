import React from 'react'
import warning from '../img/warning.png'
import '../styles/ErrorPage.css'

function ErrorPage() {
    return (
        <div className="Error">
            <div className="Banner">
                <img src={warning} alt="" style={{ width: "300px", margin: "0 5px" }}/>
            </div>
            
            <div className="title">Lost connection</div> 
        </div>
    )
}

export default ErrorPage
