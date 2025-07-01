<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>svelte-common-hooks</title>
</svelte:head>
<main class="px-4 py-6">
	{@render children?.()}
</main>
