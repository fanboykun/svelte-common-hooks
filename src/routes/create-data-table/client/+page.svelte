<script lang="ts">
	import { createDataTable } from '$lib/index.svelte';
	import * as Table from '@/components/ui/table/index.js';
	import TableHelper from '../(components)/table-helper.svelte';
	import * as Select from '@/components/ui/select/index.js';
	import { isNullish } from '../(utils)/utils.js';

	let { data } = $props();

	/**
	 * Here we initialize the data table with `client` mode, we will manually handle the data fetching.
	 * All of the processing such as filtering, searching, sorting, and pagination will be done client side.
	 * The data is `SSR` ed
	 */
	const dataTable = createDataTable({
		/**
		 * The mode of the data table.
		 */
		mode: 'client',
		/**
		 * The data that will be processed
		 */
		initial: data.users,
		/**
		 * Pass your own function for handle data searching
		 */
		searchWith(item, query) {
			return item.name.toLowerCase().includes(query.toLowerCase());
		},
		/**
		 * You can use your own logic and pass the function for handle data filtering.
		 * This library handle data filtering by doing `Array.filter()` function,
		 * so your function must return `boolean`
		 */
		filters: {
			isAdult: (item, args: boolean | undefined) =>
				typeof args === 'undefined' ? true : item.age >= 18 === args
		},
		/**
		 * You can use your own logic and pass the function for handle data sorting.
		 * This library handle data sorting by doing `Array.sort()` function,
		 * so your function must return `number`
		 */
		sorts: {
			createdAt: (a, b, dir) =>
				dir === 'asc'
					? a.createdAt.getTime() - b.createdAt.getTime()
					: b.createdAt.getTime() - a.createdAt.getTime()
		}
	}).hydrate(() => data.users);
</script>

<TableHelper
	title="Client DataTable Example"
	description="Example of using DataTable with client mode. Every thing is done client side, no data fetching from the server"
	searchPlaceholder="Search users by name"
	{dataTable}
	columns={['name', 'email', 'age', 'address', 'created'] as const}
>
	{#snippet Filter()}
		<div class="space-y-4">
			<Select.Root
				type="single"
				value={`${dataTable.appliableFilter.isAdult ?? ''}`}
				onValueChange={(value) => {
					if (!value)
						dataTable.filterBy('isAdult', undefined, { immediate: true, resetPage: true });
					else
						dataTable.filterBy('isAdult', value === 'true', { immediate: true, resetPage: true });
				}}
			>
				<Select.Trigger class="w-[180px]"
					>{isNullish(dataTable.appliableFilter.isAdult)
						? 'All'
						: dataTable.appliableFilter.isAdult
							? 'Adult'
							: 'Child'}</Select.Trigger
				>
				<Select.Content>
					<Select.Item value="">All</Select.Item>
					<Select.Item value="true">Adult</Select.Item>
					<Select.Item value="false">Child</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
	{/snippet}
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
		{#if column.created}
			<Table.Cell class="text-right"
				>{new Intl.DateTimeFormat('id-ID', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}).format(item.createdAt)}</Table.Cell
			>
		{/if}
	{/snippet}
</TableHelper>
