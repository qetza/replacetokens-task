[CmdletBinding()]
param(
    [string] $rootDirectory,
    [string] $targetFiles,
    [string] $encoding,
    [string] $failOnMissing, #keep for backward compatibility
    [string] $tokenPrefix,
    [string] $tokenSuffix,
    [string] $writeBOM,
    [string] $actionOnMissing,
    [string] $keepToken
)

Import-Module "Microsoft.TeamFoundation.DistributedTask.Task.Internal"
Import-Module "Microsoft.TeamFoundation.DistributedTask.Task.Common"

Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"
$PSBoundParameters.Keys | % { Write-Verbose "  ${_} = $($PSBoundParameters[$_])" }

[bool]$writeBOM = $writeBOM -eq 'true'
[bool]$keepToken = $keepToken -eq 'true'

# back-compat support
[bool]$failOnMissing = $failOnMissing -eq 'true'
if ($failOnMissing)
{
    Write-Warning 'Parameter ''Fail on missing'' was deprecated, use ''Action on missing variable'' instead.'
    $actionOnMissing = 'fail'
}

. $PSScriptRoot\functions.ps1

$tokenPrefix = [regex]::Escape($tokenPrefix)
$tokenSuffix = [regex]::Escape($tokenSuffix)
$regex = [regex] "${tokenPrefix}((?:(?!${tokenSuffix}).)*)${tokenSuffix}"
Write-Verbose "regex: ${regex}"

Get-MatchingFiles -Pattern $targetFiles -Root $rootDirectory | % {
    if (!(Test-Path $_))
    {
        Write-Error "File '${_}' not found."
        
        return
    }
    
    Set-Variables -Path $_ -Regex $regex -EncodingName $encoding -WriteBOM:$writeBOM -ActionOnMissing $actionOnMissing -KeepToken:$keepToken
}