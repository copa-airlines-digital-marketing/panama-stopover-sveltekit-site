<!-- ⚠️ VERIFICATION PAGE - DISABLED FOR NOW -->
<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="bg-white p-8 rounded-lg shadow-lg text-center">
		<h1 class="text-2xl font-bold text-gray-900 mb-4">Verification Page</h1>
		<p class="text-gray-600 mb-6">
			This functionality is currently disabled and will be re-enabled soon.
		</p>
		<p class="text-sm text-gray-500">Status Code: {data.status}</p>
	</div>
</div>
