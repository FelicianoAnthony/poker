////////////////////////////////////////////////////////////////////////////////////////////////
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

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////


// app.get('/userLookup', async (req, res) => {
//     // http://localhost:3000/userLookup
//     res.header("Access-Control-Allow-Origin", "*");
 
//     // get list of players
//     let requestParams = {'Fields': 'Player'}
//     let data = await util.doRequest("AccountsList", requestParams)

//     // lookup info for each player 
//     let playersList = data.data.Player

//     let returnData = [] 
//     for (let i=0; i < playersList.length; i++) {
//         let params = {'Player': playersList[i]}
//         let data1 = await util.doRequest('AccountsGet', params)
//         returnData.push(data1.data)
//     }

//     res.json({data: returnData})
    
// })


////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////



// app.get('/tournamentsAll', async (req, res) => {
//     // used by front end 
//     // this is slow ... 
//     // gets ALL tournament data 

//     res.header("Access-Control-Allow-Origin", "*");

//     logRequest(req)
//     let data = await util.doRequest('TournamentsResults', null)
//     logResponse(data)
    
//     let resData = data.data 

//     let skipFields = ['Result', 'Files']
//     let parsedRows = util.prepForTransformToRows(resData, skipFields)
//     let flatData = util.transformToRows(parsedRows)

//     console.log('got all tournaments - looking up by name and date')
//     let tournamentData = [] 
//     for (let i=0; i < flatData.length; i++) {
//         let requestParam = flatData[i];
//         console.log(`getting tournamentsResults with request params - ${requestParam} - ${i} of ${flatData.length}`)
//         let data1 = await util.doRequest('TournamentsResults', requestParam)
//         tournamentData.push(data1.data)
//     }
    
//     let skipTournamentFields = ['Result', 'Count', 'Start']
//     let skipTournamentKeys = ['Number', 'Currency', 'Bounty', 'PrizeBonus', 'MultiplyBonus', 'Late', 'Tickets', 'StopOnChop']
//     let transformedTournamentRows = []

//     let groupByName = {}
//     for (let i=0; i < tournamentData.length; i++) {
//         var tournamentResponse = tournamentData[i];
//         var filteredRows = util.prepForTransformToRows(tournamentResponse, skipTournamentFields)
//         var transformedRow = util.transformToRowsTournament(filteredRows.Data, skipTournamentKeys)
//         transformedTournamentRows.push.apply(transformedTournamentRows, transformedRow)

//         // 
//         var name = transformedRow[0].Tournament
//         let tournamentExists = groupByName[name]
//         if (tournamentExists) {
//             tournamentExists.push.apply(tournamentExists, transformedRow)
//             groupByName[name] = tournamentExists
//         }
//         else {
//             groupByName[name] = transformedRow
//         }
//     }

//     // for (var tournamentName in groupByName) {
//     //     if (groupByName.hasOwnProperty(tournamentName)) {
//     //         // key is tournament name and value is every time that tournament played, regardless of date 
//     //         var allTournamentData = groupByName[tournamentName]
//     //         redisClient.setex(tournamentName, 3600, JSON.stringify(allTournamentData));
//     //     }
//     // }

//     res.json({data: transformedTournamentRows})
// })



////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////





//Cache midleware
// function checkCache(req, res, next) {
//     console.log('using cache ...')
//     res.header("Access-Control-Allow-Origin", "*");
//     let tournamentName = req.params.name
//     redisClient.get(tournamentName, (error, cachedData) => {
//       if (error) throw error;
//       if (cachedData != null) {
//         let jsonData = JSON.parse(cachedData)
//         return res.json({data: jsonData})
//       } else {
//         next();
//       }
//     });
//   }

///////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
