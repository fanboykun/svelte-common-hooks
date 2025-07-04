<script lang="ts">
	import { createDataTable } from '$lib/index.svelte';
	import * as Table from '@/components/ui/table/index.js';
	import TableHelper from '../(components)/table-helper.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import * as Select from '@/components/ui/select/index.js';
	import { stringToBoolean, stringToEnum, stringToNumber } from '../(utils)/utils.js';
	let { data } = $props();

	const dataTable = createDataTable({
		mode: 'manual',
		initial: data.users,
		totalItems: data.totalItems,
		page: stringToNumber(page.url.searchParams.get('page'), 1),
		search: page.url.searchParams.get('search') ?? '',
		filters: {
			isAdult: stringToBoolean(page.url.searchParams.get('isAdult'), null)
		},
		sorts: {
			createdAt: stringToEnum(page.url.searchParams.get('sort'), ['asc', 'desc'] as const, 'desc')
		},
		processWith: async () => {
			const url = new URL($state.snapshot(page.url));

			if (dataTable.currentPage <= 1 || dataTable.currentPage > dataTable.totalPage)
				url.searchParams.delete('page');
			else url.searchParams.set('page', dataTable.currentPage.toString());

			if (!dataTable.search?.length) url.searchParams.delete('search');
			else url.searchParams.set('search', dataTable.search);

			if (
				dataTable.appliableFilter.isAdult === null ||
				dataTable.appliableFilter.isAdult === undefined
			)
				url.searchParams.delete('isAdult');
			else url.searchParams.set('isAdult', `${dataTable.appliableFilter.isAdult}`);

			if (dataTable.appliableSort.current && dataTable.appliableSort.dir) {
				url.searchParams.set('sort', dataTable.appliableSort.dir);
			} else {
				url.searchParams.delete('sort');
			}

			await goto(url, {
				keepFocus: true,
				invalidate: ['users:manual'],
				noScroll: true
			});
			dataTable.updateDataAndTotalItems(data.users, data.totalItems);
		}
	});
</script>

<TableHelper
	title="Manual DataTable Example"
	description="Example of using DataTable with manual mode, every thing is done manually by you. this is great if you want to do it with `goto` from sveltekit"
	searchPlaceholder="Search users by name"
	{dataTable}
	columns={['name', 'email', 'age', 'address', 'created'] as const}
	delay={500}
>
	{#snippet Filter()}
		<div class="space-y-4">
			<Select.Root
				type="single"
				onValueChange={(value) => {
					if (!value) dataTable.filterBy('isAdult', null, true);
					else dataTable.filterBy('isAdult', value === 'true', true);
				}}
			>
				<Select.Trigger class="w-[180px]"
					>{dataTable.appliableFilter.isAdult === null
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
