<script
	lang="ts"
	generics="T extends Record<string, any>, M extends Mode, F extends Filter<T, M>, S extends Sorting<T>, C extends string[]"
>
	import { type DataTable, type Mode, type Filter, type Sorting } from '$lib/index.svelte';
	import type { Snippet } from 'svelte';
	import * as Table from '@/components/ui/table/index.js';
	import * as Card from '@/components/ui/card/index.js';
	import { Input } from '@/components/ui/input/index.js';
	import Button from '@/components/ui/button/button.svelte';

	interface Props {
		dataTable: DataTable<T, M, F, S>;
		Column: Snippet<
			[{ item: DataTable<T, M, F, S>['data'][number]; column: Record<C[number], boolean> }]
		>;
		columns?: C;
	}
	let { dataTable, Column, columns }: Props = $props();
	const columnList = $state<Record<C[number], boolean>>(
		columns
			? columns.reduce(
					(acc, cur) => {
						acc[cur as C[number]] = true;
						return acc;
					},
					{} as Record<C[number], boolean>
				)
			: ({} as Record<C[number], boolean>)
	);
	function handleInput(value: string) {
		if (dataTable.mode === 'client') return;
		dataTable.setSearch(
			value,
			// 500 ms delay
			500
		);
	}
</script>

<Card.Root>
	<Card.Header>
		<div class="flex flex-col gap-2">
			<div class="flex flex-col gap-2">
				<Card.Title>Data Table Example</Card.Title>
				<Card.Description>Example of using DataTable</Card.Description>
			</div>
			<Input
				class="w-full max-w-1/2"
				bind:value={dataTable.search}
				oninput={(event) => {
					const value = event.currentTarget.value;
					handleInput(value);
				}}
			/>
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{#each columns ?? [] as column (column)}
						<Table.Head>{column}</Table.Head>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each dataTable.data as item (item.id)}
					<Table.Row>
						{@render Column({ item, column: columnList })}
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
	<Card.Footer class="w-full justify-end gap-2">
		<Button
			variant="outline"
			size="sm"
			disabled={!dataTable.canGoPrevious}
			onclick={() => dataTable.previousPage()}
		>
			&lt;</Button
		>
		<Button size="sm">{dataTable.currentPage}</Button>
		<Button
			variant="outline"
			size="sm"
			disabled={!dataTable.canGoNext}
			onclick={() => dataTable.nextPage()}
		>
			&gt;</Button
		>
	</Card.Footer>
</Card.Root>
