import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable, Optional, Inject, InjectionToken } from '@angular/core';
import { Request, Response } from 'express';

export const REQUEST: InjectionToken<Request> = new InjectionToken<Request>('REQUEST');
export const RESPONSE: InjectionToken<Response> = new InjectionToken<Response>('RESPONSE');
@Injectable()
export class UniversalInterceptor implements HttpInterceptor {
  constructor(@Optional() @Inject(REQUEST) protected request: Request) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // since the nginx somehow using http protocol on production server,
    // it request http as local request, then auto upgrade to https by redirect
    // and after that, it cause the POST method become GET method
    // it become https but using GET method
    // causing Http failure response for https://awread.vn:443/graphql: 405 Method Not Allowed
    // so we need to change it to https as well before send to backend

    let serverReq: HttpRequest<any> = req;
    if (this.request && req.url.indexOf('http') !== 0) {
      let newUrl = `${this.request.protocol}://${this.request.get('host')}`;
      if (!req.url.startsWith('/')) {
        newUrl += '/';
      }
      newUrl += req.url;
      serverReq = req.clone({ url: newUrl });
    }

    console.log(`intercept reading request: \n
    req.url ${req.url} | this.request.baseUrl ${this.request.baseUrl} | \n
    this.request.protocol ${this.request.protocol} | this.serverReq ${serverReq.url}
    `);

    return next.handle(serverReq);
  }
}
