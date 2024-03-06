import * as path from 'path';
import * as ttm from 'azure-pipelines-task-lib/mock-test';
import * as fs from 'fs';
import * as crypto from 'crypto';

require('chai').should();

const data = path.join(__dirname, '../../tests/_data');
const tmp = path.join(__dirname, '_tmp');

describe('ReplaceTokens v3 L0 suite', function () {
  this.timeout(5000);

  function runValidation(validator: () => void, tr: ttm.MockTestRunner, done: Mocha.Done) {
    try {
      validator();
      done();
    } catch (err) {
      console.log('STDERR');
      console.log(tr.stderr);
      console.log('STDOUT');
      console.log(tr.stdout);

      done(err);
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
    source = path.join(data, source);
    fs.writeFileSync(dest, fs.readFileSync(source)); // copyFileSync not supported in node 6.x

    return path.resolve(dest);
  }

  function assertFilesEqual(actual: string, expected: string, message?: string) {
    const a = fs.readFileSync(actual, 'utf8');
    const e = fs.readFileSync(expected, 'utf8');

    a.should.equal(e, message);
  }

  before(() => {
    process.env['system_servertype'] = 'server';
    process.env['system_collectionid'] = 'col01';
    process.env['system_teamprojectid'] = 'project01';
    process.env['system_definitionid'] = 'def01';

    if (fs.existsSync(tmp)) removeFolder(tmp);

    fs.mkdirSync(tmp);
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
    delete process.env['var1'];
    delete process.env['__actiononmissing__'];
    delete process.env['__verbosity__'];
    delete process.env['__escapetype__'];
    delete process.env['__actiononnofiles__'];
    delete process.env['__defaultvalue__'];
    delete process.env['__usedefaultvalue__'];
  });

  describe('telemetry', function () {
    it('should not call telemetry when disabled by input', function (done: Mocha.Done) {
      // arrange
      let tp: string = path.join(__dirname, 'telemetry', 'L0_TelemetryDisabledByInput.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.stdout.should.not.include('sent usage telemetry:');
        },
        tr,
        done
      );
    });

    it('should not call telemetry when disabled by variable', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryDisabledByVariable.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.stdout.should.not.include('sent usage telemetry:');
        },
        tr,
        done
      );
    });

    it('should call telemetry on failure', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryOnFailure.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(false, 'task succeeded');
          tr.stdout.should.match(
            /{\\"name\\":\\"Microsoft\.ApplicationInsights\.Dev\.\*+\.Event\\",\\"time\\":\\"[^"]+\\",\\"iKey\\":\\"\*+\\",\\"tags\\":{\\"ai\.application\.ver\\":\\"3\.\d+\.\d+\\",\\"ai\.cloud\.role\\":\\"server\\",\\"ai\.internal\.sdkVersion\\":\\"replacetokens:1\.0\.0\\",\\"ai\.operation\.id\\":\\"([^"]+)\\",\\"ai\.operation\.name\\":\\"replacetokens\\",\\"ai\.operation\.parentId\\":\\"\|\1\\",\\"ai\.user\.accountId\\":\\"494d0aad9d06c4ddb51d5300620122ce55366a9382b3cc2835ed5f0e2e67b4d0\\",\\"ai\.user\.authUserId\\":\\"b98ed03d3eec376dcc015365c1a944e3ebbcc33d30e3261af3f4e4abb107aa82\\"},\\"data\\":{\\"baseType\\":\\"EventData\\",\\"baseData\\":{\\"ver\\":\\"2\\",\\"name\\":\\"token\.replaced\\",\\"properties\\":{\\"preview\\":false,\\"pipelineType\\":\\"build\\",\\"result\\":\\"failed\\"}}}}/g
          );
        },
        tr,
        done
      );
    });

    it('should call telemetry on success', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'telemetry', 'L0_TelemetryOnSuccess.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_telemetryonsuccess.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');
          tr.stdout.should.match(
            /{\\"name\\":\\"Microsoft\.ApplicationInsights\.Dev\.\*+\.Event\\",\\"time\\":\\"[^"]+\\",\\"iKey\\":\\"\*+\\",\\"tags\\":{\\"ai\.application\.ver\\":\\"3\.\d+\.\d+\\",\\"ai\.cloud\.role\\":\\"server\\",\\"ai\.internal\.sdkVersion\\":\\"replacetokens:1\.0\.0\\",\\"ai\.operation\.id\\":\\"([^"]+)\\",\\"ai\.operation\.name\\":\\"replacetokens\\",\\"ai\.operation\.parentId\\":\\"\|\1\\",\\"ai\.user\.accountId\\":\\"494d0aad9d06c4ddb51d5300620122ce55366a9382b3cc2835ed5f0e2e67b4d0\\",\\"ai\.user\.authUserId\\":\\"b98ed03d3eec376dcc015365c1a944e3ebbcc33d30e3261af3f4e4abb107aa82\\"},\\"data\\":{\\"baseType\\":\\"EventData\\",\\"baseData\\":{\\"ver\\":\\"2\\",\\"name\\":\\"token\.replaced\\",\\"properties\\":{\\"preview\\":false,\\"pipelineType\\":\\"build\\",\\"result\\":\\"succeeded\\",\\"tokenPrefix\\":\\"#{\\",\\"tokenSuffix\\":\\"}#\\",\\"pattern\\":\\"#\\\\\\\\{\\\\\\\\s\*\(\(\?:\(\?!#\\\\\\\\{\)\(\?!\\\\\\\\s\*\\\\\\\\}#\)\.\)\*\)\\\\\\\\s\*\\\\\\\\}#\\",\\"encoding\\":\\"auto\\",\\"keepToken\\":false,\\"actionOnMissing\\":\\"warn\\",\\"writeBOM\\":true,\\"verbosity\\":\\"normal\\",\\"variableFiles\\":0,\\"rules\\":1,\\"rulesWithInputWildcard\\":0,\\"rulesWithOutputPattern\\":0,\\"rulesWithNegativePattern\\":0,\\"duration\\":\d+(?:\.\d+)?,\\"tokenReplaced\\":1,\\"tokenFound\\":1,\\"fileProcessed\\":1,\\"useLegacyPattern\\":false,\\"enableTransforms\\":false,\\"transformPrefix\\":\\"\(\\",\\"transformSuffix\\":\\"\)\\",\\"transformPattern\\":\\"\\\\\\\\s\*\(\.\*\)\\\\\\\\\(\\\\\\\\s\*\(\(\?:\(\?!\\\\\\\\\(\)\(\?!\\\\\\\\s\*\\\\\\\\\)\)\.\)\*\)\\\\\\\\s\*\\\\\\\\\)\\\\\\\\s\*\\",\\"transformExecuted\\":0,\\"defaultValue\\":\\"\\",\\"defaultValueReplaced\\":0,\\"actionOnNoFiles\\":\\"continue\\",\\"inlineVariables\\":0,\\"enableRecursion\\":false,\\"useLegacyEmptyFeature\\":false,\\"useDefaultValue\\":false}}}}/g
          );
        },
        tr,
        done
      );
    });
  });

  describe('target files', function () {
    it('should replace inline when no output path', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_InlineReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_inlinereplace.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace multiple inline when no output path', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_MultipleInlineReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath1__'] = copyData('default.json', 'default_inlinereplace1.json');
      process.env['__inputpath2__'] = copyData('default.json', 'default_inlinereplace2.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath1__'],
            path.join(data, 'default.expected.json'),
            'replaced output in first file'
          );
          assertFilesEqual(
            process.env['__inputpath2__'],
            path.join(data, 'default.expected.json'),
            'replaced output in second file'
          );
        },
        tr,
        done
      );
    });

    it('should replace in other file when relative output path', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_OutputReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_relativeoutputreplace.json');
      process.env['__outputpath__'] = path.join('output', 'default_relativeoutputreplace.output.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            path.join(tmp, process.env['__outputpath__']),
            path.join(data, 'default.expected.json'),
            'replaced output'
          );
          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'input');
        },
        tr,
        done
      );
    });

    it('should replace in other file when absolute output path', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_OutputReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_absoluteoutputreplace.json');
      process.env['__outputpath__'] = path.join(tmp, 'output', 'default_absoluteoutputreplace.output.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__outputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'input');
        },
        tr,
        done
      );
    });

    it('should replace in other file when wildcard and output path', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_WildcardReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__input__'] = 'default_wildcardreplace.*.json';
      process.env['__inputpath__'] = copyData('default.json', 'default_wildcardreplace.dev.json');
      process.env['__outputpath__'] = path.join('output', 'default_wildcardreplace.*.output.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            path.join(tmp, 'output', 'default_wildcardreplace.dev.output.json'),
            path.join(data, 'default.expected.json'),
            'replaced output'
          );
          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'input');
        },
        tr,
        done
      );
    });
  });

  describe('token pattern', function () {
    it('should replace when default pattern', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_TokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_defaulttokenpattern.json');
      process.env['__tokenpattern__'] = 'default';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace when custom pattern', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_CustomTokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.custom.json', 'default_customtokenpattern.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace when legacy pattern', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_LegacyTokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacytokenpattern.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should no replace when legacy pattern', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'tokenPattern', 'L0_LegacyTokenPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_newtokenpattern.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });
  });

  describe('keep token', function () {
    it('should replace with empty when not keeping token', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'keepToken', 'L0_KeepToken.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_nokeeptoken.json');
      process.env['__keeptoken__'] = 'false';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_noreplace.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace with token when keeping token', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'keepToken', 'L0_KeepToken.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_nokeeptoken.json');
      process.env['__keeptoken__'] = 'true';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.json'), 'replaced output');
        },
        tr,
        done
      );
    });
  });

  describe('transforms', function () {
    it('should uppercase replaced value with transform', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.upper.json', 'transform_upper.json');
      process.env['var1'] = 'var1_value';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'transform.upper.expected.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should lowercase replaced value with transform', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.lower.json', 'transform_lower.json');
      process.env['var1'] = 'VAR1_VALUE';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'transform.lower.expected.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should base64 replaced value with transform', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.base64.json', 'transform_base64.json');
      process.env['var1'] = 'var1_value';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'transform.base64.expected.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should not escape replaced value with transform', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.noescape.json', 'transform_noescape.json');
      process.env['var1'] = '"var1_value"';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'transform.noescape.expected.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should transform replaced value with custom transform pattern', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformPattern.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.custom.json', 'transform_custom.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'transform.upper.expected.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should indent replaced value with transform', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'transforms', 'L0_TransformValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('transform.indent.yml', 'transform_indent.yml');
      process.env['var1'] = 'line1\nline2\nline3';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'transform.indent.expected.yml'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });
  });

  describe('action on missing', function () {
    it('should display information on missing value when continue silently', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_continuemissingvar.json');
      process.env['__actiononmissing__'] = 'continue';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.debug]  variable not found: var1');
        },
        tr,
        done
      );
    });

    it('should display warn on missing value when warning', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_warnmissingvar.json');
      process.env['__actiononmissing__'] = 'warn';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.issue type=warning;]  variable not found: var1');
        },
        tr,
        done
      );
    });

    it('should fail on missing value when fail', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'actionOnMissing', 'L0_ActionOnMissing.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_failmissingvar.json');
      process.env['__actiononmissing__'] = 'fail';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(false, 'task succeeded');

          tr.stdout.should.include('##vso[task.issue type=error;]  variable not found: var1');
        },
        tr,
        done
      );
    });
  });

  describe('logs', function () {
    it('should log minimal when normal', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Verbosity.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_normalverbosity.json');
      process.env['__verbosity__'] = 'normal';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##[group]replacing tokens in: ' + process.env['__inputpath__']);
          tr.stdout.should.not.include('\n  using encoding: ascii');
          tr.stdout.should.not.include('\n  var1: var1_value');
          tr.stdout.should.include('1 token(s) replaced out of 1');

          tr.stdout.should.include('replaced 1 tokens out of 1 in 1 file(s)');
        },
        tr,
        done
      );
    });

    it('should log all when detailed', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Verbosity.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_detailedverbosity.json');
      process.env['__verbosity__'] = 'detailed';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##[group]replacing tokens in: ' + process.env['__inputpath__']);
          tr.stdout.should.include('\n  using encoding: ascii');
          tr.stdout.should.include('\n  var1: var1_value');
          tr.stdout.should.include('1 token(s) replaced out of 1');

          tr.stdout.should.include('replaced 1 tokens out of 1 in 1 file(s)');
        },
        tr,
        done
      );
    });

    it('should not log when off', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Verbosity.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_offverbosity.json');
      process.env['__verbosity__'] = 'off';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.not.include('##[group]replacing tokens in: ' + process.env['__inputpath__']);
          tr.stdout.should.not.include('\n  using encoding: ascii');
          tr.stdout.should.not.include('\n  var1: var1_value');
          tr.stdout.should.not.include('1 token(s) replaced out of 1');

          tr.stdout.should.not.include('replaced 1 tokens out of 1 in 1 file(s)');
        },
        tr,
        done
      );
    });

    it('should log summary when replaced', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'logs', 'L0_Logs.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath1__'] = copyData('logs.json', 'default_logs1.json');
      process.env['__inputpath2__'] = copyData('logs.json', 'default_logs2.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include(
            'replaced 8 tokens out of 8 (using 2 default value(s)) and running 2 functions in 2 file(s)'
          );
        },
        tr,
        done
      );
    });
  });

  describe('escape characters', function () {
    it('should escape json when auto on .json', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_autoescape.json');
      process.env['__escapetype__'] = 'auto';
      process.env['var1'] = '"var\\1\n\r\tvalue\b\f';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_escape.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should escape xml when auto on .xml', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.xml', 'default_autoescape.xml');
      process.env['__escapetype__'] = 'auto';
      process.env['var1'] = '"var\'1&<value>';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_escape.xml'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should not escape when none', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_noneescape.json');
      process.env['__escapetype__'] = 'none';
      process.env['var1'] = '"var\\1\n\r\tvalue\b\f';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_noescape.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should escape json when json', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default_json.config', 'default_jsonescape.config');
      process.env['__escapetype__'] = 'json';
      process.env['var1'] = '"var\\1\n\r\tvalue\b\f';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_escape.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should escape xml when xml', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_EscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default_xml.config', 'default_xmlescape.config');
      process.env['__escapetype__'] = 'xml';
      process.env['var1'] = '"var\'1&<value>';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_escape.xml'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should escape custom when custom', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'escapeChars', 'L0_CustomEscapeType.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_customescape.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_customescape.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });
  });

  describe('action on no file', function () {
    it('should display information on no file when continue silently', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'actionOnNoFile', 'L0_ActionOnNoFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__actiononnofiles__'] = 'continue';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('replaced 0 tokens out of 0 in 0 file(s)');
        },
        tr,
        done
      );
    });

    it('should display warn on no file when warn', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'actionOnNoFile', 'L0_ActionOnNoFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__actiononnofiles__'] = 'warn';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.issue type=warning;]found no files to process');
        },
        tr,
        done
      );
    });

    it('should fail on no file when fail', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'actionOnNoFile', 'L0_ActionOnNoFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__actiononnofiles__'] = 'fail';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(false, 'task succeeded');

          tr.stdout.should.include('##vso[task.issue type=error;]found no files to process');
        },
        tr,
        done
      );
    });
  });

  describe('empty value', function () {
    it('should replace empty value when legacy', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'emptyValue', 'L0_LegacyEmptyValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacyempty.json');
      process.env['var1'] = '';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.not.include('##vso[task.debug]  variable not found: var1');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_empty.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace empty value when new', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'emptyValue', 'L0_EmptyValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_empty.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.not.include('##vso[task.debug]  variable not found: var1');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_empty.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should not replace empty value when new and empty token', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'emptyValue', 'L0_EmptyValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_empty.json');
      process.env['var1'] = '(empty)';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.not.include('##vso[task.debug]  variable not found: var1');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_emptytoken.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });
  });

  describe('default value', function () {
    it('should not replace when legacy and no default', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_LegacyDefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacynodefault.json');
      process.env['__defaultvalue__'] = '';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.issue type=warning;]  variable not found: var1');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_noreplace.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace with default when legacy and default', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_LegacyDefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacydefault.json');
      process.env['__defaultvalue__'] = '[default]';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.debug]  var1: [default] (default value)');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_default.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace with empty when legacy and empty default', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_LegacyDefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_legacyemptydefault.json');
      process.env['__defaultvalue__'] = '(empty)';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.debug]  var1:  (default value)');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_empty.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should not replace when no default', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_DefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_nodefault.json');
      process.env['__usedefaultvalue__'] = 'false';
      process.env['__defaultvalue__'] = '';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.issue type=warning;]  variable not found: var1');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_noreplace.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace with default when default', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_DefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_default.json');
      process.env['__usedefaultvalue__'] = 'true';
      process.env['__defaultvalue__'] = '[default]';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.debug]  var1: [default] (default value)');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_default.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace with empty when empty default', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'defaultValue', 'L0_DefaultValue.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_emptydefault.json');
      process.env['__usedefaultvalue__'] = 'true';
      process.env['__defaultvalue__'] = '';

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          tr.stdout.should.include('##vso[task.debug]  var1:  (default value)');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_empty.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });
  });

  describe('recursion', function () {
    it('should not replace recursively when recursion disabled', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'recursion', 'L0_DisabledRecursion.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_disabledrecursion.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(
            process.env['__inputpath__'],
            path.join(data, 'default.expected_disabledrecursion.json'),
            'replaced output'
          );
        },
        tr,
        done
      );
    });

    it('should replace recursively when recursion', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'recursion', 'L0_Recursion.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_recursion.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'default.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should fail when cycle recursion', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'recursion', 'L0_CycleRecursion.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('default.json', 'default_cyclerecursion.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(false, 'task succeeded');

          tr.stdout.should.include("##vso[task.issue type=error;]recursion cycle with token 'var1'.");
        },
        tr,
        done
      );
    });
  });

  describe('misc', function () {
    it('should not replace when binary file', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'targetFiles', 'L0_InlineReplace.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('binary.jpg', 'binary.jpg');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
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
        },
        tr,
        done
      );
    });
  });

  describe('external variables', function () {
    it('should replace with inline variables in single document', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_InlineVariablesSingleDocument.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'inlinevariables_singledocument.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace with inline variables in multiple documents', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_InlineVariablesMultipleDocuments.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'inlinevariables_multipledocuments.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace with variables from JSON file', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace with variables from JSON file with comments', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables_comments.jsonc');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace with variables from multiple JSON files', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_MultipleFiles.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath1__'] = path.join(data, 'externalvariables1.json');
      process.env['__variablespath2__'] = path.join(data, 'externalvariables2.json');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace with variables from YAML single document file', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables_single.yml');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });

    it('should replace with variables from YAML multiple document file', function (done: Mocha.Done) {
      // arrange
      let tp = path.join(__dirname, 'externalVariables', 'L0_SingleFile.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      process.env['__inputpath__'] = copyData('variables.json', 'variablefiles_json.json');
      process.env['__variablespath__'] = path.join(data, 'externalvariables_multiple.yml');

      // act
      tr.run();

      // assert
      runValidation(
        () => {
          tr.succeeded.should.equal(true, 'task succeeded');

          assertFilesEqual(process.env['__inputpath__'], path.join(data, 'variables.expected.json'), 'replaced output');
        },
        tr,
        done
      );
    });
  });
});
