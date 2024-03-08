# Changelog

## 5.0.0
Task 6.0.0
- **Breaking changes**: the task was completely rewritten to use the npm package [@qetza/replacetokens](https://www.npmjs.com/package/@qetza/replacetokens) and be more similar with the new [ReplaceTokens GitHub Actions](https://github.com/marketplace/actions/replacetokens):
  - support only node 16
  - renamed input _targetFiles_ to _sources_ 
  - removed support for comma-separated paths in _targetFiles_
  - renamed _encoding_ value `win1252` to `windows1252`
  - merged inputs _variableFiles_ and _inlineVariables_ in _additionalVariables_
  - renamed input _variableSeparator_ to _separator_
  - renamed input _enableRecursion_ to _recursive_
  - renamed input _rootDirectory_ to _root_
  - renamed _tokenPattern_ value `azpipelines` to `azurepipelines`
  - renamed _tokenPattern_ value `rm` to `doubleunderscores`
  - renamed input _writeBOM_ to _addBom_ 
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

Task 5.3.0
- Add support for `indent` transformation with indent size and indent first line parameters ([326](https://github.com/qetza/vsts-replacetokens-task/issues/326)).
- Add support for `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable.

Task 4.4.0
- Add support for `indent` transformation with indent size and indent first line parameters ([326](https://github.com/qetza/vsts-replacetokens-task/issues/326)).
- Add support for `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable.

Task 3.12.0
- Add support for `indent` transformation with indent size and indent first line parameters ([326](https://github.com/qetza/vsts-replacetokens-task/issues/326)).
- Add support for `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable.

## 4.5.0
Task 5.2.0
- Fix recursion cycle detection ([#308](https://github.com/qetza/vsts-replacetokens-task/issues/308)) (contributed by Chad Smith).
- Add support for YAML multiple document files in variable files and inline variables ([#287](https://github.com/qetza/vsts-replacetokens-task/issues/287)).
- Add support for JSON with comments variable files ([#299](https://github.com/qetza/vsts-replacetokens-task/issues/299)).
- Add support for Node16 execution handler.

Task 4.3.0
- Fix recursion cycle detection ([#308](https://github.com/qetza/vsts-replacetokens-task/issues/308)) (contributed by Chad Smith).
- Add support for YAML multiple document files in variable files and inline variables ([#287](https://github.com/qetza/vsts-replacetokens-task/issues/287)).
- Add support for JSON with comments variable files ([#299](https://github.com/qetza/vsts-replacetokens-task/issues/299)).
  
Task 3.11.0
- Fix recursion cycle detection ([#308](https://github.com/qetza/vsts-replacetokens-task/issues/308)) (contributed by Chad Smith).
- Add support for YAML multiple document files in variable files and inline variables ([#287](https://github.com/qetza/vsts-replacetokens-task/issues/287)).
- Add support for JSON with comments variable files ([#299](https://github.com/qetza/vsts-replacetokens-task/issues/299)).

## 4.4.1
Task 4.2.1
- Fix compatibility with node 5.10.1 ([#277](https://github.com/qetza/vsts-replacetokens-task/issues/277)).

Task 3.10.1
- Fix compatibility with node 5.10.1 ([#277](https://github.com/qetza/vsts-replacetokens-task/issues/277)).

## 4.4.0
Task 5.1.0
- Add support for inline variables ([#252](https://github.com/qetza/vsts-replacetokens-task/issues/252)).
- Add support for recursive token replacement in values ([#201](https://github.com/qetza/vsts-replacetokens-task/issues/201)).
- Add optional reworked feature to simplify empty and default values (this is a **breaking change** if enabled as the old _Empty value_ is not used anymore but replaced by an empty variable declaration).

Task 4.2.0
- Add support for inline variables ([#252](https://github.com/qetza/vsts-replacetokens-task/issues/252)).
- Add support for recursive token replacement in values ([#201](https://github.com/qetza/vsts-replacetokens-task/issues/201)).
- Add optional reworked feature to simplify empty and default values (this is a **breaking change** if enabled as the old _Empty value_ is not used anymore but replaced by an empty variable declaration).

Task 3.10.0
- Add support for inline variables ([#252](https://github.com/qetza/vsts-replacetokens-task/issues/252)).
- Add support for recursive token replacement in values ([#201](https://github.com/qetza/vsts-replacetokens-task/issues/201)).
- Add optional reworked feature to simplify empty and default values (this is a **breaking change** if enabled as the old _Empty value_ is not used anymore but replaced by an empty variable declaration).

## 4.3.0
Task 5.0.0
- **Breaking change**: Migrate task to Node10 execution handler needing agent `2.144.0` minimum ([#228](https://github.com/qetza/vsts-replacetokens-task/issues/228), [#230](https://github.com/qetza/vsts-replacetokens-task/issues/230)).

## 4.2.1
Task 4.1.1
- Revert migrate tasks to Node10 execution handler ([#233](https://github.com/qetza/vsts-replacetokens-task/issues/233)).

Task 3.9.1
- Revert migrate tasks to Node10 execution handler ([#233](https://github.com/qetza/vsts-replacetokens-task/issues/233)).

## 4.2.0
Task 4.1.0
- Migrate tasks to Node10 execution handler ([#228](https://github.com/qetza/vsts-replacetokens-task/issues/228), [#230](https://github.com/qetza/vsts-replacetokens-task/issues/230)).

Task 3.9.0
- Migrate tasks to Node10 execution handler ([#228](https://github.com/qetza/vsts-replacetokens-task/issues/228), [#230](https://github.com/qetza/vsts-replacetokens-task/issues/230)).

## 4.1.0
Task 4.0.1
- Promoted to release.
- Add `base64` transform ([#163](https://github.com/qetza/vsts-replacetokens-task/issues/163)).
- Add action on no file processed ([#210](https://github.com/qetza/vsts-replacetokens-task/issues/210)).

Task 3.8.0
- Add `base64` transform ([#163](https://github.com/qetza/vsts-replacetokens-task/issues/163)).
- Add action on no file processed ([#210](https://github.com/qetza/vsts-replacetokens-task/issues/210)).

## 4.0.0
- Add support for multiple task versions.

- Task 4.x (preview)
  - **Breaking change**: Add output variables ([#160](https://github.com/qetza/vsts-replacetokens-task/issues/160)). (some older version of TFS/Azure Pipelines doesn't support output variables when used in release pipelines)
  - **Breaking change**: Add dropdown parameter _Token pattern_ to select token pattern ([#131](https://github.com/qetza/vsts-replacetokens-task/issues/131)). (users with customized token pattern will need to manually select one or `custom`)

## 3.7.1
- Fix issue on binary files ([#193](https://github.com/qetza/vsts-replacetokens-task/issues/193)).
- Rollback output variables ([#196](https://github.com/qetza/vsts-replacetokens-task/issues/196)).

## 3.7.0
- Add output variables _tokenReplacedCount_, _tokenFoundCount_ and _fileProcessedCount_ ([#160](https://github.com/qetza/vsts-replacetokens-task/issues/160)).
- Add support for variable transformations with _Enable tranformations_ ([#96](https://github.com/qetza/vsts-replacetokens-task/issues/96)).
- Add default value for tokens not found with _Default value_ (contribution from [ClemensSutor](https://github.com/ClemensSutor)).
- Group log outputs in Azure Pipelines output.
- Add support for variables in external YAML files with `.yml` or `.yaml` extension ([#177](https://github.com/qetza/vsts-replacetokens-task/issues/177)).

## 3.6.0
- Add parameter _Use legacy pattern_ with default value to `false`. 

## 3.5.2
- Fix issue when token prefix present but not as a token prefix ([#149](https://github.com/qetza/vsts-replacetokens-task/issues/149)).

## 3.5.1
- Fix issue when variable `System.ServerType` is not defined ([#147](https://github.com/qetza/vsts-replacetokens-task/issues/147)).

## 3.5.0
- Add anonymous usage telemetry.
- Ignore spaces between token prefix/suffix and variable name ([#143](https://github.com/qetza/vsts-replacetokens-task/issues/143)).

## 3.4.1
- Fix JSON escaping of slash `/` ([#138](https://github.com/qetza/vsts-replacetokens-task/issues/138))

## 3.4.0
- Add summary in logs with number of tokens found and replaced ([#126](https://github.com/qetza/vsts-replacetokens-task/issues/126)).
- Add support for variables in external JSON files ([#113](https://github.com/qetza/vsts-replacetokens-task/issues/113)).

## 3.3.1
- **Breaking change**: If you were using negative pattern you need to use the semi colon `;` as a separator instead of new-line in _Target files_.
- Fix negative pattern support ([#127](https://github.com/qetza/vsts-replacetokens-task/issues/127)).

## 3.3.0
- Add support for custom output file and wildcard support ([#114](https://github.com/qetza/vsts-replacetokens-task/issues/114)).

## 3.2.2
- Fix matching issue with directory ([#122](https://github.com/qetza/vsts-replacetokens-task/issues/122)).

## 3.2.1
- Fix log issue with escaped secret values.

## 3.2.0
- Switch to [jschardet](https://github.com/aadsm/jschardet) for encoding detection when selecting `auto` in _File encoding_ ([#99](https://github.com/qetza/vsts-replacetokens-task/issues/99)).
- Switch to [azure-pipelines-task-lib](https://github.com/Microsoft/azure-pipelines-task-lib) v2.8.0.
- Add `auto` to _Escape type_ and set it as default value.
- Move _Escape type_, _Escape character_ and _Characters to escape_ to the main paramters section for easier discoverability.

## 3.1.0
- Add _Verbosity_ parameter to allow detail logs without using `system.debug`.

## 3.0.0
- **Breaking change**: If you were using the character escaping feature you need to select `custom` in _Escape values type_ parameter.
- Add support to escape JSON in variable values (contributed by Justin Gould)
- Add support to escape XML in variable values (contributed by Justin Gould)
- Add `Windows 1252` and `ISO 8859-1` encoding to _File encoding_ ([#67](https://github.com/qetza/vsts-replacetokens-task/issues/67))

## 2.3.0
- Add support to escape characters in variable values ([#52](https://github.com/qetza/vsts-replacetokens-task/issues/52))

## 2.2.1
- Fix issue with backslash in default target files value on mac ([#50](https://github.com/qetza/vsts-replacetokens-task/issues/50))

## 2.2.0
- Fix issue on file not found when using network paths ([#40](https://github.com/qetza/vsts-replacetokens-task/issues/40), [#41](https://github.com/qetza/vsts-replacetokens-task/issues/41)).

## 2.1.0
- Add support for comma-separator in _Target files_ ([#35](https://github.com/qetza/vsts-replacetokens-task/issues/35)).
- Add _Empty value_ parameter to allow token replacement with an empty string ([#32](https://github.com/qetza/vsts-replacetokens-task/issues/32)).

## 2.0.2
- Fix invalid file permissions after saving files.

## 2.0.0
- **Breaking change**: Migrated code to typescript to support cross-platform agent. This change requires the use of an agent at least in version 2.105.0 which is **not compatible with TFS 2015**. If you need to install the task on TFS 2015, download the vsix from the repository: [https://github.com/qetza/vsts-replacetokens-task/releases/download/v1.4.1/qetza.replacetokens-1.4.1.vsix](https://github.com/qetza/vsts-replacetokens-task/releases/download/v1.4.1/qetza.replacetokens-1.4.1.vsix)
- **Breaking change**: _File encoding_ parameter is now used when reading and writing files. Previously it was only used when writing.
- **Breaking change**: _File encoding_ doesn't support 'utf-32' and 'utf-32 (big endian)' anymore.
- **Breaking change**: _Target files_ parameter now only uses the new line as a separator for multi-values (previously it used new-line and semi-colon).
- Removed required _Root directory_, an empty value is equivalent to $(System.DefaultWorkingDirectory).

## 1.4.1
- Fix missing method issue with new xplat agent (2.104.1)

## 1.4.0
- Add variables expansion in variable values.
- Escape token prefix and suffix in regex pattern.

## 1.3.1
- Fix wrong encoding constructors parameters.

## 1.3.0
- Replaced parameter _Fail on missing_ with _Action_ in _Missing variables_ group.
- Add _Keep token_ parameter in 'Missing variables' group.
- Fix issue on empty file.

## 1.2.0
- Add _Root directory_ task parameter to configure file search root directory (contributed by Jesse Houwing).
- Update _Target files_ task parameter to support newline-separator (contributed by Jesse Houwing).