# Redwood «Advanced Create and Edit» — revisión contra la guía (2026-10-23)

Fuente: la guía oficial de la plantilla,
<https://redwood.oracle.com/?pageId=GUIDEC7&page=shell&shell=content-page&selectedSection=section1>
(`oj-sp-advanced-create-edit`, categoría *Transactional*, desde 21C), y la API real del pack
`oj-sp` 2604.1.0 (loaders del CDN; ver `design/vb-page-template-apis.md` §2.13).

Regla de trabajo: en Redwood, **Spectra/VB mandan** — su plantilla, su componente y su contrato antes
que una imitación nuestra; se imita sólo si su contrato es imposible de cumplir con el contenido de
Mateu, y se dice. El objetivo es Redwood **a nivel de plantilla/UX**, no piezas sueltas.

Leyenda: ✅ soportado · 🟡 parcial · ❌ falta · ➖ no aplica.

## 1. Cuándo se usa

Crear o editar un objeto con **muchos atributos agrupados** en uno o más niveles, en una sola página.
En Mateu eso es el editor / la página de alta de un CRUD (`AutoCrud`, `Crud`) y cualquier formulario
largo seccionado que guarda o cancela.

## 2. Regiones (anatomía)

| # | Región | Guía | Mateu (modelo) | Redwood (renderer) | Estado |
|---|---|---|---|---|---|
| 1 | Información y acciones de página | requerida: título, Cancel, acción primaria | título, toolbar (cancel/save) | `oj-sp-header-create-edit` cuando la toolbar **cancela** junto a una primaria (#866) | ✅ |
| 2 | Main slot | contenido transaccional | `@Section`s, `FormLayout` | secciones `oj-sp-section` en el contenido rico (#866) | 🟡 el **formulario genérico** (formularios planos: sólo campos) aún pinta sus secciones a mano (`.mateu-form-section`) — ver §6 |
| 3 | Vertical anchor navigator | parte del main slot; enlaces a los títulos de sección | `@Toc` (tri-estado, auto > 4 secciones) | réplica del navegador de Spectra (#866; el componente no puede alojar contenido pintado por VB) | ✅ |
| 4 | Detail slot | datos contextuales; **excluyente** con el navegador | `@Aside` (→ `ContentLayout` aside) | se pinta como columna del contenido | 🟡 nada impide **índice + aside** a la vez (`tocOf` sólo descarta `@Zones`) |
| — | La plantilla en sí | `oj-sp-advanced-create-edit` (slots `main`/`detail`) | — | **compuesta** (cabecera + secciones + índice), no el componente | 🟡 ver §7 |

## 3. Comportamiento responsive

| Breakpoint | Guía | Estado |
|---|---|---|
| LG–XL | el navegador a la derecha, el resto a la izquierda | ✅ (columna `clamp(12rem, 25%, 20rem)`, pegada bajo la cabecera) |
| SM–MD | el contenido a todo el ancho; el navegador pasa a un **botón de menú** | ✅ (botón «Sections» + `oj-popup`, como el componente) |

## 4. Propiedades de página

| Propiedad | Guía | Mateu | Estado |
|---|---|---|---|
| Page layout | **sólo Fixed width** (Full width / Edge to edge: no) | `pageType=form` → `fixed` por defecto; `@PageWidth` puede forzar otro | 🟡 un `@PageWidth(FULL_WIDTH)` en un editor no se corrige ni se avisa |
| Display mode | light (defecto) / mixed / themeable — color del **header**, el fondo siempre claro | no existe | ❌ (menor: el defecto es el de Redwood) |

## 5. Elementos de la cabecera (región 1)

| # | Elemento | Req. | Mateu | Redwood | Estado |
|---|---|---|---|---|---|
| 1 | Page title | sí | `@Title`/`TitleSupplier`, `@TitlePlaceholder` | `page-title` + `page-title-placeholder` | ✅ |
| 2 | Page subtitle | no | `@Subtitle`/`SubtitleSupplier` | `page-subtitle` | ✅ |
| 3 | Avatar / iniciales / foto | no | `@Avatar` / `AvatarSupplier` → `PageDto.avatar` | **no se proyecta** (`pageHeaderOf` no lo lee) | ❌ |
| 4 | Contextual info (≤ 4; visibles al hacer scroll si la cabecera es sticky) | no | `@KPI`, facts del `EntityHeader` | `contextual-info` + `contextual-info-sticky` | ✅ (Spectra corta a 4) |
| 5 | Parent link | no | breadcrumb padre (`parentCrumb`) | `display-options.go-to-parent="false"` fijo | 🟡 se pierde el enlace al padre cuando lo hay |
| 6 | Next action (lateral) | no | `PeerNavigationSupplier` (prev/next) | no se pasa a la cabecera de edición (sólo existe `next`) | ❌ |
| 7 | Save (guarda y se queda) | no | no hay «save sin salir» distinto de la primaria en el CRUD | `display-options.save="off"` | ➖ (sin modelo; ver §8) |
| 8 | Cancel | **sí** | `cancel` / `cancel-edit` / `cancel-new` / `cancel-create` | Cancel del componente → acción de cancelar (`spCancel`) | ✅ (el texto lo pone Spectra en el idioma de la UI) |
| 9 | Primary action (defecto «Submit») | **sí** | la primaria de la toolbar (save/create…) | `primary-action` → `spPrimaryAction` | ✅ |
| 10 | Secondary actions (≤ 10; menú desde 2) | no | resto de la toolbar | `secondary-actions` | ✅ |
| 11 | Badge | no | `@BadgeInHeader`/`HeaderBadgesSupplier` (el 1º) | `badge` | ✅ (los demás siguen al subtítulo) |
| 12 | Timestamp (requerido con Save) | no | `@Timestamp` | `timestamp` (sólo fechas) | ✅ |

## 6. Slots: componentes permitidos

| Slot | Guía | Mateu | Estado |
|---|---|---|---|
| Main | Form Layout, Vertical Anchor Navigator, Messages Banner | campos en `FormLayout` ✅, índice ✅, `@Banner` (banda de mensajes de la shell) ✅ — **y además** tablas (listas `List<Row>` dentro de secciones) | 🟡 Redwood pone las colecciones en el **detail slot**; nosotros las dejamos en su sección (decisión del modelo, no del renderer) |
| Detail | List View, Dynamic Table, Table, Attachments, Collections Container(s), Information Organizer | `@Aside` con cualquier componente | 🟡 sin validar contenido; y excluyente con el índice (§2) |

Hallazgo de esta revisión (verificado en navegador con `demo-vb /section-actions`): un formulario
**plano** (sólo campos con `@Section`) va por el camino del **formulario genérico**, que pinta título
+ botones propios — ni `oj-sp-section` ni sus acciones. El contenido rico (tarjetas de sección, como el
editor de reservas) sí usa `oj-sp-section`. Las dos rutas tienen que converger.

## 7. Componente de plantilla vs composición

Hoy la página de edición se **compone** con piezas de Spectra (`oj-sp-header-create-edit`,
`oj-sp-section`) y una réplica del navegador. La plantilla `oj-sp-advanced-create-edit` es un
contenedor con slots (`main`, `detail`, `search`, `innerEnd`) y la misma API de cabecera, así que **sí
puede alojar contenido pintado por VB** — a diferencia del navegador. Usarla daría su padding, su
cabecera sticky, su responsive y su exclusión navegador/detail de serie.

Coste: la página pinta todo dentro de un único contenedor de contenido; envolverlo en la plantilla
exige una rama propia para las páginas de edición (contenido rico + formulario genérico dentro de
`slot="main"`, `@Aside` en `slot="detail"`), con su superficie de átomos generada (`make-html.mjs`).

## 8. Plan propuesto

1. **Formulario genérico → `oj-sp-section`** con sus acciones (add / edit / view more), como el
   contenido rico. (Ya hecho para el contenido rico en la rama `feat/redwood-section-actions`.)
2. **Página de edición = `oj-sp-advanced-create-edit`** (§7): header por sus props, contenido en
   `main`, `@Aside` en `detail`, índice (réplica) dentro de `main`; excluir índice si hay detail.
3. **Cabecera**: avatar (`PageDto.avatar`), next (peer nav), parent link cuando hay padre.
4. **Page layout**: forzar `fixed` en páginas de edición (o avisar) y `display-mode` si se modela.
5. Repetir esta revisión con **cada plantilla** de la guía de Redwood (Simple Create and Edit,
   Create/Edit Drawer, Guided Process, General/Item Overview, Smart Search, Foldout, Welcome,
   Dashboard…) y llevar el resultado a `design/vb-template-coverage-audit.md`.
