import React from 'react'
import {
  AlertIcon,
  AppsIcon,
  ArchiveIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BeakerIcon,
  BellIcon,
  BlockedIcon,
  BookIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  CheckCircleIcon,
  CheckboxIcon,
  ChecklistIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleIcon,
  ClockIcon,
  CloudIcon,
  CodeIcon,
  ColumnsIcon,
  CommentIcon,
  CommentDiscussionIcon,
  CopyIcon,
  CreditCardIcon,
  CrosshairsIcon,
  DashIcon,
  DashboardIcon,
  DatabaseIcon,
  DeviceCameraIcon,
  DeviceDesktopIcon,
  DeviceMobileIcon,
  DiamondIcon,
  DownloadIcon,
  EyeIcon,
  EyeClosedIcon,
  FileIcon,
  FileAddedIcon,
  FileCodeIcon,
  FileDirectoryIcon,
  FileDirectoryOpenFillIcon,
  FileMediaIcon,
  FileZipIcon,
  FilterIcon,
  FlagIcon,
  FlameIcon,
  GearIcon,
  GiftIcon,
  GlobeIcon,
  GoalIcon,
  GraphIcon,
  GraphBarHorizontalIcon,
  GraphBarVerticalIcon,
  HashIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
  HourglassIcon,
  IdBadgeIcon,
  ImageIcon,
  InboxIcon,
  InfoIcon,
  KebabHorizontalIcon,
  KeyIcon,
  LawIcon,
  LightBulbIcon,
  LinkIcon,
  LinkExternalIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  LocationIcon,
  LockIcon,
  MailIcon,
  MoonIcon,
  OrganizationIcon,
  PackageIcon,
  PaperAirplaneIcon,
  PaperclipIcon,
  PasteIcon,
  PauseIcon,
  PencilIcon,
  PeopleIcon,
  PersonIcon,
  PinIcon,
  PlayIcon,
  PlugIcon,
  PlusIcon,
  PlusCircleIcon,
  ProjectIcon,
  QuestionIcon,
  RocketIcon,
  SearchIcon,
  ServerIcon,
  ShareIcon,
  ShieldIcon,
  SignInIcon,
  SignOutIcon,
  SlidersIcon,
  SmileyIcon,
  SparkleIcon,
  StarIcon,
  StarFillIcon,
  StopIcon,
  StopwatchIcon,
  SunIcon,
  SyncIcon,
  TableIcon,
  TagIcon,
  TasklistIcon,
  ThreeBarsIcon,
  ThumbsdownIcon,
  ThumbsupIcon,
  ToolsIcon,
  TrashIcon,
  TrophyIcon,
  UnlinkIcon,
  UnlockIcon,
  UploadIcon,
  WorkflowIcon,
  XIcon,
  XCircleIcon,
  ZapIcon,
} from '@primer/octicons-react'
import type { Icon as OcticonType } from '@primer/octicons-react'
import { interpolate } from '@rn/core/expressions'
import { safeHref as libSafeHref } from '@infra/ui/safeNavigate.ts'
import { useController } from '../../ViewHost'
import type { Dict } from '../types'

export const str = (v: unknown): string => (v == null ? '' : String(v))
export const list = <T = Dict>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
export const childrenOf = (c: unknown): unknown[] => list<unknown>((c as Dict | null)?.['children'])
export const isNode = (v: unknown): v is Dict => !!v && typeof v === 'object'

/** `${…}` over the view's state/data/app state — the texts a record page templates. */
export function useText(state: Dict, data?: unknown) {
  const controller = useController()
  const ctx = { state, data, appState: controller.session.appState }
  return (t: unknown) => (t == null || t === '' ? '' : interpolate(String(t), ctx))
}

/** A server-sent URL: relative, http(s), mailto, tel (libs/mateu's rule); undefined otherwise. */
export const safeHref = (url: unknown): string | undefined => (url ? libSafeHref(String(url)) : undefined)

/** Runs a wire action id, if any, on the view's controller. */
export function useRun() {
  const controller = useController()
  return (actionId: unknown, parameters?: Dict) => {
    const id = str(actionId)
    if (id) void controller.runAction(id, parameters)
  }
}

/** Opens a mount-relative route the way a breadcrumb or a menu entry does. */
export function useOpenRoute() {
  const controller = useController()
  return (route: string, label = '') => {
    if (route) controller.session.openView({ label, route: route.replace(/^\/+/, ''), consumedRoute: '', serverSideType: '' })
  }
}

/** A server colour (a timeline dot) only when it is plainly a colour: hex, rgb()/hsl(), a name. */
export const safeColor = (c: unknown): string | undefined => {
  const v = str(c).trim()
  return /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([\d\s.,%]+\)|[a-z]+)$/i.test(v) ? v : undefined
}

// The wire names icons with the web's tokens (`vaadin:calendar`); Primer draws Octicons. A name
// with no reasonable Octicon draws nothing (never the token as text or a stray dot); a token that
// is not a `set:name` (an emoji the author typed) is shown as written.
const VAADIN_TO_OCTICON: Record<string, string> = {
  airplane: 'PaperAirplane', plane: 'PaperAirplane', 'paper-plane': 'PaperAirplane', alarm: 'Clock', 'alarm-clock': 'Clock', archive: 'Archive',
  'arrow-left': 'ArrowLeft', 'arrow-right': 'ArrowRight', 'arrow-up': 'ArrowUp', 'arrow-down': 'ArrowDown', 'arrow-backward': 'ArrowLeft', 'arrow-forward': 'ArrowRight',
  'angle-down': 'ChevronDown', 'angle-up': 'ChevronUp', 'angle-left': 'ChevronLeft', 'angle-right': 'ChevronRight',
  'chevron-down': 'ChevronDown', 'chevron-up': 'ChevronUp', 'chevron-left': 'ChevronLeft', 'chevron-right': 'ChevronRight',
  ban: 'Blocked', 'bar-chart': 'GraphBarVertical', 'bar-chart-h': 'GraphBarHorizontal', 'bar-chart-v': 'GraphBarVertical', chart: 'Graph', 'chart-line': 'Graph', 'line-chart': 'Graph', 'pie-chart': 'Graph', trending: 'Graph', stock: 'Graph',
  bell: 'Bell', 'bell-o': 'Bell', book: 'Book', bookmark: 'Bookmark', briefcase: 'Briefcase', suitcase: 'Briefcase', building: 'Organization', 'building-o': 'Organization', office: 'Organization', institution: 'Organization', workplace: 'Organization',
  bullets: 'ListUnordered', list: 'ListUnordered', 'list-ul': 'ListUnordered', 'list-ol': 'ListOrdered', 'list-select': 'Checklist', tasks: 'Tasklist',
  calendar: 'Calendar', 'calendar-o': 'Calendar', 'calendar-clock': 'Calendar', 'calendar-user': 'Calendar', camera: 'DeviceCamera', 'credit-card': 'CreditCard', cash: 'CreditCard', money: 'CreditCard', wallet: 'CreditCard',
  chat: 'CommentDiscussion', comment: 'Comment', 'comment-o': 'Comment', comments: 'CommentDiscussion',
  check: 'Check', 'check-circle': 'CheckCircle', 'check-circle-o': 'CheckCircle', 'check-square': 'Checkbox', 'check-square-o': 'Checkbox', circle: 'Circle', 'circle-thin': 'Circle',
  clipboard: 'Paste', 'clipboard-check': 'Checklist', clock: 'Clock', 'clock-o': 'Clock', hourglass: 'Hourglass', stopwatch: 'Stopwatch', timer: 'Stopwatch',
  close: 'X', 'close-small': 'X', 'close-circle': 'XCircle', cloud: 'Cloud', 'cloud-download': 'Download', 'cloud-upload': 'Upload', code: 'Code', cog: 'Gear', 'cog-o': 'Gear', cogs: 'Gear', options: 'Sliders', sliders: 'Sliders', adjust: 'Sliders',
  copy: 'Copy', 'copy-o': 'Copy', paste: 'Paste', cube: 'Package', cubes: 'Package', package: 'Package', dashboard: 'Dashboard', database: 'Database', storage: 'Database', server: 'Server', desktop: 'DeviceDesktop', laptop: 'DeviceDesktop', mobile: 'DeviceMobile', tablet: 'DeviceMobile',
  diamond: 'Diamond', download: 'Download', 'download-alt': 'Download', upload: 'Upload', 'upload-alt': 'Upload', edit: 'Pencil', pencil: 'Pencil', ellipsis: 'KebabHorizontal', 'ellipsis-dots-h': 'KebabHorizontal',
  envelope: 'Mail', 'envelope-o': 'Mail', 'exclamation-circle': 'Alert', 'exclamation-circle-o': 'Alert', warning: 'Alert', 'external-link': 'LinkExternal', eye: 'Eye', 'eye-slash': 'EyeClosed',
  file: 'File', 'file-o': 'File', 'file-text': 'File', 'file-text-o': 'File', 'file-add': 'FileAdded', 'file-code': 'FileCode', 'file-zip': 'FileZip', 'file-picture': 'FileMedia', 'file-tree': 'FileDirectory',
  filter: 'Filter', flag: 'Flag', 'flag-o': 'Flag', flash: 'Zap', bolt: 'Zap', fire: 'Flame', flask: 'Beaker', folder: 'FileDirectory', 'folder-o': 'FileDirectory', 'folder-open': 'FileDirectoryOpenFill',
  gift: 'Gift', globe: 'Globe', 'globe-wire': 'Globe', grid: 'Apps', 'grid-big': 'Apps', 'grid-h': 'Table', table: 'Table', group: 'People', users: 'People', user: 'Person', 'user-card': 'IdBadge', 'user-check': 'Person', 'user-clock': 'Person', 'user-star': 'Person', 'user-heart': 'Person',
  hash: 'Hash', heart: 'Heart', 'heart-o': 'Heart', home: 'Home', 'home-o': 'Home', 'info-circle': 'Info', 'info-circle-o': 'Info', info: 'Info', inbox: 'Inbox', key: 'Key', 'key-o': 'Key',
  kanban: 'Project', layout: 'Columns', library: 'Book', lightbulb: 'LightBulb', link: 'Link', unlink: 'Unlink', lock: 'Lock', unlock: 'Unlock', magic: 'Sparkle', 'map-marker': 'Location', 'location-arrow': 'Location', map: 'Location', pin: 'Pin',
  magnifier: 'Search', search: 'Search', menu: 'ThreeBars', minus: 'Dash', moon: 'Moon', 'moon-o': 'Moon', sun: 'Sun', 'sun-o': 'Sun', paperclip: 'Paperclip', phone: 'DeviceMobile', picture: 'Image', play: 'Play', pause: 'Pause', stop: 'Stop',
  plus: 'Plus', 'plus-circle': 'PlusCircle', 'plus-circle-o': 'PlusCircle', print: 'File', puzzle: 'Plug', connect: 'Plug', question: 'Question', 'question-circle': 'Question', 'question-circle-o': 'Question',
  refresh: 'Sync', rocket: 'Rocket', scale: 'Law', share: 'Share', shield: 'Shield', 'shield-o': 'Shield', shop: 'Organization', cart: 'Package', 'sign-in': 'SignIn', 'sign-out': 'SignOut', sitemap: 'Workflow', 'sitemap-o': 'Workflow',
  star: 'StarFill', 'star-o': 'Star', tag: 'Tag', tags: 'Tag', 'tag-o': 'Tag', 'thumbs-up': 'Thumbsup', 'thumbs-down': 'Thumbsdown', 'smiley-o': 'Smiley', tools: 'Tools', wrench: 'Tools', hammer: 'Tools', trash: 'Trash', 'trash-o': 'Trash',
  trophy: 'Trophy', medal: 'Trophy', truck: 'Package', 'time-backward': 'History', 'time-forward': 'Clock', automation: 'Workflow', records: 'Database', invoice: 'File', ticket: 'Tag', crosshairs: 'Crosshairs', bullseye: 'Goal', 'power-off': 'Stop',
}

// only the Octicons the map names: a namespace import put every Octicon in the bundle
const ICONS: Record<string, OcticonType> = {
  AlertIcon, AppsIcon, ArchiveIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, BeakerIcon, BellIcon, BlockedIcon, BookIcon, BookmarkIcon, BriefcaseIcon, CalendarIcon, CheckIcon, CheckCircleIcon, CheckboxIcon, ChecklistIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, CircleIcon, ClockIcon, CloudIcon, CodeIcon, ColumnsIcon, CommentIcon, CommentDiscussionIcon, CopyIcon, CreditCardIcon, CrosshairsIcon, DashIcon, DashboardIcon, DatabaseIcon, DeviceCameraIcon, DeviceDesktopIcon, DeviceMobileIcon, DiamondIcon, DownloadIcon, EyeIcon, EyeClosedIcon, FileIcon, FileAddedIcon, FileCodeIcon, FileDirectoryIcon, FileDirectoryOpenFillIcon, FileMediaIcon, FileZipIcon, FilterIcon, FlagIcon, FlameIcon, GearIcon, GiftIcon, GlobeIcon, GoalIcon, GraphIcon, GraphBarHorizontalIcon, GraphBarVerticalIcon, HashIcon, HeartIcon, HistoryIcon, HomeIcon, HourglassIcon, IdBadgeIcon, ImageIcon, InboxIcon, InfoIcon, KebabHorizontalIcon, KeyIcon, LawIcon, LightBulbIcon, LinkIcon, LinkExternalIcon, ListOrderedIcon, ListUnorderedIcon, LocationIcon, LockIcon, MailIcon, MoonIcon, OrganizationIcon, PackageIcon, PaperAirplaneIcon, PaperclipIcon, PasteIcon, PauseIcon, PencilIcon, PeopleIcon, PersonIcon, PinIcon, PlayIcon, PlugIcon, PlusIcon, PlusCircleIcon, ProjectIcon, QuestionIcon, RocketIcon, SearchIcon, ServerIcon, ShareIcon, ShieldIcon, SignInIcon, SignOutIcon, SlidersIcon, SmileyIcon, SparkleIcon, StarIcon, StarFillIcon, StopIcon, StopwatchIcon, SunIcon, SyncIcon, TableIcon, TagIcon, TasklistIcon, ThreeBarsIcon, ThumbsdownIcon, ThumbsupIcon, ToolsIcon, TrashIcon, TrophyIcon, UnlinkIcon, UnlockIcon, UploadIcon, WorkflowIcon, XIcon, XCircleIcon, ZapIcon,
}

/** The Octicon a wire icon token names, or null. */
export function octiconOf(token: unknown): OcticonType | null {
  const t = str(token).trim()
  const name = t.includes(':') ? t.slice(t.indexOf(':') + 1) : t
  const mapped = VAADIN_TO_OCTICON[name.toLowerCase()]
  return (mapped && ICONS[`${mapped}Icon`]) || null
}

/** A wire icon: an Octicon for a `set:name` token, the text itself for an emoji, nothing when unknown. */
export function WireIcon({ token, size = 16, label }: { token: unknown; size?: number; label?: string }) {
  const t = str(token).trim()
  if (!t) return null
  const Oct = octiconOf(t)
  if (Oct) return <Oct size={size} aria-label={label} aria-hidden={label ? undefined : true} />
  if (/^[a-z-]+:[a-z0-9-]+$/i.test(t)) return null
  return <span aria-hidden={label ? undefined : true} aria-label={label} role={label ? 'img' : undefined} style={{ fontSize: size, lineHeight: 1 }}>{t}</span>
}

/** Initials of a name (max two), for an avatar without an image. */
export const initialsOf = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?'

// The Primer data-visualisation palette: who a chat message is from, an initials avatar's colour.
const DISPLAY_COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'teal', 'pink', 'indigo', 'coral', 'olive']
export const displayColor = (index: number) => DISPLAY_COLORS[Math.abs(index) % DISPLAY_COLORS.length]!
export const colorIndexOf = (name: string) => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)

/** An avatar: the image when there is one, else initials on a Primer display colour. */
export function MateuAvatar({ name, image, abbreviation, size = 32, colorIndex }: { name: string; image?: unknown; abbreviation?: unknown; size?: number; colorIndex?: number }) {
  const src = safeHref(image)
  const label = name || str(abbreviation)
  if (src && str(image)) return <img className="mateu-avatar" src={src} alt={label} width={size} height={size} style={{ width: size, height: size }} />
  const color = displayColor(colorIndex ?? colorIndexOf(label))
  return (
    <span className="mateu-avatar mateu-avatar--initials" role="img" aria-label={label || 'Avatar'}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: `var(--display-${color}-bgColor-emphasis)` }}>
      {str(abbreviation) || initialsOf(name)}
    </span>
  )
}

export const Muted = ({ children, small }: { children: React.ReactNode; small?: boolean }) => (
  <span style={{ color: 'var(--fgColor-muted)', font: small ? 'var(--text-body-shorthand-small)' : undefined }}>{children}</span>
)
