$ErrorActionPreference = "Stop"
$token = "F_Wy4mJ-iBRJP9gstTqaMFRg8v_1MniD"
$base = "https://cm-marketing.directus.app"
$headers = @{
	Authorization = "Bearer $token"
	"Content-Type" = "application/json"
}

$fields = @(
	@{ field = "reference_point_label"; max = 80; note = "Text shown next to the distance filter (e.g. 'Measured from Iglesia del Carmen, Via Espana')" },
	@{ field = "filter_language_label"; max = 40; note = "UI label for the language filter control" },
	@{ field = "filter_category_label"; max = 40; note = "UI label for the experience_category filter control" },
	@{ field = "filter_discount_label"; max = 40; note = "UI label for the discount filter control" },
	@{ field = "filter_duration_label"; max = 40; note = "UI label for the duration filter control" },
	@{ field = "filter_distance_label"; max = 40; note = "UI label for the distance filter control" },
	@{ field = "filter_apply_label"; max = 30; note = "Text for the 'Apply filters' button" }
)

foreach ($f in $fields) {
	$body = @{
		field = $f.field
		type = "string"
		schema = @{
			max_length = $f.max
			is_nullable = $true
			default_value = $null
		}
		meta = @{
			interface = "input"
			note = $f.note
			width = "half"
			required = $false
		}
	} | ConvertTo-Json -Depth 10

	Write-Host "Creating field: $($f.field) (max $($f.max))"
	try {
		$r = Invoke-RestMethod -Uri "$base/fields/stopover_mixed_experience_module_translations" -Method POST -Headers $headers -Body $body -ErrorAction Stop
		Write-Host "  OK: $($r.data.field)"
	} catch {
		Write-Host "  ERROR: $($_.ErrorDetails.Message)"
	}
}
