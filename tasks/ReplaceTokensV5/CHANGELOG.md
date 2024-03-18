# Changelog
## 5.3.2
- Change telemetry provider.

## 5.3.1
- Add agent OS in telemetry ([#5](https://github.com/qetza/replacetokens-task/issues/5)).

## 5.3.0
- Add support for `indent` transformation with indent size and indent first line parameters ([326](https://github.com/qetza/vsts-replacetokens-task/issues/326)).
- Add support for `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable.

## 5.2.0
- Fix recursion cycle detection ([#308](https://github.com/qetza/vsts-replacetokens-task/issues/308)) (contributed by Chad Smith).
- Add support for YAML multiple document files in variable files and inline variables ([#287](https://github.com/qetza/vsts-replacetokens-task/issues/287)).
- Add support for JSON with comments variable files ([#299](https://github.com/qetza/vsts-replacetokens-task/issues/299)).
- Add support for Node16 execution handler.

## 5.1.0
- Add support for inline variables ([#252](https://github.com/qetza/vsts-replacetokens-task/issues/252)).
- Add support for recursive token replacement in values ([#201](https://github.com/qetza/vsts-replacetokens-task/issues/201)).
- Add optional reworked feature to simplify empty and default values (this is a **breaking change** if enabled as the old _Empty value_ is not used anymore but replaced by an empty variable declaration).

## 5.0.0
- **Breaking change**: Migrate task to Node10 execution handler needing agent `2.144.0` minimum ([#228](https://github.com/qetza/vsts-replacetokens-task/issues/228), [#230](https://github.com/qetza/vsts-replacetokens-task/issues/230)).