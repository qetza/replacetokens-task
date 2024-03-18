import crypto = require('crypto');
import url = require('url');
import http = require('http');
import https = require('https');

const application = 'replacetokens-task';
const version = '4.0.0';
const endpoint = 'https://insights-collector.eu01.nr-data.net/v1/accounts/4392697/events';
const key = 'eu01xxc28887c2d47d9719ed24a74df5FFFFNRAL';
const timeout = 3000;

export default function trackEvent(event: TelemetryEvent, proxy?: string): string | undefined {
  try {
    // create event payload
    let body = [
      {
        ...event,
        eventType: 'TokensReplaced',
        application: application,
        version: version
      }
    ];

    // send event
    let telemetryUrlParsed = url.parse(endpoint);
    let options = {
      method: 'POST',
      host: telemetryUrlParsed.hostname,
      port: telemetryUrlParsed.port,
      path: telemetryUrlParsed.pathname,
      withCredentials: false,
      timeout: timeout,
      headers: <{ [key: string]: string }>{
        'Api-Key': key,
        'Content-Type': 'application/json'
      }
    };

    proxy = proxy || process.env['https_proxy'] || undefined;
    if (proxy) {
      if (proxy.indexOf('//') === 0) proxy = 'http:' + proxy;

      let proxyUrlParsed = url.parse(proxy);
      if (proxyUrlParsed.protocol === 'https:') {
        proxy = undefined;
      } else {
        options = {
          ...options,
          host: proxyUrlParsed.hostname,
          port: proxyUrlParsed.port || '80',
          path: endpoint,
          headers: { ...options.headers, Host: telemetryUrlParsed.hostname }
        };
      }
    }

    let request = proxy ? http.request(options) : https.request(options);

    request.setTimeout(timeout, () => {
      request.abort();
    });
    request.on('error', e => {});

    request.write(JSON.stringify(body));
    request.end();

    return JSON.stringify(body);
  } catch {
    // silently continue
  }
}

export class TelemetryEvent {
  private readonly account: string;
  private readonly pipeline: string;

  constructor(account: string, pipeline: string) {
    this.account = crypto
      .createHash('sha256')
      .update(account || '')
      .digest('hex');
    this.pipeline = crypto
      .createHash('sha256')
      .update(pipeline || '')
      .digest('hex');
  }

  host: string;
  os: string;
  result: string;
  duration: number;
  tokenPrefix: string;
  tokenSuffix: string;
  pattern: string;
  encoding: string;
  keepToken: boolean;
  actionOnMissing: string;
  writeBOM: boolean;
  emptyValue: string;
  escapeType: string;
  escapeChar: string;
  charsToEscape: string;
  verbosity: string;
  variableFiles: number;
  variableSeparator: string;
  rules: number;
  rulesWithInputWildcard: number;
  rulesWithOutputPattern: number;
  rulesWithNegativePattern: number;
  tokenReplaced: number;
  tokenFound: number;
  fileProcessed: number;
  useLegacyPattern: boolean;
  enableTransforms: boolean;
  transformPrefix: string;
  transformSuffix: string;
  transformPattern: string;
  transformExecuted: number;
  defaultValue: string;
  defaultValueReplaced: number;
  tokenPattern: string;
  actionOnNoFiles: string;
  inlineVariables: number;
  enableRecursion: boolean;
  useLegacyEmptyFeature: boolean;
  useDefaultValue: boolean;
}
