/**
 * The icons the views name, drawn with SAP's own icon font (@ui5/webcomponents-icons, Apache-2.0).
 * Each is imported one by one (an icon module registers its glyph) — never the whole set. A view
 * passes one where it wants an icon (`leadingVisual={AddIcon}`); the controls read its `ui5Name`.
 */
import React from 'react'
import { Icon as Ui5Icon } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-icons/dist/accept.js'
import '@ui5/webcomponents-icons/dist/action-settings.js'
import '@ui5/webcomponents-icons/dist/add.js'
import '@ui5/webcomponents-icons/dist/ai.js'
import '@ui5/webcomponents-icons/dist/alert.js'
import '@ui5/webcomponents-icons/dist/arrow-bottom.js'
import '@ui5/webcomponents-icons/dist/arrow-left.js'
import '@ui5/webcomponents-icons/dist/arrow-top.js'
import '@ui5/webcomponents-icons/dist/attachment-photo.js'
import '@ui5/webcomponents-icons/dist/attachment-zip-file.js'
import '@ui5/webcomponents-icons/dist/begin.js'
import '@ui5/webcomponents-icons/dist/bell.js'
import '@ui5/webcomponents-icons/dist/bookmark.js'
import '@ui5/webcomponents-icons/dist/camera.js'
import '@ui5/webcomponents-icons/dist/chain-link.js'
import '@ui5/webcomponents-icons/dist/circle-task.js'
import '@ui5/webcomponents-icons/dist/circle-task-2.js'
import '@ui5/webcomponents-icons/dist/collapse.js'
import '@ui5/webcomponents-icons/dist/command-line-interfaces.js'
import '@ui5/webcomponents-icons/dist/copy.js'
import '@ui5/webcomponents-icons/dist/dark-mode.js'
import '@ui5/webcomponents-icons/dist/decline.js'
import '@ui5/webcomponents-icons/dist/delete.js'
import '@ui5/webcomponents-icons/dist/discussion.js'
import '@ui5/webcomponents-icons/dist/document.js'
import '@ui5/webcomponents-icons/dist/download.js'
import '@ui5/webcomponents-icons/dist/duplicate.js'
import '@ui5/webcomponents-icons/dist/edit.js'
import '@ui5/webcomponents-icons/dist/error.js'
import '@ui5/webcomponents-icons/dist/exit-full-screen.js'
import '@ui5/webcomponents-icons/dist/expand.js'
import '@ui5/webcomponents-icons/dist/favorite.js'
import '@ui5/webcomponents-icons/dist/filter.js'
import '@ui5/webcomponents-icons/dist/full-screen.js'
import '@ui5/webcomponents-icons/dist/history.js'
import '@ui5/webcomponents-icons/dist/information.js'
import '@ui5/webcomponents-icons/dist/iphone.js'
import '@ui5/webcomponents-icons/dist/key.js'
import '@ui5/webcomponents-icons/dist/less.js'
import '@ui5/webcomponents-icons/dist/light-mode.js'
import '@ui5/webcomponents-icons/dist/log.js'
import '@ui5/webcomponents-icons/dist/map.js'
import '@ui5/webcomponents-icons/dist/media-pause.js'
import '@ui5/webcomponents-icons/dist/media-play.js'
import '@ui5/webcomponents-icons/dist/menu2.js'
import '@ui5/webcomponents-icons/dist/overflow.js'
import '@ui5/webcomponents-icons/dist/paper-plane.js'
import '@ui5/webcomponents-icons/dist/search.js'
import '@ui5/webcomponents-icons/dist/show.js'
import '@ui5/webcomponents-icons/dist/slim-arrow-down.js'
import '@ui5/webcomponents-icons/dist/slim-arrow-left.js'
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js'
import '@ui5/webcomponents-icons/dist/slim-arrow-up.js'
import '@ui5/webcomponents-icons/dist/stop.js'
import '@ui5/webcomponents-icons/dist/sys-enter-2.js'
import '@ui5/webcomponents-icons/dist/table-column.js'
import '@ui5/webcomponents-icons/dist/table-view.js'
import '@ui5/webcomponents-icons/dist/unfavorite.js'
import '@ui5/webcomponents-icons/dist/upload.js'
import '@ui5/webcomponents-icons/dist/action.js'
import '@ui5/webcomponents-icons/dist/add-activity.js'
import '@ui5/webcomponents-icons/dist/add-document.js'
import '@ui5/webcomponents-icons/dist/arrow-right.js'
import '@ui5/webcomponents-icons/dist/attachment.js'
import '@ui5/webcomponents-icons/dist/badge.js'
import '@ui5/webcomponents-icons/dist/broken-link.js'
import '@ui5/webcomponents-icons/dist/building.js'
import '@ui5/webcomponents-icons/dist/business-objects-experience.js'
import '@ui5/webcomponents-icons/dist/calendar.js'
import '@ui5/webcomponents-icons/dist/cart.js'
import '@ui5/webcomponents-icons/dist/checklist.js'
import '@ui5/webcomponents-icons/dist/cloud.js'
import '@ui5/webcomponents-icons/dist/comment.js'
import '@ui5/webcomponents-icons/dist/complete.js'
import '@ui5/webcomponents-icons/dist/connected.js'
import '@ui5/webcomponents-icons/dist/course-book.js'
import '@ui5/webcomponents-icons/dist/credit-card.js'
import '@ui5/webcomponents-icons/dist/database.js'
import '@ui5/webcomponents-icons/dist/document-text.js'
import '@ui5/webcomponents-icons/dist/email.js'
import '@ui5/webcomponents-icons/dist/energy-saving-lightbulb.js'
import '@ui5/webcomponents-icons/dist/feeder-arrow.js'
import '@ui5/webcomponents-icons/dist/flag.js'
import '@ui5/webcomponents-icons/dist/fob-watch.js'
import '@ui5/webcomponents-icons/dist/folder-blank.js'
import '@ui5/webcomponents-icons/dist/grid.js'
import '@ui5/webcomponents-icons/dist/group.js'
import '@ui5/webcomponents-icons/dist/heart.js'
import '@ui5/webcomponents-icons/dist/heating-cooling.js'
import '@ui5/webcomponents-icons/dist/hide.js'
import '@ui5/webcomponents-icons/dist/home.js'
import '@ui5/webcomponents-icons/dist/horizontal-bar-chart.js'
import '@ui5/webcomponents-icons/dist/inbox.js'
import '@ui5/webcomponents-icons/dist/it-host.js'
import '@ui5/webcomponents-icons/dist/lab.js'
import '@ui5/webcomponents-icons/dist/laptop.js'
import '@ui5/webcomponents-icons/dist/lightbulb.js'
import '@ui5/webcomponents-icons/dist/line-chart.js'
import '@ui5/webcomponents-icons/dist/list.js'
import '@ui5/webcomponents-icons/dist/locked.js'
import '@ui5/webcomponents-icons/dist/number-sign.js'
import '@ui5/webcomponents-icons/dist/numbered-text.js'
import '@ui5/webcomponents-icons/dist/official-service.js'
import '@ui5/webcomponents-icons/dist/open-folder.js'
import '@ui5/webcomponents-icons/dist/paste.js'
import '@ui5/webcomponents-icons/dist/pending.js'
import '@ui5/webcomponents-icons/dist/person-placeholder.js'
import '@ui5/webcomponents-icons/dist/picture.js'
import '@ui5/webcomponents-icons/dist/product.js'
import '@ui5/webcomponents-icons/dist/project-definition-triangle-2.js'
import '@ui5/webcomponents-icons/dist/pushpin-off.js'
import '@ui5/webcomponents-icons/dist/question-mark.js'
import '@ui5/webcomponents-icons/dist/share-2.js'
import '@ui5/webcomponents-icons/dist/shield.js'
import '@ui5/webcomponents-icons/dist/source-code.js'
import '@ui5/webcomponents-icons/dist/suitcase.js'
import '@ui5/webcomponents-icons/dist/synchronize.js'
import '@ui5/webcomponents-icons/dist/sys-cancel.js'
import '@ui5/webcomponents-icons/dist/tag.js'
import '@ui5/webcomponents-icons/dist/target-group.js'
import '@ui5/webcomponents-icons/dist/task.js'
import '@ui5/webcomponents-icons/dist/thumb-down.js'
import '@ui5/webcomponents-icons/dist/thumb-up.js'
import '@ui5/webcomponents-icons/dist/unlocked.js'
import '@ui5/webcomponents-icons/dist/vertical-bar-chart.js'
import '@ui5/webcomponents-icons/dist/visits.js'
import '@ui5/webcomponents-icons/dist/workflow-tasks.js'
import '@ui5/webcomponents-icons/dist/world.js'
import '@ui5/webcomponents-icons/dist/wrench.js'

export interface SapIcon extends React.FC<{ size?: number | 'small' | 'medium' | 'large'; 'aria-label'?: string; 'aria-hidden'?: boolean | 'true' | 'false'; className?: string; style?: React.CSSProperties }> {
  ui5Name: string
}

/** An icon component for a SAP icon name (the name must be imported above or by the caller). */
/** Octicon's named sizes (small 16, medium 32, large 64) or a number of pixels. */
const px = (size: number | string) => (typeof size === 'number' ? size : ({ small: 16, medium: 32, large: 64 } as Record<string, number>)[size] ?? 16)

export function sapIcon(name: string): SapIcon {
  const C = (({ size = 16, className, style, ...aria }) => (
    <Ui5Icon name={name} className={className} accessibleName={aria['aria-label']} mode={aria['aria-label'] ? 'Image' : 'Decorative'}
      style={{ width: px(size), height: px(size), ...style }} />
  )) as SapIcon
  C.ui5Name = name
  C.displayName = `SapIcon(${name})`
  return C
}

/** The SAP icon name of an icon a view passed (a SapIcon), if any. */
export const iconName = (icon: unknown): string | undefined =>
  icon && typeof (icon as SapIcon).ui5Name === 'string' ? (icon as SapIcon).ui5Name : undefined

export const AlertFillIcon = sapIcon('alert')
export const AlertIcon = sapIcon('alert')
export const ArrowDownIcon = sapIcon('arrow-bottom')
export const ArrowLeftIcon = sapIcon('arrow-left')
export const ArrowUpIcon = sapIcon('arrow-top')
export const BellIcon = sapIcon('bell')
export const BookmarkIcon = sapIcon('bookmark')
export const CheckCircleFillIcon = sapIcon('sys-enter-2')
export const CheckCircleIcon = sapIcon('sys-enter-2')
export const CheckIcon = sapIcon('accept')
export const ChevronDownIcon = sapIcon('slim-arrow-down')
export const ChevronLeftIcon = sapIcon('slim-arrow-left')
export const ChevronRightIcon = sapIcon('slim-arrow-right')
export const ChevronUpIcon = sapIcon('slim-arrow-up')
export const CircleIcon = sapIcon('circle-task')
export const ColumnsIcon = sapIcon('table-column')
export const CommandPaletteIcon = sapIcon('command-line-interfaces')
export const CommentDiscussionIcon = sapIcon('discussion')
export const CopilotIcon = sapIcon('ai')
export const CopyIcon = sapIcon('copy')
export const DashIcon = sapIcon('less')
export const DeviceCameraIcon = sapIcon('camera')
export const DeviceMobileIcon = sapIcon('iphone')
export const DotFillIcon = sapIcon('circle-task-2')
export const DownloadIcon = sapIcon('download')
export const DuplicateIcon = sapIcon('duplicate')
export const EyeIcon = sapIcon('show')
export const FileIcon = sapIcon('document')
export const FileMediaIcon = sapIcon('attachment-photo')
export const FileZipIcon = sapIcon('attachment-zip-file')
export const FilterIcon = sapIcon('filter')
export const FoldIcon = sapIcon('collapse')
export const GearIcon = sapIcon('action-settings')
export const HistoryIcon = sapIcon('history')
export const InfoIcon = sapIcon('information')
export const KebabHorizontalIcon = sapIcon('overflow')
export const KeyIcon = sapIcon('key')
export const LinkIcon = sapIcon('chain-link')
export const LocationIcon = sapIcon('map')
export const MoonIcon = sapIcon('dark-mode')
export const PaperAirplaneIcon = sapIcon('paper-plane')
export const PauseIcon = sapIcon('media-pause')
export const PencilIcon = sapIcon('edit')
export const PlayIcon = sapIcon('media-play')
export const PlusIcon = sapIcon('add')
export const RocketIcon = sapIcon('begin')
export const ScreenFullIcon = sapIcon('full-screen')
export const ScreenNormalIcon = sapIcon('exit-full-screen')
export const SearchIcon = sapIcon('search')
export const SignOutIcon = sapIcon('log')
export const StarFillIcon = sapIcon('favorite')
export const StarIcon = sapIcon('unfavorite')
export const StopIcon = sapIcon('stop')
export const SunIcon = sapIcon('light-mode')
export const TableIcon = sapIcon('table-view')
export const ThreeBarsIcon = sapIcon('menu2')
export const TrashIcon = sapIcon('delete')
export const TriangleDownIcon = sapIcon('slim-arrow-down')
export const UnfoldIcon = sapIcon('expand')
export const UploadIcon = sapIcon('upload')
export const XCircleFillIcon = sapIcon('error')
export const XIcon = sapIcon('decline')
// the rest of the Octicon names the shared views name (views/kit-contract.json), as SAP icons
export const AppsIcon = sapIcon('grid')
export const ArchiveIcon = sapIcon('inbox')
export const ArrowRightIcon = sapIcon('arrow-right')
export const BeakerIcon = sapIcon('lab')
export const BlockedIcon = sapIcon('locked')
export const BookIcon = sapIcon('course-book')
export const BriefcaseIcon = sapIcon('suitcase')
export const CalendarIcon = sapIcon('calendar')
export const CheckboxIcon = sapIcon('complete')
export const ChecklistIcon = sapIcon('checklist')
export const ClockIcon = sapIcon('history')
export const CloudIcon = sapIcon('cloud')
export const CodeIcon = sapIcon('source-code')
export const CommentIcon = sapIcon('comment')
export const CreditCardIcon = sapIcon('credit-card')
export const CrosshairsIcon = sapIcon('target-group')
export const DashboardIcon = sapIcon('business-objects-experience')
export const DatabaseIcon = sapIcon('database')
export const DeviceDesktopIcon = sapIcon('laptop')
export const DiamondIcon = sapIcon('product')
export const EyeClosedIcon = sapIcon('hide')
export const FileAddedIcon = sapIcon('add-document')
export const FileCodeIcon = sapIcon('document-text')
export const FileDirectoryIcon = sapIcon('folder-blank')
export const FileDirectoryOpenFillIcon = sapIcon('open-folder')
export const FlagIcon = sapIcon('flag')
export const FlameIcon = sapIcon('heating-cooling')
export const GiftIcon = sapIcon('cart')
export const GlobeIcon = sapIcon('world')
export const GoalIcon = sapIcon('target-group')
export const GraphIcon = sapIcon('line-chart')
export const GraphBarHorizontalIcon = sapIcon('horizontal-bar-chart')
export const GraphBarVerticalIcon = sapIcon('vertical-bar-chart')
export const HashIcon = sapIcon('number-sign')
export const HeartIcon = sapIcon('heart')
export const HomeIcon = sapIcon('home')
export const HourglassIcon = sapIcon('pending')
export const IdBadgeIcon = sapIcon('badge')
export const ImageIcon = sapIcon('picture')
export const InboxIcon = sapIcon('inbox')
export const LawIcon = sapIcon('official-service')
export const LightBulbIcon = sapIcon('lightbulb')
export const LinkExternalIcon = sapIcon('action')
export const ListOrderedIcon = sapIcon('numbered-text')
export const ListUnorderedIcon = sapIcon('list')
export const LockIcon = sapIcon('locked')
export const MailIcon = sapIcon('email')
export const OrganizationIcon = sapIcon('building')
export const PackageIcon = sapIcon('product')
export const PaperclipIcon = sapIcon('attachment')
export const PasteIcon = sapIcon('paste')
export const PeopleIcon = sapIcon('group')
export const PersonIcon = sapIcon('person-placeholder')
export const PinIcon = sapIcon('pushpin-off')
export const PlugIcon = sapIcon('connected')
export const PlusCircleIcon = sapIcon('add-activity')
export const ProjectIcon = sapIcon('project-definition-triangle-2')
export const QuestionIcon = sapIcon('question-mark')
export const ServerIcon = sapIcon('it-host')
export const ShareIcon = sapIcon('share-2')
export const ShieldIcon = sapIcon('shield')
export const SignInIcon = sapIcon('visits')
export const SlidersIcon = sapIcon('action-settings')
export const SmileyIcon = sapIcon('feeder-arrow')
export const SparkleIcon = sapIcon('ai')
export const StopwatchIcon = sapIcon('fob-watch')
export const SyncIcon = sapIcon('synchronize')
export const TagIcon = sapIcon('tag')
export const TasklistIcon = sapIcon('task')
export const ThumbsdownIcon = sapIcon('thumb-down')
export const ThumbsupIcon = sapIcon('thumb-up')
export const ToolsIcon = sapIcon('wrench')
export const TrophyIcon = sapIcon('favorite')
export const UnlinkIcon = sapIcon('broken-link')
export const UnlockIcon = sapIcon('unlocked')
export const WorkflowIcon = sapIcon('workflow-tasks')
export const XCircleIcon = sapIcon('sys-cancel')
export const ZapIcon = sapIcon('energy-saving-lightbulb')
export type Icon = SapIcon
