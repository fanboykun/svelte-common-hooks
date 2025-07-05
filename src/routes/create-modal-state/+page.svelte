<script lang="ts">
	import { createModalState } from '$lib/create-modal-state.svelte';
	import { Button } from '@/components/ui/button/index.js';
	// @ts-expect-error i will fix it later
	import { OptionIcon as Modal, Navigation } from '@lucide/svelte';
	import * as Dialog from '@/components/ui/dialog/index.js';
	const modals = createModalState('example');
</script>

<div class="min-h-screen">
	<div class="container mx-auto max-w-6xl px-4 py-8">
		<div class="mb-8">
			<div
				class="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
			>
				<Modal class="h-4 w-4" />
				<span>Modal State Hook</span>
			</div>
			<h1 class="mb-6 text-4xl font-bold md:text-5xl">Modal State</h1>
			<p class="text-muted-foreground max-w-3xl text-xl leading-relaxed">
				A powerful hook that provides intelligent modal state management with built-in navigation
				awareness, accessibility features, and customizable behaviors. Modals automatically close
				when users navigate back, providing an intuitive user experience.
			</p>
		</div>
		<section class="mb-16">
			<div
				class="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-8"
			>
				<div class="flex items-start space-x-4">
					<div
						class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-600"
					>
						<Navigation class="h-6 w-6 text-white" />
					</div>
					<div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Navigation-Aware Behavior</h3>
						<p class="mb-4 text-gray-700">
							The standout feature of createModalState is its intelligent handling of browser
							navigation. When a modal is open and the user presses the back button, the modal
							automatically closes instead of navigating away from the page.
						</p>
						<div class="rounded-lg border border-purple-200 bg-white p-4">
							<h4 class="mb-2 font-semibold text-gray-900">How it works:</h4>
							<ol class="list-inside list-decimal space-y-1 text-sm text-gray-700">
								<li>User opens a modal → History entry is pushed</li>
								<li>User presses back button → Modal closes gracefully</li>
								<li>URL returns to previous state → No page navigation occurs</li>
								<li>User experience feels natural and intuitive</li>
							</ol>
						</div>
						<div class="mt-4 flex w-full justify-between gap-2 py-2">
							<Button
								variant="secondary"
								href="https://github.com/fanboykun/svelte-common-hooks?tab=readme-ov-file#createmodalstate"
								>See Example</Button
							>
							<Button onclick={() => modals.open('example')}>See in action</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>
<Dialog.Root bind:open={modals.list.example}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Modal example</Dialog.Title>
			<Dialog.Description>
				Try to open and close the modal with clicking close button, clicking x icon and navigating
				back
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button onclick={() => modals.close('example')}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
