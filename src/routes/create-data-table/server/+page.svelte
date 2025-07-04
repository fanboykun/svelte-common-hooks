<script lang="ts">
	import { page } from '$app/state';
	import * as Table from '@/components/ui/table/index.js';
	import TableHelper from '../(components)/table-helper.svelte';
	import * as Select from '@/components/ui/select/index.js';
	import { isNullish } from '../(utils)/utils.js';
	import { createDataTable, type QueryResult } from '$lib/create-data-table.svelte.js';
	import { setPaginationConfig } from '../(schema)/pagination-schema.js';
	import type { User } from '../(data)/users.js';

	const fetchUser = async (url: URL): Promise<QueryResult<User>> => {
		try {
			url ??= new URL($state.snapshot(page.url));
			const response = await fetch(url);
			const data = await response.json();
			if (!response.ok) throw new Error(data);
			if (typeof data === 'object' && 'users' in data && 'totalItems' in data) {
				return { result: data.users, totalItems: data.totalItems };
			}
			return {
				result: [],
				totalItems: 0
			};
		} catch (error) {
			console.error('failed to fetch user', error);
			return {
				result: [],
				totalItems: 0
			};
		}
	};

	/**
	 * Initialize the data table with `server` mode,
	 * we pass the filters and sorts that we want to use,
	 * and the `queryFn` function that will be used to fetch the data.
	 * this mode is not `SSR` able since `$effect` block only runs on client
	 */
	const dataTable = createDataTable({
		mode: 'server',
		/**
		 * we pass the placeholder for the filter,
		 * it is helping us by providing strong typing to do `filterBy` later
		 */
		filters: {
			isAdult: undefined as boolean | undefined
		},
		/**
		 * we pass the placeholder for the sort,
		 * it is helping us by providing strong typing to do `sortBy` later
		 */
		sorts: {
			createdAt: 'desc' as 'asc' | 'desc'
		},
		/**
		 * The query function, this is where the data is fetched from the server.
		 * Make sure to type the return type so that the data table can infer it.
		 * Make sure to read the config from `dataTable.getConfig()` method,
		 * so that it will trigger side effect when the state changes
		 */
		queryFn: async (): Promise<QueryResult<User>> => {
			// if you want this function to rerun, read the config from `dataTable.getConfig()` method
			const config = dataTable.getConfig();
			// we create a new url to send to the server with the config in the searchParam
			const url = setPaginationConfig(new URL(page.url), {
				isAdult: config.filter.isAdult,
				page: config.page,
				search: config.search,
				sort: config.sort.current && config.sort.dir ? config.sort.dir : null,
				limit: config.limit
			});
			// finally, we fetch the data from the server with the updated config
			return await fetchUser(url);
		}
	});
</script>

<TableHelper
	title="Server Mode DataTable Example"
	description="Example of using DataTable with server mode, means that the data processed on the server and fetch happening on the client side"
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
				}).format(
					typeof item.createdAt === 'string' ? new Date(item.createdAt) : item.createdAt
				)}</Table.Cell
			>
		{/if}
	{/snippet}
</TableHelper>
