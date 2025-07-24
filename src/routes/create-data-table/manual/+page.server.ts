import type { PageServerLoad } from './$types.js';
import { getUser } from '../(data)/users.js';
import { getPaginationConfig } from '../(schema)/pagination-schema.js';

export const load: PageServerLoad = async ({ url, depends }) => {
	depends('users:manual');
	const config = getPaginationConfig(url.searchParams);
	const { users, totalItems } = getUser(config, true);
	return {
		users,
		totalItems
	};
};
