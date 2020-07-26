const express = require('express')
const util = require('./util.js')
const config = require('./config/secrets.js')
// var Promise = require("bluebird");

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))


app.get('/tournamentsList', async (req, res) => {
    // used by front end 
    // shows tournaments in dropdown 
    res.header("Access-Control-Allow-Origin", "*");

    let tournamentFields = [
        "Result", "Name", "Status", "Game", "Seats", "Chips", "BuyIn", "AddOnChips", "MaxRebuys"
    ]
    
    let params = {"Fields": tournamentFields.join(',')}
    let data = await util.doRequest('TournamentsList', params)

    
    let resData = data.data 

    let skipFields = ['Result', 'Tournaments']
    let parsedRows = util.prepForTransformToRows(resData, skipFields)
    let flatData = util.transformToRows(parsedRows)


    let namesOnly = flatData.map(obj => {
        if (obj.hasOwnProperty('Name')) {
            return {
                value: obj.Name,
                viewValue: obj.Name
            }
        }
    })

    res.json({data: namesOnly})

})




app.get('/tournamentLookup/:name', async (req, res) => {
    // used by front end 
    // http://localhost:3000/tournamentsResults/Bob Barker
    // used by material ui select drop down 
    res.header("Access-Control-Allow-Origin", "*");

    let tournamentName = req.params.name

    let data = await util.doRequest('TournamentsResults', null)
    let skipFields = ['Result', 'Files']
    let filteredObject = util.prepForTransformToRows(data.data, skipFields)
    let transformedRows = util.transformToRows(filteredObject)


    let skipTournamentFields = ['Result', 'Count', 'Start']
    let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
    var matchedTournamentData = []
    for (var i=0; i < transformedRows.length; i++) {
        var tournament = transformedRows[i];
        if (tournament.Name === tournamentName) {
            let tournamentLookupParams = {
                'Name': tournamentName,
                'Date': tournament.Date
            }
            let matchingTournament = await util.doRequest('TournamentsResults', tournamentLookupParams)
            let matchingTournamentFiltered = util.prepForTransformToRows(matchingTournament.data, skipTournamentFields)
            let matchTournamentTransformed = util.transformToRowsTournament(matchingTournamentFiltered.Data, skipTournamentKeys)
            matchedTournamentData.push.apply(matchedTournamentData, matchTournamentTransformed)
        }
    }

    res.json({data: matchedTournamentData})


})


app.get('/tournamentsAll', async (req, res) => {
    // used by front end 
    // this is slow ... 
    // gets ALL tournament data 

    res.header("Access-Control-Allow-Origin", "*");

    let data = await util.doRequest('TournamentsResults', null)

    
    let resData = data.data 

    let skipFields = ['Result', 'Files']
    let parsedRows = util.prepForTransformToRows(resData, skipFields)
    let flatData = util.transformToRows(parsedRows)

    let tournamentData = [] 
    for (let i=0; i < flatData.length; i++) {
        let requestParam = flatData[i];
        let data1 = await util.doRequest('TournamentsResults', requestParam)
        tournamentData.push(data1.data)
    }
    
    let skipTournamentFields = ['Result', 'Count', 'Start']
    let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
    let transformedTournamentRows = []
    for (let i=0; i < tournamentData.length; i++) {
        var tournamentResponse = tournamentData[i];
        var filteredRows = util.prepForTransformToRows(tournamentResponse, skipTournamentFields)
        var transformedRow = util.transformToRowsTournament(filteredRows.Data, skipTournamentKeys)
        transformedTournamentRows.push.apply(transformedTournamentRows, transformedRow)
    }
    res.json({data: transformedTournamentRows})
})


//// not being used by front end but works //////

app.get('/tournamentsResults/:name/date/:date', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    // http://localhost:3000/tournamentsResults/
    // encodeURIComponent did not work on name when it had space 
    let params = {
        "Name": req.params.name, 
        "Date": req.params.date
    }
    let data = await util.doRequest('TournamentsResults', params)

    
    let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
    let tournamentData = util.transformToRowsTournament(data.data.Data, skipTournamentKeys)
    res.json({data: tournamentData})
})

// app.get('/userLookup/:name', async (req, res) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     // send this in postman - http://localhost:3000/userLookup/ant

//     let userToLookup = req.params.name

//     // let url = 'http://pokeribarelyknowher.com:80/api?Command=AccountsGet&Password=s&player=ant&JSON=Yes'
//     let url = `${apiUrl}:${apiPort}/api`
//     var requestParams = {
//         params: {
//             "Command": "AccountsGet", 
//             "Password": apiPassword,
//             "Player": userToLookup,
//             "JSON": "Yes"
//         }
//     }

//     let data = await axios.get(url,requestParams)

//     res.json({data: data.data})
// })

app.get('/userLookup', async (req, res) => {
    // http://localhost:3000/userLookup
    res.header("Access-Control-Allow-Origin", "*");
 
    // get list of players
    let requestParams = {'Fields': 'Player'}
    let data = await util.doRequest("AccountsList", requestParams)

    // lookup info for each player 
    let playersList = data.data.Player

    let returnData = [] 
    for (let i=0; i < playersList.length; i++) {
        let params = {'Player': playersList[i]}
        let data1 = await util.doRequest('AccountsGet', params)
        returnData.push(data1.data)
    }

    res.json({data: returnData})
    
})

app.listen(`${config.port}`, `${config.host}`, () => console.log(`Poker API listening at http://${config.host}:${config.port}`))