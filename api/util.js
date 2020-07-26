const config = require('./config/secrets.js')
const axios = require('axios')

module.exports = {
    prepForTransformToRows : prepForTransformToRows,
    transformToRows:transformToRows,
    transformToRowsTournament: transformToRowsTournament,
    doRequest: doRequest
}

function prepForTransformToRows(responseData, skipFields) {

    let parsedRows = {}
    for (var key in responseData) {
        if(responseData.hasOwnProperty(key) && !skipFields.includes(key)) {
            parsedRows[key] = responseData[key]
        }
    }
    return parsedRows
    
}

function transformToRows(parsedObject) {
    /* 
    tournaments: values will always have same number of items in array
    input: 
        {
            Name: [name1,name2],
            Status: [status1, status2] 
        }  
    output: 
        [
            {Name: name1, Status: status1}, 
            {Name: name2, Status: status2}
        ]
    */

    let keys = Object.keys(parsedObject)

    let flatData = []
    for (let i=0; i < keys.length; i++) {
        let key = keys[i];
        
        var val = parsedObject[key]
        for (let j=0; j < val.length; j++) {

            let objExists = flatData[j]
            if (objExists) {
                objExists[key] = val[j]
                flatData[j] = Object.assign(flatData[j], objExists)
            }
            else {
                objExists = {[key]: val[j]}
                flatData[j] = objExists 
            }
        } 
    }

    return flatData
    
}

async function doRequest(apiCommand, paramsObject) {

    let url = `${config.pokerApiHost}:${config.pokerApiFilePort}/api`
    let requestParams = {
        params: {
            "Command": apiCommand, 
            "Password": config.pokerApiPassword,
            "JSON": "Yes"
        }
    }

    if (paramsObject) {
        for (let key in paramsObject) {
            if (paramsObject.hasOwnProperty(key)) {
                requestParams.params[key] = paramsObject[key]
            }
        }
    }

    return axios.get(url,requestParams)
}

function transformToRowsTournament(tournamentArray, skipFields) {
    /* 
    data is from search for a game name on a specific date
    Input: 
        [
        "Tournament=Bob Barker",
        "Number=15",
        "Currency=Primary",
        "BuyIn=0+0",
        "Bounty=0",
        "PrizeBonus=0",
        "MultiplyBonus=No",
        "Entrants=4",
        "Late=0",
        "Tickets=0",
        "Removed=0",
        "Rebuys=1",
        "AddOns=0",
        "RebuyCost=0+0",
        "NetBonus=0",
        "StopOnChop=No",
        "Start=2020-07-24 21:06:08",
        "Place4=doobiegirl (0) Rebuys:1 AddOn:No KO:SeaGuard",
        "Place3=SeaGuard (0) Rebuys:0 AddOn:No KO:mother-goose",
        "Place2=ant (0) Rebuys:0 AddOn:No KO:mother-goose",
        "Place1=mother-goose (0) Rebuys:0 AddOn:No KO:mother-goose",
        "Stop=2020-07-24 22:04:25",
        "",
        "Tournament=Bob Barker",
        "Number=18",
        "Currency=Primary",
        "BuyIn=0+0",
        "Bounty=0",
        "PrizeBonus=0",
        "MultiplyBonus=No",
        "Entrants=4",
        "Late=0",
        "Tickets=0",
        "Removed=0",
        "Rebuys=0",
        "AddOns=0",
        "RebuyCost=0+0",
        "NetBonus=0",
        "StopOnChop=No",
        "Start=2020-07-24 22:14:39",
        "Place4=doobiegirl (0) Rebuys:0 AddOn:No KO:mother-goose",
        "Place3=ant (0) Rebuys:0 AddOn:No KO:SeaGuard",
        "Place2=SeaGuard (0) Rebuys:0 AddOn:No KO:mother-goose",
        "Place1=mother-goose (0) Rebuys:0 AddOn:No KO:mother-goose",
        "Stop=2020-07-24 23:21:37",
        ""
    ]
    Output: 
        rows of json 
    */


    
    let tournamentList = []
    let listIndex = 0
    for (let i =0; i < tournamentArray.length; i++) {
        var line = tournamentArray[i];
        if (!line) {
            listIndex+=1
            continue
        }
        let lineSplit = line.split('=')
        if (skipFields.includes(lineSplit[0].trim())) {
            continue
        }
        

        let existsInTournamentList = tournamentList[listIndex] 
        if (existsInTournamentList) {
            existsInTournamentList[lineSplit[0].trim()] = lineSplit[1].trim()
            tournamentList[listIndex] = Object.assign(tournamentList[listIndex], existsInTournamentList) 

        }
        else {
            existsInTournamentList = {[lineSplit[0]]: lineSplit[1]}
            tournamentList[listIndex] = existsInTournamentList
        }
        
    }

    return tournamentList

}