import {createStore} from 'redux'


// initial state
const initState = {
    light: 0,
    temperature: 0,
    moisture: 0,
    humidity: 0,
    username : "",
}


// reducer
const reducer  = ( state = initState, action)=>{
    switch(action.type){
        case 'TEMPERATURE' : return {
            ...state,
            temperature: action.value

        };
        case 'HUMIDITY' : return {
            ...state,
            humidity: action.value

        };
        case 'MOISTURE' : return {
            ...state,
            moisture: action.value

        };
        case 'LIGHT' : return {
            ...state,
            light: action.value

        };
        case 'USERNAME' : return {
            ...state,
            username : action.value

        };
        default :
            return state;
    }
}

// store
let store = createStore(reducer);


export default store