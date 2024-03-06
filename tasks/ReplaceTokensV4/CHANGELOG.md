# Changelog

## 4.4.0
- Add support for `indent` transformation with indent size and indent first line parameters ([326](https://github.com/qetza/vsts-replacetokens-task/issues/326)).

## 4.3.0
- Fix recursion cycle detection ([#308](https://github.com/qetza/vsts-replacetokens-task/issues/308)) (contributed by Chad Smith).
- Add support for YAML multiple document files in variable files and inline variables ([#287](https://github.com/qetza/vsts-replacetokens-task/issues/287)).
- Add support for JSON with comments variable files ([#299](https://github.com/qetza/vsts-replacetokens-task/issues/299)).

## 4.2.1
- Fix compatibility with node 5.10.1 ([#277](https://github.com/qetza/vsts-replacetokens-task/issues/277)).

## 4.2.0
- Add support for inline variables ([#252](https://github.com/qetza/vsts-replacetokens-task/issues/252)).
- Add support for recursive token replacement in values ([#201](https://github.com/qetza/vsts-replacetokens-task/issues/201)).
- Add optional reworked feature to simplify empty and default values (this is a **breaking change** if enabled as the old _Empty value_ is not used anymore but replaced by an empty variable declaration).

## 4.1.1
- Revert migrate tasks to Node10 execution handler ([#233](https://github.com/qetza/vsts-replacetokens-task/issues/233)).

## 4.1.0
- Migrate tasks to Node10 execution handler ([#228](https://github.com/qetza/vsts-replacetokens-task/issues/228), [#230](https://github.com/qetza/vsts-replacetokens-task/issues/230)).

## 4.0.1
- Promoted to release.
- Add `base64` transform ([#163](https://github.com/qetza/vsts-replacetokens-task/issues/163)).
- Add action on no file processed ([#210](https://github.com/qetza/vsts-replacetokens-task/issues/210)).

## 4.x (preview)
- **Breaking change**: Add output variables ([#160](https://github.com/qetza/vsts-replacetokens-task/issues/160)). (some older version of TFS/Azure Pipelines doesn't support output variables when used in release pipelines)
- **Breaking change**: Add dropdown parameter _Token pattern_ to select token pattern ([#131](https://github.com/qetza/vsts-replacetokens-task/issues/131)). (users with customized token pattern will need to manually select one or `custom`)
