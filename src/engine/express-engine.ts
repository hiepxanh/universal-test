/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type { StaticProvider } from '@angular/core';
// import { CommonEngine, RenderOptions as CommonRenderOptions } from '@nguniversal/common/engine';
import { REQUEST, RESPONSE } from '@nguniversal/express-engine/tokens';
import { RenderOptions as CommonRenderOptions } from '@nguniversal/common/engine';
import type { Request, Response } from 'express';
import { CommonEngine } from './engine';

/**
 * These are the allowed options for the engine
 */
// export type NgSetupOptions = Pick<CommonRenderOptions, 'bootstrap' | 'providers' | 'publicPath' | 'inlineCriticalCss'>;
export type NgSetupOptions = Pick<
  CommonRenderOptions & { appId: string; document: string },
  'bootstrap' | 'providers' | 'publicPath' | 'inlineCriticalCss' | 'appId' | 'document'
>;

/**
 * These are the allowed options for the render
 */
export interface RenderOptions extends CommonRenderOptions {
  req: Request;
  res?: Response;
}

/**
 * This is an express engine for handling Angular Applications
 */
export function ngExpressEngine(setupOptions: Readonly<NgSetupOptions>) {
  const engine = new CommonEngine(setupOptions.bootstrap, setupOptions.providers);

  return function (filePath: string, options: object, callback: (err?: Error | null, html?: string) => void) {
    try {
      const renderOptions = { ...options } as RenderOptions;
      if (!setupOptions.bootstrap && !renderOptions.bootstrap) {
        throw new Error('You must pass in a NgModule to be bootstrapped');
      }

      const { req } = renderOptions;
      const res = renderOptions.res ?? req.res;

      renderOptions.url = renderOptions.url ?? `${req.protocol}://${req.get('host') || ''}${req.baseUrl}${req.url}`;
      renderOptions.documentFilePath = renderOptions.documentFilePath ?? filePath;
      renderOptions.providers = [...(renderOptions.providers ?? []), getReqResProviders(req, res)];
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      renderOptions.publicPath = renderOptions.publicPath ?? setupOptions.publicPath ?? (options as any).settings?.views;
      renderOptions.inlineCriticalCss = renderOptions.inlineCriticalCss ?? setupOptions.inlineCriticalCss;
      // for standalone component
      renderOptions.document = setupOptions.document;
      engine
        // .render(renderOptions)
        .render({ ...renderOptions, appId: setupOptions.appId })
        .then((html) => callback(null, html))
        .catch(callback);
    } catch (err: any) {
      callback(err);
    }
  };
}

/**
 * Get providers of the request and response
 */
function getReqResProviders(req: Request, res?: Response): StaticProvider[] {
  const providers: StaticProvider[] = [
    {
      provide: REQUEST,
      useValue: req,
    },
  ];
  if (res) {
    providers.push({
      provide: RESPONSE,
      useValue: res,
    });
  }

  return providers;
}