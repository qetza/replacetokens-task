import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// inputs
tmr.setInput('targetFiles', process.env['__sources__']);
tmr.setInput('verbosity', process.env['__logLevel__']);

// mocks
const rt = require('@qetza/replacetokens');
const rtClone = Object.assign({}, rt);
rtClone.replaceTokens = function (sources, variables, options) {
  console.debug('debug');
  console.info('info');
  console.warn('warn');
  console.error('error');
  console.group('group');
  console.groupEnd();

  return { defaults: 1, files: 2, replaced: 3, tokens: 4, transforms: 5 };
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
