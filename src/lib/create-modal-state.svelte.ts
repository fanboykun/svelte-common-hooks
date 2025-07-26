import { pushState } from '$app/navigation';
import { page } from '$app/state';

/**
 * - Creates a state manager for multiple modals by pushing state on the page.
 * - It would close the modal with navigate back gestures on mobile.
 *
 * @example
 * First, we have to declare the page state in app.d.ts
 * ```ts
 * // app.d.ts
 * declare global {
 * 	namespace App {
 * 		interface PageState {
 * 			modal?: Set<string>;
 * 		}
 * 	}
 * }
 * ```
 *
 * Then, we can create the modal state
 * ```svelte
 * <script lang="ts">
 * 	import { createModalState } from 'svelte-common-hooks';
 * 	const modals = createModalState('modal1', 'modal2');
 * 	let selectedNumber = $state<number>();
 * </script>
 *
 * <button onclick={() => modals.open('modal1')}>Open Modal 1</button>
 * <button onclick={() => modals.open('modal2', () => selectedNumber = 2)}>Open Modal 2</button>
 * {#if modal.list.modal1}
 * 	<div>
 * 		<h1>Modal 1</h1>
 * 		<button onclick={() => modals.close('modal1')}>Close</button>
 * 		<!-- or -->
 * 		<button onclick={() => modals.list.modal1 = false}>Close</button>
 * 	</div>
 * {/if}
 *
 * ```
 */
export function createModalState<T extends string>(...modal_names: T[]) {
	/**
	 * The reactive state of the modal, the value is an object that contains the state of each modal
	 */
	const list = $state(modal_names.reduce((acc, c) => ({ ...acc, [c]: false }), {})) as {
		[K in (typeof modal_names)[number]]: boolean;
	};
	/**
	 * The effect that will be run when the modal state changes
	 */
	$effect(() => {
		const modalFromPage = page.state.modal;
		const modal = Object.entries(list);
		if (modalFromPage) {
			for (const [key, value] of modal) {
				const shouldBeOpen = modalFromPage.has(key);
				if (shouldBeOpen && value === false) {
					history.back();
					break;
				} else if (!shouldBeOpen && value === true) {
					list[key as keyof typeof list] = false;
					break;
				}
			}
		} else {
			modal.forEach(([key]) => {
				list[key as keyof typeof list] = false;
			});
		}
	});
	/**
	 * Open a modal
	 *
	 * @param name The name of the modal to open
	 * @param cb The function that runs before opening the modal
	 */
	function open<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		list[name] = true;
		pushState('', {
			modal: (page.state?.modal ?? new Set()).add(name)
		});
	}

	// /**
	//  * Open a modal and close all other modals
	//  *
	//  * @param name The name of the modal to open
	//  * @param cb The function that runs before opening the modal
	//  * @deprecated use open instead
	//  */
	// function openStrict<cbr extends () => unknown>(name: T, cb?: cbr) {
	// 	cb?.();
	// 	Object.entries(list).forEach(([key, value]) => {
	// 		if (key !== name && value === true) list[key as keyof typeof list] = false;
	// 	});
	// 	setTimeout(() => {
	// 		open(name);
	// 	}, 100);
	// }

	/**
	 * Close a modal
	 *
	 * @param name The name of the modal to close
	 * @param cb The function that runs before closing the modal
	 */
	function close<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		list[name] = false;
	}

	/**
	 * Toggle a modal
	 *
	 * @param name The name of the modal to toggle
	 * @param cb The function that runs before toggling the modal
	 */
	// function toggle<cbr extends () => unknown>(name: T, cb?: cbr) {
	// 	cb?.();
	// 	list[name] = !list[name];
	// }

	/**
	 * Close all modals
	 *
	 * @param name The name of the modal to close
	 * @param cb The function that runs before closing the modal
	 * @deprecated use close instead
	 */
	// function closeStrict<cbr extends () => unknown>(name: T, cb?: cbr) {
	// 	cb?.();
	// 	Object.keys(list).forEach((key) => {
	// 		if (key !== name) list[key as keyof typeof list] = false;
	// 	});
	// 	list[name] = false;
	// }

	return {
		/**
		 * The reactive state of the modal, the value is an object that contains the state of each modal
		 */
		get list() {
			return list;
		},
		open,
		close
		// toggle,
		// openStrict,
		// closeStrict
	};
}

/**
 * Creates a simple modal state manager
 *
 * @param keys The keys of the modal
 * @returns The modal state manager
 */
export const createSimpleModal = <T extends string[]>(...keys: T) => {
	const list = $state<Record<T[number], boolean>>(
		keys.reduce(
			(acc, v) => {
				acc[v as T[number]] = false;
				return acc;
			},
			{} as Record<T[number], boolean>
		)
	);
	const open = (name: T[number], callbacks?: { before?: () => void; after?: () => void }) => {
		callbacks?.before?.();
		list[name] = true;
		callbacks?.after?.();
	};
	const close = (name: T[number], callbacks?: { before?: () => void; after?: () => void }) => {
		callbacks?.before?.();
		list[name] = false;
		callbacks?.after?.();
	};
	return {
		get list() {
			return list;
		},
		open,
		close
	};
};
