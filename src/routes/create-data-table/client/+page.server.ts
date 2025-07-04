import type { PageServerLoad } from './$types.js';
import { getAllUser } from '../(data)/users.js';

export const load: PageServerLoad = async () => {
	return {
		users: getAllUser()
	};
};
