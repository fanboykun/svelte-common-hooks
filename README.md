# svelte-common-hooks

A collection of Svelte custom hooks that I commonly use across projects.

## 🛠️ Required Dependencies

This package only run for sveltekit projects, it requires the following dependencies to be installed in your project:

- `svelte version 5 or latest`
- `@sveltejs/kit latest version`
- `zod/v4`

## 📦 Installation

We have to install zod first

```bash
bun add zod
```

Then we can install this package by executing following command

```bash
bun add svelte-common-hooks
# or
npm install svelte-common-hooks
# or
pnpm add svelte-common-hooks
# or
yarn add svelte-common-hooks
```

## 📚 Available Hooks

- [createDataTable](#createDataTable)
- [createModalState](#createModalState)
- [createFormState](#createFormState)

## 🚀 Usage

### `createDataTable`

- [Source](./src/lib/create-modal-state.svelte.ts)

This is a custom hook for creating data table utilities, it is used to create a data table with pagination, search, and sorting. data fetching can be configured via `Mode`, it can be done in client `Mode`, server `Mode`, or manually make a logic for data fetching via manual `Mode`.

#### Client Mode Example:

- [Source](./src/routes/create-data-table/client/+page.svelte)

#### Server Mode Example:

- [Source](./src/routes/create-data-table/server/+page.svelte)

#### Manual Mode Example:

- [Source](./src/routes/create-data-table/manual/+page.svelte)

### `createFormState`

- [Source](./src/lib/create-form-state.svelte.ts)

**This hooks relies on zod/v4 for validation, so make sure you already installed zod/v4**

this hook is used to create a form state, it will validate the form state on input and blur.

```svelte
<script lang="ts">
	import { createAttribute, createFormState } from 'svelte-common-hooks';
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
			{#each formState.result.name.errors as error}
				<span>{error}</span>
			{/each}
		{/if}
	</div>
	<div>
		<label for="email">Email</label>
		<input bind:value={formState.value.email} {...formState.attribute.email} />
		{#if formState.result.email.errors.length}
			{#each formState.result.email.errors as error}
				<span>{error}</span>
			{/each}
		{/if}
	</div>
	<div>
		<label for="age">Age</label>
		<input bind:value={formState.value.age} {...formState.attribute.age} />
		{#if formState.result.age.errors.length}
			{#each formState.result.age.errors as error}
				<span>{error}</span>
			{/each}
		{/if}
	</div>
</form>
```

---

### `createModalState`

- [Source](./src/lib/create-modal-state.svelte.ts)

- Creates a state manager for multiple modals by pushing state on the page.
- It would close the modal with navigate back gestures on mobile.
- It will return an object that contains the list, open, close

```svelte
<script lang="ts">
	import { createModalState } from 'svelte-common-hooks';
	import DialogComponent from './DialogComponent.svelte';
	const modals = createModalState('example');
	let selectedNumber = $state<number>();
</script>

// DialogComponent.svelte
<button onclick={() => modals.open('example', () => (selectedNumber = 2))}>Open Modal 2</button>
{#if modals.list.example}
	<div>
		<h1>Modal 2</h1>
		<button onclick={() => modals.close('example')}>Close</button>
		<!-- or -->
		<button onclick={() => (modals.list.example = false)}>Close</button>
	</div>
{/if}
```

- We could also bind the state inside the `list` since the `list` it self is a state.
- This is how i usually use it with [shadcn/svelte dialog](https://shadcn-svelte.com/docs/components/dialog)

_+page.svelte_

```svelte
<script lang="ts">
	import { createModalState } from '$lib/index.svelte';
	import DialogComponent from './DialogComponent.svelte';
	const modals = createModalState('delete');
	let selectedId = $state<number>();
</script>

<DialogComponent bind:open={modals.list.delete} {selectedId} />
<button onclick={() => modals.open('delete', () => (selectedId = 1))}>Delete</button>
```

_DialogComponent.svelte_

```svelte
<script lang="ts">
	let { open = $bindable(false), selectedId }: { open?: boolean; selectedId?: number } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Dialog.Description>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
```

## 📝 License

Free for personal and non-commercial use.
Commercial use requires a separate commercial license.
See [LICENSE](./LICENSE.md) for details.

For commercial licensing inquiries, contact: \[[joyykun@gmail.com](mailto:joyykun@gmail.com)]
