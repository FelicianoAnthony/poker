import { Component } from '@angular/core';
import { TournamentsService } from './services/tournaments.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  tournaments;

  constructor(private service:TournamentsService) {}
  
  ngOnInit() {
      this.service.getTournament()
        .subscribe(response => {
          this.tournaments = response;
          console.log(response)
        });
  }
  

  title = 'poker';
}
