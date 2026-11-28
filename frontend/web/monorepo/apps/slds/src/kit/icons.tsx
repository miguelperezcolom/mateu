import React from 'react'
import utilitySprite from '@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg?url'

/**
 * SLDS utility icons, drawn from the design system's own sprite — shipped as the package publishes
 * it (the icons are CC BY-ND 4.0: redistributed UNMODIFIED, with attribution in the jar's notices;
 * never recoloured or cut down, which is why the whole sprite ships and nothing is copied out of it).
 * The browser fetches the sprite on the first icon a screen draws.
 *
 * The views were written against an icon vocabulary (`XIcon`, `ChevronDownIcon`…); each name here is
 * the SLDS utility icon that stands for it — explicit, one line each.
 */
export type Icon = React.FC<IconProps>
export interface IconProps {
  size?: number | 'small' | 'medium' | 'large'
  className?: string
  'aria-label'?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  fill?: string
  style?: React.CSSProperties
  verticalAlign?: string
}

const sizeOf = (size: IconProps['size']): number => (typeof size === 'number' ? size : size === 'large' ? 24 : size === 'medium' ? 20 : 16)

export function UtilityIcon({ name, size = 16, className, style, ...rest }: IconProps & { name: string }) {
  const px = sizeOf(size)
  const label = rest['aria-label']
  return (
    <svg
      // the colour of what holds it (a brand button's white, a link's blue), unless the caller asks for
      // one of SLDS's icon classes (slds-icon slds-icon-text-default…)
      className={['mateu-svg-icon', className].filter(Boolean).join(' ')}
      width={px}
      height={px}
      style={{ width: px, height: px, flex: 'none', ...style }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
    >
      <use href={`${utilitySprite}#${name}`} />
    </svg>
  )
}

/** An icon of the SLDS utility set, under the name the views use. */
export const utility = (name: string): Icon => {
  const C: Icon = (p) => <UtilityIcon name={name} {...p} />
  C.displayName = `Utility(${name})`
  return C
}

export const AlertIcon = utility('warning')
export const AlertFillIcon = utility('warning')
export const AppsIcon = utility('apps')
export const ArchiveIcon = utility('archive')
export const ArrowDownIcon = utility('arrowdown')
export const ArrowLeftIcon = utility('back')
export const ArrowRightIcon = utility('forward')
export const ArrowUpIcon = utility('arrowup')
export const BeakerIcon = utility('einstein')
export const BellIcon = utility('notification')
export const BlockedIcon = utility('ban')
export const BookIcon = utility('knowledge_base')
export const BookmarkIcon = utility('bookmark')
export const BriefcaseIcon = utility('case')
export const CalendarIcon = utility('event')
export const CheckIcon = utility('check')
export const CheckCircleIcon = utility('success')
export const CheckCircleFillIcon = utility('success')
export const CheckboxIcon = utility('multi_select_checkbox')
export const ChecklistIcon = utility('task')
export const ChevronDownIcon = utility('chevrondown')
export const ChevronLeftIcon = utility('chevronleft')
export const ChevronRightIcon = utility('chevronright')
export const ChevronUpIcon = utility('chevronup')
export const CircleIcon = utility('record')
export const ClockIcon = utility('clock')
export const CloudIcon = utility('salesforce1')
export const CodeIcon = utility('apex')
export const ColumnsIcon = utility('columns')
export const CommandPaletteIcon = utility('search')
export const CommentIcon = utility('chat')
export const CommentDiscussionIcon = utility('comments')
export const CopilotIcon = utility('einstein')
export const CopyIcon = utility('copy')
export const CreditCardIcon = utility('money')
export const CrosshairsIcon = utility('target')
export const DashIcon = utility('dash')
export const DashboardIcon = utility('metrics')
export const DatabaseIcon = utility('database')
export const DeviceCameraIcon = utility('photo')
export const DeviceDesktopIcon = utility('desktop')
export const DeviceMobileIcon = utility('phone_portrait')
export const DiamondIcon = utility('diamond')
export const DotFillIcon = utility('record')
export const DownloadIcon = utility('download')
export const DuplicateIcon = utility('copy')
export const EyeIcon = utility('preview')
export const EyeClosedIcon = utility('hide')
export const FileIcon = utility('file')
export const FileAddedIcon = utility('new')
export const FileCodeIcon = utility('apex')
export const FileDirectoryIcon = utility('open_folder')
export const FileDirectoryOpenFillIcon = utility('opened_folder')
export const FileMediaIcon = utility('image')
export const FileZipIcon = utility('package')
export const FilterIcon = utility('filterList')
export const FlagIcon = utility('priority')
export const FlameIcon = utility('thunder')
export const FoldIcon = utility('collapse_all')
export const GearIcon = utility('settings')
export const GiftIcon = utility('promotions')
export const GlobeIcon = utility('world')
export const GoalIcon = utility('target')
export const GraphIcon = utility('trending')
export const GraphBarHorizontalIcon = utility('chart')
export const GraphBarVerticalIcon = utility('chart')
export const HashIcon = utility('number_input')
export const HeartIcon = utility('heart')
export const HistoryIcon = utility('recent')
export const HomeIcon = utility('home')
export const HourglassIcon = utility('hourglass')
export const IdBadgeIcon = utility('identity')
export const ImageIcon = utility('image')
export const InboxIcon = utility('inbox')
export const InfoIcon = utility('info')
export const KebabHorizontalIcon = utility('threedots')
export const KeyIcon = utility('key')
export const LawIcon = utility('rules')
export const LightBulbIcon = utility('light_bulb')
export const LinkIcon = utility('link')
export const LinkExternalIcon = utility('new_window')
export const ListOrderedIcon = utility('richtextnumberedlist')
export const ListUnorderedIcon = utility('richtextbulletedlist')
export const LocationIcon = utility('location')
export const LockIcon = utility('lock')
export const MailIcon = utility('email')
export const MoonIcon = utility('hide')
export const OrganizationIcon = utility('company')
export const PackageIcon = utility('package')
export const PaperAirplaneIcon = utility('send')
export const PaperclipIcon = utility('attach')
export const PasteIcon = utility('paste')
export const PauseIcon = utility('pause')
export const PencilIcon = utility('edit')
export const PeopleIcon = utility('groups')
export const PersonIcon = utility('user')
export const PinIcon = utility('pin')
export const PlayIcon = utility('play')
export const PlugIcon = utility('integration')
export const PlusIcon = utility('add')
export const PlusCircleIcon = utility('add')
export const ProjectIcon = utility('kanban')
export const QuestionIcon = utility('question')
export const RocketIcon = utility('trailhead')
export const ScreenFullIcon = utility('expand')
export const ScreenNormalIcon = utility('contract')
export const SearchIcon = utility('search')
export const ServerIcon = utility('database')
export const ShareIcon = utility('share')
export const ShieldIcon = utility('shield')
export const SignInIcon = utility('enter')
export const SignOutIcon = utility('logout')
export const SlidersIcon = utility('slider')
export const SmileyIcon = utility('emoji')
export const SparkleIcon = utility('sparkles')
export const StarIcon = utility('favorite_alt')
export const StarFillIcon = utility('favorite')
export const StopIcon = utility('stop')
export const StopwatchIcon = utility('clock')
export const SunIcon = utility('light_bulb')
export const SyncIcon = utility('sync')
export const TableIcon = utility('table')
export const TagIcon = utility('label')
export const TasklistIcon = utility('task')
export const ThreeBarsIcon = utility('rows')
export const ThumbsdownIcon = utility('dislike')
export const ThumbsupIcon = utility('like')
export const ToolsIcon = utility('setup')
export const TrashIcon = utility('delete')
export const TriangleDownIcon = utility('down')
export const TrophyIcon = utility('ribbon')
export const UnfoldIcon = utility('expand_all')
export const UnlinkIcon = utility('unlinked')
export const UnlockIcon = utility('unlock')
export const UploadIcon = utility('upload')
export const WorkflowIcon = utility('flow')
export const XIcon = utility('close')
export const XCircleIcon = utility('error')
export const XCircleFillIcon = utility('error')
export const ZapIcon = utility('thunder')
export const ErrorIcon = utility('error')
export const WarningIcon = utility('warning')
export const SuccessIcon = utility('success')
export const SortAscIcon = utility('arrowup')
export const SortDescIcon = utility('arrowdown')
