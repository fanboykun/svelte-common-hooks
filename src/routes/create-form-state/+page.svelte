<script lang="ts">
	import { createAttribute, createFormState } from '$lib/index.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { z } from 'zod/v4';

	/**
	 * here we create a form state, the form state will validate the form on input and blur
	 * the form state will return an object that contains the value, attribute, result, addErrors, setValue, validate, validateAll
	 * you might also wrap it in a $derived() runes if the initial value is dynamic
	 */
	const formState = createFormState({
		/**
		 * The schema thats use to validate the form.
		 * the schema is required
		 */
		schema: z.object({
			name: z.string().min(1),
			email: z.email(),
			age: z.number().min(18)
		}),
		/**
		 * The initial value of the form (optional).
		 */
		initial: {
			name: 'John Doe',
			email: 'john.doe@example.com',
			age: 18,
			customProperty: 'the property that is not exist in the schema is allowed but ignored'
		},
		/**
		 * Optionally append more attribute to the form field.
		 */
		attribute: {
			email: createAttribute<HTMLInputAttributes>({
				type: 'email',
				required: true
			})
		}
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const result = formState.validateAll();
		if (!result.success) {
			return alert('Invalid');
		}
		console.log(result.data);
	}
</script>

<form action="" method="post" onsubmit={handleSubmit}>
	<div>
		<label for="name">Name</label>
		<input bind:value={formState.value.name} {...formState.attribute.name} />
		{#if formState.result.name.errors.length}
			{#each formState.result.name.errors as error (error)}
				<span>{error}</span>
			{/each}
		{/if}
	</div>
	<div>
		<label for="email">Email</label>
		<input bind:value={formState.value.email} {...formState.attribute.email} />
		{#if formState.result.email.errors.length}
			{#each formState.result.email.errors as error (error)}
				<span>{error}</span>
			{/each}
		{/if}
	</div>
	<div>
		<label for="age">Age</label>
		<input bind:value={formState.value.age} {...formState.attribute.age} />
		{#if formState.result.age.errors.length}
			{#each formState.result.age.errors as error (error)}
				<span>{error}</span>
			{/each}
		{/if}
	</div>
</form>
