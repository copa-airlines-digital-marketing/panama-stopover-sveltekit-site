$ErrorActionPreference = "Stop"
$token = "F_Wy4mJ-iBRJP9gstTqaMFRg8v_1MniD"
$base = "https://cm-marketing.directus.app"
$headers = @{
	Authorization = "Bearer $token"
	"Content-Type" = "application/json"
}

function Patch-Field {
	param($collection, $field, $body)
	Write-Host "PATCH $collection/$field"
	try {
		Invoke-RestMethod -Uri "$base/fields/$collection/$field" -Method PATCH -Headers $headers -Body $body -ErrorAction Stop | Out-Null
		Write-Host "  OK"
	} catch {
		Write-Host "  ERROR: $($_.ErrorDetails.Message)"
	}
}

# 1) Fix FK fields: remove explicit interface (null), keep them hidden, fix sort order
#    Pattern from working module_translations: FKs sort=2 and 3, content sort=4+

$fixFkSources = @{
	meta = @{
		interface = $null
		hidden = $true
		sort = 2
		width = "full"
		readonly = $false
		required = $false
	}
} | ConvertTo-Json -Depth 10
Patch-Field "stopover_mixed_experience_module_sources_translations" "stopover_mixed_experience_module_sources_id" $fixFkSources

$fixFkLang = @{
	meta = @{
		interface = $null
		hidden = $true
		sort = 3
		width = "full"
		readonly = $false
		required = $false
	}
} | ConvertTo-Json -Depth 10
Patch-Field "stopover_mixed_experience_module_sources_translations" "languages_code" $fixFkLang

# 2) Fix id field: remove explicit interface, restore defaults
$fixId = @{
	meta = @{
		interface = $null
		hidden = $true
		sort = 1
		width = "full"
		readonly = $true
	}
} | ConvertTo-Json -Depth 10
Patch-Field "stopover_mixed_experience_module_sources_translations" "id" $fixId

# 3) Move label to sort=4 and make it required
$fixLabel = @{
	meta = @{
		interface = "input"
		hidden = $false
		sort = 4
		width = "full"
		required = $true
		note = "Visible name of the entity type (e.g. Tour / Activity / Actividad)"
	}
} | ConvertTo-Json -Depth 10
Patch-Field "stopover_mixed_experience_module_sources_translations" "label" $fixLabel

# 4) Make the 'translations' alias on parent required (same as working pattern)
$fixAlias = @{
	meta = @{
		special = @("translations")
		interface = "translations"
		options = @{
			languageField = "name"
			defaultOpenSplitView = $true
		}
		display = "translations"
		hidden = $false
		required = $true
		width = "full"
	}
} | ConvertTo-Json -Depth 10
Patch-Field "stopover_mixed_experience_module_sources" "translations" $fixAlias

Write-Host ""
Write-Host "=== DONE ==="
