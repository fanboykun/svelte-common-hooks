/* eslint-disable @typescript-eslint/no-explicit-any */
// import type { HTMLAttributes } from 'svelte/elements';
import { z } from 'zod/v4';
type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type FormStateProps<T extends z.ZodObject<any>, Initial extends z.infer<T> = z.infer<T>> = {
	schema: T;
	initial?: Initial;
	attribute?: FormAttribute<T>;
};
type FormAttribute<T extends z.ZodObject<any>> = {
	[K in keyof z.infer<T>]?: ReturnType<typeof createAttribute>;
};
type FormStateValue<T extends Record<string, any>> = T;
type FormStateConfig<T extends z.ZodObject<any>> = {
	[K in keyof z.infer<T>]: {
		errors: string[];
		hasError: boolean;
	};
};
type FormStateAttribute<T extends z.ZodObject<any>> = {
	[K in keyof z.infer<T>]: {
		'aria-invalid': boolean;
		oninput: (event: Event & { currentTarget: EventTarget & HTMLElement }) => void;
		onblur: (event: Event & { currentTarget: EventTarget & HTMLElement }) => void;
	};
};
export function createAttribute<InputAttribute extends Record<string, any>>(
	attribute: InputAttribute & Record<string, unknown>
) {
	return attribute;
}
export function createFormState<
	T extends z.ZodObject<any>,
	Initial extends z.infer<T> = z.infer<T>
>(props: FormStateProps<T, Initial>) {
	const keys = Object.keys(props.schema.shape);
	let value = $state<FormStateValue<Initial>>(
		keys.reduce((acc, value) => {
			if (props.initial && value in props.initial)
				acc[value as keyof Initial] = props.initial[value as keyof Initial];
			else acc[value as keyof Initial] = null!;
			return acc;
		}, {} as Initial)
	);
	const result = $state<Prettify<FormStateConfig<T>>>(
		keys.reduce((acc, value) => {
			acc[value as keyof z.infer<T>] = {
				errors: [],
				hasError: false
			};
			return acc;
		}, {} as FormStateConfig<T>)
	);

	const attribute = $state<Prettify<FormStateAttribute<T>>>(
		keys.reduce((acc, v) => {
			const userDefinedOnInput = props.attribute?.[v]?.oninput;
			const userDefinedOnBlur = props.attribute?.[v]?.onblur;
			if (props.attribute?.[v]) {
				delete props.attribute[v].name;
				delete props.attribute[v].id;
				delete props.attribute[v]['aria-invalid'];
				delete props.attribute[v].oninput;
				delete props.attribute[v].onblur;
			}
			acc[v as keyof z.infer<T>] = {
				...(props.attribute?.[v as keyof z.infer<T>] ?? {}),
				name: v,
				id: v,
				'aria-invalid': false,
				oninput: (event) => {
					if (result?.[v]?.hasError === false) return userDefinedOnInput?.(event);

					const value = 'value' in event.currentTarget ? event.currentTarget.value : undefined;
					const validated = props.schema.pick({ [v]: true }).safeParse({ [v]: value });
					if (!validated.success) {
						result[v].errors = validated.error.issues.map((v) => v.message);
						result[v].hasError = true;
						attribute[v]['aria-invalid'] = true;
					} else {
						result[v].errors = [];
						result[v].hasError = false;
						attribute[v]['aria-invalid'] = false;
					}

					userDefinedOnInput?.(event);
				},
				onblur: (event) => {
					const value = 'value' in event.currentTarget ? event.currentTarget.value : undefined;
					const validated = props.schema.pick({ [v]: true }).safeParse({ [v]: value });
					if (!validated.success) {
						result[v].errors = validated.error.issues.map((v) => v.message);
						result[v].hasError = true;
						attribute[v]['aria-invalid'] = true;
					} else {
						result[v].errors = [];
						result[v].hasError = false;
						attribute[v]['aria-invalid'] = false;
					}
					userDefinedOnBlur?.(event);
				}
			};
			return acc;
		}, {} as FormStateAttribute<T>)
	);
	const addErrors = (key: keyof z.infer<T>, errors: string[]) => {
		result[key].errors = errors;
		result[key].hasError = true;
		attribute[key]['aria-invalid'] = true;
	};
	const setValue = <K extends keyof typeof value>(
		key: K,
		newValue: (typeof value)[K],
		config: { validateFirst?: boolean; addErrorIfInvalid: boolean } = {
			validateFirst: true,
			addErrorIfInvalid: true
		}
	) => {
		if (!config.validateFirst) return (value[key] = newValue);
		if (!(key in keys)) return;
		const validated = props.schema.pick({ [key as string]: true }).safeParse({ [key]: newValue });
		if (validated.success) value[key] = newValue;
		if (config.addErrorIfInvalid) {
			addErrors(
				key as keyof z.infer<T>,
				validated.success ? [] : validated.error.issues.map((v) => v.message)
			);
		}
	};
	const validate = (key: keyof z.infer<T>) => {
		return props.schema.pick({ [key as string]: true }).safeParse({ [key]: value[key] });
	};
	const validateAll = () => {
		return props.schema.safeParse(value);
	};
	return {
		get value() {
			return value;
		},
		set value(newValue) {
			value = newValue;
		},
		get attribute() {
			return attribute;
		},
		get result() {
			return result;
		},
		addErrors,
		setValue,
		validate,
		validateAll
	};
}
