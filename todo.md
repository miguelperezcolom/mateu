## bugs
- algunas veces arrastra componentes de otros formularios (cuando sucede un error)
- mateu.js: Uncaught TypeError: this.component.setLabel is not a function (MateuField.setupComponent)

## missing features
- secciones remotas
- captcha
- captcha for files

## improvements
- 1 sola petición
- ir a vista solo lectura si hay campos con relaciones @xtomany
- inferir crud para entidad jpa cuando @xtomany

## tasks
- clean unused classes / code
- add/recover tests
- add javadoc to public classes and interfaces
- add readmes to every module

## done (para referencia)
- layout adaptativo de listados: motor de pesos compartido (WeightEstimator), selector de columnas (table/twoLineList/cards/masterDetail) y selector de filtros (inline/popover/drawer/dialog) según ancho real. Nuevas anotaciones @Priority + @Weight + RECORD_COMPONENT target. Nuevos campos GridColumn.priority/identifier/weight y Listing.filtersLayout/gridLayout.
- motor implementado en renderer SAP UI5: weightEngine.ts (lib compartida), mateu-sapui5-table (ResizeObserver + layouts adaptativos), mateu-sapui5-filter-bar (inline/popover/drawer/dialog).
- motor implementado en renderer Vaadin: DTOs actualizados (CrudlDto + GridColumnDto), mateu-filter-bar (inline/popover/drawer/dialog con Lumo tokens), mateu-table-crud (ResizeObserver + list/cards/masterDetail/table).
- exportar CSV / Excel / PDF (módulos opcionales export-excel, export-pdf)
- buscador con columnas, filtros, etc. (@Searchable / Selector)
- do not support file type → file upload en campos de formulario
- validaciones lado cliente (min, max) via ConstraintValidationMapper
- abrir en modal (Dialog + ServerSideComponent)
- links en formularios (stereotype link)
- tablas en formularios (stereotype grid / colecciones complejas)
- mapas (@vaadin/map)
- grabar y permanecer (_create-and-stay)
- link al detalle al grabar (UICommand.navigateTo)
- formularios parciales / secciones con actions (FormSection)
- buscar por texto + filtros con URL sync (filtros, página, orden)
- mensajes (Message)
- pasar request en cada método (HttpRequest en todos los métodos)
- i18n / Translator
- UploadEnabled (Import en listados)
- Auditable (historial de cambios)
- ReactiveListingBackend
- docs actualizadas
