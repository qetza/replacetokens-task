[CmdletBinding()]
param(
    [string] $rootDirectory,
    [string] $targetFiles,
    [string] $encoding,
    [string] $failOnMissing,
    [string] $tokenPrefix,
    [string] $tokenSuffix,
    [string] $writeBOM
)

Import-Module "Microsoft.TeamFoundation.DistributedTask.Task.Internal"
Import-Module "Microsoft.TeamFoundation.DistributedTask.Task.Common"

Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"
$PSBoundParameters.Keys | %{ Write-Verbose "$_ = $($PSBoundParameters[$_])" }

[bool]$failOnMissing = $failOnMissing -eq 'true'
[bool]$writeBOM = $writeBOM -eq 'true'

. $PSScriptRoot\functions.ps1

$regex = [regex] "${tokenPrefix}((?:(?!${tokenSuffix}).)*)${tokenSuffix}"
Write-Verbose "regex: ${regex}"

Get-MatchingFiles -Pattern $targetFiles -Root $rootDirectory | % {
    if (!(Test-Path $_))
    {
        Write-Error "File '${_}' not found."
        
        return
    }
    
    Set-Variables -Path $_ -Regex $regex -EncodingName $encoding -WriteBOM:$writeBOM -FailOnMissing:$failOnMissing
}