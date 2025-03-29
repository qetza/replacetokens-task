import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');
import http = require('http');
import https = require('https');

const taskPath = path.join(__dirname, '..', '..', 'index.js');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// inputs
tmr.setInput('enableTelemetry', 'false');
tmr.setInput('rootDirectory', '/rootDirectory');

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
requestClone.end = function (callback?: () => void) {
  console.log('telemetry sent');

  return this;
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
  checkPath: {
    '/rootDirectory': false
  }
};
tmr.setAnswers(answers);

// act
tmr.run();
