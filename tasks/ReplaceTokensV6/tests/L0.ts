import * as fs from 'fs';
import * as path from 'path';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as os from 'os';

require('chai').should();

const data = path.join(__dirname, '..', '..', 'tests', '_data');
const tmp = path.join(__dirname, '..', '..', 'tests', '_tmp');

describe('ReplaceTokens v6 L0 suite', function () {
  this.timeout(10000);

  beforeEach(() => {
    fs.mkdirSync(tmp, { recursive: true });

    process.env['__caseInsensitivePaths__'] = 'true';
    process.env['__includeDotPaths__'] = 'true';
  });

  afterEach(() => {
    delete process.env['__sources__'];
    delete process.env['__addBOM__'];
    delete process.env['__additionalVariables__'];
    delete process.env['__caseInsensitivePaths__'];
    delete process.env['__charsToEscape__'];
    delete process.env['__encoding__'];
    delete process.env['__escape__'];
    delete process.env['__escapeChar__'];
    delete process.env['__ifNoFilesFound__'];
    delete process.env['__includeDotPaths__'];
    delete process.env['__logLevel__'];
    delete process.env['__missingVarAction__'];
    delete process.env['__missingVarDefault__'];
    delete process.env['__missingVarLog__'];
    delete process.env['__recursive__'];
    delete process.env['__root__'];
    delete process.env['__separator__'];
    delete process.env['__telemetryOptout__'];
    delete process.env['__tokenPattern__'];
    delete process.env['__tokenPrefix__'];
    delete process.env['__tokenSuffix__'];
    delete process.env['__transforms__'];
    delete process.env['__transformsPrefix__'];
    delete process.env['__transformsSuffix__'];
    delete process.env['__VARS__'];

    if (process.env['VSTS_PUBLIC_VARIABLES']) {
      for (const name in JSON.parse(process.env['VSTS_PUBLIC_VARIABLES'])) {
        delete process.env[name.replace(/[ \.]/g, '_').toUpperCase()];
      }
      delete process.env['VSTS_PUBLIC_VARIABLES'];
    }

    if (process.env['VSTS_SECRET_VARIABLES']) {
      for (const name in JSON.parse(process.env['VSTS_SECRET_VARIABLES'])) {
        delete process.env[`SECRET_${name.replace(/[ \.]/g, '_').toUpperCase()}`];
      }
      delete process.env['VSTS_SECRET_VARIABLES'];
    }

    fs.rmSync(tmp, { force: true, recursive: true });
  });

  function runValidations(validator: () => void, tr: ttm.MockTestRunner) {
    try {
      validator();
    } catch (error) {
      console.log('STDERR', tr.stderr);
      console.log('STDOUT', tr.stdout);

      throw error;
    }
  }

  function addVariables(variables: { [key: string]: string }) {
    process.env['VSTS_PUBLIC_VARIABLES'] = JSON.stringify(Object.keys(variables));

    for (const [name, value] of Object.entries(variables)) {
      process.env[name.replace(/[ \.]/g, '_').toUpperCase()] = value;
    }
  }

  function addSecrets(secrets: { [key: string]: string }) {
    process.env['VSTS_SECRET_VARIABLES'] = JSON.stringify(Object.keys(secrets));

    for (const [name, value] of Object.entries(secrets)) {
      process.env[`SECRET_${name.replace(/[ \.]/g, '_').toUpperCase()}`] = value;
    }
  }

  it('validate: sources', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.failed.should.be.true;

      tr.stdout.should.include('##vso[task.complete result=Failed;]Error: Input required: sources');
    }, tr);
  });

  it('validate: escape', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__escape__'] = 'unsupported';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.failed.should.be.true;

      tr.stdout.should.include(
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: escape. Support input list: 'auto | custom | json | off | xml'"
      );
    }, tr);
  });

  it('validate: missingVarAction', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__missingVarAction__'] = 'unsupported';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.failed.should.be.true;

      tr.stdout.should.include(
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: missingVarAction. Support input list: 'keep | none | replace'"
      );
    }, tr);
  });

  it('validate: missingVarLog', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__missingVarLog__'] = 'unsupported';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.failed.should.be.true;

      tr.stdout.should.include(
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: missingVarLog. Support input list: 'error | off | info | warn'"
      );
    }, tr);
  });

  it('validate: tokenPattern', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__tokenPattern__'] = 'unsupported';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.failed.should.be.true;

      tr.stdout.should.include(
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: tokenPattern. Support input list: 'azpipelines | custom | default | doublebraces | doubleunderscores | githubactions | octopus'"
      );
    }, tr);
  });

  it('default', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json\r\n**/*.xml\r\n**/*.yml';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.not.contain('loadVariables_variables');
      tr.stdout.should.include('sources: ["**/*.json","**/*.xml","**/*.yml"]');
      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('telemetry: success', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json\r\n**/*.xml\r\n**/*.yml';
    process.env['SYSTEM_SERVERTYPE'] = 'hosted';
    process.env['SYSTEM_COLLECTIONID'] = 'col01';
    process.env['SYSTEM_TEAMPROJECTID'] = 'project01';
    process.env['SYSTEM_DEFINITIONID'] = 'def01';
    process.env['AGENT_OS'] = 'Windows_NT';

    try {
      // act
      await tr.runAsync();

      // assert
      runValidations(() => {
        tr.succeeded.should.be.true;

        tr.stdout.should.include('telemetry sent');
        tr.stdout.should.match(
          /\[\{"eventType":"TokensReplaced","application":"replacetokens-task","version":"6.0.0","account":"494d0aad9d06c4ddb51d5300620122ce55366a9382b3cc2835ed5f0e2e67b4d0","pipeline":"b98ed03d3eec376dcc015365c1a944e3ebbcc33d30e3261af3f4e4abb107aa82","host":"cloud","os":"Windows","sources":3,"add-bom":false,"case-insenstive-paths":true,"encoding":"auto","escape":"auto","if-no-files-found":"ignore","include-dot-paths":true,"log-level":"info","missing-var-action":"none","missing-var-default":"","missing-var-log":"warn","recursive":false,"separator":".","token-pattern":"default","transforms":false,"transforms-prefix":"\(","transforms-suffix":"\)","use-additional-variables-only":false,"variable-files":0,"variable-envs":0,"inline-variables":0,"output-defaults":1,"output-files":2,"output-replaced":3,"output-tokens":4,"output-transforms":5,"result":"success","duration":\d+(?:\.\d+)?}]/
        );
      }, tr);
    } finally {
      delete process.env['SYSTEM_SERVERTYPE'];
      delete process.env['SYSTEM_COLLECTIONID'];
      delete process.env['SYSTEM_TEAMPROJECTID'];
      delete process.env['SYSTEM_DEFINITIONID'];
      delete process.env['AGENT_OS'];
    }
  });

  it('telemetry: failed', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['SYSTEM_SERVERTYPE'] = 'hosted';
    process.env['SYSTEM_COLLECTIONID'] = 'col01';
    process.env['SYSTEM_TEAMPROJECTID'] = 'project01';
    process.env['SYSTEM_DEFINITIONID'] = 'def01';
    process.env['AGENT_OS'] = 'Windows_NT';

    try {
      // act
      await tr.runAsync();

      // assert
      runValidations(() => {
        tr.failed.should.be.true;

        tr.stdout.should.include('telemetry sent');
        tr.stdout.should.match(
          /\[\{"eventType":"TokensReplaced","application":"replacetokens-task","version":"6.0.0","account":"494d0aad9d06c4ddb51d5300620122ce55366a9382b3cc2835ed5f0e2e67b4d0","pipeline":"b98ed03d3eec376dcc015365c1a944e3ebbcc33d30e3261af3f4e4abb107aa82","host":"cloud","os":"Windows","result":"failed","duration":\d+(?:\.\d+)?}]/
        );
      }, tr);
    } finally {
      delete process.env['SYSTEM_SERVERTYPE'];
      delete process.env['SYSTEM_COLLECTIONID'];
      delete process.env['SYSTEM_TEAMPROJECTID'];
      delete process.env['SYSTEM_DEFINITIONID'];
      delete process.env['AGENT_OS'];
    }
  });

  it('sources: normalize', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = 'D:\\a\\1\\s/test.json';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      if (os.platform() === 'win32') {
        tr.stdout.should.include('sources: ["D:/a/1/s/test.json"]');
      } else {
        tr.stdout.should.include('sources: ["D:\\\\a\\\\1\\\\s/test.json"]');
      }
    }, tr);
  });

  it('addBOM', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__addBOM__'] = 'true';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":true,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('additionalVariables: file', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__root__'] = path.join(data, '..');
    process.env['__additionalVariables__'] = '@**/_data/vars.(json|jsonc|yml|yaml)';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('loadVariables_variables: ["@**/_data/vars.(json|jsonc|yml|yaml)"]');
      tr.stdout.should.include(
        `loadVariables_options: {"caseInsensitive":true,"dot":true,"normalizeWin32":true,"root":"${process.env['__root__'].replace(/\\/g, '\\\\')}","separator":"."}`
      );
    }, tr);
  });

  it('additionalVariables: env', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__VARS__'] = '{ "var1": "value1", "var2": "value2" }';
    process.env['__additionalVariables__'] = '$__VARS__';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('loadVariables_variables: ["$__VARS__"]');
      tr.stdout.should.include(`loadVariables_options: {"caseInsensitive":true,"dot":true,"normalizeWin32":true,"separator":"."}`);
    }, tr);
  });

  it('additionalVariables: object', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__additionalVariables__'] = `
  var1: value1
  var2: value2
  `;

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('loadVariables_variables: ["{\\"var1\\":\\"value1\\",\\"var2\\":\\"value2\\"}"]');
      tr.stdout.should.include(`loadVariables_options: {"caseInsensitive":true,"dot":true,"normalizeWin32":true,"separator":"."}`);
    }, tr);
  });

  it('additionalVariables: merge', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__telemetryOptout__'] = 'true';
    process.env['__sources__'] = '**/*.json';
    process.env['__root__'] = path.join(data, '..');
    process.env['__VARS__'] = '{ "var1": "env", "var2": "env" }';
    process.env['__additionalVariables__'] = `
- '@**/_data/vars.*;!**/*.xml'
- '$__VARS__'
- var2: inline
  var_yml2: inline
`;

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('loadVariables_variables: ["@**/_data/vars.*;!**/*.xml","$__VARS__","{\\"var2\\":\\"inline\\",\\"var_yml2\\":\\"inline\\"}"]');
      tr.stdout.should.include(
        `loadVariables_options: {"caseInsensitive":true,"dot":true,"normalizeWin32":true,"root":"${process.env['__root__'].replace(/\\/g, '\\\\')}","separator":"."}`
      );
    }, tr);
  });

  it('caseInsensitivePaths', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__additionalVariables__'] = 'var1: value1';
    process.env['__caseInsensitivePaths__'] = 'false';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include('loadVariables_options: {"caseInsensitive":false,"dot":true,"normalizeWin32":true,"separator":"."}');
      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":false,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('charsToEscape', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__charsToEscape__'] = 'abcd';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"chars":"abcd","type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('encoding', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__encoding__'] = 'abcd';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"abcd","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('escape', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__escape__'] = 'json';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"json"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('ifNoFilesFound: ignore', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_IfNoFilesFound.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__ifNoFilesFound__'] = 'ignore';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include('No files were found with provided sources.');
    }, tr);
  });

  it('ifNoFilesFound: warn', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_IfNoFilesFound.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__ifNoFilesFound__'] = 'warn';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]No files were found with provided sources.');
    }, tr);
  });

  it('ifNoFilesFound: error', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_IfNoFilesFound.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__ifNoFilesFound__'] = 'error';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.failed.should.be.true;

      tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]No files were found with provided sources.');
      tr.stdout.should.include('##vso[task.complete result=Failed;]No files were found with provided sources.');
    }, tr);
  });

  it('includeDotPaths', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__additionalVariables__'] = 'var1: value1';
    process.env['__includeDotPaths__'] = 'false';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include('loadVariables_options: {"caseInsensitive":true,"dot":false,"normalizeWin32":true,"separator":"."}');
      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":false},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('logLevel: debug', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_LogLevel.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__logLevel__'] = 'debug';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('##vso[task.debug]debug');
      tr.stdout.should.include('\ndebug\n');
      tr.stdout.should.include('info');
      tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]warn');
      tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]error');
      tr.stdout.should.include('##vso[task.complete result=Failed;]error');
      tr.stdout.should.include('##[group] group');
      tr.stdout.should.include('##[endgroup]');
    }, tr);
  });

  it('logLevel: info', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_LogLevel.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__logLevel__'] = 'info';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('##vso[task.debug]debug');
      tr.stdout.should.not.include('\ndebug\n');
      tr.stdout.should.include('\ninfo\n');
      tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]warn');
      tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]error');
      tr.stdout.should.include('##vso[task.complete result=Failed;]error');
      tr.stdout.should.include('##[group] group');
      tr.stdout.should.include('##[endgroup]');
    }, tr);
  });

  it('logLevel: warn', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_LogLevel.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__logLevel__'] = 'warn';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('##vso[task.debug]debug');
      tr.stdout.should.not.include('\ndebug\n');
      tr.stdout.should.not.include('\ninfo\n');
      tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]warn');
      tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]error');
      tr.stdout.should.include('##vso[task.complete result=Failed;]error');
      tr.stdout.should.not.include('##[group] group');
      tr.stdout.should.not.include('##[endgroup]');
    }, tr);
  });

  it('logLevel: error', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_LogLevel.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__logLevel__'] = 'error';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.stdout.should.include('##vso[task.debug]debug');
      tr.stdout.should.not.include('\ndebug\n');
      tr.stdout.should.not.include('\ninfo\n');
      tr.stdout.should.not.include('##vso[task.issue type=warning;source=TaskInternal;]warn');
      tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]error');
      tr.stdout.should.include('##vso[task.complete result=Failed;]error');
      tr.stdout.should.not.include('##[group] group');
      tr.stdout.should.not.include('##[endgroup]');
    }, tr);
  });

  it('missingVarAction', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__missingVarAction__'] = 'keep';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"keep","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('missingVarDefault', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__missingVarDefault__'] = 'abcd';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"abcd","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('missingVarLog', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__missingVarLog__'] = 'off';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"off"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('recursive', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__recursive__'] = 'true';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":true,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('root', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__root__'] = __dirname;

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        `options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"root":"${__dirname.replace(/\\/g, '\\\\')}","sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}`
      );
    }, tr);
  });

  it('separator', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__additionalVariables__'] = 'var1: value1';
    process.env['__separator__'] = ':';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include('loadVariables_options: {"caseInsensitive":true,"dot":true,"normalizeWin32":true,"separator":":"}');
    }, tr);
  });

  it('telemetryOptout: input', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__telemetryOptout__'] = 'true';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
      tr.stdout.should.not.include('telemetry sent');
      tr.stdout.should.not.include('##vso[task.debug]telemetry: [');
    }, tr);
  });

  it('telemetryOptout: REPLACETOKENS_TELEMETRY_OPTOUT=1', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['REPLACETOKENS_TELEMETRY_OPTOUT'] = '1';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
      tr.stdout.should.not.include('telemetry sent');
      tr.stdout.should.not.include('##vso[task.debug]telemetry: [');
    }, tr);
  });

  it('telemetryOptout: REPLACETOKENS_TELEMETRY_OPTOUT=true', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['REPLACETOKENS_TELEMETRY_OPTOUT'] = '1';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
      tr.stdout.should.not.include('telemetry sent');
      tr.stdout.should.not.include('##vso[task.debug]telemetry: [');
    }, tr);
  });

  it('telemetryOptout: REPLACETOKENS_DISABLE_TELEMETRY=1', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['REPLACETOKENS_TELEMETRY_OPTOUT'] = '1';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
      tr.stdout.should.not.include('telemetry sent');
      tr.stdout.should.not.include('##vso[task.debug]telemetry: [');
    }, tr);
  });

  it('telemetryOptout: REPLACETOKENS_DISABLE_TELEMETRY=true', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['REPLACETOKENS_TELEMETRY_OPTOUT'] = '1';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
      tr.stdout.should.not.include('telemetry sent');
      tr.stdout.should.not.include('##vso[task.debug]telemetry: [');
    }, tr);
  });

  it('tokenPattern', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__tokenPattern__'] = 'azpipelines';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"azpipelines"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('tokenPrefix', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__tokenPrefix__'] = '[[';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default","prefix":"[["},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('tokenSuffix', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__tokenSuffix__'] = ']]';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default","suffix":"]]"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('transforms', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__transforms__'] = 'true';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":true,"prefix":"(","suffix":")"}}'
      );
    }, tr);
  });

  it('transformsPrefix', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__transformsPrefix__'] = '[';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"[","suffix":")"}}'
      );
    }, tr);
  });

  it('transformsSuffix', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__transformsSuffix__'] = ']';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"sources":{"caseInsensitive":true,"dot":true},"token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":"]"}}'
      );
    }, tr);
  });

  it('replace tokens', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_NoMock.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    addVariables({ 'var.var': 'var', var_yaml2: 'var' });
    addSecrets({ 'var.secret': 'secret', 'var.yml2': 'secret' });

    let input = path.join(tmp, 'file.txt');
    await fs.promises.copyFile(path.join(data, 'file.txt'), input);
    input = path.resolve(input);

    process.env['__telemetryOptout__'] = 'true';
    process.env['__sources__'] = input;
    process.env['__missingVarAction__'] = 'replace';
    process.env['__missingVarDefault__'] = 'DEFAULT';
    process.env['__root__'] = path.join(data, '..');
    process.env['__VARS__'] = '{ "var1": "env", "var2": "env" }';
    process.env['__additionalVariables__'] = `
- '@**/_data/vars.*;!**/*.xml'
- '$__VARS__'
- var2: inline
  var.yml2: inline
`;

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      const actual = fs.readFileSync(input, 'utf8');
      const expected = fs.readFileSync(path.join(data, 'file.expected.txt'), 'utf8');

      actual.should.equal(expected);
    }, tr);
  });

  it('useAdditionalVariablesOnly', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_NoMock.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    addVariables({ 'var.var': 'var', var_yaml2: 'var' });
    addSecrets({ 'var.secret': 'secret', 'var.yml2': 'secret' });

    let input = path.join(tmp, 'file.txt');
    await fs.promises.copyFile(path.join(data, 'file.txt'), input);
    input = path.resolve(input);

    process.env['__telemetryOptout__'] = 'true';
    process.env['__sources__'] = input;
    process.env['__missingVarAction__'] = 'replace';
    process.env['__missingVarDefault__'] = 'DEFAULT';
    process.env['__root__'] = path.join(data, '..');
    process.env['__VARS__'] = '{ "var1": "env", "var2": "env" }';
    process.env['__useAdditionalVariablesOnly__'] = 'true';
    process.env['__additionalVariables__'] = `
- '@**/_data/vars.*;!**/*.xml'
- '$__VARS__'
- var2: inline
  var.yml2: inline
`;

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      const actual = fs.readFileSync(input, 'utf8');
      const expected = fs.readFileSync(path.join(data, 'file.only_additional_variables.expected.txt'), 'utf8');

      actual.should.equal(expected);
    }, tr);
  });
});
