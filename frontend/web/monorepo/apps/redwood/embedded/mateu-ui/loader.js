/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root).
 *
 * <mateu-ui>: a Mateu screen inside a Visual Builder / JET page — the JET Custom Component (CCA)
 * of the Redwood renderer's EMBEDDED mode. Everything from Oracle (JET, the Spectra oj-sp
 * components) is the HOST's: this component vendors none of it (NOTICE.md).
 *
 * Its view is the content page of the standalone VB app and its viewModel runs the same chains
 * (see apps/redwood/poc/embedded.mjs and make-embedded.mjs, which generates this package).
 */
define([
  'ojs/ojcomposite',
  'text!./mateu-ui-view.html',
  './mateu-ui-viewModel',
  'text!./component.json',
  'css!./mateu-ui-styles',
], (Composite, view, viewModel, metadata) => {
  'use strict';

  Composite.register('mateu-ui', {
    view,
    viewModel,
    metadata: JSON.parse(metadata),
  });
});
