import type { UserPaginationConfig } from '../(schema)/pagination-schema.js';
import { randomDate } from '../(utils)/utils.js';

interface User {
	id: string;
	name: string;
	email: string;
	age: number;
	address: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
	};
	createdAt: Date;
}

export const users: User[] = Array.from({ length: 100 }, (_, i) => ({
	id: crypto.randomUUID() as string,
	name: `User ${i + 1}`,
	email: `user${i + 1}@example.com`,
	age: Math.floor(Math.random() * 50),
	address: {
		street: `Street ${i + 1}`,
		city: `City ${i + 1}`,
		state: `State ${i + 1}`,
		zipCode: `ZipCode ${i + 1}`
	},
	createdAt: randomDate(i)
}));

export function getUser(config: UserPaginationConfig) {
	const result = users.filter((user) => {
		return (
			(config?.search ? user.name.toLowerCase().includes(config.search.toLowerCase()) : true) &&
			(typeof config?.isAdult === 'undefined' || config?.isAdult === null
				? true
				: config.isAdult
					? user.age >= 18
					: user.age < 18)
		);
	});
	const totalItems = result.length;
	const paginated = result
		.sort((a, b) => {
			return config.sort === 'desc'
				? a.createdAt.getTime() - b.createdAt.getTime()
				: b.createdAt.getTime() - a.createdAt.getTime();
		})
		.slice((config.page - 1) * config.limit, config.page * config.limit);
	return {
		users: paginated,
		totalItems
	};
}
