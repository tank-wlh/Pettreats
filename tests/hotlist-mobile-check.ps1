$css = Get-Content -Raw (Join-Path $PSScriptRoot "..\styles.css")

if ($css -notmatch '(?s)@media \(max-width: 767px\).*?\.hotlist-card\s*\{.*?width: calc\(100% - 20px\)') {
  throw "mobile hotlist card width constraint is missing"
}

if ($css -notmatch '(?s)@media \(max-width: 767px\).*?\.hotlist-actions\s*\{.*?grid-template-columns: 1fr') {
  throw "mobile hotlist actions are not single column"
}

if ($css -notmatch '(?s)@media \(max-width: 767px\).*?\.hotlist-body\s+h3\s*\{.*?font-size: 20px') {
  throw "mobile hotlist title size constraint is missing"
}

if ($css -notmatch '(?s)@media \(max-width: 767px\).*?\.hotlist-body\s*\{.*?grid-column: 1 / -1') {
  throw "mobile hotlist body is not spanning the card"
}

Write-Output "hotlist mobile checks passed"
