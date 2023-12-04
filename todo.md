
## bugs
- collections deben comportarse como los arrays
- no pide los parámetros en las actions
- quitar el rich text que no utiliza el componente de vaadin
- algunas veces arrastra componentes de otros formularios (cuando sucede un error)
- mateu.js:13689 Uncaught (in promise) TypeError: this.component.setLabel is not a function
  at MateuField.setupComponent (mateu.js:13689:1218)
  at MateuField.updated (mateu.js:13689:1122)
- validaciones en lado cliente y en lado servidor
- exportar
## missing features
- links en formularios
- tablas en formularios
- abrir en modal
- mapas
- colecciones complejas (terminar)
- grabar y permanecer
- link al detalle al grabar
- formularios parciales / secciones con actions
- buscar por texto + filtros
- mensajes
## improvements
- ir a vista solo lectura si hay campos con relaciones @xtomany
- inferir crud para entidad jpa cuando @xtomany
- pensar edición con objeto pinned
## tasks
- clean unused classes / code
- add/recover tests
- refactor where advisable
- make more extensible
- recover docs
- doc api
- add readmes to every module
- add javadoc to public classes and interfaces
