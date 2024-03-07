import * as tl from 'azure-pipelines-task-lib';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as fg from 'fast-glob';
import * as rt from '@qetza/replacetokens';
import stripJsonComments from './strip-json-comments';

async function run() {
  const _debug = console.debug;
  const _info = console.info;
  const _warn = console.warn;
  const _error = console.error;
  const _group = console.group;
  const _groupEnd = console.groupEnd;

  try {
    // read and validate inputs
    const sources = tl.getDelimitedInput('sources', /\r?\n/, true);
    const options: rt.Options = {
      addBOM: tl.getBoolInput('addBOM'),
      encoding: tl.getInput('encoding') || rt.Encodings.Auto,
      escape: {
        chars: tl.getInput('charsToEscape'),
        escapeChar: tl.getInput('escapeChar'),
        type: getChoiceInput('escape', [rt.Escapes.Auto, rt.Escapes.Custom, rt.Escapes.Json, rt.Escapes.Off, rt.Escapes.Xml]) || rt.Escapes.Auto
      },
      missing: {
        action:
          getChoiceInput('missingVarAction', [rt.MissingVariables.Action.Keep, rt.MissingVariables.Action.None, rt.MissingVariables.Action.Replace]) ||
          rt.MissingVariables.Action.None,
        default: tl.getInput('missingVarDefault') || '',
        log:
          getChoiceInput('missingVarLog', [rt.MissingVariables.Log.Error, rt.MissingVariables.Log.Off, rt.MissingVariables.Log.Warn]) ||
          rt.MissingVariables.Log.Warn
      },
      recursive: tl.getBoolInput('recursive'),
      root: tl.getPathInput('root', false, true),
      separator: tl.getInput('separator') || rt.Defaults.Separator,
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
        enabled: tl.getBoolInput('transforms'),
        prefix: tl.getInput('transformsPrefix') || rt.Defaults.TransformPrefix,
        suffix: tl.getInput('transformsSuffix') || rt.Defaults.TransformSuffix
      }
    };

    const variables = rt.merge(
      tl.getVariables().reduce((map, current) => {
        map[current.name] = current.value;
        return map;
      }, {}),
      await parseVariables(tl.getInput('additionalVariables'), options.root)
    );

    // override console logs
    const logLevel = parseLogLevel(tl.getInput('logLevel') || 'info');
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

    // replace tokens
    const result = await rt.replaceTokens(sources, variables, options);

    if (result.files === 0) {
      (msg => {
        switch (tl.getInput('ifNoFilesFound') || 'ignore') {
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
  } catch (error) {
    tl.setResult(tl.TaskResult.Failed, error);
  } finally {
    // restore console logs
    console.debug = _debug;
    console.info = _info;
    console.warn = _warn;
    console.error = _error;
    console.group = _group;
    console.groupEnd = _groupEnd;
  }
}

var getChoiceInput = function (name: string, choices: string[]): string {
  const input = tl.getInput(name)?.trim();
  if (!input || choices.includes(input)) return input;

  throw new Error(`Unsupported value for input: ${name}\nSupport input list: '${choices.join(' | ')}'`);
};

var parseVariables = async function (input: string, root: string): Promise<{ [key: string]: any }> {
  input = input || '';
  if (!input) return {};

  switch (input[0]) {
    case '@': // single string referencing a file
      return await loadVariablesFromFile(input.substring(1), root);

    case '$': // single string referencing environment variable
      return loadVariablesFromEnv(input.substring(1));

    default: // yaml format
      return await loadVariablesFromYaml(input, root);
  }
};

var loadVariablesFromFile = async function (name: string, root: string): Promise<{ [key: string]: any }> {
  var files = await fg.glob(
    name.split(';').map(v => v.trim()),
    {
      absolute: true,
      cwd: root,
      onlyFiles: true,
      unique: true
    }
  );

  const vars: { [key: string]: any }[] = [];
  for (const file of files) {
    tl.debug(`loading variables from file '${file}'`);

    const extension: string = path.extname(file).toLowerCase();
    const content = (await rt.readTextFile(file)).content;

    if (['.yml', '.yaml'].includes(extension)) {
      yaml.loadAll(content, (v: any) => {
        vars.push(v);
      });
    } else {
      vars.push(JSON.parse(stripJsonComments(content)));
    }
  }

  return rt.merge(...vars);
};

var loadVariablesFromEnv = function (name: string): { [key: string]: any } {
  tl.debug(`loading variables from environment variable '${name}'`);

  return JSON.parse(stripJsonComments(process.env[name] || '{}'));
};

var loadVariablesFromYaml = async function (input: string, root: string): Promise<{ [key: string]: any }> {
  const variables = yaml.load(input);
  const load = async (v: any) => {
    if (typeof v === 'string') {
      switch (v[0]) {
        case '@':
          return await loadVariablesFromFile(v.substring(1), root);

        case '$':
          return loadVariablesFromEnv(v.substring(1));

        default:
          throw new Error("Unsupported value for: additionalVariables\nString values must starts with '@' (file path) or '$' (environment variable)");
      }
    }

    return v;
  };

  if (Array.isArray(variables)) {
    // merge items
    const vars: { [key: string]: any }[] = [];
    for (let v of variables) {
      vars.push(await load(v));
    }

    return rt.merge(...vars);
  }

  return await load(variables);
};

enum LogLevel {
  Debug,
  Info,
  Warn,
  Error
}
function parseLogLevel(level: string): LogLevel {
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
}

run();
