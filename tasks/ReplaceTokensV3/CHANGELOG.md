# Changelog
## 3.12.4
- Add explicit deprecation warning.

## 3.12.3
- Fix telemetry account hash.

## 3.12.2
- Change telemetry provider.

## 3.12.1
- Add agent OS in telemetry ([#5](https://github.com/qetza/replacetokens-task/issues/5)).

## 3.12.0
- Add support for `indent` transformation with indent size and indent first line parameters ([326](https://github.com/qetza/vsts-replacetokens-task/issues/326)).
- Add support for `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable.

## 3.11.0
- Fix recursion cycle detection ([#308](https://github.com/qetza/vsts-replacetokens-task/issues/308)) (contributed by Chad Smith).
- Add support for YAML multiple document files in variable files and inline variables ([#287](https://github.com/qetza/vsts-replacetokens-task/issues/287)).
- Add support for JSON with comments variable files ([#299](https://github.com/qetza/vsts-replacetokens-task/issues/299)).

## 3.10.1
- Fix compatibility with node 5.10.1 ([#277](https://github.com/qetza/vsts-replacetokens-task/issues/277)).

## 3.10.0
- Add support for inline variables ([#252](https://github.com/qetza/vsts-replacetokens-task/issues/252)).
- Add support for recursive token replacement in values ([#201](https://github.com/qetza/vsts-replacetokens-task/issues/201)).
- Add optional reworked feature to simplify empty and default values (this is a **breaking change** if enabled as the old _Empty value_ is not used anymore but replaced by an empty variable declaration).

## 3.9.1
- Revert migrate tasks to Node10 execution handler ([#233](https://github.com/qetza/vsts-replacetokens-task/issues/233)).

## 3.9.0
- Migrate tasks to Node10 execution handler ([#228](https://github.com/qetza/vsts-replacetokens-task/issues/228), [#230](https://github.com/qetza/vsts-replacetokens-task/issues/230)).

## 3.8.0
- Add `base64` transform ([#163](https://github.com/qetza/vsts-replacetokens-task/issues/163)).
- Add action on no file processed ([#210](https://github.com/qetza/vsts-replacetokens-task/issues/210)).

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