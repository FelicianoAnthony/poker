const express = require('express')
const app = express()
const axios = require('axios')


const port = 3000
const apiUrl = 'http://pokeribarelyknowher.com'
const apiPort = '80'
const apiPassword = ""

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/userLookup/:name', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    // send this in postman - http://localhost:3000/userLookup/ant

    let userToLookup = req.params.name

    // let url = 'http://pokeribarelyknowher.com:80/api?Command=AccountsGet&Password=s&player=ant&JSON=Yes'
    let url = `${apiUrl}:${apiPort}/api`
    var requestParams = {
        params: {
            "Command": "AccountsGet", 
            "Password": apiPassword,
            "Player": userToLookup,
            "JSON": "Yes"
        }
    }

    let data = await axios.get(url,requestParams)

    res.json({data: data.data})
})

app.get('/tournamentsResults/:name', async (req, res) => {
    // http://localhost:3000/tournamentsResults/Bob%20Barker

    let tournamentName = req.params.name
    let tournamentEncoded = encodeURIComponent(tournamentName)

    let url = `${apiUrl}:${apiPort}/api`

    let requestParams = {
        params: {
            "Command": "TournamentsResults", 
            "Password": apiPassword,
            "Name": tournamentEncoded,
            "JSON": "Yes"
        }
    }

    let data = await axios.get(url, requestParams) 
    res.json({data: data.data})
})


app.get('/tournamentsResults/:name/:date', async (req, res) => {

    let tournamentName = req.params.name
    let tournamentDate = req.params.date 
    let tournamentNameEncoded = encodeURIComponent(tournamentName)
    let tournamentDateEncoded = encodeURIComponent(tournamentDate)

    let url = `${apiUrl}:${apiPort}/api`

    let requestParams = {
        params: {
            "Command": "TournamentsResults", 
            "Password": apiPassword,
            "Name": tournamentNameEncoded,
            "Date": tournamentDateEncoded,
            "JSON": "Yes"
        }
    }

    let data = await axios.get(url, requestParams) 
    res.json({data: data.data})
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))