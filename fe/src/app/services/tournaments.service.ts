import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
  
@Injectable({
  providedIn: 'root'
})
export class TournamentsService {
  private url = 'http://localhost:3000/userLookup/ant';
   
  constructor(private httpClient: HttpClient) { }
  
  getTournament(){
    return this.httpClient.get(this.url);
  }
  
}