import { ExportResult, ExportResultCode, hrTimeToMilliseconds, hrTimeToNanoseconds } from '@opentelemetry/core';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { BasicTracerProvider, SimpleSpanProcessor, SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import * as axios from 'axios';
import * as crypto from 'crypto';

const application = 'replacetokens-task';
const version = '6.0.0';
const url = 'https://westeurope-5.in.applicationinsights.azure.com/v2/track';
const key = 'e18a8793-c093-46f9-8c3b-433c9553eb7f';
const timeout = 3000;

class ApplicationInsightsExporter implements SpanExporter {
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
      console.debug(
        `telemetry: ${JSON.stringify(
          events.map(e => {
            return { ...e, name: '*****', iKey: '*****' };
          })
        )}`
      );

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
      name: `Microsoft.ApplicationInsights.Dev.${key}.Event`,
      time: new Date(hrTimeToNanoseconds(span.startTime) / 1000000).toISOString(),
      iKey: key,
      tags: {
        'ai.application.ver': version,
        'ai.cloud.role': span.attributes['host'],
        'ai.internal.sdkVersion': 'replacetokens:2.0.0',
        'ai.operation.id': span.spanContext().traceId,
        'ai.operation.name': application,
        'ai.user.accountId': span.attributes['account'],
        'ai.user.authUserId': span.attributes['pipeline']
      },
      data: {
        baseType: 'EventData',
        baseData: {
          ver: '2',
          name: 'tokens.replaced',
          properties: {
            ...span.attributes,
            host: undefined,
            account: undefined,
            pipeline: undefined,
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
          }
        }
      }
    };
  }

  private async _send(data: any[]): Promise<ExportResult> {
    try {
      const options: axios.AxiosRequestConfig<any[]> = { timeout: timeout };
      if (this._proxy) {
        const proxyUrl = new URL(this._proxy);

        let proxy: any = { host: proxyUrl.host };
        if (proxyUrl.port) proxy = { ...proxy, port: parseInt(proxyUrl.port) };
        if (proxyUrl.username) proxy = { ...proxy, auth: { username: proxyUrl.username } };
        if (proxyUrl.password) proxy = { ...proxy, auth: { ...proxy.auth, password: proxyUrl.password } };

        options.proxy = proxy;
      }

      await axios.default.post(url, data, options);

      return { code: ExportResultCode.SUCCESS };
    } catch (e) {
      return { code: ExportResultCode.FAILED };
    }
  }
}

const tracer = trace.getTracer(application, version);
const provider = new BasicTracerProvider({ forceFlushTimeoutMillis: timeout });
trace.setGlobalTracerProvider(provider);

export function useApplicationInsightsExporter(proxy?: string) {
  provider.addSpanProcessor(new SimpleSpanProcessor(new ApplicationInsightsExporter({ proxy: proxy })));
}

export function startSpan(name: string, account: string, pipeline: string, host: string) {
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
      host: host
    }
  });
}
