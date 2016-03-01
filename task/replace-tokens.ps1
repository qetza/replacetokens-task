[CmdletBinding()]
param(
    [string] $targetFiles,
    [string] $encoding,
    [string] $failOnMissing,
    [string] $tokenPrefix,
    [string] $tokenSuffix
)

Import-Module "Microsoft.TeamFoundation.DistributedTask.Task.Internal"
Import-Module "Microsoft.TeamFoundation.DistributedTask.Task.Common"

Write-Verbose "targetFiles = ${targetFiles}"
Write-Verbose "encoding = ${encoding}"
Write-Verbose "failOnMissing = ${failOnMissing}"
Write-Verbose "tokenPrefix = ${tokenPrefix}"
Write-Verbose "tokenSuffix = ${tokenSuffix}"

[bool]$failOnMissing = $failOnMissing -eq 'true'

. $PSScriptRoot\functions.ps1

$regex = [regex] "${tokenPrefix}((?:(?!${tokenSuffix}).)*)${tokenSuffix}"
Write-Verbose "regex: ${regex}"

Get-MatchingFiles -Pattern $targetFiles -Root $env:BUILD_SOURCESDIRECTORY | % {
    if (!(Test-Path $_))
    {
        Write-Error "File '${_}' not found."
        
        return
    }
    
    Set-Variables -Path $_ -Regex $regex -Encoding $encoding -FailOnMissing:$failOnMissing
}