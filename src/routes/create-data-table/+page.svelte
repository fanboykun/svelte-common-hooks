<script lang="ts">
	import { createDataTable } from '$lib/index.svelte';
	import * as Table from '@/components/ui/table/index.js';
	import * as Card from '@/components/ui/card/index.js';
	import { Input } from '@/components/ui/input/index.js';
	import Button from '@/components/ui/button/button.svelte';
	import { Badge } from '@/components/ui/badge/index.js';
	let { data } = $props();

	const dataTable = createDataTable({
		mode: 'client',
		initial: data.users,
		searchWith(item, query) {
			return item.name.toLowerCase().includes(query.toLowerCase());
		},
		filters: {
			isAdult: (item, args: boolean) => item.age >= 18 === args
		},
		sorts: {
			age: (a, b, dir) => (dir === 'asc' ? a.age - b.age : b.age - a.age),
			name: (a, b, dir) =>
				dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
		}
	});
</script>

<Card.Root>
	<Card.Header>
		<div class="flex flex-col gap-2">
			<div class="flex flex-col gap-2">
				<Card.Title>Card Title</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</div>
			<Input
				class="w-full max-w-1/2"
				value={dataTable.search}
				oninput={(event) => {
					const value = event.currentTarget.value;
					dataTable.setSearch(
						value,
						// 500 ms delay
						500
					);
				}}
			/>
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Age</Table.Head>
					<Table.Head class="text-right">Address</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each dataTable.data as item (item.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{item.name}</Table.Cell>
						<Table.Cell>{item.email}</Table.Cell>
						<Table.Cell>{item.age}</Table.Cell>
						<Table.Cell class="text-right">{item.address.street}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
	<Card.Footer class="w-full justify-end gap-2">
		<Button size="sm" disabled={!dataTable.canGoPrevious} onclick={() => dataTable.previousPage()}
			>Prev</Button
		>
		<Badge class="w-fit">{dataTable.currentPage}</Badge>
		<Button disabled={!dataTable.canGoNext} onclick={() => dataTable.nextPage()}>></Button>
	</Card.Footer>
</Card.Root>
