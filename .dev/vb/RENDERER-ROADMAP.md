# Mateu-sobre-VB — Roadmap por fases con validación VISUAL

> El problema histórico del renderer Redwood **nunca fue el mecanismo, fue la fidelidad visual**:
> funcionaba mejor o peor, pero **no se parecía a una app Redwood**. Este roadmap invierte el eje:
> se ordena por **entregable visible**, y **no se pasa de fase sin una validación visual que pase**.

## Principio rector (la causa raíz y su antídoto)

Los intentos anteriores fallaron porque **aproximaban** el chrome y los componentes en vez de usar los reales.

- **Construir DENTRO de una app VB real** (base: `.dev/vb/frontoffice`), montando desde la Fase 1 el
  `oj-sp-simple-ui-shell` auténtico + `oj-sp-global-header` + `oj-sp-navigator`, y usando los componentes
  reales `oj-dynamic`/`oj-sp`/`oj-c` para cada superficie.
- La fidelidad visual se **hereda** de esos componentes; el bridge (reducer + efectos) **solo alimenta datos**.
- Nunca dibujar a mano lo que un componente Oracle ya pinta. Si un componente no existe o no encaja, eso
  ES la señal de parar y resolver el aspecto **antes** de avanzar.
- Dos niveles de validación, ambos obligatorios: **lógica** (POC Node, `renderer-poc/test.mjs`) y **aspecto**
  (puerta visual de cada fase).

## Protocolo de la puerta visual (idéntico en cada fase)

1. **Referencia**: la MISMA superficie `oj-sp-*`/`oj-c-*` renderizada de forma nativa — una página VBCS
   autorada con datos hardcodeados, o la pantalla equivalente del `frontoffice` / una app Redwood real.
2. **Método**: captura de la superficie alimentada-por-Mateu y comparación lado a lado con la referencia,
   mismo viewport (p.ej. 1440×900) y mismo tema.
3. **Criterio = "indistinguible de una pantalla Redwood nativa"**, no "se parece bastante". Checklist:
   - global-header + tira de color RDS + texturas de fondo + footer
   - escala tipográfica y pesos
   - spacing / densidad (compact vs cómodo)
   - chrome de campos (label-aside, bordes, foco, estados hover/active)
   - densidad de tabla + smart-search bar + estados vacíos
   - `pageWidth` (fixed / fullWidth / edgeToEdge)
   - light/dark si aplica
4. **Salida**: guardar la captura en `.dev/vb/renderer-poc/shots/faseN.png` como evidencia; si NO pasa,
   no se abre la fase siguiente.

## Fases

| # | Entregable visible | Qué se construye debajo (mínimo) | Puerta visual (pasa si…) |
|---|---|---|---|
| **1** | **Hola mundo** dentro de la shell real | shell `oj-sp-simple-ui-shell` + header; `vbEnter → callMateu(__load__)` devuelve una Page con un `Text`; render de 1 nodo | el **chrome** (header, tira RDS, fondos, footer) es indistinguible de una app Redwood; el texto sale en su sitio |
| **2** | **App con 2–3 opciones** de menú simples | `App` metadata → `shell` slice; `oj-sp-navigator` con 2–3 rutas; clic = `loadRoute` | el navigator (iconos, activo, hover) es idéntico al de Redwood; navegar cambia contenido sin recargar la shell |
| **3** | **Formulario básico** editable | dispatcher `FormLayout`/`FormField` (switch `widgetFor` o `oj-dyn-form`); `value` two-way; botón Save → `runActionChain` | los campos son `oj-c-*`/`oj-dyn-form` auténticos: label-aside, densidad, foco y validación como Redwood |
| **4** | **Listado** | `oj-dynamic-table` alimentada por un listing de Mateu; smart-search bar | densidad de filas, cabeceras, smart-search y estado vacío como una collection Redwood |
| **5** | **CRUD** completo | New/Edit/Delete; navegación a form o drawer (`editInDrawer`) | el flujo entero (lista ↔ form ↔ guardar ↔ refresco) se ve nativo; toasts/banners reales |
| **6** | **App con menú complejo** | menú profundo/grupos; `@AppContext` selectors; header actions | navigator con submenús + selectores de contexto + acciones de cabecera idénticos a Redwood |
| **7** | **Foldout** | `FoldoutLayout`/`FoldoutPanel` → `oj-sp-foldout-layout`/`-panel` (dispatcher recursivo) | los paneles se pliegan/despliegan y se ven como el foldout de Redwood |
| **8** | **Guided process** | Wizard → `oj-sp-guided-process`; rail/steps | el proceso guiado (rail, pasos, navegación) es el `oj-sp-guided-process` auténtico |
| **9** | **App anidada** | mediador embebido / isla vía registro `targetComponentId→contexto`; overlays apilados | la isla/app anidada se repinta sola sin romper el host; se ve como un componente embebido Redwood |
| … | (crece: dashboard, item/general overview, planning, calendar, command center) | reutiliza el mismo dispatcher + registro | cada superficie valida contra su `oj-sp-*` nativo |

## Cómo encaja el trabajo ya hecho

- El **reducer + registro por id + efectos** (`renderer-poc/reduceContexts.mjs`, 10 tests verdes) es el motor
  transversal que crece por debajo de las fases; **nunca es el hito** — el hito es siempre la captura.
- El **dispatcher recursivo** (`mateu-node`) se estrena en Fase 3 (rama FormLayout) y se amplía una rama por
  fase (tabla, foldout, guided-process…). Como la mayoría de arquetipos son composición de un núcleo de ~20
  tipos, cada fase añade pocas ramas.
- Antes de Fase 1, un paso previo recomendado: **`capture.mjs`** contra un backend Mateu vivo para fijar el
  contrato de wire real (paths `component.id`, `initialData`, metadata de `Drawer`) — así los fixtures del POC
  dejan de ser sintéticos.

## La regla, en una línea

**Cada fase = una pantalla que un usuario Redwood no distinguiría de la nativa.** Si la captura no lo logra,
se arregla el aspecto antes de tocar la fase siguiente.
