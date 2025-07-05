<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import AppSidebar from '@/components/layouts/app-sidebar.svelte';
	// import * as Breadcrumb from '@/components/ui/breadcrumb/index.js';
	import { Separator } from '@/components/ui/separator/index.js';
	import * as Sidebar from '@/components/ui/sidebar/index.js';
	let { children } = $props();
</script>

<svelte:head>
	<title>svelte-common-hooks</title>
	<meta name="description" content="Svelte Common Hooks, a collection of common hooks for Svelte" />
	<meta
		name="keywords"
		content="Svelte, Common Hooks, Svelte Common Hooks, Sveltekit, Svelte Data Table, Svelte Form State, Svelte Modal, Svelte Modal State, Svelte Navigation, Svelte Navigation State, Svelte Modal State"
	/>

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://svelte-common-hooks.fanboykun.com" />
	<meta property="og:title" content="Svelte Common Hooks" />
	<meta property="og:description" content="A collection of common hooks for Svelte" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://svelte-common-hooks.fanboykun.com" />
	<meta property="twitter:title" content="Svelte Common Hooks" />
	<meta property="twitter:description" content="A collection of common hooks for Svelte" />
</svelte:head>
<ModeWatcher defaultMode="dark" />
<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			<!-- <Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="/">Building Your Application</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root> -->
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
