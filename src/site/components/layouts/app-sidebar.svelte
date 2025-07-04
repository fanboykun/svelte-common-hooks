<script lang="ts" module>
	// sample data

	// This is sample data.
	const data = {
		navMain: [
			{
				title: 'Getting Started',
				url: '/',
				items: [
					{
						title: 'Prerequisites',
						url: '/prerequisites'
					},
					{
						title: 'Installation',
						url: '/installation'
					}
				]
			},
			{
				title: 'Data Table',
				url: '/create-data-table',
				items: [
					{
						title: 'Guide',
						url: '/create-data-table'
					},
					{
						title: 'Client Mode',
						url: '/create-data-table/client'
					},
					{
						title: 'Server Mode',
						url: '/create-data-table/server'
					},
					{
						title: 'Manual Mode',
						url: '/create-data-table/manual'
					}
				]
			},
			{
				title: 'Form State',
				url: '/create-form-state',
				items: [
					{
						title: 'Guide',
						url: '/create-form-state'
					}
				]
			},
			{
				title: 'Model State',
				url: '/create-modal-state',
				items: [
					{
						title: 'Guide',
						url: '/create-modal-state'
					}
				]
			}
		]
	};
</script>

<script lang="ts">
	import * as Collapsible from '@/components/ui/collapsible/index.js';
	import * as Sidebar from '@/components/ui/sidebar/index.js';
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<GalleryVerticalEndIcon class="size-4" />
							</div>
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">Svelte Common Hooks</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.Menu>
				{#each data.navMain as item, index (item.title)}
					<Collapsible.Root open={index === 1} class="group/collapsible">
						<Sidebar.MenuItem>
							<Collapsible.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuButton {...props}>
										{item.title}
										<PlusIcon class="ml-auto group-data-[state=open]/collapsible:hidden" />
										<MinusIcon class="ml-auto group-data-[state=closed]/collapsible:hidden" />
									</Sidebar.MenuButton>
								{/snippet}
							</Collapsible.Trigger>
							{#if item.items?.length}
								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each item.items as subItem (subItem.title)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton>
													{#snippet child({ props })}
														<a href={subItem.url} {...props}>{subItem.title}</a>
													{/snippet}
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							{/if}
						</Sidebar.MenuItem>
					</Collapsible.Root>
				{/each}
			</Sidebar.Menu>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
