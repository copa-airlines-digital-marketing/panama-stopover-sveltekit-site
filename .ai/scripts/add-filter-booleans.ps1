$ErrorActionPreference = "Stop"
$token = "F_Wy4mJ-iBRJP9gstTqaMFRg8v_1MniD"
$base = "https://cm-marketing.directus.app"
$headers = @{
	Authorization = "Bearer $token"
	"Content-Type" = "application/json"
}

$booleans = @(
	@{ field = "filter_language_enabled"; note = "Show language filter control in UI" },
	@{ field = "filter_category_enabled"; note = "Show experience_category filter control in UI" },
	@{ field = "filter_discount_enabled"; note = "Show promo_discount_percent filter control in UI" },
	@{ field = "filter_duration_enabled"; note = "Show duration filter control in UI" },
	@{ field = "filter_distance_enabled"; note = "Show distance-from-reference-point filter control in UI" }
)

foreach ($b in $booleans) {
	$body = @{
		field = $b.field
		type = "boolean"
		schema = @{
			default_value = $true
			is_nullable = $false
		}
		meta = @{
			interface = "boolean"
			special = @("cast-boolean")
			note = $b.note
			width = "half"
			options = @{ label = "Visible" }
		}
	} | ConvertTo-Json -Depth 10

	Write-Host "Creating field: $($b.field)"
	try {
		$r = Invoke-RestMethod -Uri "$base/fields/stopover_mixed_experience_module" -Method POST -Headers $headers -Body $body -ErrorAction Stop
		Write-Host "  OK: $($r.data.field)"
	} catch {
		Write-Host "  ERROR: $($_.ErrorDetails.Message)"
	}
}
