import { describe, expect, it } from 'vitest';
import { createPlan, sourceIds, stageCopies } from './hero-a.mjs';

function fixture() {
	const sources = sourceIds.map((id) => ({
		id,
		name: `Hero ${id}`,
		image: 'image-id',
		translations: [
			{
				languages_code: 'es',
				title: 'Título',
				description: '<p>Texto</p>',
				media: null,
				icon: 12,
				call_to_actions: null,
				embed_media: null
			}
		]
	}));
	const references = sourceIds.map((id) => ({
		id,
		sections_id: id,
		collection: 'Text_Content',
		item: String(id),
		component_name: 'hero-a',
		order: 1,
		display: null,
		horizontal_alignment: null,
		vertical_alignment: null,
		theme: 'light',
		area: null
	}));
	const sections = sourceIds.map((id) => ({
		id,
		landmark: 'regular',
		section_content: [{ id }],
		page_storefronts: [{ pages_storefronts_id: { pages_id: { site: 34 } } }]
	}));
	return { sources, references, sections, siteId: 34, allowedCollections: ['Text_Content'] };
}
function clientFor(input, stored = new Map()) {
	const writes = [];
	return {
		writes,
		stored,
		async request(route, options = {}) {
			if (options.method) {
				writes.push({ route, ...options });
				stored.set(options.body.id, structuredClone(options.body));
				return options.body;
			}
			if (route.startsWith('/items/Text_Content/'))
				return input.sources.find((x) => x.id === Number(route.split('/').at(-1)));
			if (route.startsWith('/items/sections_section_content/'))
				return input.references.find((x) => x.id === Number(route.split('/').at(-1)));
			if (route === '/items/block_hero') {
				const row = stored.get(options.params.filter.id._eq);
				return row ? [row] : [];
			}
			return stored.get(route.split('/').at(-1));
		}
	};
}
describe('hero-a content migration', () => {
	it('preserves content and asset references without publishing', () => {
		const input = fixture(),
			plan = createPlan(input);
		expect(plan.entries).toHaveLength(4);
		expect(plan.entries[0].target).toMatchObject({
			status: 'draft',
			image: 'image-id',
			translations: [
				{ title: 'Título', description: '<p>Texto</p>', icon: 12, eyebrow: null, decorative: true }
			]
		});
		expect(input.sources[0]).not.toHaveProperty('status');
	});
	it('rejects other designs or cross-site sections', () => {
		const input = fixture();
		input.references[0].component_name = 'hero-b';
		expect(() => createPlan(input)).toThrow();
		input.references[0].component_name = 'hero-a';
		input.sections[0].page_storefronts[0].pages_storefronts_id.pages_id.site = 35;
		expect(() => createPlan(input)).toThrow();
	});
	it('rejects unsupported languages and incomplete content instead of dropping it', () => {
		const input = fixture();
		input.sources[0].translations[0].languages_code = 'fr';
		expect(() => createPlan(input)).toThrow();
		input.sources[0].translations[0].languages_code = 'es';
		input.sources[0].image = null;
		expect(() => createPlan(input)).toThrow();
	});
	it('stages drafts once and verifies reused records on retry', async () => {
		const input = fixture(),
			plan = createPlan(input),
			client = clientFor(input);
		await stageCopies(client, plan);
		await stageCopies(client, plan);
		expect(client.writes).toHaveLength(4);
		expect(
			client.writes.every(
				(w) => w.route === '/items/block_hero' && w.method === 'POST' && w.body.status === 'draft'
			)
		).toBe(true);
	});
	it('preflights all sources before any write', async () => {
		const input = fixture(),
			plan = createPlan(input),
			client = clientFor(input);
		input.sources.at(-1).translations[0].title = 'Cambio editorial';
		await expect(stageCopies(client, plan)).rejects.toThrow('Source changed');
		expect(client.writes).toHaveLength(0);
	});
	it('rejects page reference drift', async () => {
		const input = fixture(),
			plan = structuredClone(createPlan(input)),
			client = clientFor(input);
		input.references[0].item = '999';
		await expect(stageCopies(client, plan)).rejects.toThrow('Page reference changed');
		expect(client.writes).toHaveLength(0);
	});
	it('does not overwrite changes made to a staged draft', async () => {
		const input = fixture(),
			plan = createPlan(input),
			client = clientFor(input);
		await stageCopies(client, plan);
		client.stored.get(plan.entries[0].target.id).translations[0].title = 'Edición posterior';
		await expect(stageCopies(client, plan)).rejects.toThrow('Existing draft differs');
		expect(client.writes).toHaveLength(4);
	});
});
