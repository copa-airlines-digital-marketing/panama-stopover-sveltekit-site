$ErrorActionPreference = "Stop"
$token = "F_Wy4mJ-iBRJP9gstTqaMFRg8v_1MniD"
$base = "https://cm-marketing.directus.app"
$headers = @{
	Authorization = "Bearer $token"
	"Content-Type" = "application/json"
}

function Invoke-Step {
	param($label, $url, $method = "POST", $body)
	Write-Host ""
	Write-Host "=== $label ==="
	try {
		$r = Invoke-RestMethod -Uri $url -Method $method -Headers $headers -Body $body -ErrorAction Stop
		Write-Host "  OK"
		return $r
	} catch {
		Write-Host "  ERROR: $($_.ErrorDetails.Message)"
		return $null
	}
}

# Step 1: Create the collection with a primary id field
$step1 = @{
	collection = "stopover_mixed_experience_module_sources_translations"
	meta = @{
		hidden = $true
		group = "stopover_mixed_experience_module"
		icon = "import_export"
		accountability = "all"
		versioning = $false
		collapse = "open"
		singleton = $false
	}
	schema = @{
		name = "stopover_mixed_experience_module_sources_translations"
	}
	fields = @(
		@{
			field = "id"
			type = "integer"
			meta = @{
				hidden = $true
				interface = "numeric"
				readonly = $true
			}
			schema = @{
				is_primary_key = $true
				has_auto_increment = $true
				is_nullable = $false
			}
		}
	)
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create collection" -url "$base/collections" -body $step1 | Out-Null

# Step 2: Create the 'translations' alias field on the parent sources collection
$step2 = @{
	field = "translations"
	type = "alias"
	meta = @{
		special = @("translations")
		interface = "translations"
		options = @{
			languageField = "name"
			defaultOpenSplitView = $true
		}
		display = "translations"
		hidden = $false
		required = $false
	}
	schema = $null
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create translations alias on sources" -url "$base/fields/stopover_mixed_experience_module_sources" -body $step2 | Out-Null

# Step 3: Create 'label' field
$step3 = @{
	field = "label"
	type = "string"
	meta = @{
		interface = "input"
		note = "Visible name of the entity type (e.g. Tour / Activity / Actividad)"
		width = "full"
		required = $false
	}
	schema = @{
		max_length = 40
		is_nullable = $true
	}
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create field 'label'" -url "$base/fields/stopover_mixed_experience_module_sources_translations" -body $step3 | Out-Null

# Step 4: Create FK field stopover_mixed_experience_module_sources_id
$step4 = @{
	field = "stopover_mixed_experience_module_sources_id"
	type = "integer"
	meta = @{
		hidden = $true
		interface = "select-dropdown-m2o"
		required = $false
	}
	schema = @{
		is_nullable = $true
	}
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create FK field 'stopover_mixed_experience_module_sources_id'" -url "$base/fields/stopover_mixed_experience_module_sources_translations" -body $step4 | Out-Null

# Step 5: Create FK field languages_code
$step5 = @{
	field = "languages_code"
	type = "string"
	meta = @{
		hidden = $true
		interface = "select-dropdown-m2o"
		required = $false
	}
	schema = @{
		max_length = 255
		is_nullable = $true
	}
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create FK field 'languages_code'" -url "$base/fields/stopover_mixed_experience_module_sources_translations" -body $step5 | Out-Null

# Step 6: Create relation for languages_code -> languages.code
$step6 = @{
	collection = "stopover_mixed_experience_module_sources_translations"
	field = "languages_code"
	related_collection = "languages"
	meta = @{
		junction_field = "stopover_mixed_experience_module_sources_id"
		one_field = $null
		one_deselect_action = "nullify"
		sort_field = $null
	}
	schema = @{
		on_update = "NO ACTION"
		on_delete = "NO ACTION"
	}
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create relation languages_code -> languages" -url "$base/relations" -body $step6 | Out-Null

# Step 7: Create relation for stopover_mixed_experience_module_sources_id -> sources.id
$step7 = @{
	collection = "stopover_mixed_experience_module_sources_translations"
	field = "stopover_mixed_experience_module_sources_id"
	related_collection = "stopover_mixed_experience_module_sources"
	meta = @{
		junction_field = "languages_code"
		one_field = "translations"
		one_deselect_action = "delete"
		sort_field = $null
	}
	schema = @{
		on_update = "NO ACTION"
		on_delete = "CASCADE"
	}
} | ConvertTo-Json -Depth 10

Invoke-Step -label "Create relation sources_id -> sources" -url "$base/relations" -body $step7 | Out-Null

Write-Host ""
Write-Host "=== DONE ==="
