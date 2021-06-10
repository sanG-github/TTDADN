// action
export const updateHumidity = (value) => {
    return {
        type : 'HUMIDITY', value : value
    }
}

export const updateTemperature = (value) => {
    return {
        type : 'TEMPERATURE', value: value
    }
}

export const updateMoisture = (value) => {
    return {
        type : 'MOISTURE', value : value
    }
}

export const updateLight = (value) => {
    return {
        type : 'LIGHT', value : value
    }
}

export const updateUsername = (value) => {
    return {
        type : 'USERNAME', value : value
    }
}