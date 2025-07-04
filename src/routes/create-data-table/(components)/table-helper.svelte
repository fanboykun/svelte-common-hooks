<script
	lang="ts"
	generics="M extends Mode, T extends Record<string, any>, F extends Filter<T, M>, S extends Sorting<T, M>, C extends string[]"
>
	import { type DataTable, type Mode, type Filter, type Sorting } from '$lib/index.svelte';
	import type { Snippet } from 'svelte';
	import * as Table from '@/components/ui/table/index.js';
	import * as Card from '@/components/ui/card/index.js';
	import { Input } from '@/components/ui/input/index.js';
	import Button, { buttonVariants } from '@/components/ui/button/button.svelte';
	import * as DropdownMenu from '@/components/ui/dropdown-menu/index.js';
	// @ts-expect-error somehow the @lucide/svelte did not get recognized even after re-installing it LOL.
	import { ArrowBigRight, ArrowBigLeft, Check, X } from '@lucide/svelte';

	interface Props {
		dataTable: DataTable<M, T, F, S>;
		Column: Snippet<
			[{ item: DataTable<M, T, F, S>['data'][number]; column: Record<C[number], boolean> }]
		>;
		Filter?: Snippet<[{ dataTable: DataTable<M, T, F, S> }]>;
		columns?: C;
		delay?: number;
		title?: string;
		description?: string;
		searchPlaceholder?: string;
	}
	let {
		dataTable,
		Column,
		Filter: FilterSnippet,
		columns,
		delay = 0,
		title = 'Data Table Example',
		description = 'Example of using DataTable',
		searchPlaceholder = 'Search'
	}: Props = $props();
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
</script>

<Card.Root>
	<Card.Header>
		<div class="flex flex-col gap-2">
			<div class="flex flex-col gap-2">
				<Card.Title>{title}</Card.Title>
				<Card.Description>{description}</Card.Description>
			</div>
			<div class="flex w-full justify-between gap-4">
				<Input
					class="w-full max-w-1/2"
					value={dataTable.search}
					placeholder={searchPlaceholder}
					oninput={(event) => {
						const value = event.currentTarget.value;
						dataTable.setSearch(value, delay);
					}}
				/>
				<div class="flex gap-2">
					{#if dataTable.hasInteracted}
						<Button size="icon" variant="destructive" onclick={() => dataTable.reset()}
							><X /></Button
						>
					{/if}
					{#if dataTable.sortKeys?.length}
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class={buttonVariants({ variant: 'outline', class: 'relative' })}
							>
								Sort
								{#if dataTable.appliableSort.current}
									<div
										class="bg-primary absolute -top-1 -right-1 size-2 animate-pulse rounded-full"
									></div>
								{/if}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content>
								<DropdownMenu.Group>
									{#each dataTable.sortKeys as sortKey (sortKey)}
										<DropdownMenu.Item onclick={() => dataTable.sortBy(sortKey, 'desc')}>
											{sortKey} desc
											{#if dataTable.appliableSort.current === sortKey && dataTable.appliableSort.dir === 'desc'}
												<Check />
											{/if}
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item onclick={() => dataTable.sortBy(sortKey, 'asc')}>
											{sortKey} asc
											{#if dataTable.appliableSort.current === sortKey && dataTable.appliableSort.dir === 'asc'}
												<Check />
											{/if}
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Group>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{/if}
					{#if FilterSnippet}
						{@render FilterSnippet({ dataTable })}
					{/if}
				</div>
			</div>
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
	<Card.Footer class="w-full justify-between gap-2">
		<div class="text-muted-foreground text-sm">
			Showing <span class="text-primary font-medium">{dataTable.showingFrom}</span> to
			<span class="text-primary font-medium">{dataTable.showingTo}</span>
			of <span class="text-primary font-medium">{dataTable.totalItems}</span> items
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={!dataTable.canGoPrevious}
				onclick={() => dataTable.previousPage()}
			>
				<ArrowBigLeft /></Button
			>
			<Button size="sm">{dataTable.currentPage}</Button>
			<Button
				variant="outline"
				size="sm"
				disabled={!dataTable.canGoNext}
				onclick={() => dataTable.nextPage()}
			>
				<ArrowBigRight />
			</Button>
		</div>
	</Card.Footer>
</Card.Root>
