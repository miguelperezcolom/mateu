// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkMateuVersion } from './src/plugins/remark-mateu-version.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://mateu.io',
	// Pages moved by the 2026-10 restructure (one model, many authoring paths): old URLs keep working.
	redirects: {
		'/java-user-manual/start-here/quickstart-yaml/': '/define/yaml/quickstart/',
		'/java-ui-definition/yaml-ui-definition/': '/define/yaml/pages/',
		'/java-ui-definition/visual-editor/': '/define/yaml/visual-editor/',
		'/java-ui-definition/yaml-app-shell/': '/define/yaml/app-shell/',
		'/java-ui-definition/yaml-security/': '/define/yaml/permissions/',
		'/java-ui-definition/yaml-i18n/': '/define/yaml/translations/',
		'/java-ui-definition/project-settings/': '/define/yaml/project-settings/',
		'/java-ui-definition/partials/': '/define/yaml/partials/',
		'/java-ui-definition/route-registry/': '/concepts/routes-and-mounts/',
		'/java-ui-definition/rest-source-catalogue/': '/concepts/data-sources/',
		'/java-ui-definition/action-catalogue/': '/concepts/action-catalogue/',
		'/java-ui-definition/environments/': '/deploy/environments/',
		'/java-user-manual/build/static-bundle/': '/deploy/static-bundle/',
		'/java-user-manual/build/static-ui/': '/deploy/static-ui/',
		'/java-user-manual/build/deploy-to-production/': '/deploy/production-checklist/',
	},
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
					label: 'Start here',
					items: [
						{ slug: 'mateu-about/what-is-mateu', label: 'What is Mateu' },
						{ slug: 'start-here/choose-your-path', label: 'Choose your path' },
						{ slug: 'concepts/building-blocks', label: 'What a Mateu UI is made of' },
						{ slug: 'ux', label: 'The UX guide' },
						{ slug: 'define/yaml/quickstart', label: 'Quickstart: YAML (no code)' },
						{ slug: 'java-user-manual/start-here/quickstart', label: 'Quickstart: Java' },
						{ slug: 'csharp-user-manual', label: 'Quickstart: C#' },
						{ slug: 'python-user-manual', label: 'Quickstart: Python' },
						{ slug: 'build-a-full-backoffice-in-10-minutes', label: 'A full backoffice in 10 minutes' },
						{
							label: 'About the project',
							collapsed: true,
							items: [
								{ slug: 'mateu-about/why-mateu', label: 'Why Mateu' },
								{ slug: 'when-to-use-mateu' },
								{ slug: 'use-cases' },
								{ slug: 'mateu-about/comparison' },
								{ slug: 'mateu-about/comparison-low-code', label: 'Mateu vs Visual Builders' },
								{ slug: 'mateu-about/mateu-and-ai', label: 'Mateu and AI' },
								{ slug: 'mateu-about/portability-and-exit', label: 'Portability & exit strategy' },
								{ slug: 'mateu-about/governance-and-continuity', label: 'Governance & continuity' },
								{ slug: 'mateu-about/see-it-in-action' },
								{ slug: 'mateu-about/disclaimer' },
							],
						},
					],
				},
				{
					label: 'Concepts',
					items: [
						{ slug: 'concepts', label: 'Overview' },
						{ slug: 'concepts/building-blocks', label: 'What a Mateu UI is made of' },
						{
							label: 'Building blocks',
							items: [
								{ slug: 'concepts/routes-and-mounts', label: 'Mounts & routes' },
								{ slug: 'concepts/app-shell-and-menus', label: 'App shell & menus' },
								{ slug: 'concepts/pages-and-components', label: 'Pages & components' },
								{ slug: 'define/yaml/partials', label: 'Partials' },
								{ slug: 'concepts/action-catalogue', label: 'Actions' },
								{ slug: 'concepts/data-sources', label: 'Data sources' },
								{ slug: 'concepts/state-and-triggers', label: 'State, scopes & triggers' },
								{
									label: 'Cross-cutting',
									items: [
										{ slug: 'java-ui-definition/field-types', label: 'Field types' },
										{ slug: 'define/yaml/translations', label: 'Translations' },
										{ slug: 'deploy/environments', label: 'Environments' },
										{ slug: 'define/yaml/permissions', label: 'Access & permissions' },
										{ slug: 'define/yaml/project-settings', label: 'Project settings' },
									],
								},
							],
						},
						{
							label: 'Pages & patterns',
							items: [
								{ slug: 'the-mateu-way', label: 'Pages: the Mateu Way' },
								{ slug: 'ux', label: 'The UX guide' },
								{ slug: 'ux/page-types', label: 'Page types' },
							],
						},
						{
							label: 'The model & the wire',
							items: [
								{ slug: 'mateu-about/the-model', label: 'The model' },
								{ slug: 'reference/wire-specification', label: 'The wire' },
								{ slug: 'mateu-about/how-mateu-works', label: 'How Mateu works' },
								{ slug: 'authoring-rule', label: 'The authoring rule' },
							],
						},
						{
							label: 'Federation',
							items: [
								{ slug: 'mateu-about/ui-federation' },
								{ slug: 'mateu-about/shell-and-remote-menus' },
								{ slug: 'mateu-about/microservices' },
								{ slug: 'mateu-about/embed' },
								{ slug: 'java-user-manual/build/using-external-mateu-uis', label: 'Using external Mateu UIs' },
								{ slug: 'case-study-microservices', label: 'Case study: microservices' },
							],
						},
						{
							label: 'Architecture',
							collapsed: true,
							items: [
								{ slug: 'mateu-about/architecture', label: 'Technical Architecture' },
								{ slug: 'mateu-about/system-architecture' },
								{ slug: 'mateu-about/diagram' },
							],
						},
					],
				},
				{
					label: 'UX',
					items: [
						{ slug: 'ux', label: 'Overview' },
						{ slug: 'ux/app-structure', label: 'Structure of an app' },
						{ slug: 'ux/page-types', label: 'Page types' },
						{ slug: 'ux/components', label: 'Components' },
						{ slug: 'ux/extending', label: 'Extending the UI' },
						{ slug: 'ux/quality', label: 'How UX quality is kept' },
						{
							label: 'Pattern catalogue',
							collapsed: true,
							items: [
								{ slug: 'ux-patterns', label: 'Principles & full catalogue' },
								{
									label: 'App shell & navigation',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/navigation', label: 'Navigation & Menus' },
										{ slug: 'ux-patterns/command-center', label: 'Command Center (Ask Oracle)' },
										{ slug: 'ux-patterns/action-panel', label: 'Action Panel (I want to…)' },
										{ slug: 'ux-patterns/app-shortcuts', label: 'App Shortcuts & Quick Launch' },
										{ slug: 'ux-patterns/live-header-values', label: 'Live Header Values' },
										{ slug: 'ux-patterns/app-context', label: 'App Context Selector' },
										{ slug: 'ux-patterns/global-search' },
										{ slug: 'ux-patterns/notification-inbox' },
										{ slug: 'ux-patterns/notifications' },
										{ slug: 'ux-patterns/idle-session', label: 'Idle-Session Warning' },
										{ slug: 'ux-patterns/session-expiry' },
										{ slug: 'ux-patterns/not-found', label: 'Not Found' },
										{ slug: 'ai', label: 'Embedded AI chat' },
									],
								},
								{
									label: 'Page templates',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/page-templates', label: 'Page Templates' },
										{ slug: 'ux-patterns/choosing-a-page-template', label: 'Choosing a Page Template' },
										{ slug: 'ux-patterns/create-and-edit' },
										{ slug: 'ux-patterns/advanced-create-and-edit', label: 'Advanced Create & Edit' },
										{ slug: 'ux-patterns/smart-search' },
										{ slug: 'ux-patterns/hero-search' },
										{ slug: 'ux-patterns/to-do-list' },
										{ slug: 'ux-patterns/calendar' },
										{ slug: 'ux-patterns/collection-detail' },
										{ slug: 'ux-patterns/split-view' },
										{ slug: 'ux-patterns/tree-crud', label: 'Tree CRUD' },
										{ slug: 'ux-patterns/item-overview' },
										{ slug: 'ux-patterns/general-overview' },
										{ slug: 'ux-patterns/foldout' },
										{ slug: 'ux-patterns/waterfall-detail' },
										{ slug: 'ux-patterns/gantt' },
										{ slug: 'ux-patterns/data-management' },
										{ slug: 'ux-patterns/wizard' },
										{ slug: 'ux-patterns/dashboard' },
										{ slug: 'ux-patterns/welcome-page' },
										{ slug: 'ux-patterns/workspace' },
										{ slug: 'ux-patterns/task-centric', label: 'Task-Centric Page' },
										{ slug: 'ux-patterns/front-office', label: 'Front-Office Screens' },
									],
								},
								{
									label: 'Collections & listings',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/filters-and-listing' },
										{ slug: 'ux-patterns/bulk-actions' },
										{ slug: 'ux-patterns/saved-views' },
										{ slug: 'ux-patterns/aggregates', label: 'Totals & Row Grouping' },
										{ slug: 'ux-patterns/column-chooser' },
										{ slug: 'ux-patterns/inline-crud-editing', label: 'Inline Editing in Listings' },
										{ slug: 'ux-patterns/editable-table', label: 'Editable Table' },
										{ slug: 'ux-patterns/drag-to-a-destination', label: 'Drag Rows to a Destination' },
										{ slug: 'ux-patterns/guided-import' },
										{ slug: 'ux-patterns/kanban' },
										{ slug: 'ux-patterns/task-queue' },
										{ slug: 'ux-patterns/planning-board', label: 'Planning Board (Tape Chart)' },
										{ slug: 'ux-patterns/matrix-grid', label: 'Matrix Grid' },
										{ slug: 'ux-patterns/resource-grid' },
									],
								},
								{
									label: 'Forms & editing',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/partial-forms' },
										{ slug: 'ux-patterns/sections-index', label: 'Sticky Sections Index' },
										{ slug: 'ux-patterns/high-density', label: 'High-Density Screens' },
										{ slug: 'ux-patterns/layout-inference', label: 'Layout Inference' },
										{ slug: 'ux-patterns/entity-picker' },
										{ slug: 'ux-patterns/autosave' },
										{ slug: 'ux-patterns/optimistic-locking' },
										{ slug: 'ux-patterns/record-merge', label: 'Compare & Merge Records' },
										{ slug: 'ux-patterns/audit-diff', label: 'Audit Version Diff' },
										{ slug: 'ux-patterns/audience-projection', label: 'Audience Projection' },
										{ slug: 'ux-patterns/addon-picker', label: 'Add-On Picker' },
										{ slug: 'ux-patterns/payment-picker' },
										{ slug: 'ux-patterns/documents-and-printing', label: 'Documents and Printing' },
									],
								},
								{
									label: 'Overlays & feedback',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/drawer' },
										{ slug: 'ux-patterns/notice' },
										{ slug: 'ux-patterns/empty-states-and-skeletons' },
										{ slug: 'ux-patterns/undo' },
										{ slug: 'ux-patterns/long-running-jobs' },
										{ slug: 'ux-patterns/hover-details' },
										{ slug: 'ux-patterns/progress-steps' },
										{ slug: 'ux-patterns/task-progress' },
										{ slug: 'ux-patterns/slow-connections', label: 'Slow Connections' },
										{ slug: 'ux-patterns/client-error-log' },
										{ slug: 'ux-patterns/client-side-caching', label: 'Client-Side Caching' },
									],
								},
								{
									label: 'Display components',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/entity-header' },
										{ slug: 'ux-patterns/stat' },
										{ slug: 'ux-patterns/meter' },
										{ slug: 'ux-patterns/status-list' },
										{ slug: 'ux-patterns/timeline' },
										{ slug: 'ux-patterns/trend-chart' },
										{ slug: 'ux-patterns/funnel' },
										{ slug: 'ux-patterns/heatmap' },
										{ slug: 'ux-patterns/org-chart' },
										{ slug: 'ux-patterns/checklist' },
										{ slug: 'ux-patterns/comment-thread' },
										{ slug: 'ux-patterns/file-list' },
										{ slug: 'ux-patterns/ledger' },
										{ slug: 'ux-patterns/process-monitor' },
										{ slug: 'ux-patterns/callout-card' },
										{ slug: 'ux-patterns/offer-card' },
										{ slug: 'ux-patterns/comparison-card' },
										{ slug: 'ux-patterns/pricing-table' },
										{ slug: 'ux-patterns/feature-grid' },
										{ slug: 'ux-patterns/testimonials' },
										{ slug: 'ux-patterns/faq' },
									],
								},
								{
									label: 'Interaction',
									collapsed: true,
									items: [
										{ slug: 'ux-patterns/keyboard-shortcuts' },
										{ slug: 'ux-patterns/component-communication', label: 'Component Communication' },
									],
								},
							],
						},
					],
				},
				{
					label: 'Define the UI',
					items: [
						{ slug: 'define', label: 'Three paths, one model' },
						{
							label: 'YAML + visual editor (no code)',
							items: [
								{ slug: 'define/yaml/quickstart', label: 'Quickstart' },
								{ slug: 'define/yaml/pages', label: 'Pages in YAML' },
								{ slug: 'define/yaml/visual-editor', label: 'The visual editor' },
								{ slug: 'define/yaml/app-shell', label: 'App shell as data' },
								{ slug: 'define/yaml/partials', label: 'Partials' },
								{ slug: 'define/yaml/permissions', label: 'Permissions' },
								{ slug: 'define/yaml/translations', label: 'Translations' },
								{ slug: 'define/yaml/project-settings', label: 'Project settings' },
								{ slug: 'native/ide-tooling', label: 'IDE tooling (IntelliJ & VS Code)' },
								{ slug: 'design-systems/figma', label: 'From Figma' },
							],
						},
						{
							label: 'Code: Java',
							collapsed: true,
							items: [
								{
									label: 'Start Here',
									items: [
										{ slug: 'java-user-manual/start-here/quickstart' },
										{ slug: 'java-user-manual/start-here/first-app' },
									],
								},
								{
									label: 'Create Your Project',
									items: [
										{ slug: 'java-create-your-project' },
										{ slug: 'java-create-your-project/prerequisites' },
										{ slug: 'java-create-your-project/configuration' },
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
										{ slug: 'java-user-manual/build/dashboard-home-page' },
										{ slug: 'java-user-manual/build/domain-models' },
										{ slug: 'java-user-manual/build/entity-interfaces' },
										{ slug: 'java-user-manual/build/foreign-keys-and-options' },
										{ slug: 'java-user-manual/build/crud-navigation-flow' },
										{ slug: 'java-user-manual/build/capability-listings' },
										{ slug: 'java-user-manual/build/auto-orchestrators' },
										{ slug: 'java-user-manual/build/auto-adapters' },
										{ slug: 'java-user-manual/build/customizing-crud-and-listings' },
										{ slug: 'java-user-manual/build/listing-layout' },
										{ slug: 'java-user-manual/build/listing-row-actions' },
										{ slug: 'java-user-manual/build/filtered-orchestrators' },
										{ slug: 'java-user-manual/build/full-control-crud-orchestrator' },
										{ slug: 'java-user-manual/build/editable-view' },
										{ slug: 'java-user-manual/build/view-orchestrator' },
										{ slug: 'java-user-manual/build/listing' },
										{ slug: 'java-user-manual/build/relationships-vs-embedded-cruds' },
										{ slug: 'java-user-manual/build/master-detail' },
										{ slug: 'java-user-manual/build/orders-customers-order-lines' },
										{ slug: 'java-user-manual/build/live-reload', label: 'Live reload (development mode)' },
									],
								},
								{
									label: 'Advanced',
									items: [
										{ slug: 'java-user-manual/advanced/rules' },
										{ slug: 'java-user-manual/advanced/breadcrumbs' },
										{ slug: 'java-user-manual/advanced/layout-and-composition' },
										{ slug: 'java-user-manual/advanced/escaping-the-framework' },
										{ slug: 'java-user-manual/advanced/custom-web-components' },
										{ slug: 'java-user-manual/advanced/extensibility' },
										{ slug: 'java-user-manual/advanced/security' },
										{ slug: 'java-user-manual/advanced/i18n' },
										{ slug: 'java-user-manual/advanced/printing' },
										{ slug: 'java-user-manual/advanced/audit' },
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
								{
									label: 'UI Definition',
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
										{ slug: 'java-ui-definition/field-types' },
										{ slug: 'java-ui-definition/domain-vocabulary', label: 'Build Your Domain Vocabulary' },
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
								{ slug: 'kotlin-user-manual', label: 'Kotlin' },
							],
						},
						{ slug: 'csharp-user-manual', label: 'Code: C#' },
						{ slug: 'python-user-manual', label: 'Code: Python' },
						{ slug: 'define/mixing', label: 'Mixing YAML and code' },
						{ slug: 'reference/language-rosetta', label: 'Language Rosetta (Java/C#/Python)' },
						{
							label: 'With AI',
							items: [
								{ slug: 'ai-assistant-reference', label: 'AI assistant reference' },
								{ slug: 'reference/prompt-to-app', label: 'Prompt-to-app (AI authoring)' },
							],
						},
					],
				},
				{
					label: 'Renderers',
					items: [
						{ slug: 'design-systems', label: 'Overview' },
						{ slug: 'design-systems/vaadin', label: 'Web: Vaadin' },
						{ slug: 'design-systems/oracle-redwood', label: 'Web: Redwood / Visual Builder' },
						{ slug: 'native/react-native', label: 'Mobile: the Mateu app' },
						{ slug: 'ux-patterns/mobile-app', label: 'Mobile: Open on mobile (QR)' },
						{ slug: 'native', label: 'Desktop: IntelliJ (and native overview)' },
						{ slug: 'design-systems/branding-and-design-tokens', label: 'Branding & design tokens' },
						{ slug: 'design-systems/accent-strip', label: 'Accent colour and strip' },
						{
							label: 'Write your own',
							items: [
								{ slug: 'design-systems/renderer-contract' },
								{ slug: 'design-systems/bring-your-own-design-system' },
								{ slug: 'design-systems/reference-renderer', label: 'The reference renderer' },
							],
						},
					],
				},
				{
					label: 'Serve & deploy',
					items: [
						{ slug: 'deploy', label: 'Overview' },
						{
							label: 'Backends',
							items: [
								{ slug: 'java-create-your-project/springboot-mvc' },
								{ slug: 'java-create-your-project/springboot-webflux' },
								{ slug: 'java-create-your-project/quarkus' },
								{ slug: 'java-create-your-project/micronaut' },
								{ slug: 'java-create-your-project/helidon' },
								{ slug: 'csharp-user-manual', label: '.NET (ASP.NET Core)' },
								{ slug: 'python-user-manual', label: 'Python (FastAPI)' },
							],
						},
						{
							label: 'No backend',
							items: [
								{ slug: 'deploy/static-bundle', label: 'Static bundle' },
								{ slug: 'deploy/static-ui', label: 'A 100 % static UI' },
							],
						},
						{ slug: 'deploy/environments', label: 'Environments' },
						{ slug: 'java-user-manual/build/derived-openapi', label: 'The OpenAPI your UI implies' },
						{ slug: 'deploy/production-checklist', label: 'Production checklist' },
						{
							label: 'Guides',
							items: [
								{ slug: 'deploy/netlify', label: 'Netlify' },
								{ slug: 'deploy/kubernetes-hetzner-cloudfleet', label: 'Kubernetes on Hetzner (Cloudfleet)' },
								{ slug: 'deploy/mobile-app-stores', label: 'App Store & Google Play' },
								{ slug: 'mateu-about/standalone-desktop', label: 'Standalone desktop app' },
							],
						},
					],
				},
				{
					label: 'Reference',
					collapsed: true,
					items: [
						{ slug: 'reference/wire-specification', label: 'Wire specification & derivation' },
						{ slug: 'reference/agent-operability', label: 'Agent operability (MCP)' },
						{ slug: 'reference/key-annotations' },
						{ slug: 'reference/key-interfaces' },
						{ slug: 'reference/java-imports', label: 'Java imports' },
						{ slug: 'reference/fluent-model' },
						{ slug: 'reference/useful-types' },
						{ slug: 'reference/language-rosetta', label: 'Language Rosetta (Java/C#/Python)' },
						{ slug: 'reference/parity', label: 'Feature parity matrix' },
						{ slug: 'reference/stability-and-versioning', label: 'Stability & versioning' },
						{ slug: 'reference/migrating-from-alpha', label: 'Migrating from alpha' },
						{ slug: 'reference/support-policy', label: 'Support policy' },
						{ slug: 'reference/known-issues', label: 'Known issues' },
					],
				},
				{
					label: 'Quality',
					items: [
						{ slug: 'quality', label: 'Overview' },
						{ slug: 'ux-patterns/how-ux-is-evaluated', label: 'How UX is evaluated' },
						{ slug: 'ux-patterns/accessibility', label: 'Accessibility' },
						{ slug: 'java-user-manual/advanced/accessibility', label: 'Accessibility in your code' },
						{ slug: 'java-user-manual/advanced/testing', label: 'Testing your UI' },
						{ slug: 'reference/parity', label: 'Feature parity matrix' },
					],
				},
			],
		}),
	],
});
