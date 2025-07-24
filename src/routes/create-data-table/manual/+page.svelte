<script lang="ts">
	import { createDataTable } from '$lib/index.svelte';
	import * as Table from '@/components/ui/table/index.js';
	import TableHelper from '../(components)/table-helper.svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import * as Select from '@/components/ui/select/index.js';
	import { isNullish, stringToBoolean, stringToEnum, stringToNumber } from '../(utils)/utils.js';
	import { setPaginationConfig } from '../(schema)/pagination-schema.js';
	import Button from '@/components/ui/button/button.svelte';
	let { data } = $props();

	/**
	 * Here we initialize the data table with `manual` mode, we will manually handle the data fetching.
	 * we put all of the state like pagination, search, filters, and sorts from the url search params.
	 * Then we use `goto` from sveltekit to force the `load` function to rerun,
	 * and returning the updated data with the config in the `searchParams`.
	 * since we working with the `load` function, this will be `SSR`ed.
	 */
	const dataTable = createDataTable({
		/**
		 * we use `manual` mode, this mode will not do the filter, pagination, search and sort in the client side,
		 * It is encouraging you to move it to the server instead inside `load` function and store the state in the search params.
		 */
		mode: 'manual',
		/**
		 * we pass the paginated/sliced data here
		 */
		initial: data.users,
		/**
		 * we pass the unpaginated/unsliced data so then we know is the data have another page
		 * see how i implemented it in +page.server.ts
		 */
		totalItems: data.totalItems,
		/**
		 * we pass the current page number that we got from url search params,
		 * we do this so that when the user refresh on the url that has page in the search params,
		 * the data table will also be on the same page
		 */
		page: stringToNumber(page.url.searchParams.get('page'), 1),
		/**
		 * we pass the search query that we got from url search params,
		 * we do this so that when the user refresh on the url that has search in the search params,
		 * the data table will also be on the same search query
		 */
		search: page.url.searchParams.get('search') ?? '',
		/**
		 * we pass the filters that we got from url search params,
		 * we do this so that when the user refresh on the url that has filter in the search params,
		 * the data table will also be on the same filter.
		 *
		 * In `manual` mode, the filter object accept Record<string, unknown> type.
		 * It is helping us by providing strong typing to do `filterBy` later
		 */
		filters: {
			isAdult: stringToBoolean(page.url.searchParams.get('isAdult'), undefined)
		},
		/**
		 * we pass the sorts that we got from url search params,
		 * we do this so that when the user refresh on the url that has sort in the search params,
		 * the data table will also be on the same sort.
		 *
		 * In `manual` mode, the sort object accept Record<string, unknown> type.
		 * It is helping us by providing strong typing to do `sortBy` later
		 */
		sorts: {
			createdAt: stringToEnum(
				page.url.searchParams.get('sort'),
				['asc', 'desc'] as const,
				undefined
			)
		},
		/**
		 * In `manual` mode, we get our data with `processWith` function.
		 * We get the state from the dataTable and store it in the url search params
		 * so that our load function can read them and return the updated data
		 */
		processWith: async () => {
			// get the snapshotted config to send to the server
			const config = dataTable.getConfig();
			// create a new url to send to the server with the config in the searchParam
			const url = setPaginationConfig(new URL($state.snapshot(page.url)), {
				isAdult: config.filter.isAdult,
				page: config.page,
				search: config.search,
				sort: config.sort.current && config.sort.dir ? config.sort.dir : null,
				limit: config.limit
			});

			// here we force the `load` function to rerun and sending the updated config in the url object
			await goto(url, {
				// keep the focus in case the user is typing on the search bar
				keepFocus: true,
				// invalidate the `users:manual` load function so that it will rerun
				invalidate: ['users:manual'],
				// prevent the page from scrolling to the top
				noScroll: true
			});

			// we then finally can updated the data and totalItems returning from the `load` function here
			// dataTable.updateDataAndTotalItems(data.users, data.totalItems);
		}
	}).invalidate(
		() => data,
		(instance) => {
			instance.updateDataAndTotalItems(data.users, data.totalItems);
		}
	);
</script>

<Button onclick={() => invalidateAll()}>Invalidate Page</Button>
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
