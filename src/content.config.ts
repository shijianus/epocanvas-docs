import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { SUPPORTED_LANGUAGES, getTranslation } from './utils/i18n';

export const collections = {
	i18n: defineCollection({
		loader: async () => SUPPORTED_LANGUAGES.map(({ code }) => ({
			id: code,
			'skipLink.label': getTranslation('skipLink.label', code),
			'search.label': getTranslation('search.label', code),
		})),
		schema: i18nSchema(),
	}),
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema(),
	}),
};
