import React from 'react'
import '../styles/GardenControl.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons'

function GardenControl() {




    return (
        <div>
            <div className="title">Điều khiển vườn</div>

            <div className="Inner">
                <div className="Display">
                    <div className="Garden">
                        <div className="Block Zone1"><p className="Rotate">Zone 1 <FontAwesomeIcon icon={faInfoCircle}/></p> </div>
                        <div className="Block Zone2"><p className="Rotate">Zone 2 <FontAwesomeIcon icon={faInfoCircle}/></p> </div>
                        <div className="Block Zone3">Zone 3 <FontAwesomeIcon icon={faInfoCircle}/></div>
                        <div className="Block Zone4"><p className="Rotate">Zone 4 <FontAwesomeIcon icon={faInfoCircle}/></p> </div>
                        <div className="Block Zone5"><p className="Rotate">Zone 5 <FontAwesomeIcon icon={faInfoCircle}/></p> </div>
                    </div>
                </div>
                <div className="Control">
                    click vô zone xong cái list thiết bị sẽ hiện ra ở đây ok không Sang
                </div>
                
            </div>
            

        </div>
    )
}

export default GardenControl
