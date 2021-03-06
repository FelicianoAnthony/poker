import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { TournamentsComponent } from './tournaments/tournaments.component';

const routes: Routes =  [
  {
    path: 'users', 
    component: UsersComponent,
  },
  {
    path: 'tournaments',
    component: TournamentsComponent
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
