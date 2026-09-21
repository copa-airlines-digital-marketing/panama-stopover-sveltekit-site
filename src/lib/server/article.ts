import sanitizeHtml from 'sanitize-html';

// Article content is sanitized on the server; no CMS HTML is trusted by the renderer.
export function cleanArticleHtml(value: string) {
	return sanitizeHtml(value, {
		allowedTags: [
			'p',
			'br',
			'h2',
			'h3',
			'h4',
			'strong',
			'b',
			'em',
			'i',
			'u',
			's',
			'ul',
			'ol',
			'li',
			'a',
			'img',
			'blockquote',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td',
			'hr',
			'sup',
			'sub'
		],
		allowedAttributes: {
			a: ['href', 'title', 'target', 'rel', 'id'],
			img: ['src', 'alt', 'width', 'height'],
			h2: ['id'],
			h3: ['id'],
			h4: ['id'],
			ol: ['start'],
			li: ['value'],
			th: ['scope', 'colspan', 'rowspan'],
			td: ['colspan', 'rowspan']
		},
		allowedSchemes: ['https', 'mailto', 'tel'],
		allowedSchemesByTag: { img: ['https'] },
		allowProtocolRelative: false,
		transformTags: {
			a: (tagName, attribs) => ({
				tagName,
				attribs: {
					...attribs,
					...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {})
				}
			})
		}
	});
}

export function prepareArticleSections(value: unknown): unknown {
	if (!Array.isArray(value)) return value;
	const record = (v: unknown): v is Record<string, unknown> =>
		!!v && typeof v === 'object' && !Array.isArray(v);
	return value.map((section) => {
		if (!record(section) || !Array.isArray(section.section_content)) return section;
		return {
			...section,
			section_content: section.section_content.map((entry: unknown) => {
				if (
					!record(entry) ||
					entry.collection !== 'Text_Content' ||
					entry.component_name !== 'article' ||
					!record(entry.item) ||
					!Array.isArray(entry.item.translations)
				)
					return entry;
				const t = entry.item.translations[0];
				return {
					...entry,
					item: {
						...entry.item,
						articleHtml: cleanArticleHtml(
							record(t) && typeof t.description === 'string' ? t.description : ''
						)
					}
				};
			})
		};
	});
}
