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
type ClientConfig<T> = {
	initial: T[];
	searchWith?: (item: T, query: string) => boolean;
};
type ServerConfig<T> = {
	queryFn: Query<T>;
};
type ManualConfig<T> = {
	initial: T[];
	processWith?: () => Promise<void>;
};
export type Config<
	T,
	F extends Filter<T>,
	S extends Sorting<T>,
	Mode extends 'client' | 'server' | 'manual'
> = {
	mode: Mode;
	perPage: number;
	page?: number;
	search?: string;
	totalItems?: number;
	filters?: F;
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

	// private initial: T[] = [];
	private initial = $state<T[]>([]);
	private config: Config<T, F, S, Mode>;
	private queryFn?: Query<T>;

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

	#appliableFilter = $state<{ [K in keyof F]: FilterArg<F[K]> }>(
		{} as {
			[K in keyof F]: FilterArg<F[K]>;
		}
	);
	#pendingFilter = $state(
		{} as {
			[K in keyof F]: FilterArg<F[K]>;
		}
	);
	#appliableSort = $state<{ current: SortingKeys; dir: 'asc' | 'desc' }>(
		{} as {
			current: SortingKeys;
			dir: 'asc' | 'desc';
		}
	);
	#perPage = $state(10);
	#currentPage = $state(1);
	#totalItems = $derived(this.#data.length);
	#totalPage = $derived(Math.ceil(this.#totalItems / this.#perPage));
	#pageList = $derived(Array.from({ length: this.#totalPage }, (_, i) => i + 1));
	#canGoNext = $derived(this.#currentPage < this.#totalPage && this.#totalItems > 0);
	#canGoPrevious = $derived(this.#currentPage > 1 && this.#totalItems > 0);
	#showingFrom = $derived((this.#currentPage - 1) * this.#perPage + 1);
	#showingTo = $derived(Math.min(this.#currentPage * this.#perPage, this.#totalItems));

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

		this.#perPage = config.perPage;
		this.#totalItems = config.totalItems ?? this.initial.length;
		this.#search = config.search ?? '';
		this.#currentPage = config.page ?? 1;

		$effect(() => {
			if (this.config.mode === 'client' && this.#search) this.#currentPage = 1;
		});

		$effect(() => {
			if (this.queryFn) {
				this.queryFn({ page: this.#currentPage, search: this.#search }).then((result) => {
					this.#data = {
						length: result.totalItems,
						value: result.result
					};
				});
			}
		});
	}
	public readonly isFilterApplied = $derived.by(() => {
		if (this.#search) return true;
		if (this.#appliableSort.current) return true;
		if (Object.keys(this.#appliableFilter ?? {}).length) return true;
		return false;
	});

	private timeout: number | null = null;
	public readonly setSearch = (value: string, delay = 0) => {
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			this.#search = value;
			this.#currentPage = 1;
			this.processUpdate();
		}, delay);
	};

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

	private readonly processUpdate = async () => {
		if (this.config.mode === 'manual' && 'processWith' in this.config && this.config.processWith)
			this.config.processWith();
	};

	public readonly nextPage = () => {
		if (!this.#canGoNext) return;
		this.#currentPage = this.#currentPage + 1;
		this.processUpdate();
	};

	public readonly previousPage = () => {
		if (!this.#canGoPrevious) return;
		this.#currentPage = this.#currentPage - 1;
		this.processUpdate();
	};

	public readonly gotoPage = (page: number) => {
		if (page >= this.#totalPage || page <= 1 || page === this.#currentPage) return;
		this.#currentPage = page;
		this.processUpdate();
	};

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

	public readonly filterBy = <K extends FilterKeys>(
		key: K,
		args: Parameters<F[K]>[1],
		immediate = false
	) => {
		if (immediate) this.#appliableFilter[key] = args;
		else this.#pendingFilter[key] = args;
		this.processUpdate();
	};

	public readonly removeFilter = <K extends FilterKeys>(key: K, immediate = false) => {
		delete this.#pendingFilter[key];
		if (immediate) delete this.#appliableFilter[key];
		this.processUpdate();
	};

	public readonly clearFilters = () => {
		this.#appliableFilter = {} as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.#pendingFilter = {} as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.processUpdate();
	};

	public readonly applyPendingFilter = () => {
		const snap = $state.snapshot(this.#pendingFilter) as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.#appliableFilter = {
			...snap
		};
		this.processUpdate();
	};

	public readonly reset = () => {
		this.#appliableFilter = {} as {
			[K in keyof F]: FilterArg<F[K]>;
		};
		this.#appliableSort = {} as {
			current: SortingKeys;
			dir: 'asc' | 'desc';
		};
		this.#currentPage = 1;
		this.#perPage = this.config.perPage;
		this.#search = '';
		this.processUpdate();
	};

	public readonly sortBy = (col: SortingKeys, dir?: 'asc' | 'desc') => {
		const isTheSameColumn = this.#appliableSort.current === col;
		this.#appliableSort = {
			current: col,
			dir: dir ?? (isTheSameColumn ? (this.#appliableSort.dir === 'asc' ? 'desc' : 'asc') : 'asc')
		};
		this.processUpdate();
	};

	public readonly removeSort = () => {
		this.#appliableSort = {
			current: '' as SortingKeys,
			dir: 'desc'
		};
		this.processUpdate();
	};

	get data() {
		return this.#data.value;
	}
	get perPage() {
		return this.#perPage;
	}
	get currentPage() {
		return this.#currentPage;
	}
	get totalItems() {
		return this.#totalItems;
	}
	get totalPage() {
		return this.#totalPage;
	}
	get pageList() {
		return this.#pageList;
	}
	get canGoNext() {
		return this.#canGoNext;
	}
	get canGoPrevious() {
		return this.#canGoPrevious;
	}
	get showingFrom() {
		return this.#showingFrom;
	}
	get showingTo() {
		return this.#showingTo;
	}
	get appliableFilter() {
		return this.#appliableFilter;
	}
	get appliableSort() {
		return this.#appliableSort;
	}
	get sortKeys() {
		return this.config.sorts
			? (Object.keys(this.config.sorts) as SortingKeys[])
			: ([] as SortingKeys[]);
	}
	get pendingFilter() {
		return this.#pendingFilter;
	}
	get search() {
		return this.#search;
	}
}
