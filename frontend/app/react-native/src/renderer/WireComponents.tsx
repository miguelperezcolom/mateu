/**
 * Native renderers for the wire component types that used to fall through to "Unsupported
 * component": grids and lists, navigation (breadcrumbs, menu bar, context menu, directory),
 * people (avatar, avatar group), messaging (chat, message list/input), structural layouts
 * (master-detail, carousel, content layout, responsive grid, board), outcome pages (result,
 * not found), overlays rendered in place (drawer, notification, cookie consent), web elements
 * and the read-only diagrams (BPMN, workflow, form definition).
 *
 * Mobile adaptations, deliberately: hover becomes long-press, right-click becomes long-press,
 * multi-column layouts stack below a phone width, a Bpmn diagram is shown read-only (as on the
 * web); the Workflow and FormEditor editors live in DefinitionEditors.tsx. The decisions that can be made without React live in wireWidgets.ts / diagrams.ts.
 */
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, type GestureResponderEvent, Modal, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useOpenHref } from './useOpenHref';
import { hrefIntent } from '../core/linkTarget';
import { Image } from './BackendImage';
import { cssToRn } from '../core/cssStyle';
import { MIcon } from '../ui/controls';
import { TouchableOpacity } from '../ui/Touchable';
import { Text, TextInput } from '../ui/Text';
import Svg, { Circle, G, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { ComponentRenderer } from './ComponentRenderer';
import { MateuViewHost, useViewController } from './MateuViewHost';
import { ChatPanel } from './ChatPanel';
import { iconGlyph } from './menuCards';
import { parseBpmn, type Diagram } from './diagrams';
import {
  avatarColor,
  avatarGroupSplit,
  cellText,
  contentSlots,
  elementKind,
  gridCellText,
  gridHeader,
  visibleTreeRows,
  type GridLeaf,

  gridRowsOf,
  initials,
  menuIntent,
  responsiveColumns,
  textOfHtml,
  type MenuOptionLike,
  gridTrackSizes,
  gridCellParameters,
  orderByAreas,
} from './wireWidgets';
import { interpolate } from '../core/expressions';
import { platformStore } from '../core/secureStore';
import { useAppContext } from '../context/AppContext';
import { theme, themed } from '../theme';
import { Icon as PaperIcon } from 'react-native-paper';
import { materialIconOf } from '../ui/wireIcons';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import { openExternal } from './openExternal';
import { masterDetailDirection } from '../core/phoneLayout';

type Dict = Record<string, unknown>;
const meta = (c: unknown): Dict => ((c as Dict)?.['metadata'] as Dict) ?? {};
const childrenOf = (c: unknown): unknown[] => ((c as Dict)?.['children'] as unknown[]) ?? [];
const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

function Kids({ list, state, data }: { list: unknown[]; state: Dict; data?: unknown }) {
  return (
    <>
      {list.map((c, i) => (
        <ComponentRenderer key={i} component={c} state={state} data={data} />
      ))}
    </>
  );
}

/** In-app navigation, the same push the Anchor and the rowRoute use. */
function useNavigate() {
  const controller = useViewController();
  return (route: string, label = '') =>
    controller.session.openView({ label: label || route, route, consumedRoute: '', serverSideType: '' });
}

function useRunMenuOption() {
  const controller = useViewController();
  const navigate = useNavigate();
  return (o: MenuOptionLike) => {
    const intent = menuIntent(o);
    if (intent.kind === 'action') void controller.runAction(intent.target);
    else if (intent.kind === 'route') {
      if (/^[a-z]+:/i.test(intent.target)) openExternal(intent.target);
      else navigate(intent.target, o.label);
    }
  };
}

// ── Parts rendered on their own (normally drawn by their owner) ────────────────

/** Tab / AccordionPanel / FormItem / BoardLayoutItem reaching the switch on their own:
 *  their label (when they have one) over their children. */
export function LabelledChildrenRenderer({ component, state, data }: { component: unknown; state: Dict; data?: unknown }) {
  const label = interpolate(str(meta(component)['label']), { state });
  return (
    <View style={styles.stack}>
      {!!label && <Text style={styles.partLabel}>{label}</Text>}
      <Kids list={childrenOf(component)} state={state} data={data} />
    </View>
  );
}

export function GridColumnRenderer({ metadata }: { metadata: Dict }) {
  return <Text style={styles.th}>{str(metadata['label'] ?? metadata['id'])}</Text>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function AvatarCircle({ name, abbreviation, image, colorIndex, size = 36, ring = false }: {
  name?: string; abbreviation?: string; image?: string; colorIndex?: number | null; size?: number; ring?: boolean;
}) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  return (
    <View
      accessible
      accessibilityLabel={name || abbreviation || 'Avatar'}
      style={[styles.avatar, box, { backgroundColor: avatarColor(name ?? abbreviation, colorIndex) }, ring && styles.avatarRing]}
    >
      {image ? (
        <Image source={{ uri: image }} style={box} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials(name, abbreviation)}</Text>
      )}
    </View>
  );
}

export function AvatarRenderer({ metadata }: { metadata: Dict }) {
  return <AvatarCircle name={str(metadata['name'])} abbreviation={str(metadata['abbreviation'])} image={str(metadata['image'])} />;
}

export function AvatarGroupRenderer({ metadata }: { metadata: Dict }) {
  const avatars = (metadata['avatars'] as Dict[]) ?? [];
  const { shown, overflow } = avatarGroupSplit(avatars, Number(metadata['maxItemsVisible'] ?? 0));
  return (
    <View style={styles.row} accessibilityLabel={`${avatars.length} people`}>
      {shown.map((a, i) => (
        <View key={i} style={i > 0 ? styles.avatarOverlap : undefined}>
          <AvatarCircle name={str(a['name'])} abbreviation={str(a['abbreviation'])} image={str(a['image'])} ring />
        </View>
      ))}
      {overflow > 0 && (
        <View style={[styles.avatar, styles.avatarOverlap, styles.avatarRing, { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.muted }]}>
          <Text style={styles.avatarText}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

// ── Icon ──────────────────────────────────────────────────────────────────────

/** A few design-system icon names mapped to glyphs; anything else that is not already a glyph
 *  shows as a neutral dot so the layout keeps its slot. */
const ICON_GLYPHS: Record<string, string> = {
  check: '✓', close: '✕', plus: '+', minus: '−', search: '🔍', user: '👤', users: '👥', home: '🏠', cog: '⚙',
  calendar: '📅', clock: '🕒', envelope: '✉', phone: '📞', star: '★', heart: '♥', trash: '🗑', edit: '✎',
  pencil: '✎', warning: '⚠', info: 'ℹ', 'info-circle': 'ℹ', bell: '🔔', lock: '🔒', 'arrow-right': '→',
  'arrow-left': '←', chart: '📊', download: '⬇', upload: '⬆', file: '📄', folder: '📁', cart: '🛒', money: '💶',
};
export function iconText(icon: string): string {
  const glyph = iconGlyph(icon);
  if (glyph) return glyph;
  const name = icon.includes(':') ? icon.split(':')[1]! : icon;
  return ICON_GLYPHS[name] ?? ICON_GLYPHS[name.replace(/-o$/, '')] ?? '•';
}

export function IconRenderer({ metadata }: { metadata: Dict }) {
  const icon = str(metadata['icon']);
  const material = materialIconOf(icon);
  if (material) return <PaperIcon source={material} size={20} color={theme.ink} />;
  return (
    <Text style={styles.icon} accessibilityLabel={icon.split(':').pop()}>
      {iconText(icon)}
    </Text>
  );
}

// ── Breadcrumbs ───────────────────────────────────────────────────────────────

export function BreadcrumbRenderer({ metadata }: { metadata: Dict }) {
  const navigate = useNavigate();
  const link = str(metadata['link']);
  const text = str(metadata['text']);
  return link ? (
    <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={() => navigate(link, text)}>
      <Text style={styles.link}>{text}</Text>
    </TouchableOpacity>
  ) : (
    <Text style={styles.crumbCurrent}>{text}</Text>
  );
}

export function BreadcrumbsRenderer({ metadata }: { metadata: Dict }) {
  const crumbs = (metadata['breadcrumbs'] as Dict[]) ?? [];
  const current = str(metadata['currentItemText']);
  return (
    <View style={[styles.row, styles.wrap]} accessibilityRole="toolbar" accessibilityLabel="Breadcrumbs">
      {crumbs.map((c, i) => (
        <View key={i} style={styles.row}>
          <BreadcrumbRenderer metadata={c} />
          <MIcon name="chevron-right" size={16} />
        </View>
      ))}
      {!!current && <Text style={styles.crumbCurrent}>{current}</Text>}
    </View>
  );
}

// ── Details ──────────────────────────────────────────────────────────────────

export function DetailsRenderer({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const [open, setOpen] = useState(metadata['opened'] === true);
  const summary = metadata['summary'];
  return (
    <View style={styles.panel}>
      <TouchableOpacity {...buttonA11y({ expanded: open })} style={styles.panelHeader} onPress={() => setOpen(!open)}>
        <View style={styles.flex1}>
          {summary && typeof summary === 'object' ? <ComponentRenderer component={summary} state={state} data={data} /> : <Text style={styles.bold}>{str(summary)}</Text>}
        </View>
        <MIcon name={open ? 'chevron-up' : 'chevron-down'} size={20} />
      </TouchableOpacity>
      {open && !!metadata['content'] && (
        <View style={styles.panelBody}>
          <ComponentRenderer component={metadata['content']} state={state} data={data} />
        </View>
      )}
    </View>
  );
}

// ── Menus ────────────────────────────────────────────────────────────────────

/** A modal action sheet listing options (submenus drill down in place). */
function OptionsSheet({ title, options, onClose }: { title: string; options: MenuOptionLike[]; onClose: () => void }) {
  const run = useRunMenuOption();
  const [stack, setStack] = useState<{ title: string; options: MenuOptionLike[] }[]>([{ title, options }]);
  const top = stack[stack.length - 1]!;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} accessibilityViewIsModal>
      <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={onClose} accessibilityLabel="Close menu">
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            {stack.length > 1 && (
              <TouchableOpacity {...buttonA11y({ label: 'Back' })} onPress={() => setStack(stack.slice(0, -1))}>
                <MIcon name="arrow-left" />
              </TouchableOpacity>
            )}
            <Text style={styles.sheetTitle}>{top.title}</Text>
          </View>
          {top.options.map((o, i) =>
            o.separator ? (
              <View key={i} style={styles.hr} />
            ) : (
              <TouchableOpacity
                key={i}
                {...buttonA11y({ disabled: !!o.disabled })}
                disabled={!!o.disabled}
                style={styles.sheetItem}
                onPress={() => {
                  const intent = menuIntent(o);
                  if (intent.kind === 'submenu') {
                    setStack([...stack, { title: o.label ?? '', options: o.submenus ?? [] }]);
                    return;
                  }
                  onClose();
                  run(o);
                }}
              >
                <Text style={[styles.sheetItemText, o.disabled && styles.disabledText]}>{o.label}</Text>
                {!!o.submenus?.length && <MIcon name="chevron-right" size={20} />}
              </TouchableOpacity>
            ),
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function MenuBarRenderer({ metadata }: { metadata: Dict }) {
  const options = (metadata['options'] as MenuOptionLike[]) ?? [];
  const run = useRunMenuOption();
  const [sheet, setSheet] = useState<MenuOptionLike | null>(null);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.menuBar} accessibilityRole="menubar">
      {options.map((o, i) =>
        o.separator ? (
          <View key={i} style={styles.vr} />
        ) : (
          <TouchableOpacity
            key={i}
            {...buttonA11y({ disabled: !!o.disabled, expanded: o.submenus?.length ? sheet === o : undefined })}
            disabled={!!o.disabled}
            style={styles.menuBarItem}
            onPress={() => (o.submenus?.length ? setSheet(o) : run(o))}
          >
            <Text style={[styles.menuBarText, o.disabled && styles.disabledText]}>
              {o.label}
              {o.submenus?.length ? ' ▾' : ''}
            </Text>
          </TouchableOpacity>
        ),
      )}
      {sheet && <OptionsSheet title={sheet.label ?? ''} options={sheet.submenus ?? []} onClose={() => setSheet(null)} />}
    </ScrollView>
  );
}

/** Right-click has no touch equivalent: a LONG-PRESS on the wrapped content opens the menu (a
 *  plain press too, when the menu is declared activateOnLeftClick). */
export function ContextMenuRenderer({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const [open, setOpen] = useState(false);
  const onLeft = metadata['activateOnLeftClick'] === true;
  return (
    <>
      <TouchableOpacity
        {...buttonA11y({ hint: 'Long press for more actions' })}
        activeOpacity={0.7}
        onLongPress={() => setOpen(true)}
        onPress={onLeft ? () => setOpen(true) : undefined}
      >
        {!!metadata['wrapped'] && <ComponentRenderer component={metadata['wrapped']} state={state} data={data} />}
      </TouchableOpacity>
      {open && <OptionsSheet title="" options={(metadata['menu'] as MenuOptionLike[]) ?? []} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Tooltip: no hover on touch — a long-press shows the text under the wrapped content (and the
 *  text is the control's accessibility hint, so screen readers get it without the gesture). */
export function TooltipRenderer({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const [shown, setShown] = useState(false);
  const text = interpolate(str(metadata['text']), { state });
  return (
    <View>
      <TouchableOpacity activeOpacity={0.8} accessibilityHint={text} onLongPress={() => setShown(true)} onPressOut={() => setShown(false)}>
        {!!metadata['wrapped'] && <ComponentRenderer component={metadata['wrapped']} state={state} data={data} />}
      </TouchableOpacity>
      {shown && !!text && (
        <View style={styles.tooltip} accessibilityLiveRegion="polite">
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      )}
    </View>
  );
}

export function DirectoryRenderer({ metadata }: { metadata: Dict }) {
  const run = useRunMenuOption();
  const renderItem = (o: MenuOptionLike, i: number, depth: number): React.ReactNode =>
    o.submenus?.length ? (
      <View key={i} style={[styles.dirGroup, { marginLeft: depth * 12 }]}>
        <Text style={styles.dirGroupTitle} {...headingA11y()}>{o.label}</Text>
        {o.submenus.map((s, j) => renderItem(s, j, depth + 1))}
      </View>
    ) : o.separator ? (
      <View key={i} style={styles.hr} />
    ) : (
      <TouchableOpacity key={i} {...buttonA11y({ role: 'link' })} style={{ marginLeft: depth * 12, paddingVertical: 6 }} onPress={() => run(o)}>
        <Text style={styles.link}>{o.label}</Text>
      </TouchableOpacity>
    );
  return <View style={styles.stack}>{((metadata['menu'] as MenuOptionLike[]) ?? []).map((o, i) => renderItem(o, i, 0))}</View>;
}

// ── Grid / VirtualList ──────────────────────────────────────────────────────────

export function GridRenderer({ component, state, data }: { component: unknown; state: Dict; data?: unknown }) {
  const controller = useViewController();
  const m = meta(component);
  const { leaves: columns, groups } = gridHeader(component);
  const tree = m['tree'] === true;
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const allRows = gridRowsOf(component, state, data);
  const rows = tree ? visibleTreeRows(allRows, expanded) : allRows.map((row, i) => ({ row, depth: 0, key: String(i), hasChildren: false }));
  const stripes = m['rowStripes'] === true;
  const colW = (c: GridLeaf) => c.width ?? 140;
  const toggle = (key: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  return (
    <ScrollView horizontal style={styles.gridBox}>
      <View>
        {groups && (
          <View style={[styles.gridRow, styles.gridHead]}>
            {groups.map((g, gi) => {
              const start = groups.slice(0, gi).reduce((n, x) => n + x.span, 0);
              const width = columns.slice(start, start + g.span).reduce((n, c) => n + colW(c), 0);
              return <Text key={gi} style={[styles.th, styles.thGroup, { width }]} numberOfLines={1}>{g.label}</Text>;
            })}
          </View>
        )}
        <View style={[styles.gridRow, styles.gridHead]}>
          {columns.map((c) => (
            <Text key={c.id} style={[styles.th, { width: colW(c), textAlign: c.align === 'end' || c.align === 'right' ? 'right' : 'left' }]} numberOfLines={1}>
              {c.label}
            </Text>
          ))}
        </View>
        {rows.length === 0 && <Text style={styles.empty}>No data.</Text>}
        {rows.map(({ row, depth, key, hasChildren }, r) => (
          <View key={key} style={[styles.gridRow, stripes && r % 2 === 1 ? styles.gridStripe : null]}>
            {columns.map((c, ci) => {
              // money in the UI's locale, dates as dates — the column's dataType, like a listing
              const text = gridCellText(row[c.id], c);
              const indent = tree && ci === 0 ? depth * 16 : 0;
              const cellStyle = [styles.td, { width: colW(c), paddingLeft: 6 + indent, textAlign: (c.align === 'end' || c.align === 'right' ? 'right' : 'left') as 'left' | 'right' }];
              if (tree && ci === 0 && hasChildren) {
                const open = expanded.has(key);
                return (
                  <TouchableOpacity key={c.id} {...buttonA11y({ expanded: open, label: text })} style={[styles.treeCell, { width: colW(c), paddingLeft: indent }]} onPress={() => toggle(key)}>
                    <MIcon name={open ? 'chevron-down' : 'chevron-right'} size={18} color={theme.muted} />
                    <Text style={styles.treeCellText} numberOfLines={1}>{text}</Text>
                  </TouchableOpacity>
                );
              }
              const leafPad = tree && ci === 0 ? { paddingLeft: 6 + indent + 18 } : null;
              return c.actionId ? (
                <TouchableOpacity key={c.id} {...buttonA11y({ role: 'link' })} onPress={() => void controller.runAction(c.actionId!, gridCellParameters(c.actionId!, row))}>
                  <Text style={[...cellStyle, leafPad, styles.link]} numberOfLines={1}>{text}</Text>
                </TouchableOpacity>
              ) : (
                <Text key={c.id} style={[...cellStyle, leafPad]} numberOfLines={1}>{text}</Text>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/**
 * A VirtualList: a box of its declared height (`height: 18rem`, else 400) that scrolls by itself and
 * only draws the rows near the viewport (FlatList windowing) — it used to draw all its 2,000 rows
 * down the page. Nested in the screen's scroll (nestedScrollEnabled, for Android).
 */
export function VirtualListRenderer({ component, metadata, state, data }: { component?: unknown; metadata: Dict; state: Dict; data?: unknown }) {
  const items = (((metadata['page'] as Dict)?.['content'] as unknown[]) ?? []);
  const declared = cssToRn(((component as Dict)?.['style'] as string) ?? '', new Set(['height', 'max-height']));
  const height = typeof declared['height'] === 'number' ? declared['height'] : typeof declared['maxHeight'] === 'number' ? declared['maxHeight'] : 400;
  return (
    <FlatList
      style={[styles.virtualList, { height: height as number }]}
      data={items}
      nestedScrollEnabled
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={7}
      removeClippedSubviews
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) =>
        item && typeof item === 'object' && ('type' in (item as Dict) || 'metadata' in (item as Dict)) ? (
          <View style={styles.virtualRow}><ComponentRenderer component={item} state={state} data={data} /></View>
        ) : (
          <Text style={[styles.text, styles.virtualRow]}>{str(item)}</Text>
        )
      }
    />
  );
}

// ── Layouts ──────────────────────────────────────────────────────────────────

/** Master + detail: side by side on a tablet, stacked (master first) on a phone. The detail is
 *  the server-provided `data.detailComponent` (row selection) or the static second child. */
export function MasterDetailRenderer({ component, state, data }: { component: unknown; state: Dict; data?: unknown }) {
  const { width } = useWindowDimensions();
  const kids = childrenOf(component);
  const d = (data as Dict) ?? {};
  const detail = (d['detailComponent'] as unknown) ?? kids[1];
  const hasDetail = !!d['hasDetail'] || !!kids[1];
  const direction = masterDetailDirection(meta(component)['orientation'], width);
  const wide = direction === 'row';
  return (
    <View style={{ flexDirection: direction, gap: 12 }}>
      <View style={wide ? styles.flex1 : undefined}>{!!kids[0] && <ComponentRenderer component={kids[0]} state={state} data={data} />}</View>
      <View style={wide ? styles.flex1 : undefined}>
        {hasDetail && detail ? (
          <ComponentRenderer component={detail} state={state} data={data} />
        ) : (
          <Text style={styles.placeholder}>Select an item to view details</Text>
        )}
      </View>
    </View>
  );
}

/** Carousel: horizontal paging with dots (and prev/next when `nav`), auto-advancing when `auto`. */
export function CarouselRenderer({ component, metadata, state, data }: { component: unknown; metadata: Dict; state: Dict; data?: unknown }) {
  const slides = childrenOf(component);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(Math.max(0, Number(metadata['selected'] ?? 0)));
  const scroll = useRef<ScrollView>(null);
  const loop = metadata['loop'] === true;
  const go = (i: number) => {
    const n = slides.length;
    if (n === 0) return;
    const next = loop ? (i + n) % n : Math.max(0, Math.min(n - 1, i));
    setIndex(next);
    scroll.current?.scrollTo({ x: next * width, animated: true });
  };
  useEffect(() => {
    if (metadata['auto'] !== true || slides.length < 2 || !width) return;
    const t = setInterval(() => go(index + 1), Number(metadata['duration'] ?? 4000) || 4000);
    return () => clearInterval(t);
  });
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        scrollEnabled={metadata['disableSwipe'] !== true && metadata['disabled'] !== true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => width && setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {slides.map((s, i) => (
          <View key={i} style={{ width: width || undefined }}>
            <ComponentRenderer component={s} state={state} data={data} />
          </View>
        ))}
      </ScrollView>
      <View style={[styles.row, styles.carouselNav]}>
        {metadata['nav'] === true && (
          <TouchableOpacity {...buttonA11y({ label: 'Previous slide' })} onPress={() => go(index - 1)}>
            <MIcon name="chevron-left" color={theme.ink} />
          </TouchableOpacity>
        )}
        {metadata['dots'] !== false &&
          slides.map((_, i) => (
            <TouchableOpacity key={i} {...buttonA11y({ label: `Slide ${i + 1}`, selected: i === index })} onPress={() => go(i)}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        {metadata['nav'] === true && (
          <TouchableOpacity {...buttonA11y({ label: 'Next slide' })} onPress={() => go(index + 1)}>
            <MIcon name="chevron-right" color={theme.ink} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/** Content page grammar (main / aside / footer): side by side on a tablet, stacked on a phone. */
export function ContentLayoutRenderer({ component, metadata, state, data }: { component: unknown; metadata: Dict; state: Dict; data?: unknown }) {
  const { width } = useWindowDimensions();
  const { main, aside, footer } = contentSlots(childrenOf(component));
  const wide = width >= 768 && aside.length > 0;
  const asideFirst = metadata['asidePosition'] === 'start';
  const mainCol = (
    <View key="main" style={wide ? styles.flex2 : undefined}>
      <Kids list={main} state={state} data={data} />
    </View>
  );
  const asideCol = aside.length ? (
    <View key="aside" style={wide ? styles.flex1 : undefined}>
      <Kids list={aside} state={state} data={data} />
    </View>
  ) : null;
  return (
    <View style={styles.stack}>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>{asideFirst ? [asideCol, mainCol] : [mainCol, asideCol]}</View>
      {footer.length > 0 && <Kids list={footer} state={state} data={data} />}
    </View>
  );
}

/** CSS-grid layout: stacked below a phone width (or `stackBelow`), else the declared tracks
 *  with each child spanning its `colSpans[i]`. */
export function ResponsiveGridRenderer({ component, metadata, state, data }: { component: unknown; metadata: Dict; state: Dict; data?: unknown }) {
  const { width } = useWindowDimensions();
  const cols = responsiveColumns(str(metadata['gridTemplateColumns']), width, str(metadata['stackBelow']) || null);
  const spans = (metadata['colSpans'] as number[]) ?? [];
  const kids = childrenOf(component);
  // Stacked: children order (a promoted slot — e.g. GeneralOverview's info — comes first on purpose).
  if (cols <= 1) return <View style={styles.stack}><Kids list={kids} state={state} data={data} /></View>;
  // Wide, one child per declared track ("1fr 22rem"): honour the area names and the track sizes.
  const tracks = gridTrackSizes(str(metadata['gridTemplateColumns']));
  const byArea = orderByAreas(str(metadata['gridTemplateAreas']), kids) ?? (tracks && kids.length === tracks.length ? kids : null);
  if (tracks && byArea && byArea.length === tracks.length) {
    return (
      <View style={[styles.row, { alignItems: 'stretch', gap: 12 }]}>
        {byArea.map((c, i) => {
          const t = tracks[i]!;
          return (
            <View key={i} style={'fr' in t ? { flex: t.fr, minWidth: 0 } : { width: t.px }}>
              <ComponentRenderer component={c} state={state} data={data} />
            </View>
          );
        })}
      </View>
    );
  }
  return (
    <View style={[styles.row, styles.wrap, { alignItems: 'stretch' }]}>
      {kids.map((c, i) => {
        const span = Math.min(cols, Math.max(1, spans[i] ?? 1));
        return (
          <View key={i} style={{ width: `${(span / cols) * 100}%`, padding: 6 }}>
            <ComponentRenderer component={c} state={state} data={data} />
          </View>
        );
      })}
    </View>
  );
}

export function BoardLayoutRenderer({ component, state, data }: { component: unknown; state: Dict; data?: unknown }) {
  return <View style={styles.stack}><Kids list={childrenOf(component)} state={state} data={data} /></View>;
}

/** A board row: its items side by side on a tablet (weighted by boardCols), stacked on a phone. */
export function BoardLayoutRowRenderer({ component, state, data }: { component: unknown; state: Dict; data?: unknown }) {
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  return (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
      {childrenOf(component).map((c, i) => (
        <View key={i} style={wide ? { flex: Number(meta(c)['boardCols'] ?? 1) || 1 } : undefined}>
          <ComponentRenderer component={c} state={state} data={data} />
        </View>
      ))}
    </View>
  );
}

// ── Messaging ──────────────────────────────────────────────────────────────────

export function MessageListRenderer({ metadata }: { metadata: Dict }) {
  const items = (metadata['items'] as Dict[]) ?? [];
  return (
    <View style={styles.stack} accessibilityRole="list">
      {items.map((m, i) => (
        <View key={i} style={styles.message}>
          <AvatarCircle name={str(m['userName'])} abbreviation={str(m['userAbbr'])} image={str(m['userImg'])} colorIndex={m['userColorIndex'] as number | null} size={32} />
          <View style={styles.flex1}>
            <View style={styles.row}>
              <Text style={styles.bold}>{str(m['userName'])}</Text>
              {!!m['time'] && <Text style={styles.muted}>  {str(m['time'])}</Text>}
            </View>
            <Text style={styles.text}>{str(m['text'])}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Submitting runs `actionId` with `{ message }` — the same contract as the web's input. */
export function MessageInputRenderer({ metadata }: { metadata: Dict }) {
  const controller = useViewController();
  const [value, setValue] = useState('');
  const actionId = str(metadata['actionId']);
  const submit = () => {
    if (!actionId || !value.trim()) return;
    void controller.runAction(actionId, { message: value });
    setValue('');
  };
  return (
    <View style={[styles.row, { gap: 8 }]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        placeholder="Message"
        accessibilityLabel="Message"
        returnKeyType="send"
      />
      <TouchableOpacity {...buttonA11y({ label: 'Send' })} style={styles.primaryBtn} onPress={submit}>
        <Text style={styles.primaryBtnText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}

/** The Chat component: the same assistant panel as the app-level chat FAB, opened on demand. */
export function ChatRenderer({ metadata }: { metadata: Dict }) {
  const { session } = useAppContext();
  const [open, setOpen] = useState(false);
  // relative urls (sseUrl, uploadUrl) resolve against the backend inside the panel
  const sseUrl = str(metadata['sseUrl']);
  if (!sseUrl) return null;
  return (
    <>
      <TouchableOpacity {...buttonA11y({ label: 'Open chat' })} style={styles.primaryBtn} onPress={() => setOpen(true)}>
        <Text style={styles.primaryBtnText}>Open chat</Text>
      </TouchableOpacity>
      {/* mounted while hidden: the conversation survives closing it */}
      <ChatPanel session={session} sseUrl={sseUrl} uploadUrl={str(metadata['uploadUrl']) || null} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ── Outcome pages ──────────────────────────────────────────────────────────────

export function NotFoundRenderer({ metadata }: { metadata: Dict }) {
  const navigate = useNavigate();
  const backRoute = str(metadata['backRoute']);
  return (
    <View style={styles.outcome}>
      <View style={[styles.outcomeIcon, { backgroundColor: theme.infoBg }]}>
        <MIcon name="magnify" size={32} color={theme.info} />
      </View>
      <Text style={styles.outcomeTitle} {...headingA11y()}>{str(metadata['title']) || 'Not found'}</Text>
      <Text style={styles.outcomeMessage}>{str(metadata['message']) || 'The page you are looking for does not exist.'}</Text>
      {!!backRoute && (
        <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={() => navigate(backRoute)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <MIcon name="arrow-left" size={18} color={theme.primary} />
            <Text style={styles.link}>{str(metadata['backLabel']) || 'Go back'}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── In-place overlays ──────────────────────────────────────────────────────────

/** A Drawer reaching the tree (not as an overlay fragment — those open as a sheet from the
 *  App's OverlayHost): drawn in place as a titled panel. */
export function DrawerInlineRenderer({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  return (
    <View style={styles.card}>
      {!!metadata['headerTitle'] && <Text style={styles.cardTitle} {...headingA11y()}>{str(metadata['headerTitle'])}</Text>}
      {!!metadata['subtitle'] && <Text style={styles.muted}>{str(metadata['subtitle'])}</Text>}
      {!!metadata['header'] && <ComponentRenderer component={metadata['header']} state={state} data={data} />}
      {!!metadata['content'] && <ComponentRenderer component={metadata['content']} state={state} data={data} />}
      {!!metadata['footer'] && <ComponentRenderer component={metadata['footer']} state={state} data={data} />}
    </View>
  );
}

/** A Notification component: an inline status strip (the web's neutral rendering). */
export function NotificationRenderer({ metadata }: { metadata: Dict }) {
  return (
    <View style={styles.notification} accessibilityRole="alert" accessibilityLiveRegion="polite">
      {!!metadata['title'] && <Text style={styles.bold}>{str(metadata['title'])}</Text>}
      {!!metadata['text'] && <Text style={styles.text}>{str(metadata['text'])}</Text>}
    </View>
  );
}

/** Cookie consent: a dismissible banner; the dismissal persists on the device (keyed by
 *  `cookieName`), like the cookie the web banner sets. */
export function CookieConsentRenderer({ metadata }: { metadata: Dict }) {
  const key = `mateu.consent.${(str(metadata['cookieName']) || 'cookieconsent').replace(/[^A-Za-z0-9._-]/g, '_')}`;
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    platformStore.get(key).then((v) => alive && setDismissed(v === 'dismiss'), () => alive && setDismissed(false));
    return () => {
      alive = false;
    };
  }, [key]);
  if (dismissed !== false) return null;
  const learnMoreLink = str(metadata['learnMoreLink']);
  // it FLOATS over the screen at its declared edge (Top*/Bottom*, default bottom), like the web's
  // fixed banner — drawn inline it sat in the middle of the content
  const top = /^top/i.test(str(metadata['position']));
  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setDismissed(true)}>
      <View style={[styles.consentHost, top ? styles.consentHostTop : styles.consentHostBottom]} pointerEvents="box-none">
    <View style={styles.consent} accessibilityRole="alert">
      <Text style={styles.consentText}>{str(metadata['message']) || 'This app uses cookies to ensure you get the best experience.'}</Text>
      <View style={[styles.row, { gap: 12, marginTop: 8 }]}>
        {!!learnMoreLink && (
          <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={() => void openExternal(learnMoreLink)}>
            <Text style={styles.consentLink}>{str(metadata['learnMore']) || 'Learn more'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          {...buttonA11y()}
          style={styles.consentBtn}
          onPress={() => {
            setDismissed(true);
            void platformStore.set(key, 'dismiss');
          }}
        >
          <Text style={styles.consentBtnText}>{str(metadata['dismiss']) || 'Got it!'}</Text>
        </TouchableOpacity>
      </View>
    </View>
      </View>
    </Modal>
  );
}

// ── Element / App ──────────────────────────────────────────────────────────────

/** A web element: plain HTML tags map to native text/image/rule; `on.click` runs its action on
 *  press. A custom element (a dash in the tag) cannot run natively and shows its text content. */
export function ElementRenderer({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useViewController();
  const name = str(metadata['name']);
  const attrs = (metadata['attributes'] as Record<string, string>) ?? {};
  const on = (metadata['on'] as Record<string, string>) ?? {};
  const raw = interpolate(str(metadata['content']), { state, data });
  const text = metadata['html'] === true ? textOfHtml(raw) : raw;
  const kind = elementKind(name);
  const openHref = useOpenHref();
  // `on: {click: action}` runs the action with the event, as the web serializes it (its scalar
  // fields: type, clientX/Y…) — an empty `{}` made the handler answer "null at x=null, y=null"
  // a second press within 300 ms is a double click (`on: {dblclick: …}`), after its click, as in a browser
  const lastPress = useRef(0);
  const press = on['click'] || on['dblclick']
    ? (e?: GestureResponderEvent) => {
        const now = Date.now();
        const double = now - lastPress.current < 300;
        lastPress.current = double ? 0 : now;
        if (on['click']) void controller.runAction(on['click']!, { event: pressEventOf(e) });
        if (double && on['dblclick']) void controller.runAction(on['dblclick']!, { event: { ...pressEventOf(e), type: 'dblclick', detail: 2 } });
      }
    : undefined;
  if (name.toLowerCase() === 'iframe') return <FramedPage src={str(attrs['src'])} title={str(attrs['title'])} />;
  let node: React.ReactNode;
  switch (kind) {
    case 'heading': {
      const level = parseInt(name.slice(1), 10) || 2;
      node = <Text style={[styles.bold, { fontSize: 24 - level * 2, color: theme.ink }]} {...headingA11y()}>{text}</Text>;
      break;
    }
    case 'image':
      node = attrs['src'] ? <Image source={{ uri: attrs['src'] }} style={styles.elementImage} resizeMode="contain" accessibilityLabel={attrs['alt']} /> : null;
      break;
    case 'rule':
      node = <View style={styles.hr} />;
      break;
    case 'break':
      node = <Text>{'\n'}</Text>;
      break;
    case 'link': {
      const href = attrs['href'] ?? '';
      node = (
        <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={press ?? (() => openHref(href, text))}>
          <Text style={styles.link}>{text || href}</Text>
        </TouchableOpacity>
      );
      return <>{node}</>;
    }
    case 'custom':
      node = (
        <View style={styles.customElement}>
          {!!text && <Text style={styles.text}>{text}</Text>}
          {!text && <Text style={styles.muted}>{`<${name}>`}</Text>}
        </View>
      );
      break;
    case 'listItem':
      node = <Text style={styles.text}>• {text}</Text>;
      break;
    default:
      node = text ? <Text style={[styles.text, kind === 'inline' && name === 'strong' ? styles.bold : null]}>{text}</Text> : null;
  }
  return press ? (
    <TouchableOpacity {...buttonA11y()} onPress={press}>
      {node}
    </TouchableOpacity>
  ) : (
    <>{node}</>
  );
}

/**
 * An `<iframe>` (the Explorer's AppPreview frames a whole app): a native app cannot frame a web
 * page, so a page of THIS backend (a relative src) is drawn live in a framed box — the same screen,
 * hosted as an island at that route — with a link that opens it as a screen of its own; another
 * origin's page is only that link (to the OS browser).
 */
function FramedPage({ src, title }: { src: string; title: string }) {
  const { session } = useViewController();
  const openHref = useOpenHref();
  const intent = hrefIntent(src);
  if (intent.kind === 'none') return null;
  return (
    <View style={styles.frame} accessibilityLabel={title || undefined}>
      {intent.kind === 'inApp' && (
        <View style={styles.frameBody}>
          <MateuViewHost session={session} target={{ label: title, route: intent.route, consumedRoute: '', serverSideType: '' }} embedded />
        </View>
      )}
      <TouchableOpacity {...buttonA11y({ role: 'link' })} style={styles.frameLink} onPress={() => openHref(src, title)}>
        <Text style={styles.link}>{intent.kind === 'inApp' ? 'Open full screen ↗' : `${title || src} ↗`}</Text>
      </TouchableOpacity>
    </View>
  );
}

/** A press as the web's element events serialize it (its scalar fields). */
function pressEventOf(e?: GestureResponderEvent): Record<string, unknown> {
  const n = (e?.nativeEvent ?? {}) as unknown as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' ? v : undefined);
  const out: Record<string, unknown> = {
    type: 'click',
    clientX: num(n['clientX']) ?? num(n['pageX']),
    clientY: num(n['clientY']) ?? num(n['pageY']),
    pageX: num(n['pageX']),
    pageY: num(n['pageY']),
    offsetX: num(n['offsetX']) ?? num(n['locationX']),
    offsetY: num(n['offsetY']) ?? num(n['locationY']),
    timeStamp: num(n['timestamp']) ?? num(n['timeStamp']) ?? Date.now(),
    button: 0,
    detail: 1,
  };
  for (const k of Object.keys(out)) if (out[k] === undefined) delete out[k];
  return out;
}

/** An App shell nested inside a screen (an embedded app, e.g. a crud mediator the controller did
 *  not unwrap): hosted as its own island, at its home route. */
export function NestedAppRenderer({ metadata }: { metadata: Dict }) {
  const { session } = useAppContext();
  return (
    <MateuViewHost
      session={session}
      target={{
        label: str(metadata['title']),
        route: str(metadata['homeRoute']) || str(metadata['route']),
        consumedRoute: str(metadata['homeConsumedRoute']),
        serverSideType: str(metadata['homeServerSideType']) || str(metadata['serverSideType']),
      }}
      embedded
    />
  );
}

// ── Diagrams (read-only) ───────────────────────────────────────────────────────

/** A diagram scene painted with react-native-svg; `onPressNode` makes its nodes pressable (the
 *  workflow editor opens the pressed step). */
export function DiagramView({ diagram, label, onPressNode }: { diagram: Diagram; label: string; onPressNode?: (id: string) => void }) {
  if (diagram.nodes.length === 0) return <Text style={styles.placeholder}>Empty diagram</Text>;
  return (
    <ScrollView horizontal style={styles.diagramBox} accessibilityLabel={label}>
      <ScrollView nestedScrollEnabled>
        <Svg width={diagram.width} height={diagram.height}>
          {diagram.edges.map((e) => (
            <G key={e.id}>
              <Polyline points={e.points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={theme.muted} strokeWidth={1.5} />
              <Arrow from={e.points[e.points.length - 2]!} to={e.points[e.points.length - 1]!} />
            </G>
          ))}
          {diagram.nodes.map((n) => (
            <G key={n.id} onPress={onPressNode ? () => onPressNode(n.id) : undefined}>
              {n.kind === 'start' || n.kind === 'end' || n.kind === 'event' ? (
                <Circle
                  cx={n.x + n.w / 2}
                  cy={n.y + n.h / 2}
                  r={Math.min(n.w, n.h) / 2}
                  fill={theme.white}
                  stroke={n.kind === 'end' ? theme.danger : n.kind === 'start' ? theme.success : theme.info}
                  strokeWidth={n.kind === 'end' ? 3 : 2}
                />
              ) : n.kind === 'gateway' && !n.color ? (
                <Polygon
                  points={`${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w / 2},${n.y + n.h} ${n.x},${n.y + n.h / 2}`}
                  fill={theme.warningBg}
                  stroke={theme.warning}
                  strokeWidth={2}
                />
              ) : (
                <Rect x={n.x} y={n.y} width={n.w} height={n.h} rx={8} fill={n.color ?? theme.white} stroke={n.color ?? theme.ink} strokeWidth={1.5} />
              )}
              {!!n.label && (
                <SvgText
                  x={n.x + n.w / 2}
                  y={n.kind === 'task' || n.kind === 'subprocess' || (n.color && n.kind !== 'end') ? n.y + n.h / 2 + 4 : n.y + n.h + 14}
                  fontSize={12}
                  fill={n.color && n.kind !== 'end' ? theme.white : theme.ink}
                  textAnchor="middle"
                >
                  {n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label}
                </SvgText>
              )}
            </G>
          ))}
        </Svg>
      </ScrollView>
    </ScrollView>
  );
}

function Arrow({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const a = Math.atan2(to.y - from.y, to.x - from.x);
  const s = 7;
  const p1 = `${to.x - s * Math.cos(a - 0.4)},${to.y - s * Math.sin(a - 0.4)}`;
  const p2 = `${to.x - s * Math.cos(a + 0.4)},${to.y - s * Math.sin(a + 0.4)}`;
  return <Polygon points={`${to.x},${to.y} ${p1} ${p2}`} fill={theme.muted} />;
}

export function BpmnRenderer({ metadata }: { metadata: Dict }) {
  return <DiagramView diagram={parseBpmn(str(metadata['xml']))} label="Process diagram" />;
}

const styles = themed(() => StyleSheet.create({
  stack: { gap: 8 },
  virtualList: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusSm, flexGrow: 0 },
  virtualRow: { paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexWrap: 'wrap' },
  flex1: { flex: 1, minWidth: 0 },
  flex2: { flex: 2, minWidth: 0 },
  text: { fontSize: 14, color: theme.ink },
  bold: { fontWeight: '600', color: theme.ink, fontSize: 14 },
  muted: { fontSize: 12, color: theme.muted },
  link: { color: theme.info, fontSize: 14 },
  frame: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusMd, overflow: 'hidden', backgroundColor: theme.background },
  frameBody: { maxHeight: 560, overflow: 'hidden' },
  frameLink: { paddingHorizontal: 12, minHeight: theme.minTouch, justifyContent: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  placeholder: { color: theme.faint, fontStyle: 'italic', padding: 12, textAlign: 'center' },
  empty: { color: theme.faint, padding: 16 },
  partLabel: { fontWeight: '600', color: theme.muted, fontSize: 14, textTransform: 'uppercase' },
  hr: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border, marginVertical: 6 },
  vr: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: theme.border, marginHorizontal: 4 },
  chevron: { color: theme.muted, fontSize: 16, paddingHorizontal: 6 },
  disabledText: { color: theme.faint },
  card: { backgroundColor: theme.white, borderRadius: theme.radiusMd, borderWidth: 1, borderColor: theme.divider, padding: 14, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.ink },
  // avatar
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { color: theme.onFill, fontWeight: '700' },
  avatarRing: { borderWidth: 2, borderColor: theme.white },
  avatarOverlap: { marginLeft: -10 },
  icon: { fontSize: 16, color: theme.ink },
  // breadcrumbs
  crumbSep: { color: theme.faint },
  crumbCurrent: { color: theme.ink, fontWeight: '600', fontSize: 14 },
  // details / panels
  panel: { borderWidth: 1, borderColor: theme.divider, borderRadius: theme.radiusMd, backgroundColor: theme.white },
  panelHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  panelBody: { paddingHorizontal: 12, paddingBottom: 12 },
  // menus
  menuBar: { gap: 4, alignItems: 'center', paddingVertical: 4 },
  menuBarItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: theme.radiusSm, backgroundColor: theme.background },
  menuBarText: { color: theme.ink, fontSize: 14 },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.white, borderTopLeftRadius: 14, borderTopRightRadius: 14, paddingBottom: 24, paddingTop: 8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  sheetBack: { fontSize: 22, color: theme.info, paddingRight: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '600', color: theme.ink },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  sheetItemText: { fontSize: 16, color: theme.ink },
  tooltip: { marginTop: 4, backgroundColor: theme.ink, borderRadius: theme.radiusSm, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  tooltipText: { color: theme.onFill, fontSize: 12 },
  dirGroup: { gap: 2, marginBottom: 8 },
  dirGroupTitle: { fontWeight: '700', color: theme.ink, fontSize: 14, marginBottom: 2 },
  // grid
  gridBox: { borderWidth: 1, borderColor: theme.divider, borderRadius: theme.radiusSm },
  gridRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  gridHead: { backgroundColor: theme.background },
  th: { fontWeight: '600', color: theme.muted, fontSize: 14, padding: 8 },
  thGroup: { textAlign: 'center', color: theme.ink, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: theme.border },
  gridStripe: { backgroundColor: theme.background },
  treeCell: { flexDirection: 'row', alignItems: 'center', minHeight: 36, paddingRight: 6 },
  treeCellText: { flex: 1, fontSize: 14, color: theme.ink },
  td: { color: theme.ink, fontSize: 14, padding: 8 },
  // stepper
  // carousel
  carouselNav: { justifyContent: 'center', gap: 8, marginTop: 8 },
  carouselArrow: { fontSize: 22, color: theme.ink, paddingHorizontal: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.border },
  dotActive: { backgroundColor: theme.ink },
  // messaging
  message: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  input: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: theme.radiusSm, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: theme.ink },
  primaryBtn: { backgroundColor: theme.primary, borderRadius: theme.radiusSm, paddingHorizontal: 14, paddingVertical: 9, alignSelf: 'flex-start' },
  primaryBtnText: { color: theme.onPrimary, fontWeight: '600', fontSize: 14 },
  // outcome pages
  outcome: { alignItems: 'center', padding: 24, gap: 8 },
  outcomeIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  outcomeTitle: { fontSize: 22, fontWeight: '600', color: theme.ink, textAlign: 'center' },
  outcomeMessage: { fontSize: 14, color: theme.muted, textAlign: 'center', maxWidth: 420 },
  // overlays in place
  notification: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: theme.background, borderRadius: theme.radiusMd, padding: 12 },
  consent: { backgroundColor: theme.ink, borderRadius: theme.radiusMd, padding: 14, maxWidth: 560, width: '100%', elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  consentHost: { flex: 1, padding: 16, alignItems: 'center' },
  consentHostTop: { justifyContent: 'flex-start', paddingTop: 48 },
  consentHostBottom: { justifyContent: 'flex-end', paddingBottom: 32 },
  consentText: { color: theme.onFill, fontSize: 14 },
  consentLink: { color: theme.onFill, textDecorationLine: 'underline', fontSize: 14 },
  consentBtn: { backgroundColor: theme.white, borderRadius: theme.radiusSm, paddingHorizontal: 12, paddingVertical: 6 },
  consentBtnText: { color: theme.ink, fontWeight: '600', fontSize: 14 },
  // element
  elementImage: { width: '100%', height: 180 },
  customElement: { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.border, borderRadius: theme.radiusSm, padding: 8 },
  // diagrams / form definition
  diagramBox: { borderWidth: 1, borderColor: theme.divider, borderRadius: theme.radiusMd, backgroundColor: theme.white, maxHeight: 480 },
}));
