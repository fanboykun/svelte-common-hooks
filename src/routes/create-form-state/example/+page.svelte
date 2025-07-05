<script lang="ts">
	import { createAttribute, createFormState } from '$lib/index.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { z } from 'zod/v4';
	import { Button } from '@/components/ui/button/index.js';
	import { Label } from '@/components/ui/label/index.js';
	import { Input } from '@/components/ui/input/index.js';
	import * as Card from '@/components/ui/card/index.js';
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
			age: z.coerce.number().min(18)
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
			name: createAttribute<HTMLInputAttributes>({
				placeholder: 'Your name'
			}),
			email: createAttribute<HTMLInputAttributes>({
				type: 'email',
				required: true,
				placeholder: 'email@example.com'
			}),
			age: createAttribute<HTMLInputAttributes>({
				type: 'number',
				required: true,
				min: 18,
				placeholder: 'Your age'
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

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title>Form Example</Card.Title>
		<Card.Description>Every input will be validated on input and blur</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit}>
			<div class="flex flex-col gap-6">
				<div class="grid gap-2">
					<Label for="name">Name</Label>
					<Input {...formState.attribute.name} />
					{#if formState.result.name.errors}
						{#each formState.result.name.errors as error (error)}
							<span class="text-destructive text-sm">{error}</span>
						{/each}
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input {...formState.attribute.email} />
					{#if formState.result.email.errors}
						{#each formState.result.email.errors as error (error)}
							<span class="text-destructive text-sm">{error}</span>
						{/each}
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="age">Age</Label>
					<Input {...formState.attribute.age} />
					{#if formState.result.age.errors}
						{#each formState.result.age.errors as error (error)}
							<span class="text-destructive text-sm">{error}</span>
						{/each}
					{/if}
				</div>
			</div>
		</form>
	</Card.Content>
	<Card.Footer class="flex-col gap-2">
		<Button type="submit" class="w-full">Submit</Button>
	</Card.Footer>
</Card.Root>
