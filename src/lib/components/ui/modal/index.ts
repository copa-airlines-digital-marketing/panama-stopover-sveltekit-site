import { Dialog, type DialogContentProps, type ScrollAreaContentProps } from 'bits-ui';

import Content from './modal-content.svelte';
import Body from './modal-body.svelte';
import Footer from './modal-footer.svelte';
import Overlay from './modal-overlay.svelte';
import Close from './modal-close.svelte';
import { cmTailwindVariants } from '$lib/utils';
import type { VariantProps } from 'tailwind-variants';
import type { HTMLAttributes } from 'svelte/elements';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

const Root = Dialog.Root;
const Portal = Dialog.Portal;
const Trigger = Dialog.Trigger;
const Title = Dialog.Title;
const Description = Dialog.Description;

const modalVariants = cmTailwindVariants({
	base: 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 min-h-80 md:min-h-96 max-h-[67%] w-full max-w-[90%] bg-background-paper pt-11 rounded-lg',
	variants: {
		size: {
			narrow: 'pb-10 sm:max-h-[576px] md:max-h-[87%] lg:max-h-[72%] sm:max-w-[392px]',
			normal:
				'pb-11 sm:max-h-[87%] lg:max-h-[72%] sm:max-w-[560px] md:max-w-[600px] lg:max-w-[798px]',
			wide: 'pb-11 sm:max-h-[97%] md:max-h-[87%] lg:max-h-[72%] sm:max-w-[768px] md:max-w-[910px] lg:max-w-[1200px]'
		}
	},
	defaultVariants: {
		size: 'normal'
	}
});

const modalBodyVariants = cmTailwindVariants({
	base: 'px-2',
	variants: {
		size: {
			narrow: '',
			normal: 'sm:px-10 lg:px-14',
			wide: 'sm:px-8 md:px-14'
		}
	}
});

const modalFooterVariant = cmTailwindVariants({
	base: 'flex flex-col sm:flex-row-reverse',
	variants: {
		size: {
			narrow: '-mb-10 gap-2 p-4',
			normal: '-mb-11 gap-4 p-6',
			wide: '-mb-11 gap-4 p-6'
		}
	},
	defaultVariants: {
		size: 'normal'
	}
});

type ModalSize = VariantProps<typeof modalVariants>['size'];

type BodySize = VariantProps<typeof modalBodyVariants>['size'];

type FooterSize = VariantProps<typeof modalFooterVariant>['size'];

type ModalProps = DialogContentProps & {
	size?: ModalSize;
};

type BodyProps = ScrollAreaContentProps & {
	size?: BodySize;
};

type FooterProps = HTMLAttributes<HTMLDivElement> & {
	size?: FooterSize;
};

const MODAL_CONTEXT_KEY = Symbol('cm-modal');

function setModalContext(props: ModalProps) {
	const store = writable<ModalProps>(props);
	setContext(MODAL_CONTEXT_KEY, store);
	return store;
}

function getModalContext() {
	return getContext<Writable<ModalProps> | undefined>(MODAL_CONTEXT_KEY);
}

export {
	Root,
	Trigger,
	Portal,
	Overlay,
	Content,
	Body,
	Title,
	Description,
	Footer,
	Close,
	modalVariants,
	modalBodyVariants,
	modalFooterVariant,
	setModalContext,
	getModalContext,
	Root as ModalRoot,
	Trigger as ModalTrigger,
	Portal as ModalPortal,
	Overlay as ModalOverlay,
	Content as ModalContent,
	Body as ModalBody,
	Title as ModalTitle,
	Description as ModalDescription,
	Footer as ModalFooter,
	Close as ModalClose
};

export type { ModalProps, BodyProps, FooterProps };
