/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root) */

// The content page module: the chains are in *-chains/; here only what a binding
// expression needs to call.
define([], () => {
  'use strict';
  return class MateuContentPageModule {
    /**
     * The listing rows as the SERVER sorted them: the page's data provider without the local
     * sorting. oj-table, when a header is clicked, asks the provider for the current page with
     * `sortCriteria` and the ArrayDataProvider sorted it LOCALLY, on top of the order the server
     * had already applied to ALL rows (listingSorted asks for the sorted search): the second
     * click (descending) brought the right page from the server and the table painted it reversed.
     */
    serverSorted(dp) {
      if (!dp || typeof dp.fetchFirst !== 'function') return dp;
      const unsorted = (params) => {
        if (!params || !params.sortCriteria) return params;
        const copy = Object.assign({}, params);
        delete copy.sortCriteria;
        return copy;
      };
      // the table reads its sort indicator back from the results' fetchParameters: they keep
      // saying what the table ASKED for, so the header still shows (and toggles) the sort
      const asAsked = (params, iterable) => ({
        [Symbol.asyncIterator]: () => {
          const it = iterable[Symbol.asyncIterator]();
          return {
            next: () => it.next().then((r) => {
              if (r && r.value && params) r.value.fetchParameters = params;
              return r;
            }),
          };
        },
      });
      return {
        fetchFirst: (params) => asAsked(params, dp.fetchFirst(unsorted(params))),
        fetchByKeys: (params) => dp.fetchByKeys(params),
        containsKeys: (params) => dp.containsKeys(params),
        fetchByOffset: (params) => dp.fetchByOffset(unsorted(params)),
        getCapability: (name) => dp.getCapability(name),
        getTotalSize: () => dp.getTotalSize(),
        isEmpty: () => dp.isEmpty(),
        createOptimizedKeySet: dp.createOptimizedKeySet ? (keys) => dp.createOptimizedKeySet(keys) : undefined,
        createOptimizedKeyMap: dp.createOptimizedKeyMap ? (map) => dp.createOptimizedKeyMap(map) : undefined,
        addEventListener: (type, listener) => dp.addEventListener(type, listener),
        removeEventListener: (type, listener) => dp.removeEventListener(type, listener),
        dispatchEvent: (event) => dp.dispatchEvent(event),
      };
    }
  };
});
