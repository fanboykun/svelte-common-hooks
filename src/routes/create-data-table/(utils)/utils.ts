/* eslint-disable @typescript-eslint/no-explicit-any */
export function stringToNumber(strNum: string | null, defaultNumber = 1, min = 1) {
	if (!strNum) return defaultNumber;
	const num = parseInt(strNum);
	if (isNaN(num)) return defaultNumber;
	if (num < min) return min;
	return num;
}
export function stringToBoolean<D>(strBool: string | null, defaultValue: D): boolean | D {
	if (!strBool) return defaultValue;
	return strBool === 'true';
}
export function stringToEnum<Enum extends Readonly<[any, ...any[]]>, DefaultEnum = any>(
	strEnum: string | null,
	enums: Enum,
	defaultEnum: DefaultEnum
): Enum[number] {
	if (!strEnum || !strEnum?.length) return defaultEnum;
	if (!Array.isArray(enums)) return defaultEnum;
	if (enums.includes(strEnum)) return strEnum;
	return defaultEnum;
}
export function randomDate(randomNum: number) {
	return new Date(Date.now() - randomNum * 24 * 60 * 60 * 1000);
}

export function isNullish(value: unknown) {
	return (
		value === null ||
		value === undefined ||
		(typeof value === 'string' && !value?.length) ||
		(Array.isArray(value) && !value.length) ||
		(typeof value === 'object' && value !== null && !Object.keys(value).length)
	);
}
