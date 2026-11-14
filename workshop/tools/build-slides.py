#!/usr/bin/env python3
"""Writes workshop/slides.html (EN) and workshop/slides.es.html (ES) from ONE template, so the two
decks never drift apart. Edit the texts here, then: python3 workshop/tools/build-slides.py

The look is the promo reel's (doc/public/reel.html): dark ground, a faint engineering grid, mono
headlines, azure and amber accents. Self-contained: no external script, no external font."""

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent

CSS = """
:root{color-scheme:dark;--ground:#081319;--panel:#0f2530;--ink:#eaf2f2;--muted:#8fa9b1;--line:#17323d;
--azure:#4cb2ff;--amber:#f6b23c;--good:#39d98a;
--mono:ui-monospace,"JetBrains Mono","SF Mono","Cascadia Code",Menlo,Consolas,monospace;
--sans:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:#030608;color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased}
body{display:grid;place-items:center;padding:clamp(8px,2.5vw,32px)}
.deck{position:relative;width:min(100%,calc((100vh - 64px)*16/9),1280px);aspect-ratio:16/9;border-radius:16px;overflow:hidden;
background:radial-gradient(120% 80% at 78% -10%,rgba(76,178,255,.14),transparent 55%),radial-gradient(90% 90% at 12% 115%,rgba(246,178,60,.10),transparent 55%),var(--ground);
border:1px solid var(--line);box-shadow:0 40px 120px -40px rgba(0,0,0,.9)}
.deck::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.3;
background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:44px 44px;
-webkit-mask-image:radial-gradient(120% 100% at 50% 40%,#000 40%,transparent 85%);mask-image:radial-gradient(120% 100% at 50% 40%,#000 40%,transparent 85%)}
.slide{position:absolute;inset:0;padding:6% 7%;display:flex;flex-direction:column;justify-content:center;gap:2.2vh;
opacity:0;visibility:hidden;transform:translateY(10px);transition:opacity .45s ease,transform .45s ease}
.slide.active{opacity:1;visibility:visible;transform:none}
.eyebrow{font-family:var(--mono);font-size:clamp(10px,1.1vw,14px);letter-spacing:.28em;text-transform:uppercase;color:var(--amber);display:flex;align-items:center;gap:10px}
.eyebrow::before{content:"";width:22px;height:1px;background:var(--amber);opacity:.7}
h1,h2{font-family:var(--mono);font-weight:700;letter-spacing:-.02em;line-height:1.05;text-wrap:balance}
h1{font-size:clamp(28px,5.2vw,68px)}h2{font-size:clamp(22px,3.4vw,44px)}
.lead{color:var(--muted);font-size:clamp(13px,1.7vw,22px);line-height:1.45;max-width:52ch}
.accent{color:var(--azure)}.amber{color:var(--amber)}
ul.points{list-style:none;display:grid;gap:1.3vh;font-size:clamp(13px,1.65vw,21px);line-height:1.4;max-width:60ch}
ul.points li{padding-left:1.4em;position:relative}
ul.points li::before{content:"›";position:absolute;left:0;color:var(--azure);font-family:var(--mono);font-weight:700}
.flow{display:grid;grid-template-columns:1fr auto 1fr auto 1.2fr;align-items:center;gap:1.4vw;margin-top:1vh}
.box{border:1px solid var(--line);background:rgba(15,37,48,.75);border-radius:12px;padding:1.4vh 1.2vw;font-size:clamp(11px,1.35vw,17px);line-height:1.5}
.box .h{display:block;font-family:var(--mono);font-weight:700;color:var(--azure);margin-bottom:.4vh;font-size:.95em}.box b{color:var(--amber)}
.arrow{font-family:var(--mono);color:var(--amber);font-size:clamp(16px,2.4vw,30px)}
table{border-collapse:collapse;font-size:clamp(11px,1.35vw,17px);width:100%;max-width:62em}
td{padding:.75vh .8vw;border-bottom:1px solid var(--line);vertical-align:top}
td.t{font-family:var(--mono);color:var(--amber);white-space:nowrap;width:5.5em}td.d{color:var(--muted);white-space:nowrap;width:3.5em}
td.l{font-weight:600}
.done{font-size:clamp(12px,1.5vw,19px);color:var(--muted);border-left:2px solid var(--good);padding-left:1vw;max-width:60ch}
.done b{color:var(--good);font-family:var(--mono)}
code{font-family:var(--mono);color:var(--ink);background:rgba(76,178,255,.12);border-radius:4px;padding:0 .3em;font-size:.92em}
.mark{font-family:var(--mono);font-weight:800;font-size:clamp(40px,8vw,108px);color:var(--amber);text-shadow:0 0 30px rgba(246,178,60,.35);letter-spacing:-.04em}
.nav{position:absolute;bottom:2.2%;right:3%;display:flex;gap:8px;align-items:center;font-family:var(--mono);font-size:12px;color:var(--muted);z-index:2}
.nav button{background:rgba(15,37,48,.9);color:var(--ink);border:1px solid var(--line);border-radius:8px;width:32px;height:28px;cursor:pointer;font-family:var(--mono)}
.nav button:hover,.nav button:focus-visible{border-color:var(--azure);outline:none}
.lang{position:absolute;top:2.5%;right:3%;font-family:var(--mono);font-size:12px;z-index:2}
.lang a{color:var(--muted)}
@media (max-width:700px){.flow{grid-template-columns:1fr;}.arrow{transform:rotate(90deg);justify-self:center}}
@media (prefers-reduced-motion:reduce){.slide{transition:none}}
"""

JS = """
const slides=[...document.querySelectorAll('.slide')];let i=0;
const pos=document.getElementById('pos');
function show(n){i=Math.max(0,Math.min(slides.length-1,n));slides.forEach((s,k)=>{s.classList.toggle('active',k===i);s.setAttribute('aria-hidden',k===i?'false':'true')});
pos.textContent=(i+1)+' / '+slides.length;history.replaceState(null,'','#'+(i+1))}
document.getElementById('prev').onclick=()=>show(i-1);document.getElementById('next').onclick=()=>show(i+1);
addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();show(i+1)}
if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(i-1)}if(e.key==='Home')show(0);if(e.key==='End')show(slides.length-1)});
let x0=null;addEventListener('touchstart',e=>x0=e.touches[0].clientX);addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)show(i+(dx<0?1:-1));x0=null});
show((parseInt(location.hash.slice(1))||1)-1);
"""

T = {
 "en": dict(
  lang="en", title="Mateu workshop", other=("slides.es.html", "Español"),
  prev="Previous slide", next="Next slide",
  s_title=("Hands-on workshop", "Declare it once.<br><span class='accent'>Run it everywhere.</span>",
           "Half a day of labs. You type, it runs: on the web, on Oracle Redwood, on your phone, in a desktop app, for an AI agent."),
  s_what=("What Mateu is", "A model-driven UI system",
          [("You declare", "a model of the UI — as <b>code</b> (Java, C#, Python) or as <b>data</b> (YAML)"),
           ("One wire", "the server answers <code>/mateu/v3/sync</code>: what is on the screen, never how to draw it"),
           ("Every renderer", "Vaadin · Oracle Redwood · the phone app · the desktop app · an AI agent over MCP")],
          "No frontend code for typical business apps. Served by a backend, or shipped as a static bundle with no backend at all."),
  s_rules=("How today works", "You type. Everything runs.",
           ["Pick a track: <b>Java</b>, <b>C#</b> or <b>Python</b> — the shared labs are the same for all",
            "Each lab: a guide, a <code>start/</code> and a <code>solution/</code> — generated from the starters",
            "Fell behind? Open the next lab's <code>start/</code>: it is where you should be",
            "Every lab ends with a <span class='amber'>✅ checkpoint</span> — something you can see working"]),
  s_agenda=("Agenda", "Three and three-quarter hours",
            [("0:00", "10′", "Welcome"), ("0:10", "35′", "01 · Your first app"), ("0:45", "30′", "02 · One UI, every renderer"),
             ("1:15", "25′", "03 · Test it like a user"), ("1:40", "15′", "Break"), ("1:55", "35′", "04 · UI as data"),
             ("2:30", "30′", "05 · AI agents over MCP"), ("3:00", "30′", "06 · Sign-in"), ("3:30", "15′", "Wrap-up + stretch labs")]),
  labs=[
   ("Lab 01 · 35′", "Your first app", ["Generate it with the New Project wizard (or open <code>start/</code>)", "Run it: a shell, a home page, a whole Products CRUD", "Add a field — it is a column, an input and a server-checked rule", "Add a screen of your own: a Quote with a <code>Calculate</code> button"], "Quantity 3 × 10, discount 10 % → <b>27.00</b>"),
   ("Lab 02 · 30′", "One UI, every renderer", ["Java: swap <code>mateu-vaadin</code> for <code>mateu-redwood</code> — same app, Oracle Redwood", "C# / Python: point <code>MATEU_UI</code> at the other jar", "Phone: scan a QR — <code>museums.ec1.mateu.io</code> opens natively", "Desktop: <code>mateu://add?u=museums.ec1.mateu.io</code>"], "One public UI on your phone <b>and</b> in the desktop app"),
   ("Lab 03 · 25′", "Test it like a user", ["The harness opens a route like a renderer — no browser, no server", "<code>field(…).set</code> · <code>button(…).press</code> · <code>listing().rows</code>", "Break the Quote on purpose and watch the right test fail", "Java <code>mateu-test</code> · C# <code>Mateu.AspNetCore.Testing</code> · Python <code>mateu_ui.testing</code>"], "Four UI tests green — and one red for the right reason"),
   ("Lab 04 · 35′", "UI as data", ["The same model as YAML under <code>specs/ui</code> — no code at all", "<code>mvn mateu-bundle:dev</code>: live reload while you edit", "The visual editor in IntelliJ or VS Code; a page over a live public API", "<code>mvn package</code> → a folder for any CDN, no backend"], "Products + Planets served as <b>static files</b>"),
   ("Lab 05 · 30′", "AI agents over MCP", ["One setting: your app is an MCP server at <code>/mateu/mcp</code>", "An agent lists, describes and operates your screens — same rules as a user", "<b>Connect AI</b> → a pairing code → the agent pushes a screen it wrote", "Validated before it is sent; untrusted when it is shown"], "Your agent ran <code>calculate</code>; its page opened over your app"),
   ("Lab 06 · 30′", "Sign-in", ["Keycloak in Docker: realm, client, ada (manager) and bob (clerk)", "Mateu <b>offers</b> the sign-in; your framework <b>validates</b> the token", "<code>@EyesOnly(roles = \"manager\")</code> — applied on the server, for every client", "Tested with an identity, no Keycloak needed"], "ada sees Discount; bob does not; anonymous gets 401"),
  ],
  s_end=("Where next", "Thank you", ["Stretch labs: other templates, other runtimes, your AI assistant building a screen", "Docs: <code>mateu.io</code> · this workshop: <code>workshop/</code> in the repository", "Coming next: the desktop app as an MCP server, driving a live session from the server, the user menu"]),
  done="Checkpoint",
 ),
 "es": dict(
  lang="es", title="Taller de Mateu", other=("slides.html", "English"),
  prev="Diapositiva anterior", next="Diapositiva siguiente",
  s_title=("Taller práctico", "Decláralo una vez.<br><span class='accent'>Ejecútalo en todas partes.</span>",
           "Media jornada de labs. Tú tecleas y funciona: en la web, en Oracle Redwood, en tu móvil, en una app de escritorio, para un agente de IA."),
  s_what=("Qué es Mateu", "Un sistema de UI dirigido por modelos",
          [("Declaras", "un modelo de la UI, como <b>código</b> (Java, C#, Python) o como <b>datos</b> (YAML)"),
           ("Un wire", "el servidor responde <code>/mateu/v3/sync</code>: qué hay en pantalla, nunca cómo dibujarlo"),
           ("Todos los renderers", "Vaadin · Oracle Redwood · la app del móvil · la app de escritorio · un agente de IA por MCP")],
          "Sin código de frontend para las apps de negocio típicas. Servida por un backend, o publicada como bundle estático sin backend."),
  s_rules=("Cómo va hoy", "Tú tecleas. Todo funciona.",
           ["Elige itinerario: <b>Java</b>, <b>C#</b> o <b>Python</b>; los labs comunes son iguales para todos",
            "Cada lab: una guía, un <code>start/</code> y un <code>solution/</code>, generados desde los starters",
            "¿Te has quedado atrás? Abre el <code>start/</code> del lab siguiente: está donde deberías estar",
            "Cada lab termina con un <span class='amber'>✅ checkpoint</span>: algo que ves funcionar"]),
  s_agenda=("Agenda", "Tres horas y tres cuartos",
            [("0:00", "10′", "Bienvenida"), ("0:10", "35′", "01 · Tu primera app"), ("0:45", "30′", "02 · Una UI, todos los renderers"),
             ("1:15", "25′", "03 · Pruébala como un usuario"), ("1:40", "15′", "Descanso"), ("1:55", "35′", "04 · La UI como datos"),
             ("2:30", "30′", "05 · Agentes de IA por MCP"), ("3:00", "30′", "06 · Inicio de sesión"), ("3:30", "15′", "Cierre + labs extra")]),
  labs=[
   ("Lab 01 · 35′", "Tu primera app", ["Genérala con el asistente New Project (o abre <code>start/</code>)", "Arráncala: un shell, una página de inicio, un CRUD de productos completo", "Añade un campo: es una columna, un input y una regla que comprueba el servidor", "Añade una pantalla tuya: un presupuesto con un botón <code>Calculate</code>"], "Cantidad 3 × 10, descuento 10 % → <b>27.00</b>"),
   ("Lab 02 · 30′", "Una UI, todos los renderers", ["Java: cambia <code>mateu-vaadin</code> por <code>mateu-redwood</code>; la misma app, en Oracle Redwood", "C# / Python: apunta <code>MATEU_UI</code> al otro jar", "Móvil: escanea un QR; <code>museums.ec1.mateu.io</code> se abre en nativo", "Escritorio: <code>mateu://add?u=museums.ec1.mateu.io</code>"], "Una UI pública en tu móvil <b>y</b> en la app de escritorio"),
   ("Lab 03 · 25′", "Pruébala como un usuario", ["El arnés abre una ruta como un renderer: sin navegador, sin servidor", "<code>field(…).set</code> · <code>button(…).press</code> · <code>listing().rows</code>", "Rompe el presupuesto a propósito y mira fallar el test correcto", "Java <code>mateu-test</code> · C# <code>Mateu.AspNetCore.Testing</code> · Python <code>mateu_ui.testing</code>"], "Cuatro tests de UI en verde, y uno en rojo por el motivo correcto"),
   ("Lab 04 · 35′", "La UI como datos", ["El mismo modelo como YAML en <code>specs/ui</code>, sin código", "<code>mvn mateu-bundle:dev</code>: recarga en vivo mientras editas", "El editor visual en IntelliJ o VS Code; una página sobre una API pública real", "<code>mvn package</code> → una carpeta para cualquier CDN, sin backend"], "Products + Planets servidos como <b>ficheros estáticos</b>"),
   ("Lab 05 · 30′", "Agentes de IA por MCP", ["Un ajuste: tu app es un servidor MCP en <code>/mateu/mcp</code>", "Un agente lista, describe y maneja tus pantallas, con las reglas de un usuario", "<b>Connect AI</b> → un código → el agente te pone delante una pantalla que ha escrito", "Validada antes de enviarse; no confiable al mostrarse"], "Tu agente ejecutó <code>calculate</code>; su página se abrió sobre tu app"),
   ("Lab 06 · 30′", "Inicio de sesión", ["Keycloak en Docker: realm, cliente, ada (responsable) y bob (dependiente)", "Mateu <b>ofrece</b> el login; tu framework <b>valida</b> el token", "<code>@EyesOnly(roles = \"manager\")</code>: se aplica en el servidor, para todos los clientes", "Se prueba con una identidad, sin Keycloak"], "ada ve Discount; bob no; anónimo recibe 401"),
  ],
  s_end=("Por dónde seguir", "Gracias", ["Labs extra: otras plantillas, otros runtimes, tu asistente de IA construyendo una pantalla", "Docs: <code>mateu.io</code> · este taller: <code>workshop/</code> en el repositorio", "Llega pronto: la app de escritorio como servidor MCP, manejar una sesión en vivo desde el servidor, el menú de usuario"]),
  done="Checkpoint",
 ),
}


def page(t):
    s = []
    e, h, lead = t["s_title"]
    s.append(f"<section class='slide' aria-label='1'><div class='mark' aria-hidden='true'>mateu</div><div class='eyebrow'>{e}</div><h1>{h}</h1><p class='lead'>{lead}</p></section>")
    e, h, boxes, lead = t["s_what"]
    flow = "<span class='arrow' aria-hidden='true'>→</span>".join(f"<div class='box'><span class='h'>{a}</span>{b}</div>" for a, b in boxes)
    s.append(f"<section class='slide'><div class='eyebrow'>{e}</div><h2>{h}</h2><div class='flow'>{flow}</div><p class='lead'>{lead}</p></section>")
    e, h, pts = t["s_rules"]
    s.append(f"<section class='slide'><div class='eyebrow'>{e}</div><h2>{h}</h2><ul class='points'>{''.join(f'<li>{p}</li>' for p in pts)}</ul></section>")
    e, h, rows = t["s_agenda"]
    trs = "".join(f"<tr><td class='t'>{a}</td><td class='d'>{b}</td><td class='l'>{c}</td></tr>" for a, b, c in rows)
    s.append(f"<section class='slide'><div class='eyebrow'>{e}</div><h2>{h}</h2><table>{trs}</table></section>")
    for e, h, pts, done in t["labs"]:
        s.append(f"<section class='slide'><div class='eyebrow'>{e}</div><h2>{h}</h2><ul class='points'>{''.join(f'<li>{p}</li>' for p in pts)}</ul><p class='done'><b>✅ {t['done']}</b> — {done}</p></section>")
    e, h, pts = t["s_end"]
    s.append(f"<section class='slide'><div class='eyebrow'>{e}</div><h1>{h}</h1><ul class='points'>{''.join(f'<li>{p}</li>' for p in pts)}</ul></section>")
    href, label = t["other"]
    return f"""<!doctype html>
<html lang="{t['lang']}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t['title']}</title>
<!-- Generated by workshop/tools/build-slides.py — edit the texts there, not here. ← → / space to move. -->
<style>{CSS}</style></head>
<body><main class="deck" aria-roledescription="slide deck">
<div class="lang"><a href="{href}">{label}</a></div>
{''.join(s)}
<nav class="nav"><button id="prev" aria-label="{t['prev']}">‹</button><span id="pos" aria-live="polite"></span><button id="next" aria-label="{t['next']}">›</button></nav>
</main><script>{JS}</script></body></html>
"""


for key, name in (("en", "slides.html"), ("es", "slides.es.html")):
    (OUT / name).write_text(page(T[key]), encoding="utf-8")
    print("wrote", OUT / name)
