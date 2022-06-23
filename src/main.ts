import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { mainProviders } from './app/main.provider';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [mainProviders],
});
