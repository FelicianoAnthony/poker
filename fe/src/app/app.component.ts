import { Component } from '@angular/core';
import { TournamentsService } from './services/tournaments.service';

interface TournamentName {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  tournaments;
  columnDefs = []
  rowData = []
  usersList = []
  tournamentNames: TournamentName[] = [];
  tournamentDates = []

  constructor(private service:TournamentsService) {}
  

  makeHeader(data) {

    let responseKeys = Object.keys(data[0])

    let headers = []
    responseKeys.forEach(key => {
      let tempObj = {
        headerName: key,
        field: key,
        filter: 'agTextColumnFilter',
        editable: true
      }

      headers.push(tempObj)
    })

    return headers
  }



  createRows(responseData) {
    return responseData
  }


  ngOnInit() {

      this.service.getTournamentNames()
      .subscribe(response => {
        this.tournamentNames = response.data
        console.log(response)
      })

      this.service.getTournaments()
        .subscribe(response => {
          this.tournaments = response;
          this.columnDefs = this.makeHeader(response.data)
          this.rowData = this.createRows(response.data)
          console.log(response)
        });


  }

  onSelectChange(ev: any) {
    let tournamentName = ev.value;
    this.service.getTournamentByName(tournamentName)
    .subscribe(response => {
      this.columnDefs = this.makeHeader(response.data)
      this.rowData = this.createRows(response.data)
      console.log(response)
    })
 }




  

  title = 'poker';
}
