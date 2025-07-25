# svelte-common-hooks

A collection of Svelte custom hooks that I commonly use across projects.
<a href="https://svelte-common-hooks.vercel.app/">Documentation</a>

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

- [Source](./src/lib/create-data-table.svelte.ts)

This is a custom hook for creating data table utilities, it is used to create a data table with pagination, search, and sorting. data fetching can be configured via `Mode`, it can be done in client `Mode`, server `Mode`, or manually make a logic for data fetching via manual `Mode`.

#### Client Mode Example:

In client mode, you should define your own function to search data, filter and sorting

- [Source](./src/routes/create-data-table/client/+page.svelte)

**_+page.svelte_**

```svelte
<script lang="ts">
	import { createDataTable } from 'svelte-common-hooks';

	let { data } = $props();

	/**
	 * Here we initialize the data table with `client` mode, we will manually handle the data fetching.
	 * All of the processing such as filtering, searching, sorting, and pagination will be done client side.
	 * The data is `SSR` ed
	 */
	const dataTable = createDataTable({
		/**
		 * The mode of the data table.
		 */
		mode: 'client',
		/**
		 * The data that will be processed
		 */
		initial: data.users,
		/**
		 * Pass your own function for handle data searching
		 */
		searchWith(item, query) {
			return item.name.toLowerCase().includes(query.toLowerCase());
		},
		/**
		 * You can use your own logic and pass the function for handle data filtering.
		 * This library handle data filtering by doing `Array.filter()` function,
		 * so your function must return `boolean`
		 */
		filters: {
			isAdult: (item, args: boolean | undefined) =>
				typeof args === 'undefined' ? true : item.age >= 18 === args
		},
		/**
		 * You can use your own logic and pass the function for handle data sorting.
		 * This library handle data sorting by doing `Array.sort()` function,
		 * so your function must return `number`
		 */
		sorts: {
			createdAt: (a, b, dir) =>
				dir === 'asc'
					? a.createdAt.getTime() - b.createdAt.getTime()
					: b.createdAt.getTime() - a.createdAt.getTime()
		}
	}).hydrate(() => data.users); // hydrate the data in case the page is invalidated, or you could wrap the dataTable inside `$derived` block
</script>
```

**_+page.server.ts_**

```ts
import type { PageServerLoad } from './$types.js';
// mock database query
import { getAllUser } from '../(data)/users.js';

export const load: PageServerLoad = async () => {
	return {
		users: getAllUser()
	};
};
```

#### Server Mode Example:

- [Source](./src/routes/create-data-table/server/+page.svelte)

**_+page.svelte_**

```svelte
<script lang="ts">
	import { page } from '$app/state';
	import { createDataTable, type QueryResult } from 'svelte-common-hooks';
	// see pagination-schema.ts for more info
	import { setPaginationConfig } from '../(schema)/pagination-schema.js';
	import type { User } from '../(data)/users.js';

	const fetchUser = async (url: URL): Promise<QueryResult<User>> => {
		try {
			url ??= new URL($state.snapshot(page.url));
			const response = await fetch(url);
			const data = await response.json();
			if (!response.ok) throw new Error(data);
			if (typeof data === 'object' && 'users' in data && 'totalItems' in data) {
				return { result: data.users, totalItems: data.totalItems };
			}
			return {
				result: [],
				totalItems: 0
			};
		} catch (error) {
			console.error('failed to fetch user', error);
			return {
				result: [],
				totalItems: 0
			};
		}
	};

	/**
	 * Initialize the data table with `server` mode,
	 * we pass the filters and sorts that we want to use,
	 * and the `queryFn` function that will be used to fetch the data.
	 * this mode is not `SSR` able since `$effect` block only runs on client
	 */
	const dataTable = createDataTable({
		mode: 'server',
		/**
		 * we pass the placeholder for the filter,
		 * it is helping us by providing strong typing to do `filterBy` later
		 */
		filters: {
			isAdult: undefined as boolean | undefined
		},
		/**
		 * we pass the placeholder for the sort,
		 * it is helping us by providing strong typing to do `sortBy` later
		 */
		sorts: {
			createdAt: 'desc' as 'asc' | 'desc'
		},
		/**
		 * The query function, this is where the data is fetched from the server.
		 * Make sure to type the return type so that the data table can infer it.
		 * Make sure to read the config from `dataTable.getConfig()` method,
		 * so that it will trigger side effect when the state changes
		 */
		queryFn: async (): Promise<QueryResult<User>> => {
			// if you want this function to rerun, read the config from `dataTable.getConfig()` method
			const config = dataTable.getConfig();
			// we create a new url to send to the server with the config in the searchParam
			const url = setPaginationConfig(new URL(page.url), {
				isAdult: config.filter.isAdult,
				page: config.page,
				search: config.search,
				sort: config.sort.current && config.sort.dir ? config.sort.dir : null,
				limit: config.limit
			});
			// finally, we fetch the data from the server with the updated config
			return await fetchUser(url);
		}
	});
</script>
```

**_+server.ts_**

```ts
import type { RequestHandler } from './$types.js';
// see pagination-schema.ts for more info
import { getPaginationConfig } from '../(schema)/pagination-schema.js';
// mock database qery
import { getUser } from '../(data)/users.js';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = (event) => {
	const config = getPaginationConfig(event.url.searchParams);
	const { users, totalItems } = getUser(config);
	return json({
		users,
		totalItems
	});
};
```

#### Manual Mode Example:

- [Source](./src/routes/create-data-table/manual/+page.svelte)

**_+page.svelte_**

```svelte
<script lang="ts">
	import { createDataTable } from '$lib/index.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	// utils for transforming value from page.url.searchParams
	import { stringToBoolean, stringToEnum, stringToNumber } from '../(utils)/utils.js';
	// see pagination-schema.ts for more info
	import { setPaginationConfig } from '../(schema)/pagination-schema.js';
	let { data } = $props();

	/**
	 * Here we initialize the data table with `manual` mode, we will manually handle the data fetching.
	 * we put all of the state like pagination, search, filters, and sorts from the url search params.
	 * Then we use `goto` from sveltekit to force the `load` function to rerun,
	 * and returning the updated data with the config in the `searchParams`.
	 * since we working with the `load` function, this will be `SSR`ed.
	 */
	const dataTable = createDataTable({
		/**
		 * we use `manual` mode, this mode will not do the filter, pagination, search and sort in the client side,
		 * It is encouraging you to move it to the server instead inside `load` function and store the state in the search params.
		 */
		mode: 'manual',
		/**
		 * we pass the paginated/sliced data here
		 */
		initial: data.users,
		/**
		 * we pass the unpaginated/unsliced data so then we know is the data have another page
		 * see how i implemented it in +page.server.ts
		 */
		totalItems: data.totalItems,
		/**
		 * we pass the current page number that we got from url search params,
		 * we do this so that when the user refresh on the url that has page in the search params,
		 * the data table will also be on the same page
		 */
		page: stringToNumber(page.url.searchParams.get('page'), 1),
		/**
		 * we pass the search query that we got from url search params,
		 * we do this so that when the user refresh on the url that has search in the search params,
		 * the data table will also be on the same search query
		 */
		search: page.url.searchParams.get('search') ?? '',
		/**
		 * we pass the filters that we got from url search params,
		 * we do this so that when the user refresh on the url that has filter in the search params,
		 * the data table will also be on the same filter.
		 *
		 * In `manual` mode, the filter object accept Record<string, unknown> type.
		 * It is helping us by providing strong typing to do `filterBy` later
		 */
		filters: {
			isAdult: stringToBoolean(page.url.searchParams.get('isAdult'), undefined)
		},
		/**
		 * we pass the sorts that we got from url search params,
		 * we do this so that when the user refresh on the url that has sort in the search params,
		 * the data table will also be on the same sort.
		 *
		 * In `manual` mode, the sort object accept Record<string, unknown> type.
		 * It is helping us by providing strong typing to do `sortBy` later
		 */
		sorts: {
			createdAt: stringToEnum(page.url.searchParams.get('sort'), ['asc', 'desc'] as const, 'desc')
		},
		/**
		 * In `manual` mode, we get our data with `processWith` function.
		 * We get the state from the dataTable and store it in the url search params
		 * so that our load function can read them and return the updated data
		 */
		processWith: async () => {
			// get the snapshotted config to send to the server
			const config = dataTable.getConfig();
			// create a new url to send to the server with the config in the searchParam
			const url = setPaginationConfig(new URL($state.snapshot(page.url)), {
				isAdult: config.filter.isAdult,
				page: config.page,
				search: config.search,
				sort: config.sort.current && config.sort.dir ? config.sort.dir : null,
				limit: config.limit
			});

			// here we force the `load` function to rerun and sending the updated config in the url object
			await goto(url, {
				// keep the focus in case the user is typing on the search bar
				keepFocus: true,
				// invalidate the `users:manual` load function so that it will rerun
				invalidate: ['users:manual'],
				// prevent the page from scrolling to the top
				noScroll: true
			});

			// we then finally can updated the data and totalItems returning from the `load` function here
			dataTable.updateDataAndTotalItems(data.users, data.totalItems);
		}
	}).effect(
		() => data,
		(instance) => {
			instance.updateDataAndTotalItems(data.users, data.totalItems);
		}
	);
</script>
```

**_+page.server.ts_**

```ts
import type { PageServerLoad } from './$types.js';
import { getUser } from '../(data)/users.js';
import { getPaginationConfig } from '../(schema)/pagination-schema.js';

export const load: PageServerLoad = async ({ url, depends }) => {
	depends('users:manual');
	const config = getPaginationConfig(url.searchParams);
	const { users, totalItems } = getUser(config);
	return {
		users,
		totalItems
	};
};
```

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
			email: createAttribute<HTMLInputAttributes>({
				type: 'email',
				required: true
			}),
			age: createAttribute<HTMLInputAttributes>({
				type: 'number',
				required: true,
				min: 18
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
