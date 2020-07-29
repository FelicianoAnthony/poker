import { Component, OnInit } from '@angular/core';
import { TournamentsService } from '../services/tournaments.service';

interface TournamentName {
  value: string;
  viewValue: string;
}

interface TournamentDate {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-tournaments',
  templateUrl: './tournaments.component.html',
  styleUrls: ['./tournaments.component.css']
})
export class TournamentsComponent implements OnInit {

  tournamentNames: TournamentName[] = [];
  tournamentDates: TournamentDate[] = [];
  defaultDate: ''
  defaultTournament = ''
  responseData = {}
  columnDefs = []
  rowData = []
  showTournamentSelector = false
  tournamentIds = []
  defaultTournamentId = '' 

  constructor(private service:TournamentsService) { }

  formatDropdown(dropdownItems) {

    let dropdown = dropdownItems.map(name => {
      return {
        viewValue: name, 
        value: name
      }
    })
    return dropdown

  }

  makeHeader(data) {

    let responseKeys = Object.keys(data[0])

    let headers = []
    responseKeys.forEach(key => {
      let tempObj = {
        headerName: key,
        field: key,
        filter: 'agTextColumnFilter',
        editable: true,
        width:150      
      }


      headers.push(tempObj)
    })

    return headers
  }

  createRows(responseData) {
    return responseData
  }




  ngOnInit(): void {


    this.service.getTournamentsByDate()
    .subscribe(response => {
      this.responseData = response.data
      let formatDropdown = this.formatDropdown(Object.keys(response.data))
      this.tournamentNames = formatDropdown
      this.defaultTournament = formatDropdown[0].viewValue
      let formatDropDownDates = this.formatDropdown(response.data[formatDropdown[0].viewValue])
      this.tournamentDates = formatDropDownDates
      // this.defaultDate = formatDropDownDates[0].viewValue

      this.service.getTournamentNameAndDate(this.defaultTournament,this.defaultDate)
      .subscribe(response => {
        console.log(response)
        //   this.columnDefs = this.makeHeader(response.data)
        //   this.rowData = this.createRows(response.data)
      })
    })
    
      // this.service.getTournamentNames()
      // .subscribe(response => {
      //   this.tournamentNames = response.data
      //   this.defaultTournament = response.data[0].viewValue
      //   console.log(response)
      //   // this.service.getTournamentByName(this.defaultTournament)
      //   // .subscribe(response => {
      //   //   this.columnDefs = this.makeHeader(response.data)
      //   //   this.rowData = this.createRows(response.data)
      //   //   console.log(response)
      //   // })
      // })
  }


  onSelectNameChange(ev: any) {
    this.defaultTournament = ev.value
    this.defaultTournamentId = ''
    this.showTournamentSelector = false
    
    let tournamentName = ev.value;
    let newDates = this.responseData[tournamentName]
    this.tournamentDates = this.formatDropdown(newDates)
    this.defaultDate = this.formatDropdown(newDates)[0].viewValue
    // this.service.getTournamentNameAndDate(tournamentName, this.defaultDate)
    // .subscribe(response => {

    //   let hasMultipleGames = Object.keys(response.data).length > 1 ? true : false
    //   if (hasMultipleGames) {
    //     this.showTournamentSelector = !this.showTournamentSelector
    //     this.tournamentIds = this.formatDropdown(Object.keys(response.data))
    //     this.defaultTournamentId = Object.keys(response.data)[0]
    //   }


    //   let keys = Object.keys(response.data)
    //   this.columnDefs = this.makeHeader(response.data[keys[0]])
    //   this.rowData = this.createRows(response.data[keys[0]])
    //   console.log(response)
    // })

 }

 onSelectDateChange(ev: any) {
    this.defaultDate = ev.value
    this.showTournamentSelector = false
    this.defaultTournamentId = '' 
  // let tournamentDate = ev.value
  // let tournamentName = this.defaultTournament
  // this.service.getTournamentNameAndDate(tournamentName, tournamentDate)
  // .subscribe(response => {

  //   let hasMultipleGames = Object.keys(response.data).length > 1 ? true : false 
  //   if (hasMultipleGames) {
  //     this.showTournamentSelector = !this.showTournamentSelector
  //     this.tournamentIds = this.formatDropdown(Object.keys(response.data))
  //     this.defaultTournamentId = Object.keys(response.data)[0]
  //   }
  //   let keys = Object.keys(response.data)
  //   this.columnDefs = this.makeHeader(response.data[keys[0]])
  //   this.rowData = this.createRows(response.data[keys[0]])
  //   console.log(response)
  // }) 

  

 }
 onTournamentChange(ev: any) {
    
  this.defaultTournamentId = ev.value
  //  let tournamentId = ev.value
  //   let selectedTournament = this.defaultTournament
  //   let selectedDate = this.defaultDate
  //   this.service.getTournamentByNameDateId(selectedTournament, selectedDate, tournamentId)
  //   .subscribe(response => {

      
  //     this.columnDefs = this.makeHeader(response.data)
  //     this.rowData = this.createRows(response.data)
  //   })

 }

 findTournament(ev: any) {
    let selectedTournament =  this.defaultTournament
    let selectedDate = this.defaultDate
    let selectedTournamentId = this.defaultTournamentId
    
    if (!selectedTournamentId) {
      selectedTournamentId = 'noid'
    }
    this.service.getTournamentByNameDateId(selectedTournament, selectedDate, selectedTournamentId)
    .subscribe(response => {

      let hasMultipleGames = Object.keys(response.data).length > 1 ? true : false
      if (!Array.isArray(response.data)) {
        if(hasMultipleGames) {
          this.showTournamentSelector = !this.showTournamentSelector
        }
        
        this.tournamentIds = this.formatDropdown(Object.keys(response.data))
        this.defaultTournamentId = Object.keys(response.data)[0]
        let keys = Object.keys(response.data)
        this.columnDefs = this.makeHeader(response.data[keys[0]])
        this.rowData = this.createRows(response.data[keys[0]])
        console.log(response)
      }
      else {

        this.columnDefs = this.makeHeader(response.data)
        this.rowData = this.createRows(response.data)
        console.log('has 1 game')

      }



    })

 }

}