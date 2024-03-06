# ReplaceTokens v4
[![mit license](https://img.shields.io/badge/license-MIT-green)](https://github.com/qetza/replacetokens-action/blob/main/LICENSE) [![donate](https://img.shields.io/badge/donate-paypal-blue)](https://www.paypal.com/donate/?hosted_button_id=CCEAVYA8DUFD8)

This Azure Pipelines task replaces tokens in text files with variable values.

## What's new
Please refer to the [release page](https://github.com/qetza/replacetokens-task/releases) for the latest release notes.

## Usage
### Inputs
```yaml
- task: qetza.replacetokens.replacetokens-task.replacetokens@4
  inputs:
    # The root path to use when reading files with a relative path.
    #
    # Optional. Default: $(System.DefaultWorkingDirectory)
    rootDirectory: ''

    # A multiline or comma-separated list of files to replace tokens in.
    # Each entry supports:
    #   - multiple glob patterns separated by a semi-colon ';' using fast-glob syntax 
    #     (you must always use forward slash '/' as a directory separator)
    #   - outputing the result in another file adding the output path after an arrow '=>' 
    #     (if the output path is a relative path, it will be relative to the input file)
    #   - wildcard replacement in the output file name using an asterix '*' in the input and 
    #     output file names
    #
    # Example: '**/*.json; !local/ => out/*.json' will match all files ending with '.json' in 
    # all directories and sub directories except in `local` directory and the output will be in a 
    # sub directory `out` relative to the input file keeping the file name.
    #
    # Required. Default: **/*.config
    targetFiles: ''

    # Encoding to read and write all files.
    #
    # Accepted values:
    #   - auto: detect encoding using js-chardet
    #   - ascii
    #   - utf-7
    #   - utf-8
    #   - utf-16le
    #   - utf-16be
    #   - win1252
    #   - iso88591
    #
    # Required. Default: auto
    encoding: ''

    # Add BOM when writing files.
    #
    # Required. Default: true
    writeBOM: ''

    # Character escape type to apply on each value.
    #
    # Accepted values:
    #  - auto: automatically apply JSON or XML escape based on file extension
    #  - custom: apply custom escape using escape-char and chars-to-escape
    #  - json: JSON escape
    #  - none: don't escape values
    #  - xml: XML escape
    #
    # Optional. Default: auto
    escapeType: ''

    # The escape character to use when using 'custom' escape.
    #
    # Optional.
    escapeChar: ''

    # The characters to escape when using 'custom' escape.
    #
    # Optional.
    charsToEscape: ''

    # The log level.
    #
    # Accepted values:
    #   - normal
    #   - detailed
    #   - off
    #
    # Debug messages will always be sent to the internal debug system.
    # Error messages will always fail the task.
    #
    # Optional. Default: normal
    verbosity: ''

    # The behavior if variable is not found.
    #
    # Accepted values:
    #   - continue: output a debug message
    #   - warn: output a warning
    #   - fail: fail the task with an error message
    #
    # Optional. Default: warn
    actionOnMissing: ''

    # Keep the token if no variable is found.
    #
    # Required. Default: false
    keepToken: ''

    # The behavior if no files are found.
    #
    # Accepted values:
    #   - continue: do not output any message, the action do not fail
    #   - warn: output a warning but do not fail the action
    #   - error: fail the action with an error message
    #
    # Required. Default: continue
    actionOnNoFiles: ''

    # The token pattern to use.
    #
    # Accepted values:
    #   - azpipelines: $( ... )
    #   - custom: token-prefix ... token-suffix
    #   - default: #{ ... }#
    #   - doublebraces: {{ ... }}
    #   - octopus: #{ ... }
    #   - rm: __ ... __
    #
    # Required. Default: default
    tokenPattern: ''

    # The token prefix when using 'custom' token pattern.
    #
    # Required. Default: #{
    tokenPrefix: ''

    # The token suffix when using 'custom' token pattern.
    #
    # Required. Default: }#
    tokenSuffix: ''

    # Enable legacy pattern which doesn't ignore whitespaces.
    #
    # Required. Default: false
    useLegacyPattern: ''

    # Enable legacy empty feature which uses emptyValue to check for empty string variables.
    #
    # Optional. Default: true
    useLegacyEmptyFeature: ''

    # The value use to compare variables to replace with an empty string.
    #
    # Optional. Default: (empty)
    emptyValue: ''

    # Enable replacing not found variables with a default value.
    #
    # Required. Default: false
    useDefaultValue: ''

    # The default value to use when a variable is not found.
    #
    # Optional. Default: empty string
    defaultValue: ''

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
    # Example: 'key=#{upper(KEY1)}#' with '{ "KEY1": "value1" }' will result in 'key=VALUE1'
    #
    # Required. Default: false
    enableTransforms: ''

    # The tranforms prefix when using transforms.
    #
    # Required. Default: (
    transformPrefix: ''

    # The tranforms prefix when using transforms.
    #
    # Required. Default: )
    transformSuffix: ''

    # A multiline list of paths to JSON or YAML files containing additional variables.
    # Supports wildcards.
    #
    # Optional.
    variableFiles: ''

    # Additional inline variables as YAML.
    #
    # Optional.
    inlineVariables: ''

    # The separtor to use when flattening keys in additional variables.
    #
    # Example: '{ "key": { "array": ["a1", "a2"], "sub": "s1" } }' will be flatten as 
    # '{ "key.array.0": "a1", "key.array.1": "a2", "key.sub": "s1" }'
    #
    # Optional. Default: .
    variableSeparator: ''

    # Enable token replacements in values recusively.
    #
    # Example: '#{message}#' with variables '{ "message": "hello #{name}#!", "name": "world" }' 
    # will result in 'hello world!'
    #
    # Required. Default: false
    enableRecursion: ''

    # Enable seding anonymous usage data for analytics.
    #
    # Required. Default: true
    enableTelemetry: ''
```

### Output
| Name | Description | Example |
| - | - | - |
| defaultValueCount | The number of tokens replaced with the default value if one was specified. | `1` |
| fileProcessedCount | The number of source files parsed. | `2` |
| tokenFoundCount | The number of tokens found in all files. | `8` |
| tokenReplacedCount | The number of values replaced by a value different than the default value. | `7` |
| transformExecutedCount | The number of transforms applied. | `2` |

## Examples
### Multiple target files
```yaml
- task: qetza.replacetokens.replacetokens-task.replacetokens@4
  inputs:
    targetFiles: |
      **/*.json;!**/*.dev.json;!**/vars.json => _tmp/*.json
      **/*.yml
```

### Additional variables
```yaml
- task: qetza.replacetokens.replacetokens-task.replacetokens@4
  inputs:
    targetFiles: |
      **/*.json
    variableFiles: |
      **/vars.json
      **/vars.yml
    inlineVariables: |
      var1: '${{ parameters.var1 }}'
      var2: '${{ parameters.var2 }}'
```

### Access outputs
```yaml
steps:
- task: qetza.replacetokens.replacetokens-task.replacetokens@4
  name: replace-tokens
  inputs:
    targetFiles: '**/*.json'
- script: |
    echo "defaultValueCount     : $(replace-tokens.defaultValueCount }}"
    echo "fileProcessedCount    : $(replace-tokens.fileProcessedCount }}"
    echo "tokenFoundCount       : $(replace-tokens.tokenFoundCount }}"
    echo "tokenReplacedCount    : $(replace-tokens.tokenReplacedCount }}"
    echo "transformExecutedCount: $(replace-tokens.transformExecutedCount }}"
```

## Data/Telemetry
The Replace Tokens task for Azure Pipelines collects anonymous usage data and sends them by default to its author to help improve the product. If you don't wish to send usage data, you can change your telemetry settings through _enableTelemetry_ parameter or by setting a variable or environment variable `REPLACETOKENS_DISABLE_TELEMETRY` to `true`.
