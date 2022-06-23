import 'zone.js/node';

// import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';



import { APP_BASE_HREF } from '@angular/common';
import { existsSync, readFileSync } from 'fs';
import { ngExpressEngine } from 'src/engine/express-engine';
import { AppComponent } from 'src/app/app.component';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { mainProviders } from 'src/app/main.provider';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UniversalInterceptor } from 'src/app/universal.interceptor';
import { environment } from 'src/environments/environment';

if (environment.production) {
  enableProdMode();
}

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';
  const document = readFileSync(join(distFolder, 'index.html'), 'utf-8').toString();
  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/main/modules/express-engine)
  server.engine('html', ngExpressEngine({
    // bootstrap: AppServerModule,
    appId: 'tour-of-heroes',
    bootstrap: AppComponent,
    document,
    providers: [
      ...mainProviders,
      importProvidersFrom(ServerModule),
      importProvidersFrom(ServerTransferStateModule),
      { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true, deps: [REQUEST] },
    ] as any,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // TODO: implement data requests securely
  server.get('/api/heroes', (req, res) => {
      const heroes = [
        { id: 12, name: 'Dr. Nice' },
        { id: 13, name: 'Bombasto' },
        { id: 14, name: 'Celeritas' },
        { id: 15, name: 'Magneta' },
        { id: 16, name: 'RubberMan' },
        { id: 17, name: 'Dynama' },
        { id: 18, name: 'Dr. IQ' },
        { id: 19, name: 'Magma' },
        { id: 20, name: 'Tornado' }
      ];
      res.send(heroes);
    // res.status(404).send('data requests are not yet supported');
  });

  server.get('/api/heroes/:heroId', (req, res) => {
    res.status(404).send('data requests are not yet supported');
  });

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }, { provide: REQUEST, useValue: req },] });
  });

  return server;
}

function run() {
  const port = process.env['PORT'] || 4004;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

