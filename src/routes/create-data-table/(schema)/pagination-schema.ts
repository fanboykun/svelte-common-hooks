import { z } from 'zod/v4';

export const userPaginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).default(10),
	sort: z.union([z.enum(['asc', 'desc']), z.null()]).default('desc'),
	search: z.string().optional(),
	isAdult: z
		.string()
		.optional()
		.transform((v) => (typeof v === 'undefined' ? undefined : v === 'true'))
});
export type UserPaginationConfig = z.infer<typeof userPaginationSchema>;
export function getPaginationConfig(searchParam: URLSearchParams) {
	const defaultConfig = {
		page: 1,
		limit: 10,
		sort: 'desc' as 'asc' | 'desc',
		search: '',
		isAdult: undefined
	};
	const validated = userPaginationSchema.safeParse(Object.fromEntries(searchParam.entries()));
	if (!validated.success) {
		return defaultConfig;
	}
	return {
		...validated.data
	};
}

export function setPaginationConfig(url: URL, config: UserPaginationConfig) {
	if (config.page <= 1) url.searchParams.delete('page');
	else url.searchParams.set('page', config.page.toString());

	if (!config.search?.length) url.searchParams.delete('search');
	else url.searchParams.set('search', config.search);

	if (config.isAdult === null || config.isAdult === undefined) url.searchParams.delete('isAdult');
	else url.searchParams.set('isAdult', `${config.isAdult}`);

	if (config.sort) {
		url.searchParams.set('sort', config.sort);
	} else {
		url.searchParams.delete('sort');
	}
	return url;
}
