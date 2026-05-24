// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkMateuVersion } from './src/plugins/remark-mateu-version.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://mateu.io',
	markdown: {
		remarkPlugins: [remarkMateuVersion],
	},
	integrations: [
		starlight({
			title: 'Mateu',
			head: [
				{
					tag: 'script',
					attrs: { type: 'module' },
					content: `
						import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

						async function renderMermaid() {
							const blocks = document.querySelectorAll('pre[data-language="mermaid"]');
							if (!blocks.length) return;

							mermaid.initialize({ startOnLoad: false, theme: 'default' });

							let id = 0;
							for (const pre of blocks) {
								const lines = pre.querySelectorAll('.ec-line');
								const code = Array.from(lines).map(l => l.textContent).join('\\n');
								try {
									const { svg } = await mermaid.render('mermaid-' + id++, code);
									const div = document.createElement('div');
									div.innerHTML = svg;
									div.style.overflowX = 'auto';
									const wrapper = pre.closest('.expressive-code') || pre;
									wrapper.replaceWith(div);
								} catch (e) {
									console.error('Mermaid render error:', e);
								}
							}
						}

						document.addEventListener('DOMContentLoaded', renderMermaid);
						document.addEventListener('astro:page-load', renderMermaid);
					`,
				},
			],
			logo: {
				light: './src/assets/logo.png',
				dark: './src/assets/logo-darkmode.png',
				replacesTitle: true,
			},
			favicon: '/favicon.png',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/miguelperezcolom/mateu' },
			],
			sidebar: [
				{
					label: 'About Mateu',
					items: [
						{ slug: 'mateu-about/what-is-mateu' },
						{ slug: 'why-mateu', label: 'Why Mateu' },
						{ slug: 'mateu-about/philosophy' },
						{ slug: 'mateu-about/the-basics' },
						{ slug: 'mateu-about/mental-model' },
						{ slug: 'mateu-about/how-to-think-in-mateu' },
						{ slug: 'mateu-about/advantages' },
						{ slug: 'mateu-about/architecture' },
						{ slug: 'mateu-about/system-architecture' },
						{ slug: 'mateu-about/comparison' },
						{ slug: 'mateu-about/disclaimer' },
						{
							label: 'Advanced',
							items: [
								{ slug: 'mateu-about/microservices' },
								{ slug: 'mateu-about/shell-and-remote-menus' },
								{ slug: 'mateu-about/ui-federation' },
								{ slug: 'mateu-about/embed' },
								{ slug: 'mateu-about/see-it-in-action' },
							],
						},
					],
				},
				{
					label: 'Java User Manual',
					items: [
						{
							label: 'Start Here',
							items: [
								{ slug: 'java-user-manual/start-here/quickstart' },
								{ slug: 'java-user-manual/start-here/first-app' },
							],
						},
						{
							label: 'Use Cases',
							items: [
								{ slug: 'java-user-manual/use-cases/admin-panel' },
								{ slug: 'java-user-manual/use-cases/users-crud' },
								{ slug: 'java-user-manual/use-cases/custom-listing' },
								{ slug: 'java-user-manual/use-cases/nested-crud' },
								{ slug: 'java-user-manual/use-cases/distributed-backoffice' },
								{ slug: 'java-user-manual/use-cases/embedded-ui' },
							],
						},
						{
							label: 'Concepts',
							items: [
								{ slug: 'java-user-manual/concepts/state-actions-and-fields' },
								{ slug: 'java-user-manual/concepts/routing-and-parameters' },
								{ slug: 'java-user-manual/concepts/ui-vs-route' },
								{ slug: 'java-user-manual/concepts/model-vs-pages' },
								{ slug: 'java-user-manual/concepts/execution-model' },
								{ slug: 'java-user-manual/concepts/viewmodel-lifecycle' },
								{ slug: 'java-user-manual/concepts/validation' },
								{ slug: 'java-user-manual/concepts/action-behavior' },
								{ slug: 'java-user-manual/concepts/field-stereotypes' },
								{ slug: 'java-user-manual/concepts/declarative-vs-fluent' },
								{
									label: 'UI Effects',
									items: [
										{ slug: 'java-user-manual/concepts/ui-effects' },
										{ slug: 'java-user-manual/concepts/ui-effects/multiple-results' },
									],
								},
								{
									label: 'Fluent Components',
									items: [
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-api-basics' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-layouts' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-form-fields' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-listings' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-display-components' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-actions' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-commands' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-validations' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-rules' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-triggers' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-data-contexts' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-components-state' },
										{ slug: 'java-user-manual/concepts/fluent-components/fluent-nested-apps' },
									],
								},
							],
						},
						{
							label: 'Build',
							items: [
								{ slug: 'java-user-manual/build/application-shell' },
								{ slug: 'java-user-manual/build/navigation-and-menus' },
								{ slug: 'java-user-manual/build/domain-models' },
								{ slug: 'java-user-manual/build/crud-navigation-flow' },
								{ slug: 'java-user-manual/build/customizing-crud-and-listings' },
								{ slug: 'java-user-manual/build/listing-row-actions' },
								{ slug: 'java-user-manual/build/full-control-crud-orchestrator' },
								{ slug: 'java-user-manual/build/master-detail' },
								{ slug: 'java-user-manual/build/relationships-vs-embedded-cruds' },
								{ slug: 'java-user-manual/build/orders-customers-order-lines' },
								{ slug: 'java-user-manual/build/foreign-keys-and-options' },
								{ slug: 'java-user-manual/build/dashboard-home-page' },
							],
						},
						{
							label: 'Advanced',
							items: [
								{ slug: 'java-user-manual/advanced/rules' },
								{ slug: 'java-user-manual/advanced/breadcrumbs' },
								{ slug: 'java-user-manual/advanced/layout-and-composition' },
								{ slug: 'java-user-manual/advanced/custom-web-components' },
								{ slug: 'java-user-manual/advanced/extensibility' },
								{ slug: 'java-user-manual/advanced/testing' },
								{ slug: 'java-user-manual/advanced/security' },
							],
						},
						{
							label: 'Real World',
							items: [
								{ slug: 'java-user-manual/real-world/mateu-in-hexagonal-architecture' },
								{ slug: 'java-user-manual/real-world/service-owned-ui-modules' },
								{ slug: 'java-user-manual/real-world/distributed-control-plane' },
								{ slug: 'java-user-manual/real-world/lookups-backed-by-query-services' },
								{ slug: 'java-user-manual/real-world/query-services-and-ui-rows' },
								{ slug: 'java-user-manual/real-world/workflow-and-forms-integration' },
								{ slug: 'java-user-manual/real-world/real-world-ssr-to-ssg' },
							],
						},
					],
				},
				{
					label: 'Create Your Project',
					items: [
						{ slug: 'java-create-your-project/prerequisites' },
						{ slug: 'java-create-your-project/springboot-mvc' },
						{ slug: 'java-create-your-project/springboot-webflux' },
						{ slug: 'java-create-your-project/quarkus' },
						{ slug: 'java-create-your-project/micronaut' },
						{ slug: 'java-create-your-project/helidon' },
					],
				},
				{
					label: 'Java UI Definition',
					items: [
						{ slug: 'java-ui-definition/the-component-tree' },
						{ slug: 'java-ui-definition/supported-components' },
						{ slug: 'java-ui-definition/components-overview' },
						{ slug: 'java-ui-definition/forms' },
						{ slug: 'java-ui-definition/grids' },
						{ slug: 'java-ui-definition/layouts' },
						{ slug: 'java-ui-definition/actions' },
						{ slug: 'java-ui-definition/fluent-components' },
						{ slug: 'java-ui-definition/client-side-logic' },
						{ slug: 'java-ui-definition/yaml-ui-definition' },
						{
							label: 'Components',
							items: [{ autogenerate: { directory: 'java-ui-definition/components' } }],
						},
						{
							label: 'Annotations',
							items: [{ autogenerate: { directory: 'java-ui-definition/annotations' } }],
						},
						{
							label: 'Interfaces',
							items: [{ autogenerate: { directory: 'java-ui-definition/interfaces' } }],
						},
						{
							label: 'Records',
							items: [{ autogenerate: { directory: 'java-ui-definition/records' } }],
						},
					],
				},
				{
					label: 'Design Systems',
					items: [
						{ slug: 'design-systems/vaadin' },
						{ slug: 'design-systems/sapui5' },
						{ slug: 'design-systems/oracle-redwood' },
						{ slug: 'design-systems/redhat' },
						{ slug: 'design-systems/slds2' },
						{ slug: 'design-systems/bring-your-own-design-system' },
					],
				},
				{
					label: 'Native',
					items: [
						{ slug: 'native', label: 'Desktop & Mobile' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ slug: 'reference/key-annotations' },
						{ slug: 'reference/key-interfaces' },
						{ slug: 'reference/fluent-model' },
						{ slug: 'reference/useful-types' },
					],
				},
				{
					label: 'Other Languages',
					items: [
						{ slug: 'kotlin-user-manual', label: 'Kotlin' },
						{ slug: 'csharp-user-manual', label: 'C#' },
						{ slug: 'python-user-manual', label: 'Python' },
					],
				},
			],
		}),
	],
});
