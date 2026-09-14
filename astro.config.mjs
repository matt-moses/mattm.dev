// @ts-check
import { defineConfig } from 'astro/config';

// Syntax theme keyed to the site's accent pair (orange/blue) instead of a
// generic rainbow theme -- see public/images/mattmdev-logo-pcb.svg for the
// same pairing used as a wiring-diagram color code.
const wiringDiagram = {
	name: 'wiring-diagram',
	type: 'dark',
	colors: {
		'editor.background': '#12151A',
		'editor.foreground': '#E4E7EB',
	},
	tokenColors: [
		{ settings: { foreground: '#E4E7EB' } },
		{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#3FA9F5' } },
		{ scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#FF7A33' } },
		{ scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'], settings: { foreground: '#FF7A33' } },
		{ scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#3FA9F5' } },
		{ scope: ['constant.numeric', 'constant.language', 'constant.character'], settings: { foreground: '#3FA9F5' } },
		{ scope: ['entity.name.tag', 'entity.other.attribute-name'], settings: { foreground: '#FF7A33' } },
		{ scope: ['variable', 'variable.parameter', 'variable.other'], settings: { foreground: '#E4E7EB' } },
		{ scope: ['punctuation', 'meta.brace', 'punctuation.separator'], settings: { foreground: '#8B929B' } },
	],
};

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.mattm.dev',
	markdown: {
		shikiConfig: {
			theme: wiringDiagram,
		},
	},
});
