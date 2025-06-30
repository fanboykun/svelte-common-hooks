<script lang="ts">
	import { createModalState } from '$lib/create-modal-state.svelte';
	const modals = createModalState('example');
	let selectedNumber = $state<number>();
</script>

<button onclick={() => modals.open('example', () => (selectedNumber = 2))}>Open Modal 2</button>
{#if modals.list.example}
	<div>
		<h1>Example Modal (imagine this is a modal)</h1>
		<button onclick={() => modals.close('example')}>Close</button>
		<!-- or -->
		<button onclick={() => (modals.list.example = false)}>Close</button>
	</div>
{/if}
