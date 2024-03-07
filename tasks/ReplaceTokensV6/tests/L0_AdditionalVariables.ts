import * as tmrm from 'azure-pipelines-task-lib/mock-run';
import * as path from 'path';

const taskPath = path.join(__dirname, '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// inputs
tmr.setInput('sources', '**/*.json');
tmr.setInput('root', process.env['__root__'] || process.cwd());
tmr.setInput('additionalVariables', process.env['__additionalVariables__']);

// mocks
const rt = require('@qetza/replacetokens');
const rtClone = Object.assign({}, rt);
rtClone.replaceTokens = function (sources, variables, options) {
  console.log(`variables: ${JSON.stringify(variables)}`);

  return { defaults: 1, files: 2, replaced: 3, tokens: 4, transforms: 5 };
};

tmr.registerMock('@qetza/replacetokens', rtClone);

// act
tmr.run();
