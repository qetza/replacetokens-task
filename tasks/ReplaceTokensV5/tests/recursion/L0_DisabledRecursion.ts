import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// variables
process.env['VAR1'] = 'var1_#{var2}#';
process.env['VAR2'] = 'value';

// inputs
tmr.setInput('enableTelemetry', 'false');
tmr.setInput('targetFiles', 'input.json');
tmr.setInput('writeBOM', 'true');
tmr.setInput('enableRecursion', 'false');

// sdk answers
let answers = {
  checkPath: {},
  findMatch: {
    'input.json': [process.env['__inputpath__']]
  },
  stats: {},
  exist: {}
};
answers['stats'][process.env['__inputpath__']] = {
  isDirectory: false
};
answers['exist'][process.env['__inputpath__']] = true;

tmr.setAnswers(answers);

// act
tmr.run();
