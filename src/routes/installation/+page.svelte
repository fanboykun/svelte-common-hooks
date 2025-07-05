<script lang="ts">
</script>

<section id="installation" class="px-4 py-20">
	<div class="container mx-auto max-w-4xl">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold md:text-4xl">Installation</h2>
			<p class="text-muted-foreground text-lg">
				svelte-common-hooks can only runs on <a
					href="https://www.npmjs.com/package/@sveltejs/kit"
					class="text-blue-500 underline">sveltekit</a
				>
				projects, that means you need to have sveltekit installed. createFormState hooks requires
				<a href="https://www.npmjs.com/package/zod" class="text-blue-500 underline">Zod</a> version 3.25.74
				at minimum and you have to install it by your self.
			</p>
		</div>

		<div class="flex flex-col gap-4">
			<div class="rounded-2xl shadow-lg">
				<div class="flex items-center justify-between">
					<div class="flex flex-col py-2">
						<h3 class="text-lg font-semibold">Install zod</h3>
						<span class="text-muted-foreground text-sm"
							>requires zod version 3.25.74 at minimum</span
						>
					</div>
				</div>
				<div class="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">bun add zod</div>
			</div>
			<div class="rounded-2xl shadow-lg">
				<div class=" flex items-center justify-between">
					<h3 class="text-lg font-semibold">Install the package</h3>
				</div>
				<div class="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
					bun add svelte-common-hooks
				</div>
			</div>
		</div>
	</div>
</section>
