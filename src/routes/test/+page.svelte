<script lang="ts">
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import { Input as FormField } from '$lib/components/ui/input';
	import Field from '$lib/components/ui/input/field.svelte';
	import Helper from '$lib/components/ui/input/helper.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/input/label.svelte';
</script>

<FormField let:Field let:Helper let:Label required>
	<Label>Test</Label>
	<Field let:Input let:Icon>
		<Icon>X</Icon>
		<Input class='font-gilroy' required />
		<Icon>^</Icon>
	</Field>
	<Helper let:Icon let:Text>
		<Icon></Icon>
		<Text>Hello</Text>
	</Helper>
</FormField>
