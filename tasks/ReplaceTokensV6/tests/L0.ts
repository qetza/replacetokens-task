import * as path from 'path';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

require('chai').should();

const data = path.join(__dirname, '..', '..', 'tests', '_data');
const tmp = path.join(__dirname, '_tmp');

describe('ReplaceTokens v6 L0 suite', function () {
  this.timeout(5000);

  afterEach(() => {
    // clean env
    delete process.env['__sources__'];
    delete process.env['__addBOM__'];
    delete process.env['__additionalVariables__'];
    delete process.env['__charsToEscape__'];
    delete process.env['__encoding__'];
    delete process.env['__escape__'];
    delete process.env['__escapeChar__'];
    delete process.env['__ifNoFilesFound__'];
    delete process.env['__logLevel__'];
    delete process.env['__missingVarAction__'];
    delete process.env['__missingVarDefault__'];
    delete process.env['__missingVarLog__'];
    delete process.env['__recursive__'];
    delete process.env['__root__'];
    delete process.env['__separator__'];
    delete process.env['__telemetry__'];
    delete process.env['__tokenPattern__'];
    delete process.env['__tokenPrefix__'];
    delete process.env['__tokenSuffix__'];
    delete process.env['__transforms__'];
    delete process.env['__transformsPrefix__'];
    delete process.env['__transformsSuffix__'];
    delete process.env['__VARS__'];
    delete process.env['VSTS_PUBLIC_VARIABLES'];
    delete process.env['VSTS_SECRET_VARIABLES'];
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

    for (const name of Object.keys(variables)) {
      process.env[name] = variables[name];
    }
  }

  function cleanVariables(names: string[]) {
    for (const name of names) {
      delete process.env[name];
    }
  }

  function addSecrets(secrets: { [key: string]: string }) {
    process.env['VSTS_SECRET_VARIABLES'] = JSON.stringify(Object.keys(secrets));

    for (const name of Object.keys(secrets)) {
      process.env[`SECRET_${name}`] = secrets[name];
    }
  }

  function cleanSecrets(names: string[]) {
    for (const name of names) {
      delete process.env[`SECRET_${name}`];
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
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: escape%0ASupport input list: 'auto | custom | json | off | xml'"
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
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: missingVarAction%0ASupport input list: 'keep | none | replace'"
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
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: missingVarLog%0ASupport input list: 'error | off | warn'"
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
        "##vso[task.complete result=Failed;]Error: Unsupported value for input: tokenPattern%0ASupport input list: 'azpipelines | custom | default | doublebraces | doubleunderscores | githubactions | octopus'"
      );
    }, tr);
  });

  it('default', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    const vars = { var_var: 'var', var_yaml2: 'var' };
    const secrets = { var_secret: 'secret', var_yml2: 'secret' };
    addVariables(vars);
    addSecrets(secrets);

    process.env['__sources__'] = '**/*.json\r\n**/*.xml\r\n**/*.yml';

    try {
      // act
      await tr.runAsync();

      // assert
      runValidations(() => {
        tr.succeeded.should.be.true;

        tr.stdout.should.include('sources: ["**/*.json","**/*.xml","**/*.yml"]');
        tr.stdout.should.include('variables: {"var_secret":"secret","var_yml2":"secret","var_var":"var","var_yaml2":"var"}');
        tr.stdout.should.include(
          'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
        );
      }, tr);
    } finally {
      cleanVariables(Object.keys(vars));
      cleanSecrets(Object.keys(secrets));
    }
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
        'options: {"addBOM":true,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
      tr.stdout.should.include(`##vso[task.debug]loading variables from file '${path.join(data, 'vars.jsonc').replace(/\\/g, '/')}'`);
      tr.stdout.should.include(`##vso[task.debug]loading variables from file '${path.join(data, 'vars.yml').replace(/\\/g, '/')}'`);
      tr.stdout.should.include(`##vso[task.debug]loading variables from file '${path.join(data, 'vars.yaml').replace(/\\/g, '/')}'`);

      tr.stdout.should.include('variables: {"var_json":"file","var_yaml1":"file","var_yaml2":"file","var_yml1":"file","var_yml2":"file"}');
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
      tr.stdout.should.include("##vso[task.debug]loading variables from environment variable '__VARS__'");

      tr.stdout.should.include('variables: {"var1":"value1","var2":"value2"}');
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
      tr.stdout.should.include('variables: {"var1":"value1","var2":"value2"}');
    }, tr);
  });

  it('additionalVariables: merge', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    const vars = { var_var: 'var', var_yaml2: 'var' };
    const secrets = { var_secret: 'secret', var_yml2: 'secret' };
    addVariables(vars);
    addSecrets(secrets);

    process.env['__sources__'] = '**/*.json';
    process.env['__root__'] = path.join(data, '..');
    process.env['__VARS__'] = '{ "var1": "env", "var2": "env" }';
    process.env['__additionalVariables__'] = `
- '@**/_data/vars.*;!**/*.xml'
- '$__VARS__'
-
  var2: inline
  var_yml2: inline
`;

    try {
      // act
      await tr.runAsync();

      // assert
      runValidations(() => {
        tr.stdout.should.include(
          'variables: {"var_secret":"secret","var_yml2":"inline","var_var":"var","var_yaml2":"file","var_json":"file","var_yaml1":"file","var_yml1":"file","var1":"env","var2":"inline"}'
        );
      }, tr);
    } finally {
      cleanVariables(Object.keys(vars));
      cleanSecrets(Object.keys(secrets));
    }
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"chars":"abcd","type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"abcd","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"json"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"keep","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"abcd","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"off"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":true,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        `options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"root":"${__dirname.replace(/\\/g, '\\\\')}","separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}`
      );
    }, tr);
  });

  it('separator', async () => {
    // arrange
    const tp = path.join(__dirname, 'L0_Run.js');
    const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

    process.env['__sources__'] = '**/*.json';
    process.env['__separator__'] = ':';

    // act
    await tr.runAsync();

    // assert
    runValidations(() => {
      tr.succeeded.should.be.true;

      tr.stdout.should.include(
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":":","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
      );
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"azpipelines"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default","prefix":"[["},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default","suffix":"]]"},"transforms":{"enabled":false,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":true,"prefix":"(","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"[","suffix":")"}}'
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
        'options: {"addBOM":false,"encoding":"auto","escape":{"type":"auto"},"missing":{"action":"none","default":"","log":"warn"},"recursive":false,"separator":".","token":{"pattern":"default"},"transforms":{"enabled":false,"prefix":"(","suffix":"]"}}'
      );
    }, tr);
  });
});
