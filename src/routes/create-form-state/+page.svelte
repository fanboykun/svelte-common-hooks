<script lang="ts">
	import { Button } from '@/components/ui/button/index.js';
	// @ts-expect-error i will fix it later
	import { Shield, FormInput } from '@lucide/svelte';
</script>

<div class="min-h-screen">
	<div class="container mx-auto max-w-6xl px-4 py-8">
		<div class="mb-8">
			<div
				class="mb-6 inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800"
			>
				<FormInput class="h-4 w-4" />
				<span>Form State Hook</span>
			</div>
			<h1 class="mb-6 text-4xl font-bold md:text-5xl">Form State</h1>
			<p class="text-muted-foreground max-w-3xl text-xl leading-relaxed">
				A powerful hook that provides comprehensive form state management with Zod schema
				validation. Handle form data, validation errors, and submission states effortlessly with
				full TypeScript support and real-time validation.
			</p>
		</div>
		<section class="mb-16">
			<div
				class="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-8"
			>
				<div class="flex items-start space-x-4">
					<div
						class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-600"
					>
						<Shield class="h-6 w-6 text-white" />
					</div>
					<div>
						<h3 class="mb-4 text-xl font-bold text-gray-900">Powered by Zod Schema Validation</h3>
						<p class="mb-4 text-gray-700">
							createFormState leverages Zod's powerful schema validation system to provide type-safe
							form handling with comprehensive validation rules. Define your schema once and get
							automatic TypeScript types, runtime validation, and detailed error messages.
						</p>
						<div class="rounded-lg border border-purple-200 bg-white p-4">
							<h4 class="mb-2 font-semibold text-gray-900">Zod benefits:</h4>
							<ul class="grid gap-2 text-sm text-gray-700 md:grid-cols-2">
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
									<span>TypeScript-first validation</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
									<span>Composable schemas</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
									<span>Custom validation functions</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
									<span>Async validation support</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
									<span>Detailed error messages</span>
								</li>
								<li class="flex items-center space-x-2">
									<div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
									<span>Data transformation</span>
								</li>
							</ul>
						</div>
						<div class="mt-4 flex w-full justify-between gap-2 py-2">
							<Button
								variant="secondary"
								href="https://github.com/fanboykun/svelte-common-hooks?tab=readme-ov-file#createformstate"
								>See Example</Button
							>
							<Button href="/create-form-state/example">See in action</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>
