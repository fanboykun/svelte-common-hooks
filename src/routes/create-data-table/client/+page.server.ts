import type { PageServerLoad } from './$types.js';
import { users } from '../(data)/users.js';

export const load: PageServerLoad = async () => {
	return {
		users
	};
};
