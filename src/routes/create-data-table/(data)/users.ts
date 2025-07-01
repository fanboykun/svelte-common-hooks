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
}
export const users: User[] = Array.from({ length: 100 }, (_, i) => ({
	id: crypto.randomUUID() as string,
	name: `User ${i + 1}`,
	email: `user${i + 1}@example.com`,
	age: Math.floor(Math.random() * 100),
	address: {
		street: `Street ${i + 1}`,
		city: `City ${i + 1}`,
		state: `State ${i + 1}`,
		zipCode: `ZipCode ${i + 1}`
	}
}));
