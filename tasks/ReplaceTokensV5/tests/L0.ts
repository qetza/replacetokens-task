import * as path from 'path';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as fs from 'fs';
import * as crypto from 'crypto';

require('chai').should();

const data = path.join(__dirname, '../../tests/_data');
const tmp = path.join(__dirname, '_tmp');

describe('ReplaceTokens v5 L0 suite', function () {
  this.timeout(10000);

  function runValidation(validator: () => void, tr: ttm.MockTestRunner) {
    try {
      validator();
    } catch (err) {
      console.log('STDERR', tr.stderr);
      console.log('STDOUT', tr.stdout);

      throw err;
    }
  }

  function removeFolder(p: string) {
    if (fs.existsSync(p)) {
      fs.readdirSync(p).forEach((file, index) => {
        const newPath = path.join(p, file);
        if (fs.lstatSync(newPath).isDirectory()) removeFolder(newPath);
        else fs.unlinkSync(newPath);
      });
      fs.rmdirSync(p);
    }
  }

  function copyData(source: string, dest: string): string {
    dest = path.join(tmp, dest);
    fs.copyFileSync(path.join(data, source), dest);

    return path.resolve(dest);
  }

  function assertFilesEqual(actual: string, expected: string, message?: string) {
    const a = fs.readFileSync(actual, 'utf8');
    const e = fs.readFileSync(expected, 'utf8');

    a.should.equal(e, message);
  }

  before(() => {
    process.env['SYSTEM_SERVERTYPE'] = 'server';
    process.env['SYSTEM_COLLECTIONID'] = 'col01';
    process.env['SYSTEM_TEAMPROJECTID'] = 'project01';
    process.env['SYSTEM_DEFINITIONID'] = 'def01';
    process.env['AGENT_OS'] = 'Windows_NT';

    if (fs.existsSync(tmp)) removeFolder(tmp);

    fs.mkdirSync(tmp);
  });

  after(() => {
    delete process.env['SYSTEM_SERVERTYPE'];
    delete process.env['SYSTEM_COLLECTIONID'];
    delete process.env['SYSTEM_TEAMPROJECTID'];
    delete process.env['SYSTEM_DEFINITIONID'];
    delete process.env['AGENT_OS'];
  });

  afterEach(() => {
    // clean env
    delete process.env['__inputpath__'];
    delete process.env['__inputpath1__'];
    delete process.env['__inputpath2__'];
    delete process.env['__outputpath__'];
    delete process.env['__input__'];
    delete process.env['__tokenpattern__'];
    delete process.env['__keeptoken__'];
    delete process.env['VAR1'];
    delete process.env['__actiononmissing__'];
    delete process.env['__verbosity__'];
    delete process.env['__escapetype__'];
    delete process.env['__actiononnofiles__'];
    delete process.env['__defaultvalue__'];
    delete process.env['__usedefaultvalue__'];
    delete process.env['REPLACETOKENS_DISABLE_TELEMETRY'];
    delete process.env['REPLACETOKENS_TELEMETRY_OPTOUT'];
  });

  describe('telemetry', function () {
    it('should not call telemetry when disabled by input', async () => {
      // arrange
      let tp: string = path.join(__dirname, 'telemetry', 'L0_TelemetryDisabledByInput.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.stdout.should.not.include('sent usage telemetry:');
      }, tr);
    });

    it('should not call telemetry when disabled by REPLACETOKENS_DISABLE_TELEMETRY', async () => {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryDisabledByVariable.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['REPLACETOKENS_DISABLE_TELEMETRY'] = 'true';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.stdout.should.not.include('telemetry sent');
        tr.stdout.should.not.include('sent usage telemetry:');
      }, tr);
    });

    it('should not call telemetry when disabled by REPLACETOKENS_TELEMETRY_OPTOUT', async () => {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryDisabledByVariable.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['REPLACETOKENS_TELEMETRY_OPTOUT'] = 'true';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.stdout.should.not.include('telemetry sent');
        tr.stdout.should.not.include('sent usage telemetry:');
      }, tr);
    });

    it('should call telemetry on failure', async () => {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryOnFailure.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(false, 'task succeeded');

        tr.stdout.should.include('telemetry sent');
        tr.stdout.should.match(
          /\[\{"account":"494d0aad9d06c4ddb51d5300620122ce55366a9382b3cc2835ed5f0e2e67b4d0","pipeline":"b98ed03d3eec376dcc015365c1a944e3ebbcc33d30e3261af3f4e4abb107aa82","host":"server","os":"Windows","result":"failed","eventType":"TokensReplaced","application":"replacetokens-task","version":"5.0.0"}]/
        );
      }, tr);
    });

    it('should call telemetry on success', async () => {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryOnSuccess.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_telemetryonsuccess.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('telemetry sent');
        tr.stdout.should.match(
          /\[\{"account":"494d0aad9d06c4ddb51d5300620122ce55366a9382b3cc2835ed5f0e2e67b4d0","pipeline":"b98ed03d3eec376dcc015365c1a944e3ebbcc33d30e3261af3f4e4abb107aa82","host":"server","os":"Windows","actionOnMissing":"warn","encoding":"auto","keepToken":false,"pattern":"#\\\\{\\\\s\*\(\(\?:\(\?!#\\\\{\)\(\?!\\\\s\*\\\\}#\)\.\)\*\)\\\\s\*\\\\}#","result":"success","rules":1,"rulesWithInputWildcard":0,"rulesWithNegativePattern":0,"rulesWithOutputPattern":0,"tokenPrefix":"#{","tokenSuffix":"}#","variableFiles":0,"verbosity":"normal","writeBOM":true,"useLegacyPattern":false,"enableTransforms":false,"transformPrefix":"\(","transformSuffix":"\)","transformPattern":"\\\\s\*\(\.\*\)\\\\\(\\\\s\*\(\(\?:\(\?!\\\\\(\)\(\?!\\\\s\*\\\\\)\)\.\)\*\)\\\\s\*\\\\\)\\\\s\*","defaultValue":"","tokenPattern":"default","actionOnNoFiles":"continue","inlineVariables":0,"enableRecursion":false,"useLegacyEmptyFeature":false,"useDefaultValue":false,"useAdditionalVariablesOnly":false,"duration":\d+(?:\.\d+)?,"tokenReplaced":1,"tokenFound":1,"defaultValueReplaced":0,"fileProcessed":1,"transformExecuted":0,"eventType":"TokensReplaced","application":"replacetokens-task","version":"5.0.0"}]/
        );
      }, tr);
    });
  });

  describe('target files', function () {
    it('should replace inline when no output path', async () => {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_InlineReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_inlinereplace.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace multiple inline when no output path', async () => {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_MultipleInlineReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath1__'] = copyData('default.json', 'default_inlinereplace1.json');
      process.env['__inputpath2__'] = copyData('default.json', 'default_inlinereplace2.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath1__'], path.join(data, 'default.expected.json'), 'replaced output in first file');
        assertFilesEqual(process.env['__inputpath2__'], path.join(data, 'default.expected.json'), 'replaced output in second file');
      }, tr);
    });

    it('should replace in other file when relative output path', async () => {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_OutputReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_relativeoutputreplace.json');
      process.env['__outputpath__'] = path.join('output', 'default_relativeoutputreplace.output.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(path.join(tmp, process.env['__outputpath__']), path.join(data, 'default.expected.json'), 'replaced output');
        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'input');
      }, tr);
    });

    it('should replace in other file when absolute output path', async () => {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_OutputReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_absoluteoutputreplace.json');
      process.env['__outputpath__'] = path.join(tmp, 'output', 'default_absoluteoutputreplace.output.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__outputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'input');
      }, tr);
    });

    it('should replace in other file when wildcard and output path', async () => {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_WildcardReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__input__'] = 'default_wildcardreplace.*.json';
      process.env['__inputpath__'] = copyData('default.json', 'default_wildcardreplace.dev.json');
      process.env['__outputpath__'] = path.join('output', 'default_wildcardreplace.*.output.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(path.join(tmp, 'output', 'default_wildcardreplace.dev.output.json'), path.join(data, 'default.expected.json'), 'replaced output');
        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'input');
      }, tr);
    });
  });

  describe('token pattern', function () {
    it('should replace when default pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_TokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_defaulttokenpattern.json');
      process.env['__tokenpattern__'] = 'default';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace when rm pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_TokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.rm.json', 'default_rmtokenpattern.json');
      process.env['__tokenpattern__'] = 'rm';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace when octopus pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_TokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.octopus.json', 'default_octopustokenpattern.json');
      process.env['__tokenpattern__'] = 'octopus';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace when azpipelines pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_TokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.azpipelines.json', 'default_azpipelinestokenpattern.json');
      process.env['__tokenpattern__'] = 'azpipelines';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace when doublebraces pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_TokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.doublebraces.json', 'default_doublebracestokenpattern.json');
      process.env['__tokenpattern__'] = 'doublebraces';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace when custom pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_CustomTokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.custom.json', 'default_customtokenpattern.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace when legacy pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_LegacyTokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacytokenpattern.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should no replace when legacy pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_LegacyTokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_newtokenpattern.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });
  });

  describe('keep token', function () {
    it('should replace with empty when not keeping token', async () => {
      // arrange
      let tp = path.join(__dirname, 'keepToken', 'L0_KeepToken.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_nokeeptoken.json');
      process.env['__keeptoken__'] = 'false';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_noreplace.json'), 'replaced output');
      }, tr);
    });

    it('should replace with token when keeping token', async () => {
      // arrange
      let tp = path.join(__dirname, 'keepToken', 'L0_KeepToken.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_nokeeptoken.json');
      process.env['__keeptoken__'] = 'true';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'replaced output');
      }, tr);
    });
  });

  describe('transforms', function () {
    it('should uppercase replaced value with transform', async () => {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.upper.json', 'transform_upper.json');
      process.env['VAR1'] = 'var1_value';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'transform.upper.expected.json'), 'replaced output');
      }, tr);
    });

    it('should lowercase replaced value with transform', async () => {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.lower.json', 'transform_lower.json');
      process.env['VAR1'] = 'VAR1_VALUE';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'transform.lower.expected.json'), 'replaced output');
      }, tr);
    });

    it('should base64 replaced value with transform', async () => {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.base64.json', 'transform_base64.json');
      process.env['VAR1'] = 'var1_value';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'transform.base64.expected.json'), 'replaced output');
      }, tr);
    });

    it('should not escape replaced value with transform', async () => {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.noescape.json', 'transform_noescape.json');
      process.env['VAR1'] = '"var1_value"';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'transform.noescape.expected.json'), 'replaced output');
      }, tr);
    });

    it('should transform replaced value with custom transform pattern', async () => {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.custom.json', 'transform_custom.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'transform.upper.expected.json'), 'replaced output');
      }, tr);
    });

    it('should indent replaced value with transform', async () => {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.indent.yml', 'transform_indent.yml');
      process.env['VAR1'] = 'line1\nline2\nline3';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'transform.indent.expected.yml'), 'replaced output');
      }, tr);
    });
  });

  describe('action on missing', function () {
    it('should display information on missing value when continue silently', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_continuemissingvar.json');
      process.env['__actiononmissing__'] = 'continue';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.debug]  variable not found: var1');
      }, tr);
    });

    it('should display info on missing value when informational', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_infomissingvar.json');
      process.env['__actiononmissing__'] = 'info';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('  variable not found: var1');
      }, tr);
    });

    it('should display warn on missing value when warning', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_warnmissingvar.json');
      process.env['__actiononmissing__'] = 'warn';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]  variable not found: var1');
      }, tr);
    });

    it('should fail on missing value when fail', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_failmissingvar.json');
      process.env['__actiononmissing__'] = 'fail';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(false, 'task succeeded');

        tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]  variable not found: var1');
      }, tr);
    });
  });

  describe('logs', function () {
    it('should log minimal when normal', async () => {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Verbosity.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_normalverbosity.json');
      process.env['__verbosity__'] = 'normal';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##[group]replacing tokens in: ' + process.env['__inputpath__']);
        tr.stdout.should.not.include('\n  using encoding: ascii');
        tr.stdout.should.not.include('\n  var1: var1_value');
        tr.stdout.should.include('1 token(s) replaced out of 1');

        tr.stdout.should.include('replaced 1 tokens out of 1 in 1 file(s)');
      }, tr);
    });

    it('should log all when detailed', async () => {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Verbosity.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_detailedverbosity.json');
      process.env['__verbosity__'] = 'detailed';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##[group]replacing tokens in: ' + process.env['__inputpath__']);
        tr.stdout.should.include('\n  using encoding: ascii');
        tr.stdout.should.include('\n  var1: var1_value');
        tr.stdout.should.include('1 token(s) replaced out of 1');

        tr.stdout.should.include('replaced 1 tokens out of 1 in 1 file(s)');
      }, tr);
    });

    it('should not log when off', async () => {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Verbosity.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_offverbosity.json');
      process.env['__verbosity__'] = 'off';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.not.include('##[group]replacing tokens in: ' + process.env['__inputpath__']);
        tr.stdout.should.not.include('\n  using encoding: ascii');
        tr.stdout.should.not.include('\n  var1: var1_value');
        tr.stdout.should.not.include('1 token(s) replaced out of 1');

        tr.stdout.should.not.include('replaced 1 tokens out of 1 in 1 file(s)');
      }, tr);
    });

    it('should log summary when replaced', async () => {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Logs.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath1__'] = copyData('logs.json', 'default_logs1.json');
      process.env['__inputpath2__'] = copyData('logs.json', 'default_logs2.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('replaced 8 tokens out of 8 (using 2 default value(s)) and running 2 functions in 2 file(s)');

        tr.stdout.should.include('##vso[task.setvariable variable=tokenReplacedCount;isOutput=false;issecret=false;]8');
        tr.stdout.should.include('##vso[task.setvariable variable=tokenFoundCount;isOutput=false;issecret=false;]8');
        tr.stdout.should.include('##vso[task.setvariable variable=fileProcessedCount;isOutput=false;issecret=false;]2');
        tr.stdout.should.include('##vso[task.setvariable variable=transformExecutedCount;isOutput=false;issecret=false;]2');
        tr.stdout.should.include('##vso[task.setvariable variable=defaultValueCount;isOutput=false;issecret=false;]2');
      }, tr);
    });
  });

  describe('escape characters', function () {
    it('should escape json when auto on .json', async () => {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_autoescape.json');
      process.env['__escapetype__'] = 'auto';
      process.env['VAR1'] = '"var\\1\n\r\tvalue\b\f';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_escape.json'), 'replaced output');
      }, tr);
    });

    it('should escape xml when auto on .xml', async () => {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.xml', 'default_autoescape.xml');
      process.env['__escapetype__'] = 'auto';
      process.env['VAR1'] = '"var\'1&<value>';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_escape.xml'), 'replaced output');
      }, tr);
    });

    it('should not escape when none', async () => {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_noneescape.json');
      process.env['__escapetype__'] = 'none';
      process.env['VAR1'] = '"var\\1\n\r\tvalue\b\f';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_noescape.json'), 'replaced output');
      }, tr);
    });

    it('should escape json when json', async () => {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default_json.config', 'default_jsonescape.config');
      process.env['__escapetype__'] = 'json';
      process.env['VAR1'] = '"var\\1\n\r\tvalue\b\f';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_escape.json'), 'replaced output');
      }, tr);
    });

    it('should escape xml when xml', async () => {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default_xml.config', 'default_xmlescape.config');
      process.env['__escapetype__'] = 'xml';
      process.env['VAR1'] = '"var\'1&<value>';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_escape.xml'), 'replaced output');
      }, tr);
    });

    it('should escape custom when custom', async () => {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_CustomEscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_customescape.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_customescape.json'), 'replaced output');
      }, tr);
    });
  });

  describe('action on no file', function () {
    it('should display information on no file when continue silently', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnNoFile', 'L0_ActionOnNoFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__actiononnofiles__'] = 'continue';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('replaced 0 tokens out of 0 in 0 file(s)');
      }, tr);
    });

    it('should display warn on no file when warn', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnNoFile', 'L0_ActionOnNoFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__actiononnofiles__'] = 'warn';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]found no files to process');
      }, tr);
    });

    it('should fail on no file when fail', async () => {
      // arrange
      let tp = path.join(__dirname, 'actionOnNoFile', 'L0_ActionOnNoFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__actiononnofiles__'] = 'fail';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(false, 'task succeeded');

        tr.stdout.should.include('##vso[task.issue type=error;source=TaskInternal;]found no files to process');
      }, tr);
    });
  });

  describe('empty value', function () {
    it('should replace empty value when legacy', async () => {
      // arrange
      let tp = path.join(__dirname, 'emptyValue', 'L0_LegacyEmptyValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacyempty.json');
      process.env['VAR1'] = '';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.not.include('##vso[task.debug]  variable not found: var1');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_empty.json'), 'replaced output');
      }, tr);
    });

    it('should replace empty value when new', async () => {
      // arrange
      let tp = path.join(__dirname, 'emptyValue', 'L0_EmptyValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_empty.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.not.include('##vso[task.debug]  variable not found: var1');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_empty.json'), 'replaced output');
      }, tr);
    });

    it('should not replace empty value when new and empty token', async () => {
      // arrange
      let tp = path.join(__dirname, 'emptyValue', 'L0_EmptyValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_empty.json');
      process.env['VAR1'] = '(empty)';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.not.include('##vso[task.debug]  variable not found: var1');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_emptytoken.json'), 'replaced output');
      }, tr);
    });
  });

  describe('default value', function () {
    it('should not replace when legacy and no default', async () => {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_LegacyDefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacynodefault.json');
      process.env['__defaultvalue__'] = '';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]  variable not found: var1');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_noreplace.json'), 'replaced output');
      }, tr);
    });

    it('should replace with default when legacy and default', async () => {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_LegacyDefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacydefault.json');
      process.env['__defaultvalue__'] = '[default]';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.debug]  var1: [default] (default value)');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_default.json'), 'replaced output');
      }, tr);
    });

    it('should replace with empty when legacy and empty default', async () => {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_LegacyDefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacyemptydefault.json');
      process.env['__defaultvalue__'] = '(empty)';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.debug]  var1:  (default value)');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_empty.json'), 'replaced output');
      }, tr);
    });

    it('should not replace when no default', async () => {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_DefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_nodefault.json');
      process.env['__usedefaultvalue__'] = 'false';
      process.env['__defaultvalue__'] = '';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.issue type=warning;source=TaskInternal;]  variable not found: var1');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_noreplace.json'), 'replaced output');
      }, tr);
    });

    it('should replace with default when default', async () => {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_DefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_default.json');
      process.env['__usedefaultvalue__'] = 'true';
      process.env['__defaultvalue__'] = '[default]';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.debug]  var1: [default] (default value)');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_default.json'), 'replaced output');
      }, tr);
    });

    it('should replace with empty when empty default', async () => {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_DefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_emptydefault.json');
      process.env['__usedefaultvalue__'] = 'true';
      process.env['__defaultvalue__'] = '';

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        tr.stdout.should.include('##vso[task.debug]  var1:  (default value)');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_empty.json'), 'replaced output');
      }, tr);
    });
  });

  describe('recursion', function () {
    it('should not replace recursively when recursion disabled', async () => {
      // arrange
      let tp = path.join(__dirname, 'recursion', 'L0_DisabledRecursion.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_disabledrecursion.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected_disabledrecursion.json'), 'replaced output');
      }, tr);
    });

    it('should replace recursively when recursion', async () => {
      // arrange
      let tp = path.join(__dirname, 'recursion', 'L0_Recursion.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_recursion.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
      }, tr);
    });

    it('should fail when cycle recursion', async () => {
      // arrange
      let tp = path.join(__dirname, 'recursion', 'L0_CycleRecursion.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_cyclerecursion.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(false, 'task succeeded');

        tr.stdout.should.include("##vso[task.issue type=error;source=TaskInternal;]recursion cycle with token 'var1'.");
        tr.stdout.should.include("##vso[task.complete result=Failed;]recursion cycle with token 'var1'.");
      }, tr);
    });
  });

  describe('misc', function () {
    it('should not replace when binary file', async () => {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_InlineReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('binary.jpg', 'binary.jpg');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        let buffer: Buffer = fs.readFileSync(process.env['__inputpath__']);
        let hash = crypto.createHash('sha256');
        hash.update(buffer);
        let actual: string = hash.digest('hex');

        buffer = fs.readFileSync(path.join(data, 'binary.jpg'));
        hash = crypto.createHash('sha256');
        hash.update(buffer);
        let expected: string = hash.digest('hex');

        actual.should.equal(expected, 'replaced output');
      }, tr);
    });
  });

  describe('external variables', function () {
    it('should replace with inline variables in single document', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_InlineVariablesSingleDocument.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'inlinevariables_singledocument.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace with inline variables in multiple documents', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_InlineVariablesMultipleDocuments.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'inlinevariables_multipledocuments.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace with variables from JSON file', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace with variables from JSON file with comments', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables_comments.jsonc');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace with variables from multiple JSON files', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_MultipleFiles.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath1__'] = path.join(data, 'externalvariables1.json');
      process.env['__variablespath2__'] = path.join(data, 'externalvariables2.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace with variables from YAML single document file', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables_single.yml');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace with variables from YAML multiple document file', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables_multiple.yml');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
      }, tr);
    });

    it('should replace only with file or inline variables when specified', async () => {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_UseAdditionalVariablesOnly.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'useonlyexternalvariables.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables1.json');

      // act
      await tr.runAsync();

      // assert
      runValidation(() => {
        tr.succeeded.should.equal(true, 'task succeeded');

        assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.useadditionalvariablesonly.expected.json'), 'replaced output');
      }, tr);
    });
  });
});
