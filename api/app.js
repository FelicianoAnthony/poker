const express = require('express')
const util = require('./util.js')
const config = require('./config/secrets.js')
const Logger = require('./config/logger_service.js')

const logger = new Logger('app')
// const redis = require('redis');
// var Promise = require("bluebird");

const app = express()
// const redisClient = redis.createClient(config.redisPort);

app.get('/', (req, res) => res.send('Hello World!'))


function logRequest(req) {

    let hasParams = Object.values(req.params).length > 0 ? true : false
    let paramsLog = hasParams ? JSON.stringify(req.params) : 'no params passed'

logger.info(`request | endpoint: ${req.originalUrl} | host: ${req.hostname} | ip: ${req.ip} | params: ${paramsLog}\n`);
}

function logResponse(res) {
    logger.info(`response | status code: ${res.status} | message: ${res.statusText} | requested url: ${res.config.url}`)
}



app.get('/tournamentsList', async (req, res, next) => {
    // shows tournament in dropdown on /tournaments routerLink
    try {

        logger.info(`start ${req.url}`)
        logRequest(req)

        res.header("Access-Control-Allow-Origin", "*");
        let tournamentFields = [
            "Result", "Name", "Status", "Game", "Seats", "Chips", "BuyIn", "AddOnChips", "MaxRebuys"
        ]
        let params = {"Fields": tournamentFields.join(',')}
        let data = await util.doRequest('TournamentsList', params)

        logResponse(data)
    
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
        logger.info(`finish ${req.url}`)
        res.json({data: namesOnly})
    }
    catch(e) {
        logger.error(e.stack)
        next(e) 
    }

})



app.get('/tournamentLookup/:name', async (req, res, next) => {
    // used by front end 
    // http://localhost:3000/tournamentsResults/Bob Barker
    // used by material ui select drop down 
    
    // used in /users routerLink?
    try {
        logger.info(`start ${req.url}`)
        logRequest(req)
        res.header("Access-Control-Allow-Origin", "*");
        
        let tournamentName = req.params.name
        let data = await util.doRequest('TournamentsResults', null)
        logResponse(data)
    
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
        //redisClient.setex(tournamentName, 3600, JSON.stringify(matchedTournamentData));
        logger.info(`finish ${req.url}`)
        res.json({data: matchedTournamentData})
    }
    catch(e) {
        logger.error(e.stack)
        next(e)
    }
})



app.get('/groupTournyByDate', async(req, res, next) => {
    
    try {
        logger.info(`start ${req.url}`)
        logRequest(req)

        res.header("Access-Control-Allow-Origin", "*");

        let data = await util.doRequest('TournamentsResults', null)
        logResponse(data)
    
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

        logger.info(`finish ${req.url}`)
        return res.json({data: tournyMap})
    }

    catch (e) {
        logger.error(e.stack)
        next(e)
    }
})

app.get('/tournamentsResults/:name/date/:date',  async (req, res, next) => {
    
    
    try {
        logger.info(`start ${req.url}`)
        res.header("Access-Control-Allow-Origin", "*");
                // http://localhost:3000/tournamentsResults/
        // encodeURIComponent did not work on name when it had space 

        
        let params = {
            "Name": req.params.name, 
            "Date": req.params.date
        }
        logRequest(req)
        let data = await util.doRequest('TournamentsResults', params)
        logResponse(data)

        
        // let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
        // let tournamentData = util.transformToRowsTournament(data.data.Data, skipTournamentKeys,)
        let tournamentData = util.transformTournamentPlayers(data.data.Data)

        // for (var key in tournamentData) {
        //     if (tournamentData.hasOwnProperty(key)) {
        //         redisClient.setex(key, 3600, JSON.stringify(tournamentData[key]));
        //     }
        // }

        logger.info(`finish ${req.url}`)
        res.json({data: tournamentData})
    }
    catch(e) {
        logger.error(e.stack)
        next(e)
    }

})


app.get('/tournamentMatch/:name/:date/:tournamentId', async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    try {
        logger.info(`start ${req.url}`)
        let params = {
            Name: req.params.name,
            Date: req.params.date,
        }
        let tournamentId = req.params.tournamentId
    
        logRequest(req)
        let data = await util.doRequest('TournamentsResults', params)
        logResponse(data)
        // let matchedTournament = util.findTournament(data.data.Data, tournamentId)
        let jsonTournaments = util.tournamentToJson(data.data.Data)
    
        if (tournamentId === 'noid') {
            return res.json({data: jsonTournaments})
        }
        let matchedTournament = jsonTournaments[tournamentId * 1 ]
        logger.info(`finish ${req.url}`)
        res.json({data:matchedTournament})
    }
    catch(e) {
        logger.error(e.stack)
        next(e)
    }
})





app.listen(`${config.port}`, `${config.host}`, () => 
logger.info(`Poker API listening at http://${config.host}:${config.port}`))