import { Component, OnInit } from '@angular/core';
import { TournamentsService } from '../services/tournaments.service';

interface TournamentName {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  tournaments;
  columnDefs = []
  rowData = []
  usersList = []
  tournamentNames: TournamentName[] = [];
  tournamentDates = []
  defaultTournament = ''

  constructor(private service:TournamentsService) { }
  makeHeader(data) {

    let responseKeys = Object.keys(data[0])

    let headers = []
    responseKeys.forEach(key => {
      let tempObj = {
        headerName: key,
        field: key,
        filter: 'agTextColumnFilter',
        editable: true      }

      headers.push(tempObj)
    })

    return headers
  }



  createRows(responseData) {
    return responseData
  }
  ngOnInit(): void {
    this.service.getTournamentNames()
    .subscribe((response: any) => {
      this.tournamentNames = response.data
      this.defaultTournament = response.data[0].viewValue
      console.log(response)
      this.service.getTournamentByName(this.defaultTournament)
      .subscribe((response : any) => {
        this.columnDefs = this.makeHeader(response.data)
        this.rowData = this.createRows(response.data)
        console.log(response)
      })
    })


    // this.service.getTournaments()
    //   .subscribe(response => {
    //     this.tournaments = response;
    //     this.columnDefs = this.makeHeader(response.data)
    //     this.rowData = this.createRows(response.data)
    //     console.log(response)
    //   });


}

onSelectChange(ev: any) {
  let tournamentName = ev.value;
  this.service.getTournamentByName(tournamentName)
  .subscribe((response : any) => {
    this.columnDefs = this.makeHeader(response.data)
    this.rowData = this.createRows(response.data)
    console.log(response)
  })
}
}

