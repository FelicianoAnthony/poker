const express = require('express')
const util = require('./util.js')
const config = require('./config/secrets.js')
const redis = require('redis');
// var Promise = require("bluebird");

const app = express()
const redisClient = redis.createClient(config.redisPort);

app.get('/', (req, res) => res.send('Hello World!'))



//Cache midleware
function checkCache(req, res, next) {
    console.log('using cache ...')
    res.header("Access-Control-Allow-Origin", "*");
    let tournamentName = req.params.name
    redisClient.get(tournamentName, (error, cachedData) => {
      if (error) throw error;
      if (cachedData != null) {
        let jsonData = JSON.parse(cachedData)
        return res.json({data: jsonData})
      } else {
        next();
      }
    });
  }

app.get('/tournamentsList', async (req, res) => {
    // used by front end 
    // shows tournaments in dropdown 
    res.header("Access-Control-Allow-Origin", "*");

    console.log(`getting all unique tournaments`)
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

app.get('/tournamentByPlayers/:name', async (req, res) => {
    return res.json({data: 'here'})
})



// [checkCache]
app.get('/tournamentLookup/:name', [checkCache], async (req, res) => {
    // used by front end 
    // http://localhost:3000/tournamentsResults/Bob Barker
    // used by material ui select drop down 
    res.header("Access-Control-Allow-Origin", "*");

    let tournamentName = req.params.name
    console.log(`getting tournament name ${tournamentName}`)

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
    redisClient.setex(tournamentName, 3600, JSON.stringify(matchedTournamentData));

    res.json({data: matchedTournamentData})


})


app.get('/tournamentsAll', async (req, res) => {
    // used by front end 
    // this is slow ... 
    // gets ALL tournament data 

    res.header("Access-Control-Allow-Origin", "*");

    console.log(`getting all tournaments`)
    let data = await util.doRequest('TournamentsResults', null)

    
    let resData = data.data 

    let skipFields = ['Result', 'Files']
    let parsedRows = util.prepForTransformToRows(resData, skipFields)
    let flatData = util.transformToRows(parsedRows)

    console.log('got all tournaments - looking up by name and date')
    let tournamentData = [] 
    for (let i=0; i < flatData.length; i++) {
        let requestParam = flatData[i];
        console.log(`getting tournamentsResults with request params - ${requestParam} - ${i} of ${flatData.length}`)
        let data1 = await util.doRequest('TournamentsResults', requestParam)
        tournamentData.push(data1.data)
    }
    
    let skipTournamentFields = ['Result', 'Count', 'Start']
    let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
    let transformedTournamentRows = []

    let groupByName = {}
    for (let i=0; i < tournamentData.length; i++) {
        var tournamentResponse = tournamentData[i];
        var filteredRows = util.prepForTransformToRows(tournamentResponse, skipTournamentFields)
        var transformedRow = util.transformToRowsTournament(filteredRows.Data, skipTournamentKeys)
        transformedTournamentRows.push.apply(transformedTournamentRows, transformedRow)

        // 
        var name = transformedRow[0].Tournament
        let tournamentExists = groupByName[name]
        if (tournamentExists) {
            tournamentExists.push.apply(tournamentExists, transformedRow)
            groupByName[name] = tournamentExists
        }
        else {
            groupByName[name] = transformedRow
        }
    }

    for (var tournamentName in groupByName) {
        if (groupByName.hasOwnProperty(tournamentName)) {
            // key is tournament name and value is every time that tournament played, regardless of date 
            var allTournamentData = groupByName[tournamentName]
            redisClient.setex(tournamentName, 3600, JSON.stringify(allTournamentData));
        }
    }

    res.json({data: transformedTournamentRows})
})


//// not being used by front end but works //////

app.get('/tournamentsResults/:name/date/:date',  async (req, res) => {
    
    res.header("Access-Control-Allow-Origin", "*");

    // http://localhost:3000/tournamentsResults/
    // encodeURIComponent did not work on name when it had space 
    let params = {
        "Name": req.params.name, 
        "Date": req.params.date
    }
    let data = await util.doRequest('TournamentsResults', params)

    
    // let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
    // let tournamentData = util.transformToRowsTournament(data.data.Data, skipTournamentKeys,)
    let tournamentData = util.transformTournamentPlayers(data.data.Data)

    // for (var key in tournamentData) {
    //     if (tournamentData.hasOwnProperty(key)) {
    //         redisClient.setex(key, 3600, JSON.stringify(tournamentData[key]));
    //     }
    // }
    res.json({data: tournamentData})
})

app.get('/groupTournyByDate', async(req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    let data = await util.doRequest('TournamentsResults', null)

    // name & date will always be same length 
    var tournyNames = data.data.Name
    var tourneyDates = data.data.Date
    let tournyMap = {}
    for (let i=0; i < tournyNames.length; i++) {
        var name = tournyNames[i];
        let date = tourneyDates[i];
        if (tournyMap[name]) {
            tournyMap[name].push(date)
        }
        else {
            tournyMap[name] = [date]
        }

    }
    return res.json({data: tournyMap})
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

app.get('/tournamentMatch/:name/:date/:tournamentId', async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    let params = {
        Name: req.params.name,
        Date: req.params.date,
    }
    let tournamentId = req.params.tournamentId
    let data = await util.doRequest('TournamentsResults', params)
    // let matchedTournament = util.findTournament(data.data.Data, tournamentId)
    let jsonTournaments = util.tournamentToJson(data.data.Data)

    if (tournamentId === 'noid') {
        return res.json({data: jsonTournaments})
    }
    let matchedTournament = jsonTournaments[tournamentId * 1 ]
    res.json({data:matchedTournament})

})



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