import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
  
@Injectable({
  providedIn: 'root'
})
export class TournamentsService {
 
  // private tournamentsAllUrl = 'http://localhost:3000/tournamentsAll'
  private tournamentNamesUrl = 'http://localhost:3000/tournamentsList'
  private tournamentLookupUrl = 'http://localhost:3000/tournamentLookup'
  private groupTournyByDateUrl = 'http://localhost:3000/groupTournyByDate'
  
  constructor(private httpClient: HttpClient) { }
  
  // getTournaments(){
  //   return this.httpClient.get(this.tournamentsAllUrl);
  // }

  getTournamentNames() {
    return this.httpClient.get(this.tournamentNamesUrl)
  }
  
  getTournamentByName(tournamentName) {
    let u = `${this.tournamentLookupUrl}/${tournamentName}` 
    return this.httpClient.get(u)
  }

  getTournamentsByDate() {
    return this.httpClient.get(this.groupTournyByDateUrl)
  }

  getTournamentNameAndDate(name, date) {
    let u = `http://localhost:3000/tournamentsResults/${name}/date/${date}`
    return this.httpClient.get(u)
  }

  getTournamentByNameDateId(name, date, tournamentId) {
    let url = `http://localhost:3000/tournamentMatch/${name}/${date}/${tournamentId}`
    return this.httpClient.get(url)
  }

  
}