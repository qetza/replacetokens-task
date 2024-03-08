import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import http = require('http');
import https = require('https');

const taskPath = path.join(__dirname, '..', '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// variables
process.env['var1'] = 'var1_value';

// inputs
tmr.setInput('enableTelemetry', 'true');
tmr.setInput('targetFiles', 'input.json');
tmr.setInput('writeBOM', 'true');

// mocks
const requestClone = {} as http.ClientRequest;
requestClone.setTimeout = function () {
  return requestClone;
};
requestClone.on = function () {
  return requestClone;
};
requestClone.write = function () {
  return true;
};
requestClone.end = function () {
  console.log('telemetry sent');
};

const httpsClone = Object.assign({}, https);
httpsClone.request = function () {
  return requestClone;
};

tmr.registerMock('https', httpsClone);

const httpClone = Object.assign({}, http);
httpClone.request = function () {
  return requestClone;
};

tmr.registerMock('http', httpClone);

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
