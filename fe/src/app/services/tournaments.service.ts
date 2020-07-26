import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
  
@Injectable({
  providedIn: 'root'
})
export class TournamentsService {
  // private url = 'http://localhost:3000/userLookup/ant';

  private url = 'http://localhost:3000/tournamentsResults/Bob Barker/date/2020-07-24'
   
  constructor(private httpClient: HttpClient) { }
  
  getTournament(){
    return this.httpClient.get(this.url);
  }

  
}