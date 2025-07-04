import type { RequestHandler } from './$types.js';
import { getPaginationConfig } from '../(schema)/pagination-schema.js';
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
