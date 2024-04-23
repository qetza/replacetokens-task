# ReplaceTokens v6
[![mit license](https://img.shields.io/badge/license-MIT-green)](https://github.com/qetza/replacetokens-task/blob/main/LICENSE) [![donate](https://img.shields.io/badge/donate-paypal-blue)](https://www.paypal.com/donate/?hosted_button_id=CCEAVYA8DUFD8)

This Azure Pipelines task replaces tokens in text based files with variable values.

## What's new
Please refer to the [release page](https://github.com/qetza/replacetokens-task/releases/latest) for the latest release notes.

## Breaking changes in v6
The task was completely rewritten to use the npm package [@qetza/replacetokens](https://www.npmjs.com/package/@qetza/replacetokens) and be more similar with the new [ReplaceTokens GitHub Actions](https://github.com/marketplace/actions/replacetokens):
  - support only node 16 (mininum agent version 2.206.1)
  - renamed input _targetFiles_ to _sources_
  - migrated to [fast-glob](https://github.com/mrmlnc/fast-glob) for glob patterns causing syntax changes (must use forward slash (`/`) for directory separator whatever the OS)
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

## Usage
### Inputs
```yaml
- task: qetza.replacetokens.replacetokens-task.replacetokens@6
  inputs:
    # A multiline list of files to replace tokens in.
    # Each line supports:
    #   - multiple glob patterns separated by a semi-colon ';' using fast-glob syntax 
    #     (you must always use forward slash '/' as a directory separator, on win32 will 
    #     automatically replace backslash with forward slash)
    #   - outputing the result in another file adding the output path after an arrow '=>' 
    #     (if the output path is a relative path, it will be relative to the input file)
    #   - wildcard replacement in the output file name using an asterix '*' in the input 
    #     and output file names
    #
    # Example: '**/*.json; !**/local/* => out/*.json' will match all files ending with 
    # '.json' in all directories and sub directories except in `local` directory and the 
    # output will be in a sub directory `out` relative to the input file keeping the file 
    # name.
    #
    # Required.
    sources: ''

    # Add BOM when writing files.
    #
    # Optional. Default: false
    addBOM: ''

    # A YAML formatted string containing additional variable values (keys are case-insensitive).
    # Value can be:
    #   - an object: properties will be parsed as key/value pairs
    #   - a string starting with '@': value is parsed as multiple glob patterns separated 
    #     by a semi-colon ';' using fast-glob syntax to JSON or YAML files
    #   - a string starting with '$': value is parsed as an environment variable name 
    #     containing JSON encoded key/value pairs
    #   - an array: each item must be an object or a string and will be parsed as 
    #     specified previously
    #
    # Multiple entries are merge into a single list of key/value pairs.
    #
    # Example:
    # - '@**/*.json;**/*.yml;!**/local/*'
    # - '$COMPUTER_VARS'
    # - var1: '${{ parameters.var1 }}'
    #
    # will add all variables from:
    # - '.json' and '.yml' files except under 'local' directory, 
    # - the environment variable 'COMPUTER_VARS'
    # - the inline variable 'var1'
    #
    # Optional.
    additionalVariables: ''

    # Enable case-insensitive file path matching in glob patterns for sources and additionalVariables.
    #
    # Optional. Default: true
    caseInsensitivePaths: ''

    # The characters to escape when using 'custom' escape.
    #
    # Optional.
    charsToEscape: ''

    # The encoding to read and write all files.
    #
    # Accepted values:
    #   - auto: detect encoding using js-chardet
    #   - any value supported by iconv-lite
    #
    # Optional. Default: auto
    encoding: ''

    # The character escape type to apply on each value.
    #
    # Accepted values:
    #  - auto: automatically apply JSON or XML escape based on file extension
    #  - off: don't escape values
    #  - json: JSON escape
    #  - xml: XML escape
    #  - custom: apply custom escape using escape-char and chars-to-escape
    #
    # Optional. Default: auto
    escape: ''

    # The escape character to use when using 'custom' escape.
    #
    # Optional.
    escapeChar: ''

    # The behavior if no files are found.
    #
    # Accepted values:
    #   - ignore: do not output any message, the action do not fail
    #   - warn: output a warning but do not fail the action
    #   - error: fail the action with an error message
    #
    # Optional. Default: ignore
    ifNoFilesFound: ''

    # The log level.
    #
    # Accepted values:
    #   - debug
    #   - info
    #   - warn
    #   - error
    #
    # Debug messages will always be sent to the internal debug system.
    # Error messages will always fail the action.
    #
    # Optional. Default: info
    logLevel: ''

    # The behavior if variable is not found.
    #
    # Accepted values:
    #   - none: replace the token with an empty string and log a message
    #   - keep: leave the token and log a message
    #   - replace: replace with the value from missing-var-default and do not 
    #     log a message
    #
    # Optional. Default: none
    missingVarAction: ''

    # The default value to use when a key is not found.
    #
    # Optional. Default: empty string
    missingVarDefault: ''

    # The level to log key not found messages.
    #
    # Accepted values:
    #   - off
    #   - warn
    #   - error
    #
    # Optional. Default: warn
    missingVarLog: ''

    # Enable token replacements in values recusively.
    #
    # Example: '#{message}#' with variables '{"message":"hello #{name}#!","name":"world"}' 
    # will result in 'hello world!'
    #
    # Optional. Default: false
    recursive: ''

    # The root path to use when reading files with a relative path.
    #
    # Optional. Default: $(System.DefaultWorkingDirectory)
    root: ''

    # The separtor to use when flattening keys in variables.
    #
    # Example: '{ "key": { "array": ["a1", "a2"], "sub": "s1" } }' will be flatten as 
    # '{ "key.array.0": "a1", "key.array.1": "a2", "key.sub": "s1" }'
    #
    # Optional. Default: .
    separator: ''

    # Opt out of the anonymous telemetry feature.
    # You can also set the REPLACETOKENS_TELEMETRY_OPTOUT environment variable to '1' or 
    # 'true'.
    #
    # Optional. Default: false
    telemetryOptout: ''

    # The token pattern to use.
    # Use 'custom' to provide your own prefix and suffix.
    #
    # Accepted values:
    #   - default: #{ ... }#
    #   - azpipelines: $( ... )
    #   - custom: token-prefix ... token-suffix
    #   - doublebraces: {{ ... }}
    #   - doubleunderscores: __ ... __
    #   - githubactions: #{{ ... }}
    #   - octopus: #{ ... }
    #
    # Optional. Default: default
    tokenPattern: ''

    # The token prefix when using 'custom' token pattern.
    #
    # Optional.
    tokenPrefix: ''

    # The token suffix when using 'custom' token pattern.
    #
    # Optional.
    tokenSuffix: ''

    # Enable transforms on values.
    # The syntax to apply transform on a value is '#{<transform>(<name>[,<parameters>])}#'.
    #
    # Supported transforms:
    #   - base64(name): base64 encode the value
    #   - indent(name[, size, firstline]): indent lines in the value where size is the 
    #     indent size (default is '2') and firstline specifies if the first line must be 
    #     indented also (default is 'false')
    #   - lower(name): lowercase the value
    #   - raw(name): raw value (disable escaping)
    #   - upper(name): uppercase the value
    #
    # Example: 'key=#{upper(KEY1)}#' with '{ "KEY1": "value1" }' will result in 
    # 'key=VALUE1'
    #
    # Optional. Default: false
    transforms: ''

    # The tranforms prefix when using transforms.
    #
    # Optional. Default: (
    transformsPrefix: ''

    # The tranforms prefix when using transforms.
    #
    # Optional. Default: )
    transformsSuffix: ''
```

### Output
| Name | Description | Example |
| - | - | - |
| defaults | The number of tokens replaced with the default value if one was specified. | `1` |
| files | The number of source files parsed. | `2` |
| replaced | The number of values replaced by a value different than the default value. | `7` |
| tokens | The number of tokens found in all files. | `8` |
| transforms | The number of transforms applied. | `2` |

## Examples
### Multiple target files
```yaml
- task: qetza.replacetokens.replacetokens-task.replacetokens@6
  inputs:
    sources: |
      **/*.json;!**/*.dev.json;!**/vars.json => _tmp/*.json
      **/*.yml
```

### Additional variables
```yaml
- task: qetza.replacetokens.replacetokens-task.replacetokens@6
  inputs:
    sources: '**/*.json'
    additionalVariables: |
      - '@**/vars.(json|yml|yaml)'      # read from files
      - '$ENV_VARS',                    # read from env
      - var1: '${{ parameters.var1 }}'  # inline key/value pairs
        var2: '${{ parameters.var2 }}'
```

### Access outputs
```yaml
steps:
- task: qetza.replacetokens.replacetokens-task.replacetokens@6
  name: replace-tokens
  inputs:
    sources: '**/*.json'
- script: |
    echo "defaults  : $(replace-tokens.defaults }}"
    echo "files     : $(replace-tokens.files }}"
    echo "replaced  : $(replace-tokens.replaced }}"
    echo "tokens    : $(replace-tokens.tokens }}"
    echo "transforms: $(replace-tokens.transforms }}"
```

## Data/Telemetry
The Replace Tokens task for Azure Pipelines collects **anonymous** usage data and sends them by default to its author to help improve the product. If you don't wish to send usage data, you can change your telemetry settings through the _telemetryOptout_ parameter or by setting the `REPLACETOKENS_TELEMETRY_OPTOUT` environment variable to `1` or `true`.

The following **anonymous** data is send:
- the **hash** of your collection id
- the **hash** of your project id and pipeline definition id
- the hosting (`server` or `cloud`)
- the agent OS (`Windows`, `macOS` or `Linux`)
- the inputs values for
  - _addBOM_
  - _caseInsensitivePaths_
  - _charsToEscape_
  - _encoding_
  - _escape_
  - _escapeChar_
  - _ifNoFilesFound_
  - _logLevel_
  - _missingVarAction_
  - _missingVarDefault_
  - _missingVarLog_
  - _recursive_
  - _separator_
  - _tokenPattern_
  - _tokenPrefix_
  - _tokenSuffix_
  - _transforms_
  - _transformsPrefix_
  - _transformsSuffix_
- the **number of** _sources_ entries
- the **number of** _additionalVariables_ entries referencing file
- the **number of** _additionalVariables_ entries referencing environment variables
- the **number of** _additionalVariables_ inline entries
- the task result (`succeed` or `failed`)
- the task execution duration
- the outputs (defaults, files, replaced, tokens and transforms)

You can see the JSON serialized telemetry data sent in debug logs.