import * as tl from 'azure-pipelines-task-lib';
import * as yaml from 'js-yaml';
import * as rt from '@qetza/replacetokens';
import * as telemetry from './telemetry';
import { SpanStatusCode } from '@opentelemetry/api';
import * as os from 'os';

async function run() {
  const _debug = console.debug;
  const _info = console.info;
  const _warn = console.warn;
  const _error = console.error;
  const _group = console.group;
  const _groupEnd = console.groupEnd;

  if (
    !tl.getBoolInput('telemetryOptout') &&
    !['true', '1'].includes(process.env['REPLACETOKENS_TELEMETRY_OPTOUT'] || process.env['REPLACETOKENS_DISABLE_TELEMETRY'])
  ) {
    telemetry.enableTelemetry(tl.getHttpProxyConfiguration()?.proxyUrl);
  }

  const serverType = tl.getVariable('System.ServerType');
  const telemetryEvent = telemetry.startSpan(
    'run',
    tl.getVariable('system.collectionid'),
    `${tl.getVariable('system.teamprojectid')}${tl.getVariable('system.definitionid')}`,
    !serverType || serverType.toLowerCase() !== 'hosted' ? 'server' : 'cloud',
    (() => {
      const os = tl.getVariable('Agent.OS');
      switch (os) {
        case 'Windows_NT':
          return 'Windows';
        case 'Darwin':
          return 'macOS';
        case 'Linux':
          return 'Linux';
        default:
          return os || 'unknown';
      }
    })()
  );

  try {
    // read and validate inputs
    const sources = getSources();
    const options: rt.Options = {
      addBOM: tl.getBoolInput('writeBOM'),
      encoding: tl.getInput('encoding') || rt.Encodings.Auto,
      escape: {
        chars: tl.getInput('charsToEscape'),
        escapeChar: tl.getInput('escapeChar'),
        type: getChoiceInput('escapeType', [rt.Escapes.Auto, rt.Escapes.Custom, rt.Escapes.Json, rt.Escapes.Off, rt.Escapes.Xml], 'escape') || rt.Escapes.Auto
      },
      missing: {
        action:
          getChoiceInput('missingVarAction', [rt.MissingVariables.Action.Keep, rt.MissingVariables.Action.None, rt.MissingVariables.Action.Replace]) ||
          rt.MissingVariables.Action.None,
        default: tl.getInput('defaultValue') || '',
        log:
          getChoiceInput('actionOnMissing', [rt.MissingVariables.Log.Error, rt.MissingVariables.Log.Off, rt.MissingVariables.Log.Warn], 'missingVarLog') ||
          rt.MissingVariables.Log.Warn
      },
      recursive: tl.getBoolInput('enableRecursion'),
      root: tl.getPathInput('rootDirectory', false, true),
      sources: {
        caseInsensitive: tl.getBoolInput('caseInsensitivePaths'),
        dot: tl.getBoolInput('includeDotPaths')
      },
      token: {
        pattern:
          getChoiceInput('tokenPattern', [
            rt.TokenPatterns.AzurePipelines,
            rt.TokenPatterns.Custom,
            rt.TokenPatterns.Default,
            rt.TokenPatterns.DoubleBraces,
            rt.TokenPatterns.DoubleUnderscores,
            rt.TokenPatterns.GithubActions,
            rt.TokenPatterns.Octopus
          ]) || rt.TokenPatterns.Default,
        prefix: tl.getInput('tokenPrefix'),
        suffix: tl.getInput('tokenSuffix')
      },
      transforms: {
        enabled: tl.getBoolInput('enableTransforms'),
        prefix: tl.getInput('transformPrefix') || rt.Defaults.TransformPrefix,
        suffix: tl.getInput('transformSuffix') || rt.Defaults.TransformSuffix
      }
    };

    const ifNoFilesFound = tl.getInput('actionOnNoFiles') || 'ignore';
    const logLevelStr = tl.getInput('verbosity') || 'info';

    // override console logs
    const logLevel = parseLogLevel(logLevelStr);
    console.debug = function (...args: any[]) {
      tl.debug(args.join(' ')); // always debug to core

      if (logLevel === LogLevel.Debug) console.log(args.join(' ')); // log as info to be independant of core switch
    };
    console.info = function (...args: any[]) {
      if (logLevel < LogLevel.Warn) console.log(args.join(' '));
    };
    console.warn = function (...args: any[]) {
      if (logLevel < LogLevel.Error) tl.warning(args.join(' '));
    };
    console.error = function (...args: any[]) {
      tl.setResult(tl.TaskResult.Failed, args.join(' ')); // always set failure on error
    };
    console.group = function (...args: any[]) {
      console.info('##[group] ' + args.join(' '));
    };
    console.groupEnd = function () {
      console.info('##[endgroup]');
    };

    // load additional variables
    const separator = tl.getInput('variableSeparator') || rt.Defaults.Separator;
    const additionalVariables = await getAdditionalVariables(options.root, separator, options.sources.caseInsensitive, options.sources.dot);

    // set telemetry attributes
    telemetryEvent.setAttributes({
      sources: sources.length,
      'add-bom': options.addBOM,
      'case-insenstive-paths': options.sources.caseInsensitive,
      'chars-to-escape': options.escape.chars,
      encoding: options.encoding,
      escape: options.escape.type,
      'escape-char': options.escape.escapeChar,
      'if-no-files-found': ifNoFilesFound,
      'include-dot-paths': options.sources.dot,
      'log-level': logLevelStr,
      'missing-var-action': options.missing.action,
      'missing-var-default': options.missing.default,
      'missing-var-log': options.missing.log,
      recusrive: options.recursive,
      separator: separator,
      'token-pattern': options.token.pattern,
      'token-prefix': options.token.prefix,
      'token-suffix': options.token.suffix,
      transforms: options.transforms.enabled,
      'transforms-prefix': options.transforms.prefix,
      'transforms-suffix': options.transforms.suffix,
      'variable-files': variableFilesCount,
      'variable-envs': variablesEnvCount,
      'inline-variables': inlineVariablesCount
    });

    // replace tokens
    const result = await rt.replaceTokens(sources, (name: string) => (name in additionalVariables ? additionalVariables[name] : tl.getVariable(name)), options);

    if (result.files === 0) {
      (msg => {
        switch (ifNoFilesFound) {
          case 'warn':
            console.warn(msg);
            break;
          case 'error':
            console.error(msg);
            break;
          default:
            console.info(msg);
            break;
        }
      })('No files were found with provided sources.');
    }

    // set outputs
    tl.setVariable('defaults', `${result.defaults}`);
    tl.setVariable('files', `${result.files}`);
    tl.setVariable('replaced', `${result.replaced}`);
    tl.setVariable('tokens', `${result.tokens}`);
    tl.setVariable('transforms', `${result.transforms}`);

    telemetryEvent.setAttributes({
      'output-defaults': result.defaults,
      'output-files': result.files,
      'output-replaced': result.replaced,
      'output-tokens': result.tokens,
      'output-transforms': result.transforms
    });

    telemetryEvent.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    telemetryEvent.setStatus({ code: SpanStatusCode.ERROR });

    tl.setResult(tl.TaskResult.Failed, error);
  } finally {
    telemetryEvent.end();

    // restore console logs
    console.debug = _debug;
    console.info = _info;
    console.warn = _warn;
    console.error = _error;
    console.group = _group;
    console.groupEnd = _groupEnd;
  }
}

var getSources = function (): string[] {
  const sources = tl.getDelimitedInput('targetFiles', /\r?\n/);
  if (sources.length === 0) throw new Error('Input required: sources');

  // make sources compatible with fast-glob on win32
  if (os.platform() === 'win32') {
    for (var i in sources) {
      sources[i] = sources[i].replace(/\\/g, '/').replace(/\/\/+/g, '/');
    }
  }

  return sources;
};

var getChoiceInput = function (name: string, choices: string[], alias?: string): string {
  alias = alias || name;
  const input = tl.getInput(name)?.trim();
  if (!input || choices.includes(input)) return input;

  throw new Error(`Unsupported value for input: ${alias}. Support input list: '${choices.join(' | ')}'`);
};

var variableFilesCount = 0;
var variablesEnvCount = 0;
var inlineVariablesCount = 0;
var getAdditionalVariables = async function (root?: string, separator?: string, caseInsensitive?: boolean, dot?: boolean): Promise<{ [key: string]: string }> {
  const input = tl.getInput('additionalVariables') || '';
  if (!input) return {};

  return await rt.loadVariables(
    (() => {
      switch (input[0]) {
        case '@': // single string referencing a file
          ++variableFilesCount;
          return [input];

        case '$': // single string referencing environment variable
          ++variablesEnvCount;
          return [input];

        default: // yaml format
          return getAdditionalVariablesFromYaml(input);
      }
    })(),
    { caseInsensitive: caseInsensitive, dot: dot, normalizeWin32: true, root: root, separator: separator }
  );
};

var getAdditionalVariablesFromYaml = function (input: string): string[] {
  const variables = yaml.load(input);
  const load = (v: any): string => {
    if (typeof v === 'string') {
      switch (v[0]) {
        case '@':
          ++variableFilesCount;
          return v;

        case '$':
          ++variablesEnvCount;
          return v;

        default:
          throw new Error("Unsupported value for: additionalVariables. String values must starts with '@' (file path) or '$' (environment variable)");
      }
    }

    inlineVariablesCount += Object.keys(v).length;

    return JSON.stringify(v);
  };

  if (Array.isArray(variables)) {
    // merge items
    const vars: string[] = [];
    for (let v of variables) {
      vars.push(load(v));
    }

    return vars;
  }

  return [load(variables)];
};

enum LogLevel {
  Debug,
  Info,
  Warn,
  Error
}
var parseLogLevel = function (level: string): LogLevel {
  switch (level) {
    case 'debug':
      return LogLevel.Debug;
    case 'info':
      return LogLevel.Info;
    case 'warn':
      return LogLevel.Warn;
    case 'error':
      return LogLevel.Error;
    default:
      return LogLevel.Info;
  }
};

run();
