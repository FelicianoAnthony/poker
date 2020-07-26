import { Component } from '@angular/core';
import { TournamentsService } from './services/tournaments.service';

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

  constructor(private service:TournamentsService) {}
  

  makeHeader(data) {

    let responseKeys = Object.keys(data[0])

    let headers = []
    responseKeys.forEach(key => {
      let tempObj = {
        headerName: key,
        field: key
      }
      headers.push(tempObj)
    })

    return headers
  }

  ngOnInit() {
      this.service.getTournament()
        .subscribe(response => {
          this.tournaments = response;
          this.columnDefs = this.makeHeader(response.data)
          this.rowData = response.data
          console.log(response)
        });
  }





  

  title = 'poker';
}
