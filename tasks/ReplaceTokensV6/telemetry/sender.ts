import { ExportResult, ExportResultCode } from '@opentelemetry/core'
import * as url from 'url';
import * as http from 'http';
import * as https from 'https';
import { time } from 'console';

export class HttpSender {
  private readonly _timeout = 3000;
  private readonly _url: URL;
  private readonly _proxyOptions?: any;

  constructor(options: { url: string, proxy?: string }) {
    this._url = new URL(options.url);

    let proxyUrl = options.proxy || process.env['https_proxy'] || undefined;
    if (proxyUrl) {
      if (proxyUrl.indexOf('//') === 0) proxyUrl = `http:${proxyUrl}`;

      const u = new URL(proxyUrl);
      this._proxyOptions = u.protocol === 'https:'
        ? undefined
        : {
          host: u.hostname,
          port: u.port || '80',
          path: this._url.href,
          headers: {
            host: this._url.hostname
          }
        };
    }
  }

  send(data: any[]): ExportResult {
    try {
      let options = {
        method: 'POST',
        host: this._url.hostname,
        port: this._url.port,
        path: this._url.pathname,
        withCredentials: false,
        timeout: this._timeout,
        headers: <{ [key: string]: string }>{
          'Content-Type': 'application/json'
        }
      };

      if (this._proxyOptions) {
        options = {
          ...options,
          ...this._proxyOptions,
          headers: {
            ...options.headers,
            ...this._proxyOptions.headers
          }
        }
      }

      console.log(options);

      const request = this._proxyOptions
        ? http.request(options)
        : https.request(options);

      request.setTimeout(this._timeout, () => {
        request.destroy();
      });
      request.on('error', e => {});
      request.write(JSON.stringify(data));
      request.end();

      return { code: ExportResultCode.SUCCESS };
    } catch (e) {
      return { code: ExportResultCode.FAILED };
    }
  }
}