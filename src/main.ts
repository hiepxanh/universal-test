import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { BrowserModule } from '@angular/platform-browser';
import { environment } from './environments/environment';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './app/in-memory-data.service';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { HeroDetailComponent } from './app/hero-detail/hero-detail.component';
import { HeroesComponent } from './app/heroes/heroes.component';

if (environment.production) {
  enableProdMode();
}

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: HeroDetailComponent },
  { path: 'heroes', component: HeroesComponent }
];

export const mainProviders = [
  importProvidersFrom(BrowserModule.withServerTransition({ appId: 'tour-of-heroes' })),
  importProvidersFrom(RouterModule.forRoot(routes)),
  importProvidersFrom(HttpClientModule),

  // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
  // and returns simulated server responses.
  // Remove it when a real server is ready to receive requests.
  importProvidersFrom(HttpClientInMemoryWebApiModule.forRoot(
    InMemoryDataService, { dataEncapsulation: false }
  ))
]

bootstrapApplication(AppComponent, {
  providers: [mainProviders],
});
