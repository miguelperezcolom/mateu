/**
 * Contract names (views/kit-contract.json) whose ONLY users in the shared views are views this
 * renderer overrides with a Fiori floorplan: NavList (side navigation, the object page's anchor
 * bar, the directory), Table / DataTable (the list report), PageHeader / Breadcrumbs (the object
 * page header), Timeline (ui5-timeline), PageLayout / useConfirm (the app root), ThemeProvider
 * (setTheme). The overrides draw those with UI5 directly; these exist so the shared originals still
 * typecheck against this kit — each draws its children plainly, should a future shared view reach one.
 * BaseStyles IS reached (the sign-in chooser): UI5 needs no global style root, it passes through.
 */
import React from 'react'

type Any = { children?: React.ReactNode; [k: string]: unknown }
const plain = (tag: keyof React.JSX.IntrinsicElements) =>
  function Plain({ children }: Any) { return React.createElement(tag, null, children as React.ReactNode) }

const withParts = <T extends object>(base: React.FC<Any>, parts: T) => Object.assign(base, parts)

/* eslint-disable @typescript-eslint/no-explicit-any -- typed loosely on purpose: see the header */
export const BaseStyles: any = plain('div')
export const ThemeProvider: any = ({ children }: Any) => <>{children}</>
export const NavList: any = withParts(plain('ul'), { Item: plain('li'), Group: plain('li'), Divider: () => <hr />, Description: plain('span'), LeadingVisual: plain('span'), TrailingVisual: plain('span'), SubNav: plain('ul') })
export const Breadcrumbs: any = withParts(plain('nav'), { Item: plain('span') })
export const Timeline: any = withParts(plain('ol'), { Item: plain('li'), Badge: plain('span'), Body: plain('div'), Break: () => <hr /> })
export const PageLayout: any = withParts(plain('div'), { Header: plain('div'), Content: plain('main'), Pane: plain('aside'), Footer: plain('footer') })
export const PageHeader: any = withParts(plain('header'), {
  TitleArea: plain('div'), Title: plain('h2'), ContextArea: plain('div'), ParentLink: plain('span'), ContextBar: plain('div'), ContextAreaActions: plain('div'),
  LeadingAction: plain('span'), LeadingVisual: plain('span'), TrailingVisual: plain('span'), TrailingAction: plain('span'), Actions: plain('div'),
  Description: plain('div'), Navigation: plain('nav'), Breadcrumbs: plain('nav'),
})
export const Table: any = withParts(plain('div'), { Container: plain('div'), Title: plain('h3'), Subtitle: plain('p'), Actions: plain('div'), Divider: () => <hr />, Pagination: () => null, Skeleton: () => null, ErrorDialog: () => null })
export const DataTable: any = () => null
export const useConfirm: any = () => async (o: { title?: string; content?: React.ReactNode }) => window.confirm(String(o.title ?? ''))
