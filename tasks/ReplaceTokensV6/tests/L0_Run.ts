import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// inputs
if (process.env['__sources__']) tmr.setInput('targetFiles', process.env['__sources__']);
if (process.env['__addBOM__']) tmr.setInput('writeBOM', process.env['__addBOM__']);
if (process.env['__additionalVariables__']) tmr.setInput('additionalVariables', process.env['__additionalVariables__']);
if (process.env['__caseInsensitivePaths__']) tmr.setInput('caseInsensitivePaths', process.env['__caseInsensitivePaths__']);
if (process.env['__charsToEscape__']) tmr.setInput('charsToEscape', process.env['__charsToEscape__']);
if (process.env['__encoding__']) tmr.setInput('encoding', process.env['__encoding__']);
if (process.env['__escape__']) tmr.setInput('escapeType', process.env['__escape__']);
if (process.env['__escapeChar__']) tmr.setInput('escapeChar', process.env['__escapeChar__']);
if (process.env['__ifNoFilesFound__']) tmr.setInput('actionOnNoFiles', process.env['__ifNoFilesFound__']);
if (process.env['__logLevel__']) tmr.setInput('verbosity', process.env['__logLevel__']);
if (process.env['__missingVarAction__']) tmr.setInput('missingVarAction', process.env['__missingVarAction__']);
if (process.env['__missingVarDefault__']) tmr.setInput('defaultValue', process.env['__missingVarDefault__']);
if (process.env['__missingVarLog__']) tmr.setInput('actionOnMissing', process.env['__missingVarLog__']);
if (process.env['__recursive__']) tmr.setInput('enableRecursion', process.env['__recursive__']);
if (process.env['__root__']) tmr.setInput('rootDirectory', process.env['__root__']);
if (process.env['__separator__']) tmr.setInput('variableSeparator', process.env['__separator__']);
if (process.env['__telemetryOptout__']) tmr.setInput('telemetryOptout', process.env['__telemetryOptout__']);
if (process.env['__tokenPattern__']) tmr.setInput('tokenPattern', process.env['__tokenPattern__']);
if (process.env['__tokenPrefix__']) tmr.setInput('tokenPrefix', process.env['__tokenPrefix__']);
if (process.env['__tokenSuffix__']) tmr.setInput('tokenSuffix', process.env['__tokenSuffix__']);
if (process.env['__transforms__']) tmr.setInput('enableTransforms', process.env['__transforms__']);
if (process.env['__transformsPrefix__']) tmr.setInput('transformPrefix', process.env['__transformsPrefix__']);
if (process.env['__transformsSuffix__']) tmr.setInput('transformSuffix', process.env['__transformsSuffix__']);

// mocks
const rtClone = Object.assign({}, require('@qetza/replacetokens'));
rtClone.loadVariables = function (variables, options) {
  console.log(`loadVariables_variables: ${JSON.stringify(variables)}`);
  console.log(`loadVariables_options: ${JSON.stringify(options)}`);

  return Promise.resolve({});
};
rtClone.replaceTokens = function (sources, variables, options) {
  console.log(`sources: ${JSON.stringify(sources)}`);
  console.log(`options: ${JSON.stringify(options)}`);

  return Promise.resolve({ defaults: 1, files: 2, replaced: 3, tokens: 4, transforms: 5 });
};

tmr.registerMock('@qetza/replacetokens', rtClone);

const axiosClone = Object.assign({}, require('axios'));
axiosClone.default = Object.assign({}, axiosClone.default);
axiosClone.default.post = function () {
  console.log('telemetry sent');

  return Promise.resolve();
};

tmr.registerMock('axios', axiosClone);

// act
tmr.run();
