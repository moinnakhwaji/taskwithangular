import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

const enhancedAppConfig = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    importProvidersFrom(HttpClientModule), // <-- add here
  ],
};

bootstrapApplication(AppComponent, enhancedAppConfig)
  .catch(err => console.error(err));
