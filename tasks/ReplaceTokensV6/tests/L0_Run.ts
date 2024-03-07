import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// inputs
if (process.env['__sources__']) tmr.setInput('sources', process.env['__sources__']);
if (process.env['__addBOM__']) tmr.setInput('addBOM', process.env['__addBOM__']);
if (process.env['__additionalVariables__']) tmr.setInput('additionalVariables', process.env['__additionalVariables__']);
if (process.env['__charsToEscape__']) tmr.setInput('charsToEscape', process.env['__charsToEscape__']);
if (process.env['__encoding__']) tmr.setInput('encoding', process.env['__encoding__']);
if (process.env['__escape__']) tmr.setInput('escape', process.env['__escape__']);
if (process.env['__escapeChar__']) tmr.setInput('escapeChar', process.env['__escapeChar__']);
if (process.env['__ifNoFilesFound__']) tmr.setInput('ifNoFilesFound', process.env['__ifNoFilesFound__']);
if (process.env['__logLevel__']) tmr.setInput('logLevel', process.env['__logLevel__']);
if (process.env['__missingVarAction__']) tmr.setInput('missingVarAction', process.env['__missingVarAction__']);
if (process.env['__missingVarDefault__']) tmr.setInput('missingVarDefault', process.env['__missingVarDefault__']);
if (process.env['__missingVarLog__']) tmr.setInput('missingVarLog', process.env['__missingVarLog__']);
if (process.env['__recursive__']) tmr.setInput('recursive', process.env['__recursive__']);
if (process.env['__root__']) tmr.setInput('root', process.env['__root__']);
if (process.env['__separator__']) tmr.setInput('separator', process.env['__separator__']);
if (process.env['__telemetry__']) tmr.setInput('telemetry', process.env['__telemetry__']);
if (process.env['__tokenPattern__']) tmr.setInput('tokenPattern', process.env['__tokenPattern__']);
if (process.env['__tokenPrefix__']) tmr.setInput('tokenPrefix', process.env['__tokenPrefix__']);
if (process.env['__tokenSuffix__']) tmr.setInput('tokenSuffix', process.env['__tokenSuffix__']);
if (process.env['__transforms__']) tmr.setInput('transforms', process.env['__transforms__']);
if (process.env['__transformsPrefix__']) tmr.setInput('transformsPrefix', process.env['__transformsPrefix__']);
if (process.env['__transformsSuffix__']) tmr.setInput('transformsSuffix', process.env['__transformsSuffix__']);

// mocks
const rt = require('@qetza/replacetokens');
const rtClone = Object.assign({}, rt);
rtClone.replaceTokens = function (sources, variables, options) {
  console.log(`sources: ${JSON.stringify(sources)}`);
  console.log(`variables: ${JSON.stringify(variables)}`);
  console.log(`options: ${JSON.stringify(options)}`);

  return { defaults: 1, files: 2, replaced: 3, tokens: 4, transforms: 5 };
};

tmr.registerMock('@qetza/replacetokens', rtClone);

// act
tmr.run();
