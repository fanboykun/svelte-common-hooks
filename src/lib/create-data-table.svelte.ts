/* eslint-disable @typescript-eslint/no-explicit-any */

type FilterFunction<T, A> = (item: T, args: A) => boolean;
type FilterArg<F> = F extends FilterFunction<any, infer A> ? A : never;

type Filter<T> = Record<string, (item: T, args: any) => boolean>;
type Sorting<T> = Record<string, (a: T, b: T, currentDir: 'asc' | 'desc') => number>;
type Query<T> = (param: QueryParam) => Promise<QueryResult<T>>;
type QueryResult<T> = { result: T[]; totalItems: number };
type QueryParam = {
	search: string;
	page: number;
};
/**
 * The client side configuration
 */
type ClientConfig<T> = {
	/**
	 * The initial data
	 */
	initial: T[];
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
	/**
	 * The total number of items if your mode is server or manual
	 */
	totalItems: number;
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
	 * The process function, this is where the data is fetched and processed by yourself
	 */
	processWith: () => Promise<void>;
	/**
	 * The total number of items if your mode is server or manual
	 */
	totalItems: number;
};
/**
 * The configuration for initiating the DataTable
 * @template T The type of the data
 * @template F The type of the filter
 * @template S The type of the sorting
 * @template Mode The mode of the DataTable
 */
export type Config<
	T,
	F extends Filter<T>,
	S extends Sorting<T>,
	Mode extends 'client' | 'server' | 'manual'
> = {
	/**
	 * The mode of the DataTable
	 */
	mode: Mode;
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
	 * The list of your filters
	 */
	filters?: F;
	/**
	 * The list of your sorting
	 */
	sorts?: S;
} & (Mode extends 'client'
	? ClientConfig<T>
	: Mode extends 'server'
		? ServerConfig<T>
		: Mode extends 'manual'
			? ManualConfig<T>
			: never);

/**
 * Creates a DataTable instance.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * 	import { createDataTable } from 'svelte-common-hooks';
 * 	const dataTable = createDataTable({
 * 		mode: 'client',
 * 		perPage: 10,
 * 		initial: [],
 * 		filters: {},
 * 		sorts: {},
 * 	});
 * </script>
 * ```
 */
export function createDataTable<
	T extends Record<string, any>,
	F extends Filter<T>,
	S extends Sorting<T>,
	Mode extends 'client' | 'server' | 'manual',
	FilterKeys extends keyof F = keyof F,
	SortingKeys extends keyof S = keyof S
>(config: Config<T, F, S, Mode>) {
	return new DataTable<T, F, S, Mode, FilterKeys, SortingKeys>(config);
}

export class DataTable<
	T extends Record<string, any>,
	F extends Filter<T>,
	S extends Sorting<T>,
	Mode extends 'client' | 'server' | 'manual',
	FilterKeys extends keyof F = keyof F,
	SortingKeys extends keyof S = keyof S
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
	/**
	 * Keep the config as a class property for use later
	 */
	private config: Config<T, F, S, Mode>;
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
	#appliableFilter = $state<{ [K in keyof F]: FilterArg<F[K]> }>(
		{} as {
			[K in keyof F]: FilterArg<F[K]>;
		}
	);
	/**
	 * The filter that is currently pending to be applied
	 */
	#pendingFilter = $state(
		{} as {
			[K in keyof F]: FilterArg<F[K]>;
		}
	);
	/**
	 * The sorting that is currently applied, we keep track of the sorting to apply it to the data
	 */
	#appliableSort = $state<{ current: SortingKeys; dir: 'asc' | 'desc' }>(
		{} as {
			current: SortingKeys;
			dir: 'asc' | 'desc';
		}
	);
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

	constructor(config: Config<T, F, S, Mode>) {
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

		this.#perPage = config.perPage ?? 10;
		this.#totalItems =
			config.mode === 'client'
				? this.initial.length
				: 'totalItems' in config && config.totalItems
					? config.totalItems
					: this.initial.length;
		this.#search = config.search ?? '';
		this.#currentPage = config.page ?? 1;

		$effect(() => {
			if (this.config.mode === 'client' && this.#search) this.#currentPage = 1;
		});
		/**
		 * As soon as the component is mounted, we fetch the data from the server if the mode is server
		 */
		$effect(() => {
			if (config.mode === 'server' && this.queryFn) {
				this.queryFn({ page: this.#currentPage, search: this.#search }).then((result) => {
					this.#data = {
						length: result.totalItems,
						value: result.result
					};
				});
			}
		});
	}
	/**
	 * Whether any filter is applied
	 */
	public readonly isFilterApplied = $derived.by(() => {
		if (this.#search) return true;
		if (this.#appliableSort.current) return true;
		if (Object.keys(this.#appliableFilter ?? {}).length) return true;
		return false;
	});

	private timeout: number | null = null;
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
		if (this.config.mode !== 'client') return { result: value, totalItems: value.length };
		const result = value?.length
			? value
					.filter(
						(v) =>
							('searchWith' in this.config && this.config.searchWith
								? this.config.searchWith(v, this.#search)
								: true) &&
							Object.entries(this.#appliableFilter).every(([filterKey, args]) =>
								this.config.filters?.[filterKey]?.(v, args)
							)
					)
					.sort((a, b) => {
						if (!this.config.sorts || !this.#appliableSort.current) return 0;
						return (
							this.config.sorts[this.#appliableSort.current]?.(
								a,
								b,
								this.#appliableSort.dir ?? 'asc'
							) ?? 0
						);
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
	private readonly processUpdate = async () => {
		if (this.config.mode === 'manual' && 'processWith' in this.config && this.config.processWith)
			this.config.processWith();
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
	 * hydrate state on page invalidation
	 * only for client mode
	 * @param getters the state getters
	 * @returns this
	 */
	public hydrate(getters: () => T[]) {
		if (this.config.mode !== 'client') return this;
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
	 * Filter the data by the given defined filter from `config`
	 */
	public readonly filterBy = <K extends FilterKeys>(
		key: K,
		args: Parameters<F[K]>[1],
		immediate = false
	) => {
		if (immediate) this.#appliableFilter[key] = args;
		else this.#pendingFilter[key] = args;
		this.processUpdate();
	};

	/**
	 * Remove a filter from `pendingFilter`
	 * set `immediate` to true if you want to remove the filter from `appliableFilter` as well
	 */
	public readonly removeFilter = <K extends FilterKeys>(key: K, immediate = false) => {
		delete this.#pendingFilter[key];
		if (immediate) delete this.#appliableFilter[key];
		this.processUpdate();
	};

	/**
	 * Clear all filters from `pendingFilter` and `appliableFilter`
	 */
	public readonly clearFilters = () => {
		this.#appliableFilter = {} as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.#pendingFilter = {} as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.processUpdate();
	};

	/**
	 * Apply the pending filter to `appliableFilter`
	 */
	public readonly applyPendingFilter = () => {
		const snap = $state.snapshot(this.#pendingFilter) as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.#appliableFilter = {
			...snap
		};
		this.processUpdate();
	};

	/**
	 * Reset the data table, including `appliableFilter`, `appliableSort`, `currentPage`, `perPage`, `search` and re-process the data
	 */
	public readonly reset = () => {
		this.#appliableFilter = {} as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.#appliableSort = {} as {
			current: SortingKeys;
			dir: 'asc' | 'desc';
		};
		this.#currentPage = 1;
		this.#perPage = this.config.perPage ?? 10;
		this.#search = '';
		this.processUpdate();
	};

	/**
	 * Sort the data by the given defined sort from `config`
	 */
	public readonly sortBy = (col: SortingKeys, dir?: 'asc' | 'desc') => {
		const isTheSameColumn = this.#appliableSort.current === col;
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
			current: '' as SortingKeys,
			dir: 'desc'
		};
		this.processUpdate();
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
			? (Object.keys(this.config.sorts) as SortingKeys[])
			: ([] as SortingKeys[]);
	}
	/**
	 * @readonly pendingFilter
	 * get all of the `pendingFilter`
	 */
	get pendingFilter() {
		return this.#pendingFilter;
	}
	/**
	 * @readonly search
	 * if you want to set the value, use `setSearch`
	 */
	get search() {
		return this.#search;
	}
}
