<script lang="ts">
	import { createDataTable } from '$lib/index.svelte';
	import * as Table from '@/components/ui/table/index.js';
	import TableHelper from './(components)/table-helper.svelte';

	let { data } = $props();

	const dataTable = createDataTable({
		mode: 'client',
		initial: data.users,
		searchWith(item, query) {
			return item.name.toLowerCase().includes(query.toLowerCase());
		},
		filters: {
			isAdult: (item, args: boolean) => item.age >= 18 === args,
			age: (item, args: number) => item.age === args
		},
		sorts: {
			age: (a, b, dir) => (dir === 'asc' ? a.age - b.age : b.age - a.age),
			name: (a, b, dir) =>
				dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
		}
	});
</script>

<TableHelper {dataTable} columns={['name', 'email', 'age', 'address'] as const}>
	{#snippet Column({ item, column })}
		{#if column.name}
			<Table.Cell class="font-medium">{item.name}</Table.Cell>
		{/if}
		{#if column.email}
			<Table.Cell>{item.email}</Table.Cell>
		{/if}
		{#if column.age}
			<Table.Cell>{item.age}</Table.Cell>
		{/if}
		{#if column.address}
			<Table.Cell class="text-right">{item.address.street}</Table.Cell>
		{/if}
	{/snippet}
</TableHelper>
