import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button';
import { UsersComponent } from './users/users.component';
import { TournamentsComponent } from './tournaments/tournaments.component';
// import { MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule, MatButtonModule } from  '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ToastrModule } from 'ngx-toastr';




@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    TournamentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AgGridModule.withComponents(null),
    BrowserAnimationsModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    ToastrModule.forRoot()

    //RouterModule.forRoot(routes)
    
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
