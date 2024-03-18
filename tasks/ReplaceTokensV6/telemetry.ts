import { ExportResult, ExportResultCode, hrTimeToMilliseconds } from '@opentelemetry/core';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { BasicTracerProvider, SimpleSpanProcessor, SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as axios from 'axios';
import * as crypto from 'crypto';

const application = 'replacetokens-task';
const version = '6.0.0';
const endpoint = 'https://insights-collector.eu01.nr-data.net/v1/accounts/4392697/events';
const key = 'eu01xxc28887c2d47d9719ed24a74df5FFFFNRAL';
const timeout = 3000;

class NewRelicExporter implements SpanExporter {
  private readonly _proxy?: string;

  private _isShutdown = false;

  constructor(options: { proxy?: string }) {
    this._proxy = options.proxy;
    this._isShutdown = false;
  }

  async export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): Promise<void> {
    if (this._isShutdown) {
      setTimeout(() => resultCallback({ code: ExportResultCode.FAILED }), 0);

      return;
    }

    if (spans.length > 0) {
      const events = spans.map(s => this._spanToEvent(s));
      console.debug(`telemetry: ${JSON.stringify(events)}`);

      resultCallback(await this._send(events));
    }

    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  shutdown(): Promise<void> {
    this._isShutdown = true;

    return Promise.resolve();
  }

  private _spanToEvent(span: ReadableSpan): { [key: string]: any } {
    return {
      eventType: 'TokensReplaced',
      application: application,
      version: version,
      ...span.attributes,
      result: (() => {
        switch (span.status.code) {
          case SpanStatusCode.ERROR:
            return 'failed';
          case SpanStatusCode.OK:
            return 'success';
          default:
            return '';
        }
      })(),
      duration: hrTimeToMilliseconds(span.duration)
    };
  }

  private async _send(data: any[]): Promise<ExportResult> {
    try {
      const options: axios.AxiosRequestConfig<any[]> = {
        headers: {
          'Api-Key': key,
          'Content-Type': 'application/json'
        },
        timeout: timeout
      };
      if (this._proxy) {
        const proxyUrl = new URL(this._proxy);

        let proxy: any = { host: proxyUrl.host };
        if (proxyUrl.port) proxy = { ...proxy, port: parseInt(proxyUrl.port) };
        if (proxyUrl.username) proxy = { ...proxy, auth: { username: proxyUrl.username } };
        if (proxyUrl.password) proxy = { ...proxy, auth: { ...proxy.auth, password: proxyUrl.password } };

        options.proxy = proxy;
      }

      await axios.default.post(endpoint, data, options);

      return { code: ExportResultCode.SUCCESS };
    } catch (e) {
      return { code: ExportResultCode.FAILED };
    }
  }
}

const tracer = trace.getTracer(application, version);
const provider = new BasicTracerProvider({ forceFlushTimeoutMillis: timeout });
trace.setGlobalTracerProvider(provider);

export function enableTelemetry(proxy?: string) {
  provider.addSpanProcessor(new SimpleSpanProcessor(new NewRelicExporter({ proxy: proxy })));
}

export function startSpan(name: string, account: string, pipeline: string, host: string, os: string) {
  return tracer.startSpan(name, {
    attributes: {
      account: crypto
        .createHash('sha256')
        .update(account || '')
        .digest('hex'),
      pipeline: crypto
        .createHash('sha256')
        .update(pipeline || '')
        .digest('hex'),
      host: host,
      os: os
    }
  });
}
