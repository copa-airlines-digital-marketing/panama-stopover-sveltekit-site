$ErrorActionPreference = "Stop"
$token = "F_Wy4mJ-iBRJP9gstTqaMFRg8v_1MniD"
$base = "https://cm-marketing.directus.app"
$headers = @{
	Authorization = "Bearer $token"
	"Content-Type" = "application/json"
}

# Labels taken from the hardcoded strings in mixed-experience-module.svelte (lines 85-105)
# source id 1 = stopover_place_to_visit (Activity)
# source id 2 = stopover_tours (Tour)
$seeds = @(
	@{ source = 1; lang = "en"; label = "Activity" },
	@{ source = 1; lang = "es"; label = "Actividad" },
	@{ source = 1; lang = "pt"; label = "Atividade" },
	@{ source = 2; lang = "en"; label = "Tour" },
	@{ source = 2; lang = "es"; label = "Tour" },
	@{ source = 2; lang = "pt"; label = "Tour" }
)

foreach ($s in $seeds) {
	$body = @{
		stopover_mixed_experience_module_sources_id = $s.source
		languages_code = $s.lang
		label = $s.label
	} | ConvertTo-Json -Depth 5

	Write-Host "Seeding: source=$($s.source) lang=$($s.lang) label=$($s.label)"
	try {
		$r = Invoke-RestMethod -Uri "$base/items/stopover_mixed_experience_module_sources_translations" -Method POST -Headers $headers -Body $body -ErrorAction Stop
		Write-Host "  OK: id=$($r.data.id)"
	} catch {
		Write-Host "  ERROR: $($_.ErrorDetails.Message)"
	}
}
