<script lang="ts">
	import { Button } from '@/components/ui/button/index.js';

	// @ts-expect-error i will fix it later
	import { Database, Server, User, Zap, Filter, ArrowUpDown, Search, Code2 } from '@lucide/svelte';

	const colorClasses = {
		blue: 'from-blue-50 to-blue-100 border-blue-200',
		green: 'from-green-50 to-green-100 border-green-200',
		purple: 'from-purple-50 to-purple-100 border-purple-200'
	};
	const iconColors = {
		blue: 'bg-blue-600',
		green: 'bg-green-600',
		purple: 'bg-purple-600'
	};
	const modes: {
		id: 'client' | 'server' | 'manual';
		name: string;
		icon: any;
		description: string;
		color: keyof typeof colorClasses;
	}[] = [
		{
			id: 'client',
			name: 'Client Mode',
			icon: User,
			description: 'Process all data operations on the client side',
			color: 'blue'
		},
		{
			id: 'server',
			name: 'Server Mode',
			icon: Server,
			description: 'Fetch and process data on the server',
			color: 'green'
		},
		{
			id: 'manual',
			name: 'Manual Mode',
			icon: Code2,
			description: 'Full control over data fetching and state management',
			color: 'purple'
		}
	];
</script>

<div class="min-h-screen">
	<div class="container mx-auto max-w-6xl px-4 py-8">
		<div class="mb-8">
			<div
				class="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
			>
				<Database class="h-4 w-4" />
				<span>Data Table Hook</span>
			</div>
			<h1 class="mb-6 text-4xl font-bold md:text-5xl">Comprehensive Data Table Utility</h1>
			<p class="text-muted-foreground max-w-3xl text-xl leading-relaxed">
				A powerful hook that provides everything you need to create feature-rich data tables with
				built-in pagination, sorting, filtering, and search capabilities. Choose from three
				processing modes to fit your needs.
			</p>
		</div>

		<section class="mb-16">
			<h2 class="mb-8 text-2xl font-bold">Key Features</h2>
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<div class="rounded-xl border p-6 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
						<Search class="h-6 w-6 text-blue-600" />
					</div>
					<h3 class="mb-2 font-semibold">Smart Search</h3>
					<p class="text-muted-foreground text-sm">
						Built-in search across multiple fields with customizable logic
					</p>
				</div>

				<div class="rounded-xl border p-6 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
						<Filter class="h-6 w-6 text-green-600" />
					</div>
					<h3 class="mb-2 font-semibold">Advanced Filtering</h3>
					<p class="text-muted-foreground text-sm">
						Multiple filter types with custom filter functions
					</p>
				</div>

				<div class="rounded-xl border p-6 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
						<ArrowUpDown class="h-6 w-6 text-purple-600" />
					</div>
					<h3 class="mb-2 font-semibold">Flexible Sorting</h3>
					<p class="text-muted-foreground text-sm">
						Multi-column sorting with custom sort functions
					</p>
				</div>

				<div class="rounded-xl border p-6 shadow-sm">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
						<Zap class="h-6 w-6 text-orange-600" />
					</div>
					<h3 class="mb-2 font-semibold">High Performance</h3>
					<p class="text-muted-foreground text-sm">
						Optimized for large datasets with efficient rendering
					</p>
				</div>
			</div>
		</section>

		<section class="mb-16">
			<h2 class="mb-8 text-2xl font-bold">Processing Modes</h2>
			<div class="grid gap-8 md:grid-cols-3">
				{#each modes as mode (mode)}
					{@const Icon = mode.icon}
					<div class={`bg-gradient-to-br ${colorClasses[mode.color]} rounded-2xl border p-8`}>
						<div
							class={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg ${iconColors[mode.color]}`}
						>
							<Icon class="h-6 w-6" />
						</div>
						<h3 class="text-secondary mb-4 text-xl font-bold">{mode.name}</h3>
						<p class="text-muted mb-6">{mode.description}</p>
						{#if mode.id === 'client'}
							<ul class="text-muted space-y-2 text-sm">
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
									<span>All data processing in browser</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
									<span>Built-in search, filter, sort logic</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
									<span>Perfect for smaller datasets</span>
								</li>
							</ul>
						{:else if mode.id === 'server'}
							<ul class="text-muted space-y-2 text-sm">
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
									<span>Server-side data processing</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
									<span>Automatic API calls on state changes</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
									<span>Ideal for large datasets</span>
								</li>
							</ul>
						{:else}
							<ul class="text-muted space-y-2 text-sm">
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
									<span>Full control over data fetching</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
									<span>Custom state management</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
									<span>Maximum flexibility</span>
								</li>
							</ul>
						{/if}
						<div class="mt-4 flex w-full justify-between gap-2 py-2">
							<Button
								variant="secondary"
								href={`https://github.com/fanboykun/svelte-common-hooks?tab=readme-ov-file#${mode.id}-mode-example`}
								>See Example</Button
							>
							<Button href={`/create-data-table/${mode.id}`}>See in action</Button>
						</div>
					</div>
				{/each}
			</div>
		</section>
	</div>
</div>
