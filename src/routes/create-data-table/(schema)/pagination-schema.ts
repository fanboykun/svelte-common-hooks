import { z } from 'zod/v4';

export const userPaginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	sort: z.enum(['asc', 'desc']).default('desc'),
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
		sort: 'asc' as 'asc' | 'desc',
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
