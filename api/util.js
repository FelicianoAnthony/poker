const config = require('./config/secrets.js')
const axios = require('axios')

module.exports = {
    prepForTransformToRows : prepForTransformToRows,
    transformToRows:transformToRows,
    transformToRowsTournament: transformToRowsTournament,
    transformTournamentPlayers: transformTournamentPlayers,
    findTournament: findTournament,
    tournamentToJson: tournamentToJson,
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
        },
        timeout: 15000 // ms not seconds
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

function getPlayers(rank, data) {


    let splitData = data.split(' ')

    let playerObj = {}
    playerObj.Username = splitData[0]
    playerObj.Unknown = splitData[1]
    playerObj.Place = rank[5] * 1
    
    let rebuy = splitData[2].split(':')
    playerObj[rebuy[0]] = rebuy[1]

    let addon = splitData[3].split(':')
    playerObj[addon[0]] = addon[1]

    let ko = splitData[4].split(':')
    playerObj[ko[0]] = ko[1]
    return playerObj
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

        if (lineSplit[0].trim().startsWith('Place')) {
            var player = getPlayers(lineSplit[0], lineSplit[1])
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

  
function compare( a, b ) {
    if ( a.Place < b.Place ){
      return -1;
    }
    if ( a.Place > b.Place ){
      return 1;
    }
    return 0;
  }
  
  

function addStartEndTime(tournamentResults) {
    let start = tournamentResults[0].Start
    let end = tournamentResults[tournamentResults.length - 1].Stop
    
    var returnData = tournamentResults.slice(1, tournamentResults.length-1)

    for (let i=0; i < returnData.length; i++) {
        returnData[i].Start = start
        returnData[i].End = end 
    }

    let sortedByPlace = returnData.sort(compare)
    return sortedByPlace
}


function transformTournamentPlayers(tournamentArray) {

    let playersRank = {}
    let tournamentNumber = ''
    for (let i =0; i < tournamentArray.length; i++) {
        var line = tournamentArray[i];
        if (!line) {
            continue
        }
        
        let lineSplit = line.split('=')

        // Number will always occur before Place so this works ... 
        
        if (lineSplit[0].trim().startsWith('Number')) {
            let tournyNumber = lineSplit[1]
            let tournyExists = playersRank[tournyNumber]
            if (!tournyExists) {
                playersRank[tournyNumber] = []
                tournamentNumber = tournyNumber
            }
        }

        else if (lineSplit[0].trim().startsWith('Place')) {
            var player = getPlayers(lineSplit[0], lineSplit[1])
            playersRank[tournamentNumber].push(player)
        }

        else if (['Start', 'Stop'].includes(lineSplit[0])) {
            let val = {[lineSplit[0]]: lineSplit[1]}
            playersRank[tournamentNumber].push(val)
        }

        
    }
    
    let newList = []
    for (let key in playersRank) {
        if (playersRank.hasOwnProperty(key)) {
            let addStartStop = addStartEndTime(playersRank[key])
            // newList.push.apply(newList, addStartStop)
            playersRank[key] = addStartStop
        }
    }
    
    return playersRank
}

function findTournament(tournamentsArray, tournamentId) {
    
    let tournamentResults = []
    for (let i=0; i < tournamentsArray.length; i++) {
        let tournamentRow = tournamentsArray[i];
        if (tournamentRow.startsWith('Number')) {
            let rowSplit = tournamentRow.split('=')
            if (rowSplit[1].trim() === tournamentId.toString()) {
                if (rowSplit[0].startsWith('Player')) {
                    var player = getPlayers(lineSplit[0], lineSplit[1])
                    tournamentResults.push(player)
                }
            }
        } 

    }
    return tournamentResults
    
}



function addStartEndTimeNumber(tournamentResults, tournamentName) {

    let number = tournamentResults[0].Number
    let start = tournamentResults[1].Start
    let end = tournamentResults[tournamentResults.length - 1].Stop
    
    var returnData = tournamentResults.slice(2, tournamentResults.length-1)

    for (let i=0; i < returnData.length; i++) {
        returnData[i].Start = start
        returnData[i].End = end
        returnData[i].Number = number
        returnData[i].Tournament = tournamentName 
    }

    let sortedByPlace = returnData.sort(compare)
    return sortedByPlace
}

function tournamentToJson(tournamentArray) {

    let playersRank = {}
    let tournamentNumber = ''
    let tournamentNameCheck = ''
    for (let i =0; i < tournamentArray.length; i++) {
        var line = tournamentArray[i];
        if (!line) {
            continue
        }
        
        let lineSplit = line.split('=')

        // Number will always occur before Place so this works ... 
        
        if (lineSplit[0].trim().startsWith('Number')) {
            let tournyNumber = lineSplit[1]
            let tournyExists = playersRank[tournyNumber]
            if (!tournyExists) {
                let tournamentId = {[lineSplit[0]]: lineSplit[1]}
                playersRank[tournyNumber] = [tournamentId]
                tournamentNumber = tournyNumber
            }
        }

        else if (lineSplit[0].trim().startsWith('Place')) {
            var player = getPlayers(lineSplit[0], lineSplit[1])
            playersRank[tournamentNumber].push(player)
        }
        else if (['Tournament'].includes(lineSplit[0])) {
            tournamentNameCheck  = lineSplit[1]
        }

        else if (['Start', 'Stop', 'Number'].includes(lineSplit[0])) {
            let val = {[lineSplit[0]]: lineSplit[1]}
            playersRank[tournamentNumber].push(val)
        }

        
    }

    
    for (let key in playersRank) {
        if (playersRank.hasOwnProperty(key)) {
            let addStartStop = addStartEndTimeNumber(playersRank[key], tournamentNameCheck)
            // newList.push.apply(newList, addStartStop)
            playersRank[key] = addStartStop
        }
    }
  
        
    
    return playersRank
}

