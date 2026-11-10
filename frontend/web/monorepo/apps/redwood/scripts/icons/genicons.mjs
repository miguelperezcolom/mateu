// node genicons.mjs > poc/core/iconMap.mjs — vaadin:* → oj-ux-ico-* (only names the gallery font has)
import { readFileSync } from 'node:fs'
const dir = new URL('.', import.meta.url).pathname
const vaadin = readFileSync(dir + 'vaadin.txt', 'utf8').split('\n').filter(Boolean)
const oj = new Set(readFileSync(dir + 'oj.txt', 'utf8').split('\n').filter(Boolean))
// hand synonyms: vaadin name (or its stem) → candidate oj names, first existing wins
const PRE = {
  sun: ['weather-sun'], 'sun-o': ['weather-sun'], 'sun-down': ['weather-sun'], 'sun-rise': ['weather-sun'], morning: ['weather-sun'], moon: ['weather-moon'], 'moon-o': ['weather-moon'], umbrella: ['weather-umbrella'], flash: ['flash-on'], drop: ['waterdrop'],
  smiley: ['emoji-smile'], 'smiley-o': ['emoji-smile'], frown: ['emoji-sad'], 'frown-o': ['emoji-sad'], meh: ['emoji-meh'], 'meh-o': ['emoji-meh'],
  reply: ['email-reply'], 'reply-all': ['email-reply-all'], 'quote-left': ['blockquote'], 'quote-right': ['blockquote'], pointer: ['mouse-pointer'], cursor: ['mouse-pointer'], 'cursor-o': ['mouse-pointer'], hand: ['free-hand'], grab: ['drag-handle'], touch: ['touch-device'],
  presentation: ['file-presentation'], sitemap: ['folder-hierarchy'], tabs: ['hierarchy-tabs'], safe: ['vault'], 'spark-line': ['chart-spark'], globe: ['languages', 'external-web'], 'globe-wire': ['languages', 'external-web'], browser: ['web-window'], 'mobile-browser': ['web-window'],
  airplane: ['airport'], 'flight-takeoff': ['expected-departure', 'airport'], 'flight-landing': ['expected-arrival', 'airport'], ticket: ['voucher'], volume: ['speaker'], 'volume-up': ['speaker'], microphone: ['person-speaking'], 'paint-roll': ['paint-bucket'], paintbrush: ['paint-bucket'], magic: ['light-bulb-on'], 'file-tree': ['folder-hierarchy'], 'file-tree-small': ['folder-hierarchy'], 'file-tree-sub': ['folder-hierarchy'], 'scatter-chart': ['chart-scatter', 'scatter'], 'spline-chart': ['line-chart', 'chart-line'], 'spline-area-chart': ['area-chart', 'chart-area'],
}
// the broad table (PRE above wins over it)
const SYN0 = {
  airplane: ['airplane', 'plane', 'flight', 'travel'], 'flight-takeoff': ['flight', 'airplane', 'plane'], 'flight-landing': ['flight', 'airplane', 'plane'],
  suitcase: ['luggage', 'suitcase', 'briefcase', 'travel'], 'doctor-briefcase': ['briefcase', 'luggage'],
  user: ['contact', 'person', 'user-profile'], users: ['contact-group', 'people', 'group'], person: ['contact', 'person'], 'user-card': ['id-card', 'contact-card', 'contact'],
  'user-check': ['user-available', 'contact-check', 'contact'], 'user-clock': ['contact-clock', 'contact'], 'user-heart': ['contact-favorite', 'contact'], 'user-star': ['contact-favorite', 'contact'],
  envelope: ['email'], envelopes: ['email'], 'envelope-open': ['email-open', 'email'], mailbox: ['mailbox', 'email'],
  'paperplane': ['send', 'paper-plane'],
  cog: ['settings'], cogs: ['settings'], 'start-cog': ['settings'], 'stop-cog': ['settings'], tools: ['tools', 'wrench', 'settings'], toolbox: ['toolbox', 'tools'],
  info: ['information', 'info-circle', 'information-s'], 'info-circle': ['information', 'information-s'],
  question: ['help', 'question'], 'question-circle': ['help', 'question-circle'],
  'exclamation-circle': ['warning', 'error'], exclamation: ['warning'],
  eye: ['view', 'eye', 'show'], 'eye-slash': ['hide', 'view-hide'],
  globe: ['globe', 'world', 'web'], 'globe-wire': ['globe', 'world', 'web'],
  'map-marker': ['location-pin', 'location'], 'location-arrow': ['location-found', 'navigation'], 'location-arrow-circle': ['location-found'],
  pencil: ['edit'], pen: ['signature', 'edit'], edit: ['edit'], 'paintbrush': ['brush', 'paint'], palette: ['palette', 'color-palette'],
  trash: ['trash'], del: ['trash'], 'close-big': ['close'], 'close-small': ['close'], 'close-circle': ['close-circle'],
  'plus-circle': ['plus-circle'], 'plus-square': ['plus-square'], 'minus-circle': ['minus-circle', 'remove-circle'], 'plus-minus': ['plus', 'minus'],
  'unlock': ['lock-open'], 'safe-lock': ['lock', 'safe'], safe: ['safe', 'lock'], password: ['password', 'key', 'lock'], key: ['key'],
  'credit-card': ['bank-card', 'credit-card'], cash: ['money', 'cash'], coins: ['money', 'coins'], 'coin-piles': ['money'], 'money-deposit': ['money'], 'money-exchange': ['exchange-h', 'money'], 'money-withdraw': ['money'], 'piggy-bank-coin': ['piggy-bank', 'money'], 'book-dollar': ['money-book', 'money'],
  'cross-cutlery': ['restaurant', 'food', 'dining'], spoon: ['restaurant', 'food'], coffee: ['coffee'], taxi: ['car', 'taxi'], 'car': ['car'], boat: ['boat', 'ship'], road: ['road', 'route'],
  home: ['home'], building: ['building'], institution: ['bank', 'building'], factory: ['factory', 'building'], shop: ['store', 'shop'], workplace: ['building', 'office'],
  calendar: ['calendar'], 'calendar-user': ['calendar-contact'], 'calendar-briefcase': ['calendar'], 'calendar-envelope': ['calendar'], 'calendar-clock': ['calendar-clock', 'calendar'], 'date-input': ['calendar'],
  clock: ['clock'], time: ['clock'], 'time-forward': ['clock'], 'time-backward': ['history', 'clock'], hourglass: ['hourglass', 'clock'], 'hourglass-start': ['hourglass', 'clock'], 'hourglass-end': ['hourglass', 'clock'], 'hourglass-empty': ['hourglass', 'clock'],
  chart: ['bar-chart'], 'bar-chart': ['bar-chart'], 'bar-chart-h': ['bar-chart'], 'bar-chart-v': ['bar-chart'], 'line-chart': ['line-chart', 'trending-up'], 'line-bar-chart': ['bar-chart'], 'pie-chart': ['pie-chart'], 'pie-bar-chart': ['pie-chart'], 'area-select': ['area-chart'], 'spline-chart': ['line-chart'], 'spline-area-chart': ['area-chart'], 'scatter-chart': ['scatter-chart', 'bubble-chart'], 'chart-timeline': ['timeline'], 'spark-line': ['line-chart'], 'trending-up': ['trending-up'], 'trending-down': ['trending-down'], stock: ['trending-up'],
  table: ['table'], 'tree-table': ['tree', 'table'], grid: ['grid-view-small'], 'grid-small': ['grid-view-small'], 'grid-big': ['grid-view-large'], 'grid-h': ['grid-view-small'], 'grid-v': ['grid-view-small'], list: ['list'], 'list-ul': ['list-bulleted'], 'list-ol': ['list-numbered', 'list'], lines: ['list'], 'lines-list': ['list'], 'modal-list': ['list'], 'list-select': ['list'],
  'ellipsis-dots-h': ['overflow-h'], 'ellipsis-dots-v': ['overflow-v'], 'ellipsis-h': ['overflow-h'], 'ellipsis-v': ['overflow-v'], 'ellipsis-circle': ['overflow-h'], options: ['overflow-v', 'settings'], menu: ['menu', 'hamburger'],
  'angle-down': ['chevron-down'], 'angle-up': ['chevron-up'], 'angle-left': ['chevron-left'], 'angle-right': ['chevron-right'], 'angle-double-down': ['chevron-down'], 'angle-double-up': ['chevron-up'], 'angle-double-left': ['chevron-left'], 'angle-double-right': ['chevron-right'],
  'chevron-down-small': ['chevron-down'], 'chevron-up-small': ['chevron-up'], 'chevron-left-small': ['chevron-left'], 'chevron-right-small': ['chevron-right'],
  'caret-down': ['caret-down', 'chevron-down'], 'caret-up': ['caret-up', 'chevron-up'], 'caret-left': ['caret-left', 'chevron-left'], 'caret-right': ['caret-right', 'chevron-right'],
  'arrow-backward': ['arrow-left'], 'arrow-forward': ['arrow-right'], 'arrow-long-down': ['arrow-down'], 'arrow-long-left': ['arrow-left'], 'arrow-long-right': ['arrow-right'], 'arrow-long-up': ['arrow-up'], 'arrows-long-right': ['arrow-right'], 'arrows-long-up': ['arrow-up'], arrows: ['move'], 'arrows-cross': ['move'], 'arrows-long-h': ['exchange-h'], 'arrows-long-v': ['exchange-v'], exchange: ['exchange-h'],
  'level-down': ['arrow-down'], 'level-up': ['arrow-up'], 'level-left': ['arrow-left'], 'level-right': ['arrow-right'], 'level-down-bold': ['arrow-down'], 'level-up-bold': ['arrow-up'], 'level-left-bold': ['arrow-left'], 'level-right-bold': ['arrow-right'],
  'rotate-left': ['undo'], 'rotate-right': ['redo'], undo: ['undo'], redo: ['redo'], refresh: ['refresh'], recycle: ['refresh'], retweet: ['refresh'], random: ['shuffle'], reply: ['reply'], 'reply-all': ['reply-all'],
  'sign-in': ['login'], 'sign-in-alt': ['login'], 'sign-out': ['logout'], 'sign-out-alt': ['logout'], exit: ['logout'], enter: ['login'], 'enter-arrow': ['login'], out: ['logout'],
  bell: ['notification'], 'bell-slash': ['notification-off', 'notification'], megaphone: ['announcement', 'megaphone'],
  comment: ['chat'], comments: ['chat'], 'comment-ellipsis': ['chat'], chat: ['chat'],
  'thumbs-up': ['thumbs-up', 'like'], 'thumbs-down': ['thumbs-down', 'dislike'], smiley: ['smile', 'emoji'], frown: ['sad', 'emoji'], meh: ['emoji'],
  sun: ['sun', 'brightness'], 'sun-o': ['sun', 'brightness'], 'sun-down': ['sun'], 'sun-rise': ['sun'], moon: ['moon', 'dark-mode'], 'moon-o': ['moon', 'dark-mode'], morning: ['sun'], umbrella: ['umbrella'], drop: ['water', 'drop'], flash: ['flash', 'lightning'],
  'phone-landline': ['phone'], mobile: ['mobile', 'phone'], 'mobile-retro': ['mobile', 'phone'], 'mobile-browser': ['mobile'], tablet: ['tablet-portrait'], laptop: ['laptop'], desktop: ['desktop', 'monitor'], browser: ['browser', 'web'], 'external-browser': ['external-link'], 'external-link': ['external-link'],
  'file-o': ['file'], 'file-text': ['file-text', 'file'], 'file-text-o': ['file-text', 'file'], 'file-picture': ['file-image', 'image'], 'file-movie': ['file-video', 'video'], 'file-sound': ['file-audio', 'audio'], 'file-search': ['file-search', 'search'], 'file-tree': ['tree'], 'file-tree-small': ['tree'], 'file-tree-sub': ['tree'], 'file-refresh': ['refresh'], 'file-process': ['file'], 'file-start': ['file'], 'file-font': ['file'],
  'folder-o': ['folder'], 'folder-open': ['folder-open', 'folder'], 'folder-search': ['folder-search', 'folder'], archives: ['archive', 'folder'], archive: ['archive'],
  picture: ['image'], camera: ['camera'], movie: ['video'], 'play-circle': ['play-circle', 'play'], play: ['play'], microphone: ['microphone', 'mic'], volume: ['volume', 'sound'], 'volume-up': ['volume', 'sound'], mute: ['mute', 'volume-off'], 'sound-disable': ['mute', 'volume-off'],
  'download-alt': ['download'], 'upload-alt': ['upload'], 'cloud-download': ['cloud-download', 'download'], 'cloud-upload': ['cloud-upload', 'upload'], 'cloud-o': ['cloud'],
  paperclip: ['attachment', 'paperclip'], clipboard: ['clipboard'], 'clipboard-text': ['clipboard'], 'clipboard-user': ['clipboard'], 'clipboard-check': ['clipboard-check', 'clipboard'], copy: ['copy'], 'copy-o': ['copy'], scissors: ['cut', 'scissors'], paste: ['paste'],
  'search-plus': ['zoom-in'], 'search-minus': ['zoom-out'], 'expand-full': ['expand', 'maximize'], 'expand-square': ['expand', 'maximize'], 'compress-square': ['collapse', 'minimize'], expand: ['expand'], compress: ['collapse'],
  'star-o': ['star'], 'star-half-left': ['star-half'], 'star-half-right': ['star-half'], 'heart-o': ['heart'], 'bookmark-o': ['bookmark'], 'flag-o': ['flag'], 'check-circle-o': ['check-circle'], 'check-square-o': ['check-square', 'check'], 'check-square': ['check-square', 'check'],
  'cart-o': ['cart'], ticket: ['ticket'], 'gift': ['gift'], diamond: ['diamond'], 'diamond-o': ['diamond'], trophy: ['trophy'], diploma: ['certificate', 'diploma'], 'academy-cap': ['education', 'graduation-cap'], 'open-book': ['book'], book: ['book'], notebook: ['notebook', 'book'],
  'health-card': ['id-card', 'medical'], doctor: ['doctor', 'medical'], specialist: ['doctor', 'medical'], 'heart-medical': ['heart-medical'], 'clipboard-heart': ['heart-medical'], 'clipboard-pulse': ['heart-rate'], 'dental-chair': ['medical'], tooth: ['medical'], teeth: ['medical'],
  sitemap: ['hierarchy', 'org-chart', 'sitemap'], connect: ['connection', 'link'], plug: ['plug', 'connection'], signal: ['signal', 'connection'], wifi: ['connection'], 'link': ['link'], unlink: ['unlink'],
  bug: ['bug'], 'bug-o': ['bug'], code: ['code'], 'curly-brackets': ['code'], css: ['code'], terminal: ['terminal'], database: ['database'], harddrive: ['storage', 'database'], server: ['server'], cube: ['cube', 'box'], cubes: ['cubes', 'box'], package: ['package', 'box'], truck: ['truck'], forklift: ['forklift', 'truck'],
  rocket: ['rocket'], magic: ['magic-wand', 'sparkle'], 'automation': ['robot-action'], lightbulb: ['lightbulb', 'idea'], puzzle: ['puzzle'], 'puzzle-piece': ['puzzle'], hammer: ['hammer', 'tools'], screwdriver: ['tools'], wrench: ['wrench', 'tools'], 'paint-roll': ['brush'],
  filter: ['filter'], funnel: ['filter'], sort: ['sort'], 'twin-col-select': ['transfer', 'exchange-h'], 'split-h': ['split-view'], 'split-v': ['split-view'], layout: ['layout', 'grid-view-large'], tabs: ['tabs'], dock: ['dock'], viewport: ['screen', 'desktop'],
  print: ['print'], share: ['share'], 'share-square': ['share'], at: ['at', 'email'], hash: ['hashtag', 'number'], tag: ['tag'], tags: ['tags', 'tag'], 'bullseye': ['target'], crosshairs: ['target'], 'dot-circle': ['radio-button-checked', 'target'],
  family: ['family', 'contact-group'], child: ['child', 'contact'], male: ['contact'], female: ['contact'], 'hands-up': ['contact'], 'golf': ['sports'], gamepad: ['game'], controller: ['game'], glasses: ['view'],
  money: ['currency-money'], dollar: ['currency-dollar', 'money'], euro: ['currency-euro', 'money'], pound: ['currency-pound', 'money'], yen: ['currency-yen', 'money'], 'scale-unbalance': ['scale', 'balance'], scale: ['scale'], calc: ['calculator'], 'calc-book': ['calculator'], abacus: ['calculator'],
  presentation: ['presentation'], 'pin-post': ['pin'], pin: ['pin'], thumbtack: ['pin'], 'flag-checkered': ['flag'], 'progressbar': ['progress'], spinner: ['loading', 'refresh'], 'spinner-arc': ['loading', 'refresh'], 'spinner-third': ['loading', 'refresh'], records: ['database'],
  input: ['text-input', 'edit'], form: ['form', 'file-text'], combobox: ['list'], 'text-label': ['text'], 'text-height': ['text'], 'text-width': ['text'], font: ['text'], italic: ['italic'], bold: ['bold'], underline: ['underline'], 'quote-left': ['quote'], 'quote-right': ['quote'],
  keyboard: ['keyboard'], 'keyboard-o': ['keyboard'], cursor: ['cursor'], pointer: ['cursor'], hand: ['hand'], touch: ['touch', 'hand'], grab: ['hand'],
  lifebuoy: ['help', 'support'], 'question-circle-o': ['help'], 'info-circle-o': ['information'], 'exclamation-circle-o': ['warning'], 'warning': ['warning'], 'minus': ['minus'], 'plus': ['plus'], 'check': ['check'], 'close': ['close'],
  'vaadin-h': ['logo'], 'vaadin-v': ['logo'], 'twitter': ['twitter'], 'facebook': ['facebook'], 'youtube': ['video'], 'rss': ['rss'],
  'safe': ['safe'], 'shield': ['shield', 'security'], lock: ['lock'], 'user-check-o': ['contact'], 'tasks': ['task'], 'task': ['task'], 'clipboard-cross': ['clipboard'], 'bomb': ['error'], 'ban': ['do-not-enter'], 'stop': ['stop'], 'pause': ['pause'],
  'step-backward': ['previous', 'skip-back'], 'step-forward': ['next', 'skip-forward'], 'fast-backward': ['rewind'], 'fast-forward': ['fast-forward'], backwards: ['rewind'], forward: ['forward', 'arrow-right'],
}
const SYN = { ...SYN0, ...PRE }
const out = {}
const stems = (n) => {
  const c = [n]
  for (const suf of ['-o', '-small', '-big', '-a', '-alt', '-bold', '-thin']) if (n.endsWith(suf)) c.push(n.slice(0, -suf.length))
  return c
}
for (const v of vaadin) {
  let hit = null
  for (const s of stems(v)) {
    for (const cand of [...(SYN[s] || []), s]) { if (oj.has(cand)) { hit = cand; break } }
    if (hit) break
  }
  if (hit) out[v] = hit
}
const missing = vaadin.filter((v) => !out[v])
console.error('mapped', Object.keys(out).length, 'missing', missing.length, missing.join(' '))
console.log(`// GENERATED: vaadin:<name> → the Redwood gallery icon font (oj-ux-ico-<value>), only names the font has
// (gallery 2604.0.2). Exact names, a few common suffixes stripped (-o, -small…) and hand synonyms.
// Regenerate with the script described in DESIGN-NOTES («Icons»); a name not here falls back to GENERIC_ICON.
export const VAADIN_TO_OJ = ${JSON.stringify(out).replace(/","/g, '",\n  "').replace(/^\{/, '{\n  ').replace(/}$/, '\n}')}
`)
