import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// inputs
if (process.env['__sources__']) tmr.setInput('sources', process.env['__sources__']);
if (process.env['__ifNoFilesFound__']) tmr.setInput('ifNoFilesFound', process.env['__ifNoFilesFound__']);

// mocks
const rt = require('@qetza/replacetokens');
const rtClone = Object.assign({}, rt);
rtClone.replaceTokens = function (sources, variables, options) {
  return { defaults: 1, files: 0, replaced: 3, tokens: 4, transforms: 5 };
};

tmr.registerMock('@qetza/replacetokens', rtClone);

// act
tmr.run();
