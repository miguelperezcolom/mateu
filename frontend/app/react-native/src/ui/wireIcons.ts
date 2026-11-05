/**
 * The wire names icons with the web's tokens (`vaadin:rocket`); a phone draws Material Community
 * Icons, the set React Native Paper uses. The table is what lets a declared icon reach a native
 * screen: a name it does not know draws nothing (never a stray dot or the token as text). Every
 * value is checked against the font by wireIcons.test.ts. Pure, so `node --test` runs it.
 */
const VAADIN_TO_MATERIAL: Record<string, string> = {
  abacus: 'abacus', 'academy-cap': 'school', adjust: 'tune', airplane: 'airplane', alarm: 'alarm', archive: 'archive-outline',
  'area-select': 'select-drag', 'arrow-circle-right': 'arrow-right-circle-outline', 'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right', 'arrow-up': 'arrow-up', 'arrow-down': 'arrow-down', asterisk: 'asterisk', at: 'at', automation: 'robot-industrial',
  ban: 'cancel', 'bar-chart': 'chart-bar', 'bar-chart-h': 'chart-bar', 'bar-chart-v': 'chart-bar', barcode: 'barcode', bed: 'bed-outline', bell: 'bell-outline', 'bell-o': 'bell-outline',
  book: 'book-open-variant', bookmark: 'bookmark-outline', briefcase: 'briefcase-outline', building: 'office-building-outline', 'building-o': 'office-building-outline', bullets: 'format-list-bulleted',
  calc: 'calculator', 'calc-book': 'calculator-variant-outline', calendar: 'calendar', 'calendar-o': 'calendar-blank-outline', 'calendar-clock': 'calendar-clock', 'calendar-user': 'calendar-account',
  camera: 'camera-outline', car: 'car-outline', cart: 'cart-outline', 'cart-o': 'cart-outline', chart: 'chart-line', 'chart-line': 'chart-line', 'chart-grid': 'chart-box-outline',
  chat: 'chat-outline', check: 'check', 'check-circle': 'check-circle-outline', 'check-circle-o': 'check-circle-outline', 'check-square': 'checkbox-marked-outline', 'check-square-o': 'checkbox-marked-outline', 'chevron-left': 'chevron-left', 'chevron-right': 'chevron-right',
  circle: 'circle-outline', 'circle-thin': 'circle-outline', clipboard: 'clipboard-outline', 'clipboard-check': 'clipboard-check-outline', 'clipboard-text': 'clipboard-text-outline', clock: 'clock-outline', close: 'close', 'close-circle': 'close-circle-outline', 'close-small': 'close',
  cloud: 'cloud-outline', 'cloud-download': 'cloud-download-outline', 'cloud-upload': 'cloud-upload-outline', code: 'code-tags', cog: 'cog-outline', 'cog-o': 'cog-outline', cogs: 'cog-outline', comment: 'comment-outline', 'comment-o': 'comment-outline', comments: 'comment-multiple-outline', compass: 'compass-outline', connect: 'connection',
  'credit-card': 'credit-card-outline', cube: 'cube-outline', cubes: 'cube-outline', cutlery: 'silverware-fork-knife', dashboard: 'view-dashboard-outline', database: 'database-outline', desktop: 'monitor', 'dollar': 'currency-usd', download: 'download', 'download-alt': 'download',
  edit: 'pencil-outline', ellipsis: 'dots-horizontal', 'ellipsis-dots-h': 'dots-horizontal', 'ellipsis-dots-v': 'dots-vertical', envelope: 'email-outline', 'envelope-o': 'email-outline', eraser: 'eraser', euro: 'currency-eur', exchange: 'swap-horizontal', 'exclamation-circle': 'alert-circle-outline', 'exclamation-circle-o': 'alert-circle-outline', eye: 'eye-outline', 'eye-slash': 'eye-off-outline',
  factory: 'factory', file: 'file-outline', 'file-o': 'file-outline', 'file-text': 'file-document-outline', 'file-text-o': 'file-document-outline', 'file-tree': 'file-tree-outline', 'file-add': 'file-plus-outline', 'file-picture': 'file-image-outline', filter: 'filter-outline', flag: 'flag-outline', 'flag-o': 'flag-outline', flash: 'flash-outline', flask: 'flask-outline', 'flight-landing': 'airplane-landing', 'flight-takeoff': 'airplane-takeoff', folder: 'folder-outline', 'folder-o': 'folder-outline', 'folder-open': 'folder-open-outline', 'form': 'form-select',
  gift: 'gift-outline', globe: 'earth', 'globe-wire': 'web', grid: 'view-grid-outline', 'grid-big': 'view-grid-outline', 'grid-h': 'table', group: 'account-group-outline', hammer: 'hammer', handshake: 'handshake-outline', hash: 'pound', heart: 'heart-outline', 'heart-o': 'heart-outline', 'hourglass': 'timer-sand', home: 'home-outline', 'home-o': 'home-outline', hospital: 'hospital-building', 'info-circle': 'information-outline', 'info-circle-o': 'information-outline', info: 'information-outline', institution: 'bank-outline', invoice: 'receipt',
  kanban: 'view-column-outline', key: 'key-outline', 'key-o': 'key-outline', laptop: 'laptop', layout: 'view-quilt-outline', library: 'library', 'line-chart': 'chart-line', 'line-bar-chart': 'chart-bar', link: 'link-variant', list: 'format-list-bulleted', 'list-ol': 'format-list-numbered', 'list-select': 'format-list-checks', 'list-ul': 'format-list-bulleted', 'location-arrow': 'navigation-variant-outline', lock: 'lock-outline', magic: 'auto-fix', 'magnifier': 'magnify', male: 'human-male', 'map-marker': 'map-marker-outline', medal: 'medal-outline', menu: 'menu', 'minus': 'minus', mobile: 'cellphone', money: 'cash', 'money-exchange': 'cash-sync', moon: 'weather-night', 'moon-o': 'weather-night', 'newspaper': 'newspaper-variant-outline', 'notebook': 'notebook-outline',
  office: 'office-building-outline', options: 'tune', package: 'package-variant-closed', 'paperclip': 'paperclip', pencil: 'pencil-outline', phone: 'phone-outline', 'phone-landline': 'phone-classic', picture: 'image-outline', 'pie-chart': 'chart-pie', 'pie-bar-chart': 'chart-pie', pin: 'pin-outline', plane: 'airplane', play: 'play', plus: 'plus', 'plus-circle': 'plus-circle-outline', 'plus-circle-o': 'plus-circle-outline', print: 'printer-outline', puzzle: 'puzzle-outline', 'qrcode': 'qrcode', question: 'help', 'question-circle': 'help-circle-outline', 'question-circle-o': 'help-circle-outline',
  records: 'file-cabinet', refresh: 'refresh', 'road': 'road-variant', rocket: 'rocket-launch-outline', scale: 'scale-balance', search: 'magnify', server: 'server', share: 'share-variant-outline', shield: 'shield-outline', shop: 'storefront-outline', sign: 'draw', 'sign-in': 'login', 'sign-out': 'logout', sitemap: 'sitemap-outline', 'sliders': 'tune', spinner: 'loading', stamp: 'stamper', star: 'star', 'star-o': 'star-outline', stethoscope: 'stethoscope', 'stock': 'chart-line-variant', storage: 'database-outline', sun: 'white-balance-sunny', 'sun-o': 'white-balance-sunny', table: 'table', tablet: 'tablet', tag: 'tag-outline', tags: 'tag-multiple-outline', tasks: 'format-list-checks', taxi: 'taxi', 'time-forward': 'clock-fast', 'time-backward': 'history', tools: 'tools', train: 'train', trash: 'trash-can-outline', tree: 'file-tree-outline', trending: 'trending-up', trophy: 'trophy-outline', truck: 'truck-outline', umbrella: 'umbrella-outline', unlink: 'link-variant-off', unlock: 'lock-open-outline', upload: 'upload', 'upload-alt': 'upload', user: 'account-outline', 'user-card': 'card-account-details-outline', 'user-check': 'account-check-outline', 'user-clock': 'account-clock-outline', 'user-heart': 'account-heart-outline', 'user-star': 'account-star-outline', users: 'account-multiple-outline', wallet: 'wallet-outline', warning: 'alert-outline', 'workplace': 'domain', wrench: 'wrench-outline',
};

/** The Material Community Icons name of a wire icon token, or undefined when there is none. */
export function materialIconOf(token: string | null | undefined): string | undefined {
  const value = (token ?? '').trim();
  if (!value) return undefined;
  const colon = value.indexOf(':');
  if (colon < 0) return undefined;
  const set = value.slice(0, colon).toLowerCase();
  const name = value.slice(colon + 1).toLowerCase();
  if (set === 'mdi' || set === 'material') return name;
  return VAADIN_TO_MATERIAL[name];
}

export const wireIconNames = (): string[] => Object.values(VAADIN_TO_MATERIAL);
