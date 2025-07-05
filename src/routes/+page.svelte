<script lang="ts">
	import { Button } from '@/components/ui/button/index.js';
	// @ts-expect-error idk lol
	import { Github, Package, Database, FormInput, OptionIcon as Modal } from '@lucide/svelte';
</script>

<div class="min-h-screen">
	<section class="px-4 py-20">
		<div class="container mx-auto max-w-4xl text-center">
			<div
				class="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
			>
				<Package class="h-4 w-4" />
				<span>Svelte Common Hooks</span>
			</div>
			<h1 class="mb-6 text-5xl leading-tight font-bold md:text-6xl">
				Common Hooks for
				<span class="text-blue-600"> Svelte</span>
			</h1>
			<p class="mb-8 text-xl leading-relaxed">
				A collection of reusable custom hooks that simplify common patterns in Svelte applications.
				Build faster with pre-built utilities for data tables, form state management, and modal
				controls.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<Button href="/installation">Get Started</Button>
				<Button
					variant="outline"
					href="https://github.com/fanboykun/svelte-common-hooks"
					target="_blank"
				>
					<Github class="h-4 w-4" />
					View on GitHub
				</Button>
			</div>
		</div>
	</section>

	<section id="features" class="px-4 py-20">
		<div class=" container mx-auto max-w-6xl">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold md:text-4xl">Powerful Utilities</h2>
				<p class="text-xl">Three essential hooks to accelerate your Svelte development</p>
			</div>

			<div class="text-secondary grid gap-8 md:grid-cols-3">
				<div class="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8">
					<div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
						<Database class="h-6 w-6 text-white" />
					</div>
					<h3 class="mb-4 text-xl font-bold">createDataTable</h3>
					<p class="mb-6">
						Complete data table solution with built-in pagination, sorting, filtering, and loading
						states. Perfect for displaying large datasets with minimal setup.
					</p>
					<ul class="space-y-2 text-sm">
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
							<span>Bring your own function to define search, filter and sort</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
							<span>Automatic pagination</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
							<span>Column sorting</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
							<span>Search & filtering</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
							<span>Loading states</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
							<span
								>Data processing can be done in client, server or even manually define your logic</span
							>
						</li>
					</ul>
				</div>

				<div class="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-8">
					<div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-600">
						<FormInput class="h-6 w-6 text-white" />
					</div>
					<h3 class="text-secondary mb-4 text-xl font-bold">createFormState</h3>
					<p class="mb-6">
						Robust form state management with Zod schema validation. Handle form data, validation
						errors, and submission states effortlessly.
					</p>
					<ul class="space-y-2 text-sm">
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
							<span>Zod schema validation</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
							<span>Real-time error handling</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
							<span>Submission states</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-green-600"></div>
							<span>Type-safe forms</span>
						</li>
					</ul>
				</div>

				<div class="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-8">
					<div class="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600">
						<Modal class="h-6 w-6 text-white" />
					</div>
					<h3 class="text-secondary mb-4 text-xl font-bold">createModalState</h3>
					<p class="mb-6">
						Smart modal state management that automatically handles browser navigation. Modals close
						when users navigate back, providing intuitive UX.
					</p>
					<ul class="space-y-2 text-sm">
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
							<span>Callback on changing state</span>
						</li>
						<li class="flex items-center space-x-2">
							<div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
							<span>Navigation-aware</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<footer class="px-4 py-4">
		<div class="container mx-auto max-w-6xl">
			<div class="text-center text-gray-400">
				<p>
					<a href="https://github.com/fanboykun/svelte-common-hooks/blob/main/LICENSE.md"
						>&copy; 2024 svelte-common-hooks.</a
					>
				</p>
			</div>
		</div>
	</footer>
</div>
