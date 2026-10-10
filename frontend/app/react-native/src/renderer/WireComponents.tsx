/**
 * Native renderers for the wire component types that used to fall through to "Unsupported
 * component": grids and lists, navigation (breadcrumbs, menu bar, context menu, directory),
 * people (avatar, avatar group), messaging (chat, message list/input), structural layouts
 * (master-detail, carousel, content layout, responsive grid, board), outcome pages (result,
 * not found), overlays rendered in place (drawer, notification, cookie consent), web elements
 * and the read-only diagrams (BPMN, workflow, form definition).
 *
 * Mobile adaptations, deliberately: hover becomes long-press, right-click becomes long-press,
 * multi-column layouts stack below a phone width, editors (Workflow, FormEditor, Bpmn) are shown
 * read-only. The decisions that can be made without React live in wireWidgets.ts / diagrams.ts.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, G, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { ComponentRenderer } from './ComponentRenderer';
import { MateuViewHost, useViewController } from './MateuViewHost';
import { ChatPanel } from './ChatPanel';
import { iconGlyph } from './menuCards';
import { parseBpmn, workflowDiagram, type Diagram } from './diagrams';
import {
  avatarColor,
  avatarGroupSplit,
  cellText,
  contentSlots,
  destinationIntent,
  elementKind,
  flattenTree,
  gridColumnsOf,
  gridRowsOf,
  initials,
  menuIntent,
  parseFormDefinition,
  resultLook,
  responsiveColumns,
  textOfHtml,
  type MenuOptionLike,
  gridTrackSizes,
  orderByAreas,
} from './wireWidgets';
import { interpolate } from '../core/expressions';
import { platformStore } from '../core/secureStore';
import { useAppContext } from '../context/AppContext';
import { theme } from '../theme';
import { buttonA11y, headingA11y } from '../a11y/a11y';

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
      if (/^[a-z]+:/i.test(intent.target)) void Linking.openURL(intent.target);
      else navigate(intent.target, o.label);
    }
  };
}

// ── Parts rendered on their own (normally drawn by their owner) ────────────────

/** Tab / AccordionPanel / FormItem / Stepper / BoardLayoutItem reaching the switch on their own:
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

/** Stepper: its children as numbered steps. */
export function StepperRenderer({ component, state, data }: { component: unknown; state: Dict; data?: unknown }) {
  return (
    <View style={styles.stack}>
      {childrenOf(component).map((c, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepDot}>
            <Text style={styles.stepDotText}>{i + 1}</Text>
          </View>
          <View style={styles.flex1}>
            <ComponentRenderer component={c} state={state} data={data} />
          </View>
        </View>
      ))}
    </View>
  );
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
          <Text style={styles.crumbSep}> › </Text>
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
        <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
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
                <Text style={styles.sheetBack}>‹</Text>
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
                {!!o.submenus?.length && <Text style={styles.chevron}>›</Text>}
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
  const columns = gridColumnsOf(component);
  const rows = flattenTree(gridRowsOf(component, state, data));
  const tree = meta(component)['tree'] === true;
  const colW = 140;
  return (
    <ScrollView horizontal style={styles.gridBox}>
      <View>
        <View style={[styles.gridRow, styles.gridHead]}>
          {columns.map((c) => (
            <Text key={c.id} style={[styles.th, { width: colW }]} numberOfLines={1}>
              {c.label}
            </Text>
          ))}
        </View>
        {rows.length === 0 && <Text style={styles.empty}>No data.</Text>}
        {rows.map(({ row, depth }, r) => (
          <View key={r} style={styles.gridRow}>
            {columns.map((c, ci) => {
              const text = cellText(row, c.id);
              const indent = tree && ci === 0 ? depth * 14 : 0;
              const cellStyle = [styles.td, { width: colW, paddingLeft: 6 + indent, textAlign: (c.align === 'end' || c.align === 'right' ? 'right' : 'left') as 'left' | 'right' }];
              return c.actionId ? (
                <TouchableOpacity key={c.id} {...buttonA11y({ role: 'link' })} onPress={() => void controller.runAction(c.actionId!, { _clickedRow: row })}>
                  <Text style={[...cellStyle, styles.link]} numberOfLines={1}>{text}</Text>
                </TouchableOpacity>
              ) : (
                <Text key={c.id} style={cellStyle} numberOfLines={1}>{text}</Text>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** Every item through the component renderer, in a plain column (the host view scrolls). */
export function VirtualListRenderer({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const items = (((metadata['page'] as Dict)?.['content'] as unknown[]) ?? []);
  return (
    <View style={styles.stack}>
      {items.map((item, i) =>
        item && typeof item === 'object' && ('type' in (item as Dict) || 'metadata' in (item as Dict)) ? (
          <ComponentRenderer key={i} component={item} state={state} data={data} />
        ) : (
          <Text key={i} style={styles.text}>{str(item)}</Text>
        ),
      )}
    </View>
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
  const wide = width >= 768;
  return (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 12 }}>
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
            <Text style={styles.carouselArrow}>‹</Text>
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
            <Text style={styles.carouselArrow}>›</Text>
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
  const sseUrl = str(metadata['sseUrl']);
  const url = sseUrl.startsWith('/') ? `${session.api.baseUrl}${sseUrl}` : sseUrl;
  if (!sseUrl) return null;
  return (
    <>
      <TouchableOpacity {...buttonA11y()} style={styles.primaryBtn} onPress={() => setOpen(true)}>
        <Text style={styles.primaryBtnText}>💬 Open chat</Text>
      </TouchableOpacity>
      {open && <ChatPanel session={session} sseUrl={url} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Outcome pages ──────────────────────────────────────────────────────────────

const TONES: Record<string, { fg: string; bg: string }> = {
  success: { fg: theme.success, bg: theme.successBg },
  info: { fg: theme.info, bg: theme.infoBg },
  warning: { fg: theme.warning, bg: theme.warningBg },
  danger: { fg: theme.danger, bg: theme.dangerBg },
  muted: { fg: theme.muted, bg: theme.divider },
};

export function ResultRenderer({ metadata }: { metadata: Dict }) {
  const controller = useViewController();
  const navigate = useNavigate();
  const look = resultLook(str(metadata['resultType']));
  const tone = TONES[look.tone]!;
  const go = (d: Dict) => {
    const intent = destinationIntent(d);
    if (intent.kind === 'url') void Linking.openURL(intent.target);
    else if (intent.kind === 'route') navigate(intent.target, str(d['description']));
    else if (intent.kind === 'action') void controller.runAction(intent.target);
  };
  const links = (metadata['interestingLinks'] as Dict[]) ?? [];
  const nowTo = metadata['nowTo'] as Dict | undefined;
  return (
    <View style={styles.outcome}>
      {!!metadata['leftSideImageUrl'] && <Image source={{ uri: str(metadata['leftSideImageUrl']) }} style={styles.outcomeImage} resizeMode="contain" />}
      <View style={[styles.outcomeIcon, { backgroundColor: tone.bg }]}>
        <Text style={[styles.outcomeGlyph, { color: tone.fg }]}>{look.glyph}</Text>
      </View>
      {!!metadata['title'] && <Text style={styles.outcomeTitle} {...headingA11y()}>{str(metadata['title'])}</Text>}
      {!!metadata['message'] && <Text style={styles.outcomeMessage}>{str(metadata['message'])}</Text>}
      {links.map((l, i) => (
        <TouchableOpacity key={i} {...buttonA11y({ role: 'link' })} onPress={() => go(l)}>
          <Text style={styles.link}>{str(l['description'] || l['value'])}</Text>
        </TouchableOpacity>
      ))}
      {!!nowTo && (
        <TouchableOpacity {...buttonA11y()} style={[styles.primaryBtn, { marginTop: 12 }]} onPress={() => go(nowTo)}>
          <Text style={styles.primaryBtnText}>{str(nowTo['description']) || 'Continue'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function NotFoundRenderer({ metadata }: { metadata: Dict }) {
  const navigate = useNavigate();
  const backRoute = str(metadata['backRoute']);
  return (
    <View style={styles.outcome}>
      <View style={[styles.outcomeIcon, { backgroundColor: theme.infoBg }]}>
        <Text style={[styles.outcomeGlyph, { color: theme.info }]}>🔍</Text>
      </View>
      <Text style={styles.outcomeTitle} {...headingA11y()}>{str(metadata['title']) || 'Not found'}</Text>
      <Text style={styles.outcomeMessage}>{str(metadata['message']) || 'The page you are looking for does not exist.'}</Text>
      {!!backRoute && (
        <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={() => navigate(backRoute)}>
          <Text style={styles.link}>← {str(metadata['backLabel']) || 'Go back'}</Text>
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
  return (
    <View style={styles.consent} accessibilityRole="alert">
      <Text style={styles.consentText}>{str(metadata['message']) || 'This app uses cookies to ensure you get the best experience.'}</Text>
      <View style={[styles.row, { gap: 12, marginTop: 8 }]}>
        {!!learnMoreLink && (
          <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={() => void Linking.openURL(learnMoreLink)}>
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
  const press = on['click'] ? () => void controller.runAction(on['click']!, { event: {} }) : undefined;
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
        <TouchableOpacity {...buttonA11y({ role: 'link' })} onPress={press ?? (() => href && void Linking.openURL(href))}>
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
      silent
    />
  );
}

// ── Diagrams (read-only) ───────────────────────────────────────────────────────

function DiagramView({ diagram, label }: { diagram: Diagram; label: string }) {
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
            <G key={n.id}>
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

export function WorkflowRenderer({ metadata }: { metadata: Dict }) {
  const { name, diagram } = workflowDiagram(str(metadata['value']));
  return (
    <View style={styles.stack}>
      {!!name && <Text style={styles.cardTitle} {...headingA11y()}>{name}</Text>}
      <DiagramView diagram={diagram} label={`Workflow ${name}`} />
    </View>
  );
}

/** FormEditor (a form-definition editor on the web): the definition shown read-only. */
export function FormEditorRenderer({ metadata }: { metadata: Dict }) {
  const def = parseFormDefinition(str(metadata['value']));
  return (
    <View style={styles.card}>
      {!!def.name && <Text style={styles.cardTitle} {...headingA11y()}>{def.name}</Text>}
      {!!def.description && <Text style={styles.muted}>{def.description}</Text>}
      {def.fields.length === 0 && <Text style={styles.placeholder}>No fields yet.</Text>}
      {def.fields.map((f, i) => (
        <View key={i} style={styles.formDefRow}>
          <View style={styles.flex1}>
            <Text style={styles.bold}>
              {f.label}
              {f.required ? ' *' : ''}
            </Text>
            {!!f.description && <Text style={styles.muted}>{f.description}</Text>}
          </View>
          <Text style={styles.typeBadge}>{f.dataType}</Text>
          {!!f.stereotype && <Text style={[styles.typeBadge, styles.stereoBadge]}>{f.stereotype}</Text>}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  wrap: { flexWrap: 'wrap' },
  flex1: { flex: 1, minWidth: 0 },
  flex2: { flex: 2, minWidth: 0 },
  text: { fontSize: 14, color: theme.ink },
  bold: { fontWeight: '600', color: theme.ink, fontSize: 14 },
  muted: { fontSize: 12, color: theme.muted },
  link: { color: theme.info, fontSize: 14 },
  placeholder: { color: theme.faint, fontStyle: 'italic', padding: 12, textAlign: 'center' },
  empty: { color: theme.faint, padding: 16 },
  partLabel: { fontWeight: '600', color: theme.muted, fontSize: 13, textTransform: 'uppercase' },
  hr: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border, marginVertical: 6 },
  vr: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: theme.border, marginHorizontal: 4 },
  chevron: { color: theme.muted, fontSize: 16, paddingHorizontal: 6 },
  disabledText: { color: theme.faint },
  card: { backgroundColor: theme.white, borderRadius: theme.radiusMd, borderWidth: 1, borderColor: theme.divider, padding: 14, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.ink },
  // avatar
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { color: theme.white, fontWeight: '700' },
  avatarRing: { borderWidth: 2, borderColor: theme.white },
  avatarOverlap: { marginLeft: -10 },
  icon: { fontSize: 18, color: theme.ink },
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
  sheetTitle: { fontSize: 15, fontWeight: '600', color: theme.ink },
  sheetItem: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  sheetItemText: { fontSize: 15, color: theme.ink },
  tooltip: { marginTop: 4, backgroundColor: theme.ink, borderRadius: theme.radiusSm, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  tooltipText: { color: theme.white, fontSize: 12 },
  dirGroup: { gap: 2, marginBottom: 8 },
  dirGroupTitle: { fontWeight: '700', color: theme.ink, fontSize: 14, marginBottom: 2 },
  // grid
  gridBox: { borderWidth: 1, borderColor: theme.divider, borderRadius: theme.radiusSm },
  gridRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  gridHead: { backgroundColor: theme.background },
  th: { fontWeight: '600', color: theme.muted, fontSize: 13, padding: 8 },
  td: { color: theme.ink, fontSize: 13, padding: 8 },
  // stepper
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: theme.info, alignItems: 'center', justifyContent: 'center' },
  stepDotText: { color: theme.white, fontSize: 12, fontWeight: '700' },
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
  outcomeImage: { width: '100%', height: 160 },
  outcomeIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  outcomeGlyph: { fontSize: 28, fontWeight: '700' },
  outcomeTitle: { fontSize: 20, fontWeight: '600', color: theme.ink, textAlign: 'center' },
  outcomeMessage: { fontSize: 14, color: theme.muted, textAlign: 'center', maxWidth: 420 },
  // overlays in place
  notification: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: theme.background, borderRadius: theme.radiusMd, padding: 12 },
  consent: { backgroundColor: theme.ink, borderRadius: theme.radiusMd, padding: 14 },
  consentText: { color: theme.white, fontSize: 13 },
  consentLink: { color: theme.white, textDecorationLine: 'underline', fontSize: 13 },
  consentBtn: { backgroundColor: theme.white, borderRadius: theme.radiusSm, paddingHorizontal: 12, paddingVertical: 6 },
  consentBtnText: { color: theme.ink, fontWeight: '600', fontSize: 13 },
  // element
  elementImage: { width: '100%', height: 180 },
  customElement: { borderWidth: 1, borderStyle: 'dashed', borderColor: theme.border, borderRadius: theme.radiusSm, padding: 8 },
  // diagrams / form definition
  diagramBox: { borderWidth: 1, borderColor: theme.divider, borderRadius: theme.radiusMd, backgroundColor: theme.white, maxHeight: 480 },
  formDefRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.divider },
  typeBadge: { fontSize: 11, color: theme.white, backgroundColor: theme.info, borderRadius: theme.radiusPill, paddingHorizontal: 8, paddingVertical: 2, overflow: 'hidden' },
  stereoBadge: { backgroundColor: theme.muted },
});
