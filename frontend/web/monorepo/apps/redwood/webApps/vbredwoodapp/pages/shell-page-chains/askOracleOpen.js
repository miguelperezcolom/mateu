/* Ask Oracle (the shell's FAB): opens the palette with ALL the destinations (navigation + the
 * listing's quick views) and the focus on the search box. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  // destination catalogue: ALL the menu's screens + the quick views of the listing
  // being viewed.
  //
  // The menu is walked WHOLE, not just the first level: a group is not a destination (it does not
  // resolve, and picking it would leave the palette offering a place you cannot go to), and the
  // screens hanging from it —including those served by another pod, which in a federated shell
  // are almost all of them— are exactly what one comes here to find. The group's trail goes on the
  // right of the row: two pods may have a screen with the same name.
  const collect = (nodes, trail, items) => {
    for (const node of nodes || []) {
      const deeper = trail ? trail + ' › ' + node.label : node.label;
      if (node.hasChildren) {
        collect(node.children, deeper, items);
      } else if (node.id) {
        items.push({ label: node.label, route: node.id, trail,
          icon: node.icon || 'oj-ux-ico-arrow-circle-right', kind: trail || bridge.chromeText('goTo') });
      }
    }
    return items;
  };

  const buildResults = ($application, text) => {
    const items = [];
    const home = $application.variables.mateuHomeRoute;
    if (home) {
      items.push({ label: bridge.chromeText('home'), route: home, icon: 'oj-ux-ico-home', kind: bridge.chromeText('goTo') });
    }
    collect($application.variables.mateuMenuTree, '', items);
    // quick views: the option filters of the CURRENT listing (there used to be three hand-written
    // front-office routes, which in any other app are three dead destinations)
    const listing = $application.variables.mateuListing || {};
    const route = $application.variables.mateuSelectedRoute;
    // only OPTION filters give quick views: a quick view is a destination with a value
    // set, and a free text or a range have no values to enumerate
    for (const quick of (listing.filters || [])) {
      if (!quick.isOptions && !quick.isMulti) continue;
      for (const option of (quick.options || [])) {
        items.push({ label: (listing.title || bridge.chromeText('listing')) + ' — ' + option.label, route,
          quickField: quick.fieldId, quickValue: option.value,
          icon: 'oj-ux-ico-filter', kind: bridge.chromeText('quickView') });
      }
    }
    // QUICK LAUNCH (@AppShortcut codes): the matching app shortcuts first — an exact code + Enter
    // goes straight there (appExtras.mjs)
    const reg = $application.variables.mateuRegistry;
    const shortcutRows = bridge.appShortcutRowsOf(reg && reg.shell ? reg.shell.shortcuts : [], text);
    const busca = (text || '').trim().toLowerCase();
    // the trail is searched too: "workflow" finds its screens
    return busca
      ? shortcutRows.concat(items.filter((item) => (item.label + ' ' + (item.trail || '')).toLowerCase().indexOf(busca) >= 0))
      : items;
  };

  class askOracleOpen extends ActionChain {

    async run(context) {
      const { $application, $page } = context;
      $page.variables.mateuAskResults = buildResults($application, '');
      await Actions.callComponentMethod(context, { selector: '#mateuAskOracle', method: 'open' });
      // Ask Oracle is only the destination finder: the agent chat has its own FAB and
      // its drawer (toggleMateuChat)
      setTimeout(() => {
        const input = document.querySelector('#mateuAskInput input');
        if (input) input.focus();
      }, 300);
    }
  }

  askOracleOpen.buildResults = buildResults;
  return askOracleOpen;
});
