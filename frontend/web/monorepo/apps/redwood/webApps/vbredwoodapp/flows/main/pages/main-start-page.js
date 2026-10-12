/* Mateu — Apache License 2.0 (LICENSE.txt en la raíz del repositorio) */

// Módulo de la página de contenido: las chains están en *-chains/; aquí solo lo que una
// expresión de binding necesita llamar.
define([], () => {
  'use strict';
  return class MateuContentPageModule {
    /**
     * Las filas del listing tal como las ordenó el SERVER: el proveedor de datos de la página
     * sin la ordenación local. oj-table, al pulsar una cabecera, pide al proveedor la página
     * actual con `sortCriteria` y el ArrayDataProvider la ordenaba EN LOCAL, encima del orden que
     * el server ya aplicó a TODAS las filas (listingSorted pide la búsqueda ordenada): el segundo
     * clic (descendente) traía la página buena del server y la tabla la pintaba al revés.
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
