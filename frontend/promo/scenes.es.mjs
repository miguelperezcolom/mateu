// Spanish scene lists (explainer + teaser). Mirror of scenes.mjs. Rendered with a Spanish `say`
// voice (see VOICES in scenes.mjs). The terminal scenes keep the REAL captured output; only the
// comment/result lines are translated.

import { page, term } from "./theme.mjs";

const BRAND = "Mateu · operabilidad por agentes";

const routesJson =
  `<span class="c">// un modelo real lo escribió desde "crea un fichero de rutas con dos pantallas"</span>\n` +
  `{\n  <span class="p">"type"</span>: <span class="s">"Routes"</span>,\n` +
  `  <span class="p">"routes"</span>: [\n` +
  `    { <span class="p">"route"</span>: <span class="s">"bookings"</span>,  <span class="p">"layout"</span>: <span class="s">"bookings"</span>  },\n` +
  `    { <span class="p">"route"</span>: <span class="s">"customers"</span>, <span class="p">"layout"</span>: <span class="s">"customers"</span> }\n` +
  `  ]\n}\n\n<span class="s">✓ válido contra el routes-schema.json publicado — al primer intento</span>`;

const operateTerm =
  `<span class="u">tú ▸</span> "lista las reservas"\n\n` +
  `<span class="c">el agente, por MCP:</span>\n` +
  `  → mateu_search("bookings")        <span class="c">// lee datos reales</span>\n` +
  `  → navigation-requested → <span class="p">/booking/bookings</span>  <span class="c">// mueve la UI</span>\n\n` +
  `<span class="s">47 reservas — 28 confirmadas, 19 canceladas.</span>`;

export const explainerEs = [
  {
    id: "hook",
    vo: "Todo equipo que construye software interno choca con lo mismo: la interfaz. La diseñas, y luego la construyes a mano, pantalla tras pantalla. Mateu se hace otra pregunta. ¿Y si la interfaz fuera solo datos?",
    html: page(
      `<div class="kicker">El problema de la interfaz</div>
       <h1>Diseñas la interfaz.<br>Luego la <span class="k">construyes a mano</span>.<br>Pantalla tras pantalla.</h1>
       <p class="sub">Mateu se hace otra pregunta — ¿y si la interfaz fuera solo <span class="k2">datos</span>?</p>`,
      { brand: BRAND },
    ),
  },
  {
    id: "ui-is-data",
    vo: "En Mateu declaras el modelo una vez. Campos, formularios, listados, navegación — como definición, no como código. De esa única definición, Mateu renderiza web, nativo y estático. Pero aquí viene lo que lo cambia todo en la era de la inteligencia artificial.",
    html: page(
      `<div class="kicker">Una idea</div>
       <h1>Declara el modelo <span class="k">una vez</span>.</h1>
       <p class="sub">Formularios, CRUDs, filtros, navegación, wizards — como <span class="k2">definición</span>, no código.
       Una definición renderiza web, nativo y estático.</p>
       <ul class="pts" style="margin-top:26px">
         <li>Código — <b>@UI</b> en Java, C# o Python</li>
         <li>O datos — YAML / el visual builder</li>
       </ul>`,
      { brand: BRAND },
    ),
  },
  {
    id: "two-planes",
    vo: "Como la interfaz es un dato que se describe a sí mismo, no es solo algo que un renderer convierte en píxeles: es algo que un agente puede leer, e incluso escribir. Eso es un segundo plano entero, sobre el mismo contrato.",
    html: page(
      `<div class="kicker">Por qué importa ahora</div>
       <h1>El dato autodescriptivo no es solo para <span class="k">píxeles</span>.<br>Es para <span class="k2">agentes</span>.</h1>
       <p class="sub">Dos planos sobre un contrato: los renderers lo convierten en UI — y los agentes lo
       <b>operan</b> e incluso lo <b>escriben</b>.</p>`,
      { brand: BRAND },
    ),
  },
  {
    id: "operate",
    vo: "Ahora cada app Mateu es también un servidor M C P. Un único endpoint convierte cada pantalla en herramientas que cualquier agente descubre y ejecuta: listar las rutas, describir los campos y acciones de una pantalla, ejecutar una acción, buscar en un listado.",
    html: page(
      `<div class="kicker">Mitad uno · operar</div>
       <h1>Cada app es también un servidor <span class="k">MCP</span>.</h1>
       <ul class="pts">
         <li>mateu_list_routes <small>las pantallas navegables</small></li>
         <li>mateu_describe_screen <small>campos, acciones, estado actual</small></li>
         <li>mateu_run_action · mateu_search <small>actuar y consultar</small></li>
       </ul>
       <p class="sub" style="margin-top:18px">Sidecar para cualquier backend, o nativo en <b>POST /mateu/mcp</b> — Java, .NET, Python.</p>`,
      { brand: BRAND },
    ),
  },
  {
    id: "rbac",
    vo: "Y es seguro por construcción. Los permisos se aplican en el servidor, sobre el token del usuario. Un campo o una acción que el usuario no puede tocar ni siquiera llega al agente. Sin teatro de seguridad.",
    html: page(
      `<div class="kicker">Seguro por construcción</div>
       <h1>Permisos en el <span class="k">servidor</span>. Sin teatro.</h1>
       <p class="sub"><b>@EyesOnly</b>, <b>@ReadOnlyUnless</b>, <b>@DisabledUnless</b> — sobre el JWT.
       Lo que un token no puede tocar <span class="k2">nunca llega al agente</span>.</p>`,
      { brand: BRAND },
    ),
  },
  {
    id: "operate-demo",
    vo: "Y es real. Conectamos un agente con un modelo real a una app de reservas Mateu, y le dijimos: lista las reservas. Llamó a las herramientas, leyó cuarenta y siete registros reales, y llevó la interfaz a la pantalla de reservas — él solo.",
    html: page(
      `<div class="kicker">En vivo · el agente opera la app</div>
       ${term("agente ▸ app de reservas (MCP)", operateTerm)}`,
      { brand: BRAND },
    ),
  },
  {
    id: "author",
    vo: "La otra mitad es la autoría. Como la interfaz es un dato, y Mateu publica esquemas JSON para él, un modelo puede escribir la definición — y la salida se valida de forma mecánica contra el contrato.",
    html: page(
      `<div class="kicker">Mitad dos · autorar</div>
       <h1>El modelo puede <span class="k2">escribir la interfaz</span>.</h1>
       <p class="sub">Mateu publica esquemas JSON para la definición. Así la salida se
       <b>valida contra el contrato</b> — con bucle de reparación.</p>
       <p class="sub" style="margin-top:8px"><span class="chip on">prompt</span><span class="chip on">→ definición</span><span class="chip on">→ validar</span><span class="chip on">→ reparar</span></p>`,
      { brand: BRAND },
    ),
  },
  {
    id: "vs-react",
    vo: "Esa es la diferencia con dejar que la inteligencia artificial genere React. La I A emite una definición pequeña, revisable, validada contra un esquema, y reparada si está mal — no miles de líneas de código que nadie lee.",
    html: page(
      `<div class="kicker">Por qué es diferente</div>
       <h1>IA + React vs <span class="k">IA + Mateu</span></h1>
       <div class="row" style="margin-top:14px">
         <div class="col"><span class="chip">IA + React</span>
           <p class="sub">miles de líneas de código imperativo · irrevisable · el volumen es el pasivo</p></div>
         <div class="col"><span class="chip on">IA + Mateu</span>
           <p class="sub"><b>una definición pequeña</b> · revisable · <span class="k2">validada contra un esquema</span></p></div>
       </div>`,
      { brand: BRAND },
    ),
  },
  {
    id: "author-demo",
    vo: "De nuevo, real. Crea un fichero de rutas con dos pantallas. Un modelo real escribió esta definición, y pasó el esquema publicado a la primera. El modelo escribió la interfaz.",
    html: page(
      `<div class="kicker">En vivo · el modelo escribe la interfaz</div>
       ${term("prompt-to-app ▸ routes-schema.json", routesJson)}`,
      { brand: BRAND },
    ),
  },
  {
    id: "recap",
    vo: "Una idea, dos consecuencias. La interfaz es un dato — así que los agentes pueden operar tus apps, y ayudar a escribirlas. Operabilidad en runtime, ya disponible en Java, punto NET y Python. Prompt-to-app, una prueba de concepto que funciona.",
    html: page(
      `<div class="kicker">Todo junto</div>
       <h1>La interfaz es un <span class="k">dato</span>.<br>Los agentes la <span class="k">operan</span>. Los agentes la <span class="k2">escriben</span>.</h1>
       <ul class="pts" style="margin-top:20px">
         <li>Operar — disponible, Java · .NET · Python, con RBAC</li>
         <li>Autorar — prompt-to-app, validado por esquema (prueba de concepto)</li>
       </ul>`,
      { brand: BRAND },
    ),
  },
  {
    id: "cta",
    vo: "Mateu. Define tu interfaz una vez. Deja que humanos y agentes construyan el resto. Código abierto, Apache dos punto cero.",
    html: page(
      `<div class="big">Mateu</div>
       <h1 class="sm" style="margin-top:6px">Define tu interfaz una vez.<br>Deja que <span class="k">humanos y agentes</span> construyan el resto.</h1>
       <p class="sub">Código abierto · Apache 2.0 · <span class="k2">mateu.io</span></p>`,
      { center: true, brand: "" },
    ),
  },
];

export const teaserEs = [
  {
    id: "hook",
    vo: "Tu interfaz es un dato. Mira lo que eso desbloquea.",
    html: page(
      `<h1 style="font-size:76px">Tu interfaz es un <span class="k">dato</span>.</h1>
       <p class="sub" style="font-size:32px">Mira lo que eso desbloquea.</p>`,
      { center: true, brand: BRAND },
    ),
  },
  {
    id: "operate",
    vo: "Cada app Mateu es también un servidor M C P, así que cualquier agente puede operarla. Le dijimos a un modelo real: lista las reservas. Leyó cuarenta y siete registros reales, y movió la interfaz él solo.",
    html: page(
      `<div class="kicker">Los agentes operan tu app</div>
       ${term("agente ▸ app de reservas (MCP)", operateTerm)}`,
      { brand: BRAND },
    ),
  },
  {
    id: "author",
    vo: "Y como Mateu publica un esquema para la interfaz, un modelo también puede escribirla. Crea un fichero de rutas con dos pantallas. El modelo escribió esto — válido contra el esquema publicado, a la primera.",
    html: page(
      `<div class="kicker">Los agentes escriben tu app</div>
       ${term("prompt-to-app ▸ routes-schema.json", routesJson)}`,
      { brand: BRAND },
    ),
  },
  {
    id: "why",
    vo: "Pequeño, revisable, verificable — no miles de líneas de código generado por inteligencia artificial que nadie lee. El framework aporta el comportamiento, la accesibilidad y la seguridad.",
    html: page(
      `<div class="kicker">Por qué importa</div>
       <h1 class="sm">Pequeño. Revisable. <span class="k2">Verificable.</span></h1>
       <p class="sub">No miles de líneas de código generado por IA. El framework aporta el comportamiento,
       la accesibilidad y la seguridad — una sola vez.</p>`,
      { brand: BRAND },
    ),
  },
  {
    id: "cta",
    vo: "Define tu interfaz una vez. Deja que humanos y agentes construyan el resto. Mateu — código abierto.",
    html: page(
      `<div class="big">Mateu</div>
       <h1 class="sm" style="margin-top:6px">Define una vez.<br>Humanos y <span class="k">agentes</span> construyen el resto.</h1>
       <p class="sub">Código abierto · <span class="k2">mateu.io</span></p>`,
      { center: true, brand: "" },
    ),
  },
];
