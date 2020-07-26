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
  

  // makeHeader(data) {

  //   let responseKeys = Object.keys(data)

  //   let headers = []
  //   responseKeys.forEach(key => {
  //     let tempObj = {
  //       headerName: key,
  //       field: key
  //     }
  //     headers.push(tempObj)
  //   })

  //   return headers
  // }

  makeHeader(data) {

    let responseKeys = Object.keys(data)

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

        // this.service.getUsersList()
        //   .subscribe(response => {
        //     this.usersList = response.data
        //   })
  }


//   columnDefs = [
//     {headerName: 'Make', field: 'make'},
//     {headerName: 'Model', field: 'model'},
//     {headerName: 'Price', field: 'price'}
// ];

// rowData = [
//     {make: 'Toyota', model: 'Celica', price: 35000},
//     {make: 'Ford', model: 'Mondeo', price: 32000},
//     {make: 'Porsche', model: 'Boxter', price: 72000}
// ];


  

  title = 'poker';
}
