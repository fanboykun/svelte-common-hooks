export type Filter<T, M extends Mode> = Record<
	string,
	M extends 'client' ? (item: T, args: any) => boolean : unknown
>;

type FilterFunction<T, A> = (item: T, args: A) => boolean;
type FilterArg<F, M extends Mode> = M extends 'client'
	? F extends FilterFunction<any, infer A>
		? A
		: never
	: F;

type AppliableFilter<M extends Mode, F extends Filter<any, M>> = {
	[K in keyof F]: FilterArg<F[K], M>;
};

export type Sorting<T, M extends Mode> = Record<
	string,
	M extends 'client'
		? (a: T, b: T, currentDir: 'asc' | 'desc' | undefined) => number
		: 'asc' | 'desc' | undefined
>;

type AppliableSort<M extends Mode, S extends Sorting<any, M>> = {
	current?: keyof S;
	dir?: 'asc' | 'desc';
};

export type Query<T> = () => Promise<QueryResult<T>>;
export type QueryResult<T> = { result: T[]; totalItems: number };

export type Mode = 'server' | 'client' | 'manual';

/**
 * The client side configuration
 */
type ClientConfig<T> = {
	/**
	 * The initial data
	 */
	initial: T[];
	/**
	 * The total number of items if your mode is server or manual
	 */
	totalItems?: number;
	/**
	 * The search function
	 */
	searchWith?: (item: T, query: string) => boolean;
};
/**
 * The server side configuration
 */
type ServerConfig<T> = {
	/**
	 * The query function, this is where the data is fetched from the server
	 */
	queryFn: Query<T>;
};
/**
 * The manual configuration
 */
type ManualConfig<T> = {
	/**
	 * The initial data
	 */
	initial: T[];
	/**
	 * The total number of items if your mode is server or manual
	 */
	totalItems: number;
	/**
	 * The process function, this is where the data is fetched and processed by yourself
	 */
	processWith: () => Promise<void>;
};
/**
 * The configuration for initiating the DataTable
 * @template T The type of the data
 * @template M The mode of the DataTable
 * @template F The type of the filter, depending on the `Mode`, the value might be different
 * @template S The type of the sorting
 */
export type Config<M extends Mode, T, F extends Filter<T, M>, S extends Sorting<T, M>> = {
	/**
	 * The mode of the DataTable
	 */
	mode: M;
	/**
	 * The number of items per page
	 */
	perPage?: number;
	/**
	 * The current page
	 */
	page?: number;
	/**
	 * The search query
	 */
	search?: string;
	/**
	 * The list of your sorting
	 */
	sorts?: S;
	/**
	 * The list of your filters, depending on the `Mode`, the value might be different
	 */
	filters?: F;
} & (M extends 'client'
	? ClientConfig<T>
	: M extends 'server'
		? ServerConfig<T>
		: M extends 'manual'
			? ManualConfig<T>
			: never);

/**
 * Creates a DataTable instance.
 *
 * @example
 * the code below shows the example of client `Mode`
 * ```svelte
 * <script lang="ts">
 * 	import { createDataTable } from 'svelte-common-hooks';
 * 	let { data } = $props();
 * 	const dataTable = createDataTable({
 * 		// depending of the mode, the config might be different, see `Config`
 * 		mode: 'client',
 * 		initial: data.users,
 * 		searchWith(item, query) {
 * 			return item.name.toLowerCase().includes(query.toLowerCase());
 * 		},
 * 		filters: {
 * 			isAdult: (item, args: boolean) => item.age >= 18 === args,
 * 			age: (item, args: number) => item.age === args
 * 		},
 * 		sorts: {
 * 			age: (a, b, dir) => (dir === 'asc' ? a.age - b.age : b.age - a.age),
 * 			name: (a, b, dir) =>
 * 				dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
 * 		}
 * 	});
 * </script>
 * ```
 */
export function createDataTable<
	M extends Mode,
	T extends Record<string, any>,
	F extends Filter<T, M>,
	S extends Sorting<T, M>
>(config: Config<M, T, F, S>) {
	return new DataTable<M, T, F, S>(config);
}

export class DataTable<
	M extends Mode,
	T extends Record<string, any>,
	F extends Filter<T, M>,
	S extends Sorting<T, M>
> {
	/**
	 * we do this to avoid reprocessing the initial data
	 * it should be done once in the server or when the component is initialized
	 * not in hydration process
	 */
	private hydrated = false;

	/**
	 * We keep track of the initial as a state
	 */
	private initial = $state<T[]>([]);
	// private initial = $state<Result[]>([]);
	/**
	 * Keep the config as a class property for use later
	 */
	private config: Config<M, T, F, S>;
	/**
	 * Only available on server mode
	 * This is where the data is fetched from the server
	 */
	private queryFn?: Query<T>;

	/**
	 * The processed data
	 */
	#data = $derived.by(() => {
		const processed = $state(this.process(this.initial));
		return {
			get length() {
				return processed.totalItems;
			},
			set length(newValue) {
				processed.totalItems = newValue;
			},
			get value() {
				return processed.result;
			},
			set value(newValue) {
				processed.result = newValue;
			}
		};
	});

	/**
	 * The filter that is currently applied, we keep track of the filter to apply it to the data
	 */
	#appliableFilter = $state<AppliableFilter<M, F>>({} as AppliableFilter<M, F>);
	/**
	 * The filter that is currently pending to be applied
	 */
	#pendingFilter = $state({} as AppliableFilter<M, F>);
	/**
	 * The sorting that is currently applied, we keep track of the sorting to apply it to the data
	 */
	#appliableSort = $state<AppliableSort<M, S>>({
		current: undefined,
		dir: undefined
	} as AppliableSort<M, S>);
	/**
	 * The number of items per page
	 */
	#perPage = $state(10);
	/**
	 * The current page
	 */
	#currentPage = $state(1);
	/**
	 * The total number of items
	 */
	#totalItems = $derived(this.#data.length);
	/**
	 * The total number of pages
	 */
	#totalPage = $derived(Math.ceil(this.#totalItems / this.#perPage));
	/**
	 * The list of pages
	 */
	#pageList = $derived(Array.from({ length: this.#totalPage }, (_, i) => i + 1));
	/**
	 * Whether we can go to the next page
	 */
	#canGoNext = $derived(this.#currentPage < this.#totalPage && this.#totalItems > 0);
	/**
	 * Whether we can go to the previous page
	 */
	#canGoPrevious = $derived(this.#currentPage > 1 && this.#totalItems > 0);
	/**
	 * The number of items showing from
	 */
	#showingFrom = $derived((this.#currentPage - 1) * this.#perPage + 1);
	/**
	 * The number of items showing to
	 */
	#showingTo = $derived(Math.min(this.#currentPage * this.#perPage, this.#totalItems));
	/**
	 * The search query
	 */
	#search = $state<string>('');

	/**
	 * Processing State, only available on `server` and `manual` mode
	 */
	#processing = $state(false);

	constructor(config: Config<M, T, F, S>) {
		if (config.mode === 'server' && 'queryFn' in config && config.queryFn) {
			this.queryFn = config.queryFn;
		} else if (
			(config.mode === 'manual' || config.mode === 'client') &&
			'initial' in config &&
			config.initial
		) {
			this.initial = config.initial;
		}

		this.config = { ...config };
		// free memory
		if ('initial' in this.config) {
			this.config.initial = [];
		}

		this.#perPage = config.perPage ?? 10; // apply initial per page
		this.#totalItems =
			config.mode === 'client'
				? this.initial.length
				: 'totalItems' in config && config.totalItems
					? config.totalItems
					: this.initial.length; // apply initial totalItems
		this.#search = config.search ?? ''; // apply initial search
		this.#currentPage = config.page ?? 1; // apply initial page
		if (config.mode === 'manual' || config.mode === 'server') {
			// apply initial filter
			const currentFilter = Object.entries(config.filters ?? {});
			currentFilter?.forEach(([k, v]) => {
				if (typeof config.filters?.[k] === 'function') return;
				if (v === undefined || v === null) return;
				const snap = $state.snapshot(this.#pendingFilter) as AppliableFilter<M, F>;
				if (v !== undefined || v !== null) {
					this.#pendingFilter = {
						...snap,
						[k]: v
					};
				}
			});
			this.#appliableFilter = this.#pendingFilter;

			// apply initial sorts
			const currentSort = Object.entries(config.sorts ?? {});
			currentSort?.forEach(([key, value]) => {
				if (typeof config.sorts?.[key] === 'function') return;
				if (this.#appliableSort.current && this.#appliableSort.dir) return;
				if (key && value) {
					this.#appliableSort = {
						current: key,
						dir: value as 'asc' | 'desc' | undefined
					};
				}
			});
		}

		// reset the current page when search is not empty on client mode
		$effect(() => {
			if (this.mode === 'client' && this.#search) this.#currentPage = 1;
		});
		/**
		 * As soon as the component is mounted, we fetch the data from the server if the mode is server
		 */
		$effect(() => {
			if (config.mode === 'server' && this.queryFn) {
				this.queryFn()?.then?.((result) => {
					if (result && 'result' in result && 'totalItems' in result) {
						this.updateDataAndTotalItems(result.result, result.totalItems);
					}
				});
			}
		});
	}

	public readonly getFilterValue = <K extends keyof F, DefaultValue = any>(
		key: K,
		args: { by?: 'pending' | 'applied' | 'both'; defaultValue?: DefaultValue }
	) => {
		return args.by === 'pending'
			? (this.#pendingFilter[key] ?? args.defaultValue)
			: args.by === 'applied'
				? (this.#appliableFilter[key] ?? args.defaultValue)
				: (this.#pendingFilter[key] ?? this.#appliableFilter[key] ?? args.defaultValue);
	};

	/**
	 * Whether any interaction happened
	 */
	public readonly hasInteracted = $derived.by(() => {
		if (this.#search) return true;
		if (this.#appliableSort.current) return true;
		if (Object.keys(this.#appliableFilter ?? {}).length) return true;
		return false;
	});

	/**
	 * Update the data and total items, should only be used in manual `Mode`
	 * @param data the new data
	 * @param totalItems the new total items
	 */
	public readonly updateDataAndTotalItems = (data: T[], totalItems: number) => {
		this.#data.value = data;
		this.#totalItems = totalItems;
	};

	private timeout: NodeJS.Timeout | null = null;
	/**
	 * Set the search query, and delay the process update
	 */
	public readonly setSearch = (value: string, delay = 0) => {
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.#search = value;
			this.#currentPage = 1;
			this.processUpdate();
		}, delay);
	};

	/**
	 * Client side data processing
	 */
	private process(value: T[]) {
		if (this.mode !== 'client') return { result: value, totalItems: value.length };
		const result = value?.length
			? value
					.filter(
						(v) =>
							('searchWith' in this.config && this.config.searchWith
								? this.config.searchWith(v, this.#search)
								: true) &&
							Object.entries(this.#appliableFilter).every(([filterKey, args]) =>
								typeof this.config.filters?.[filterKey] === 'function'
									? this.config.filters?.[filterKey]?.(v, args)
									: true
							)
					)
					.sort((a, b) => {
						if (!this.config.sorts || !this.#appliableSort.current || this.mode !== 'client')
							return 0;
						const sortFn = this.config?.sorts?.[this.#appliableSort.current];
						if (typeof sortFn === 'function') return sortFn(a, b, this.#appliableSort.dir);
						return 0;
					})
			: [];
		return {
			result:
				result.length > this.#perPage
					? result.slice((this.#currentPage - 1) * this.#perPage, this.#currentPage * this.#perPage)
					: result,
			totalItems: result.length
		};
	}

	/**
	 * Manual mode processing
	 */
	private readonly processUpdate = () => {
		if (
			this.mode === 'manual' &&
			'processWith' in this.config &&
			typeof this.config.processWith === 'function'
		) {
			this.#processing = true;
			this.config.processWith?.()?.then(() => (this.#processing = false));
		}
	};

	/**
	 * Go to the next page
	 */
	public readonly nextPage = () => {
		if (!this.#canGoNext) return;
		this.#currentPage = this.#currentPage + 1;
		this.processUpdate();
	};

	/**
	 * Go to the previous page
	 */
	public readonly previousPage = () => {
		if (!this.#canGoPrevious) return;
		this.#currentPage = this.#currentPage - 1;
		this.processUpdate();
	};

	/**
	 * Go to a specific page
	 */
	public readonly gotoPage = (page: number) => {
		if (page >= this.#totalPage || page <= 1 || page === this.#currentPage) return;
		this.#currentPage = page;
		this.processUpdate();
	};

	/**
	 * Set the number of items per page
	 */
	public readonly setPerPage = (newPerPage: number) => {
		this.#perPage = newPerPage;
		this.#currentPage = 1;
		this.processUpdate();
	};

	/**
	 * @deprecated use `effect` instead
	 * hydrate state on page invalidation
	 * only for client mode
	 * @param getters the state getters
	 * @returns this
	 * @example
	 * ```svelte
	 * <script lang="ts">
	 * 	const dataTable = createDataTable({
	 * 		mode: 'client',
	 * 		initial: [],
	 * 		searchWith(item, query) {
	 * 			return item.name.toLowerCase().includes(query.toLowerCase());
	 * 		},
	 * 		filters: {
	 * 			isAdult: (item, args: boolean) => item.age >= 18 === args,
	 * 			age: (item, args: number) => item.age === args
	 * 		},
	 * 		sorts: {
	 * 			age: (a, b, dir) => (dir === 'asc' ? a.age - b.age : b.age - a.age),
	 * 			name: (a, b, dir) =>
	 * 				dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
	 * 		}
	 * 	}).hydrate(() => data.users);
	 *
	 * </script>
	 * ```
	 */
	public hydrate(getters: () => T[]) {
		if (this.mode !== 'client') return this;
		$effect(() => {
			// i am really sorry for this garbage
			const next = getters();
			if (this.hydrated) {
				this.initial = next;
			} else {
				this.hydrated = true;
			}
		});
		return this;
	}

	/**
	 * @deprecated use `effect` instead
	 * Sometimes you want to invalidate the data on a side effect.
	 * and you have to wrap the creation inside of `$derived` block.
	 * or you do the side effect inside of `$effect` block.
	 * this method provide you just that to avoid that ugliness.
	 * this method only available on `server` and `manual` mode
	 * @param dependencies
	 * @param invalidation
	 * @returns
	 */
	public invalidate(dependencies: () => any, invalidation: (instance: this) => void) {
		if (this.mode !== 'manual' && this.mode !== 'server') return this;
		$effect(() => {
			// i am really sorry for this garbage
			dependencies();
			if (this.hydrated) {
				invalidation(this);
			} else {
				this.hydrated = true;
			}
		});
		return this;
	}

	/**
	 * Sometimes you want to invalidate the data on a side effect.
	 * and you have to wrap the creation inside of `$derived` block.
	 * or you do the side effect inside of `$effect` block.
	 * this method provide you just that to avoid that ugliness.
	 * this method only available on `server` and `manual` mode
	 * @param dependencies
	 * @param invalidation
	 * @returns
	 */
	public effect<T>(
		dependencies: () => T,
		invalidation: (instance: typeof this, deps: T) => (() => any) | void
	) {
		$effect(() => {
			// i am really sorry for this garbage
			const deps = dependencies();
			let cleanup: (() => any) | void;
			if (this.hydrated) {
				cleanup = invalidation(this, deps);
			} else {
				this.hydrated = true;
			}
			return () => {
				if (typeof cleanup === 'function') return cleanup();
			};
		});
		return this;
	}

	/**
	 * Filter the data by the given defined filter from `config`
	 */
	public readonly filterBy = <K extends keyof F>(
		key: K,
		args: FilterArg<F[K], M>,
		config?: { immediate?: boolean; resetPage?: boolean; resetSearch?: boolean }
	) => {
		config = {
			immediate: false,
			resetPage: false,
			resetSearch: false,
			...config
		};
		if (typeof this.config.filters === 'undefined') return;
		this.#pendingFilter[key] = args;
		if (config.immediate === true) this.#appliableFilter[key] = args;
		if (config.resetPage === true) this.#currentPage = 1;
		if (config.resetSearch === true) this.#search = '';
		if (config.immediate === true) this.processUpdate();
	};

	/**
	 * Remove a filter from `pendingFilter`
	 * set `immediate` to true if you want to remove the filter from `appliableFilter` as well
	 */
	public readonly removeFilter = <K extends keyof F>(key: K, immediate = false) => {
		delete this.#pendingFilter[key];
		if (immediate === true) {
			delete this.#appliableFilter[key];
			this.processUpdate();
		}
	};

	/**
	 * Clear all filters from `pendingFilter` and `appliableFilter`
	 */
	public readonly clearFilters = () => {
		this.#appliableFilter = {} as AppliableFilter<M, F>;
		this.#pendingFilter = {} as AppliableFilter<M, F>;
		this.processUpdate();
	};

	/**
	 * Apply the pending filter to `appliableFilter`
	 */
	public readonly applyPendingFilter = () => {
		const snap = $state.snapshot(this.#pendingFilter);
		this.#appliableFilter = snap as AppliableFilter<M, F>;
		this.processUpdate();
	};

	/**
	 * Reset the data table, including `appliableFilter`, `appliableSort`, `currentPage`, `perPage`, `search` and re-process the data
	 */
	public readonly reset = () => {
		this.#appliableFilter = {} as AppliableFilter<M, F>;
		this.#appliableSort = {
			current: undefined,
			dir: undefined
		} as AppliableSort<M, S>;
		this.#currentPage = 1;
		this.#perPage = this.config.perPage ?? 10;
		this.#search = '';
		this.processUpdate();
	};

	/**
	 * Sort the data by the given defined sort from `config`
	 */
	public readonly sortBy = (col: keyof S, dir?: 'asc' | 'desc') => {
		const isTheSameColumn = this.#appliableSort.current === col;
		if (isTheSameColumn && dir === this.#appliableSort.dir) return;
		this.#appliableSort = {
			current: col,
			dir: dir ?? (isTheSameColumn ? (this.#appliableSort.dir === 'asc' ? 'desc' : 'asc') : 'asc')
		};
		this.processUpdate();
	};

	/**
	 * Remove the sort from `appliableSort`
	 */
	public readonly removeSort = () => {
		this.#appliableSort = {
			current: undefined,
			dir: undefined
		} as AppliableSort<M, S>;
		this.processUpdate();
	};

	/**
	 * Get all of the state used for fetching data
	 */
	public readonly getConfig = () => {
		return {
			search: $state.snapshot(this.#search),
			page: $state.snapshot(this.#currentPage),
			limit: $state.snapshot(this.#perPage),
			filter: $state.snapshot(this.#appliableFilter),
			sort: $state.snapshot(this.#appliableSort)
		};
	};

	/**
	 * @readonly data
	 * get the processed data
	 */
	get data() {
		return this.#data.value;
	}
	/**
	 * @readonly perPage
	 * get the number of items per page
	 */
	get perPage() {
		return this.#perPage;
	}
	/**
	 * @readonly currentPage
	 * get the current page
	 */
	get currentPage() {
		return this.#currentPage;
	}
	/**
	 * @readonly totalItems
	 * get the total number of items
	 */
	get totalItems() {
		return this.#totalItems;
	}
	/**
	 * @readonly totalPage
	 * get the total number of pages
	 */
	get totalPage() {
		return this.#totalPage;
	}
	/**
	 * @readonly pageList
	 * get the list of pages
	 */
	get pageList() {
		return this.#pageList;
	}
	/**
	 * @readonly canGoNext
	 * whether we can go to the next page
	 */
	get canGoNext() {
		return this.#canGoNext;
	}
	/**
	 * @readonly canGoPrevious
	 * whether we can go to the previous page
	 */
	get canGoPrevious() {
		return this.#canGoPrevious;
	}
	/**
	 * @readonly showingFrom
	 * get the number of items showing from
	 */
	get showingFrom() {
		return this.#showingFrom;
	}
	/**
	 * @readonly showingTo
	 * get the number of items showing to
	 */
	get showingTo() {
		return this.#showingTo;
	}
	/**
	 * @readonly appliableFilter
	 * get all applied filter
	 */
	get appliableFilter() {
		return this.#appliableFilter;
	}
	/**
	 * @readonly appliableSort
	 * get all applied sort
	 */
	get appliableSort() {
		return this.#appliableSort;
	}
	/**
	 * @readonly sortKeys
	 * get all the keys from `config.sorts`
	 */
	get sortKeys() {
		return this.config.sorts
			? (Object.keys(this.config.sorts) as (keyof S)[])
			: ([] as (keyof S)[]);
	}
	/**
	 * @readonly pendingFilter
	 * get all of the `pendingFilter`
	 */
	get pendingFilter() {
		return this.#pendingFilter;
	}
	/**
	 * search value
	 */
	get search() {
		return this.#search;
	}
	/**
	 * set the search value
	 */
	set search(value: string) {
		this.#search = value;
	}
	/**
	 * @readonly mode
	 * get the mode of the DataTable
	 */
	get mode() {
		return this.config.mode;
	}
	/**
	 * @readonly processing
	 * get the processing state
	 */
	get processing() {
		return this.#processing;
	}
}
