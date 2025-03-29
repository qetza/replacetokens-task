# Changelog
## 6.2.0
- Add Node 20 support ([#74](https://github.com/qetza/replacetokens-task/issues/74)).

## 6.1.0
- Add _useAdditionalVariablesOnly_ parameter ([#29](https://github.com/qetza/replacetokens-task/issues/60)).

## 6.0.6
- Fix default case sensitivity in sources and additional variables matching ([#29](https://github.com/qetza/replacetokens-task/issues/29)).
- Fix default directories and files starting with a dot in sources and additional variables matching ([#29](https://github.com/qetza/replacetokens-task/issues/29)).

## 6.0.5
- Fix normalized variable names not supported as token name ([#15](https://github.com/qetza/replacetokens-task/issues/15)) ([#20](https://github.com/qetza/replacetokens-task/issues/20)).

## 6.0.4
- Update @qetza/replacetokens to 1.4.0.
- Change telemetry provider.

## 6.0.3
- Fix minimum agent requirement to `2.206.1` ([#13](https://github.com/qetza/replacetokens-task/issues/13)).
- Fix paths in sources incompatible with `fast-glob` syntax on win32 ([#16](https://github.com/qetza/replacetokens-task/issues/16)).
- Add agent OS in telemetry ([#5](https://github.com/qetza/replacetokens-task/issues/5)).

## 6.0.2
- Add aliases for renamed inputs to ease upgrade ([#11](https://github.com/qetza/replacetokens-task/issues/11)).

## 6.0.1
- Fix missing default variables due to case-sensitivity ([#8](https://github.com/qetza/replacetokens-task/issues/8)).

## 6.0.0
- **Breaking changes**: the task was completely rewritten to use the npm package [@qetza/replacetokens](https://www.npmjs.com/package/@qetza/replacetokens) and be more similar with the new [ReplaceTokens GitHub Actions](https://github.com/marketplace/actions/replacetokens):
  - support only node 16
  - updated to [fast-glob](https://github.com/mrmlnc/fast-glob) for glob pattern
  - renamed input _targetFiles_ to _sources_ 
  - removed support for comma-separated paths in _targetFiles_
  - renamed _encoding_ value `win1252` to `windows1252`
  - renamed _escapeType_ to _escape_
    - renamed _escapeType_ value `none` to `off`
  - merged inputs _variableFiles_ and _inlineVariables_ in _additionalVariables_
  - renamed input _variableSeparator_ to _separator_
  - renamed input _enableRecursion_ to _recursive_
  - renamed input _rootDirectory_ to _root_
  - renamed _tokenPattern_ value `rm` to `doubleunderscores`
  - renamed input _writeBOM_ to _addBOM_ 
  - changed _writeBOM_ default value to `false`
  - renamed input _verbosity_ to _logLevel_
    - renamed _verbosity_ value `detailed` to `debug`
    - renamed _verbosity_ value `normal` to `info`
    - removed _verbosity_ value `off` (see new supported values for replacement)
  - renamed input _actionOnMissing_ to _missingVarLog_
    - renamed _actionOnMissing_ value `continue` to `off`
    - renamed _actionOnMissing_ value `fail` to `error`
  - replaced _keepToken_ with _missingVarAction_ with value `keep`
  - renamed input _actionOnNoFiles_ to _ifNoFilesFound_
    - renamed _actionOnNoFiles_ value `continue` to `ignore`
    - renamed _actionOnNoFiles_ value `fail` to `error`
  - renamed input _enableTransforms_ to _transforms_
    - renamed transform `noescape` to `raw`
  - renamed input _transformPrefix_ to _transformsPrefix_
  - renamed input _transformSuffix_ to _transformsSuffix_
  - removed input _useLegacyPattern_
  - removed input _useLegacyEmptyFeature_
  - replaced input _useDefaultValue_ with _missingVarAction_ with value `replace`
  - removed input _emptyValue_
  - renamed input _defaultValue_ to _missingVarDefault_
  - removed input _enableTelemetry_ to _telemetryOptout_ and inverse meaning
  - renamed output _tokenReplacedCount_ to _replaced_
  - renamed output _tokenFoundCount_ to _tokens_
  - renamed output _fileProcessedCount_ to _files_
  - renamed output _transformExecutedCount_ to _transforms_
  - renamed output _defaultValueCount_ to _defaults_
- Add new token pattern `githubactions`.
- Add new log levels `warn` and `error`.
- Add support in _additionalVariables_ for JSON encoded environment variables.
- Add support for `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable.