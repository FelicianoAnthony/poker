const express = require('express')
const util = require('./util.js')
const config = require('./config/secrets.js')
// var Promise = require("bluebird");

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))


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

app.get('/tournamentsList', async (req, res) => {
    // http://localhost:3000/tournamentsList
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

    res.json({data: flatData})

})


app.get('/tournamentsResults/:name/date/:date', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    // http://localhost:3000/tournamentsResults/Bob Barker/date/2020-07-24
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


//// everything above here works well //////


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



app.listen(`${config.port}`, `${config.host}`, () => console.log(`Poker API listening at http://${config.host}:${config.port}`))