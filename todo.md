## bugs
- algunas veces arrastra componentes de otros formularios (cuando sucede un error)
- mateu.js:13689 Uncaught (in promise) TypeError: this.component.setLabel is not a function
  at MateuField.setupComponent (mateu.js:13689:1218)
  at MateuField.updated (mateu.js:13689:1122)
- validaciones en lado cliente (min, max) y en lado servidor
- exportar
- do not support file type --> only string
## missing features
- abrir en modal
- secciones remotas
- parámetros opciones menú?
- links en formularios
- tablas en formularios
- colecciones complejas (terminar)
- mapas
- grabar y permanecer
- link al detalle al grabar
- formularios parciales / secciones con actions
- buscar por texto + filtros
- mensajes
- captcha
- captcha for files
## improvements
- journey al cliente? pasar --> meter en store --> devolver
- ir a vista solo lectura si hay campos con relaciones @xtomany
- inferir crud para entidad jpa cuando @xtomany
- pensar edición con objeto pinned
- error messages / static code validation
## tasks
- clean unused classes / code
- add/recover tests
- refactor where advisable
- make more extensible
- recover docs
- doc api
- add readmes to every module
- add javadoc to public classes and interfaces

