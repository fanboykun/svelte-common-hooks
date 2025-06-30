import { pushState } from '$app/navigation';
import { page } from '$app/state';

export function createModalState<T extends string>(...modal_names: T[]) {
	const list = $state(modal_names.reduce((acc, c) => ({ ...acc, [c]: false }), {})) as {
		[K in (typeof modal_names)[number]]: boolean;
	};
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
	function open<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		list[name] = true;
		pushState('', {
			modal: (page.state?.modal ?? new Set()).add(name)
		});
	}

	function openStrict<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		Object.entries(list).forEach(([key, value]) => {
			if (key !== name && value === true) list[key as keyof typeof list] = false;
		});
		setTimeout(() => {
			open(name);
		}, 100);
	}

	function close<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		list[name] = false;
	}

	function toggle<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		list[name] = !list[name];
	}

	function closeStrict<cbr extends () => unknown>(name: T, cb?: cbr) {
		cb?.();
		Object.keys(list).forEach((key) => {
			if (key !== name) list[key as keyof typeof list] = false;
		});
		list[name] = false;
	}

	function only(name: T) {
		// Check if the named modal is active
		if (!list[name]) return false;

		// Check if any other modal is active
		return !Object.entries(list).some(([key, value]) => {
			return key !== name && value === true;
		});
	}

	return {
		get list() {
			return list;
		},
		open,
		close,
		toggle,
		only,
		openStrict,
		closeStrict
	};
}
