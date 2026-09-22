import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';

export const sourceIds = [110, 112, 116, 119];
export const sourceFields =
	'id,name,image,translations.languages_code,translations.title,translations.description,translations.media,translations.icon,translations.call_to_actions,translations.embed_media';
export const referenceFields =
	'id,sections_id,collection,item,component_name,order,display,horizontal_alignment,vertical_alignment,theme,area';
export const targetFields =
	'id,internal_name,status,image,translations.languages_code,translations.title,translations.description,translations.media,translations.icon,translations.call_to_actions,translations.eyebrow,translations.decorative,translations.alt_text';

const sortedTranslations = (translations) =>
	[...translations].sort((a, b) => a.languages_code.localeCompare(b.languages_code));
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function sourceSnapshot(source) {
	return {
		id: source.id,
		name: source.name,
		image: source.image,
		translations: sortedTranslations(source.translations).map((t) => ({
			languages_code: t.languages_code,
			title: t.title,
			description: t.description,
			media: t.media,
			icon: t.icon,
			call_to_actions: t.call_to_actions,
			embed_media: t.embed_media
		}))
	};
}
export function projectTarget(target) {
	return {
		id: target.id,
		internal_name: target.internal_name,
		status: target.status,
		image: target.image,
		translations: sortedTranslations(target.translations).map((t) => ({
			languages_code: t.languages_code,
			title: t.title,
			description: t.description ?? null,
			media: t.media ?? null,
			icon: t.icon ?? null,
			call_to_actions: t.call_to_actions ?? null,
			eyebrow: t.eyebrow ?? null,
			decorative: t.decorative,
			alt_text: t.alt_text ?? null
		}))
	};
}

export function createPlan({ sources, references, sections, siteId, allowedCollections }) {
	assert.equal(Number(siteId), 34, 'Migration is scoped to Panama Stopover');
	assert.ok(references.length < 100 && sections.length < 100, 'Inventory needs pagination');
	assert.deepEqual(
		sources.map((s) => s.id).sort((a, b) => a - b),
		sourceIds
	);
	const entries = sources.map((source) => {
		const uses = references.filter(
			(r) => r.collection === 'Text_Content' && String(r.item) === String(source.id)
		);
		assert.ok(uses.length, `No reference for ${source.id}`);
		for (const use of uses) {
			assert.equal(use.component_name, 'hero-a', 'Other designs need their own migration');
			const section = sections.find((s) => s.id === use.sections_id);
			assert.ok(
				section && section.section_content.length === 1,
				'Review shared sections before migration'
			);
			assert.ok(section.page_storefronts.length > 0, 'Missing page scope');
			assert.ok(
				section.page_storefronts.every(
					(p) => Number(p.pages_storefronts_id.pages_id.site) === Number(siteId)
				),
				'Cross-site section'
			);
		}
		const translations = sortedTranslations(source.translations);
		assert.ok(translations.length);
		assert.equal(
			new Set(translations.map((t) => t.languages_code)).size,
			translations.length,
			'Duplicate languages'
		);
		for (const t of translations) {
			assert.ok(
				['es', 'en', 'pt'].includes(t.languages_code),
				'Unsupported locale must be reviewed'
			);
			assert.ok(t.title?.trim() && (t.media || source.image), 'Incomplete published content');
			assert.ok(!t.embed_media, 'Embedded media needs review');
		}
		const body = projectTarget({
			id: randomUUID(),
			internal_name: source.name,
			status: 'draft',
			image: source.image,
			translations: translations.map((t) => ({
				...t,
				eyebrow: null,
				decorative: true,
				alt_text: null
			}))
		});
		return {
			sourceId: source.id,
			sourceHash: digest(sourceSnapshot(source)),
			source: sourceSnapshot(source),
			target: body,
			references: uses
		};
	});
	return {
		version: 1,
		preparedAt: new Date().toISOString(),
		siteId: Number(siteId),
		entries,
		activationPrerequisite:
			'Deploy and verify the compatible frontend, then revalidate source, drafts and live references before any cutover. This module only stages drafts.',
		activation: [
			{
				method: 'PATCH',
				path: '/relations/sections_section_content/item',
				before: { meta: { one_allowed_collections: allowedCollections } },
				body: {
					meta: {
						one_allowed_collections: [
							...new Set([...allowedCollections, 'block_hero', 'block_hero_carousel'])
						]
					}
				}
			},
			...entries.map((e) => ({
				method: 'PATCH',
				path: `/items/block_hero/${e.target.id}`,
				before: { status: 'draft' },
				body: { status: 'published' }
			})),
			...sections.map((s) => ({
				method: 'PATCH',
				path: `/items/sections/${s.id}`,
				before: { landmark: s.landmark },
				body: { landmark: 'hero' }
			})),
			...entries.flatMap((e) =>
				e.references.map((r) => ({
					method: 'PATCH',
					path: `/items/sections_section_content/${r.id}`,
					before: r,
					body: {
						collection: 'block_hero',
						item: e.target.id,
						component_name: null,
						display: null,
						horizontal_alignment: null,
						vertical_alignment: null
					}
				}))
			)
		],
		rollback:
			'Restore only migrated junction fields and original landmarks using their before values. Keep legacy Text_Content records. Do not remove allowed collections or delete content that may have acquired new uses.'
	};
}

export async function stageCopies(client, plan) {
	assert.equal(plan.version, 1);
	assert.equal(plan.siteId, 34);
	assert.deepEqual(
		plan.entries.map((e) => e.sourceId).sort((a, b) => a - b),
		sourceIds
	);
	// Complete the read-only preflight for all records before the first write.
	const existing = new Map();
	for (const entry of plan.entries) {
		assert.equal(entry.target.status, 'draft');
		const source = await client.request(`/items/Text_Content/${entry.sourceId}`, {
			params: { fields: sourceFields }
		});
		assert.equal(
			digest(sourceSnapshot(source)),
			entry.sourceHash,
			'Source changed; prepare a new reviewed plan'
		);
		for (const reference of entry.references) {
			const current = await client.request(`/items/sections_section_content/${reference.id}`, {
				params: { fields: referenceFields }
			});
			assert.deepEqual(current, reference, 'Page reference changed; review before staging');
		}
		const rows = await client.request('/items/block_hero', {
			params: { fields: targetFields, filter: { id: { _eq: entry.target.id } }, limit: 2 }
		});
		assert.ok(rows.length <= 1);
		if (rows.length)
			assert.deepEqual(
				projectTarget(rows[0]),
				entry.target,
				'Existing draft differs; never overwrite editorial changes'
			);
		existing.set(entry.target.id, rows.length > 0);
	}
	const result = [];
	for (const entry of plan.entries) {
		if (!existing.get(entry.target.id))
			await client.request('/items/block_hero', { method: 'POST', body: entry.target });
		const saved = await client.request(`/items/block_hero/${entry.target.id}`, {
			params: { fields: targetFields }
		});
		assert.deepEqual(projectTarget(saved), entry.target, 'Draft verification failed');
		result.push({
			sourceId: entry.sourceId,
			targetId: saved.id,
			status: saved.status,
			translations: saved.translations.length,
			created: !existing.get(saved.id)
		});
	}
	return result;
}
