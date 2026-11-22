import './display/display.css'
import type { Catalogue } from './types'
import { Breadcrumbs, CalloutCard, EntityHeader, HeroSection, NotFound } from './display/headers'
import { Avatar, AvatarGroup, Details, FormItem, Icon, Popover, Tooltip } from './display/media'
import { CookieConsent, Faq, FeatureGrid, Testimonials } from './display/landing'
import { Chat, CommentThread, FileList, MessageInput, MessageList, Timeline } from './display/activity'

/** Wire types of the "display" group, each drawn with Primer. */
export const display: Catalogue = {
  HeroSection, EntityHeader, CalloutCard, NotFound, Breadcrumbs,
  Icon, Avatar, AvatarGroup, Details, Tooltip, Popover, FormItem,
  FeatureGrid, Testimonials, Faq, CookieConsent,
  Timeline, CommentThread, FileList, MessageList, MessageInput, Chat,
}
