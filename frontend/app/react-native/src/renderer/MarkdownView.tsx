import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { theme, themed } from '../theme';
import { headingA11y } from '../a11y/a11y';
import { parseMarkdown, type MdBlock } from './markdownBlocks';
import { inlineSpans } from './markdownInline';
import { openExternal } from './openExternal';

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' });

/**
 * A Markdown text drawn with React Native's own views: paragraphs (soft line breaks), headings,
 * **bold** / *italic* / `code` / ~~strike~~ / links, nested lists, blockquotes, pipe tables and
 * fenced code blocks (monospace, indentation kept, scrolling sideways instead of wrapping).
 * Never interpolated: a `${…}` inside it is text, as on the web.
 */
export function MarkdownView({ value, onRouteLink }: { value: string; onRouteLink?: (route: string) => void }) {
  const blocks = React.useMemo(() => parseMarkdown(value ?? ''), [value]);
  return <View>{blocks.map((b, i) => <Block key={i} block={b} first={i === 0} onRouteLink={onRouteLink} />)}</View>;
}

export function MarkdownInline({ text, onRouteLink }: { text: string; onRouteLink?: (route: string) => void }) {
  return <>{renderSpans(text, onRouteLink)}</>;
}

function renderSpans(text: string, onRouteLink?: (route: string) => void): React.ReactNode[] {
  return inlineSpans(text, !!onRouteLink).map((span, i) => {
    switch (span.kind) {
      case 'bold': return <Text key={i} style={styles.bold}>{span.text}</Text>;
      case 'italic': return <Text key={i} style={styles.italic}>{span.text}</Text>;
      case 'boldItalic': return <Text key={i} style={[styles.bold, styles.italic]}>{span.text}</Text>;
      case 'strike': return <Text key={i} style={styles.strike}>{span.text}</Text>;
      case 'code': return <Text key={i} style={styles.inlineCode}>{span.text}</Text>;
      case 'link':
        return <Text key={i} style={styles.link} accessibilityRole="link" onPress={() => void openExternal(span.url)}>{span.text}</Text>;
      case 'route':
        return <Text key={i} style={styles.link} accessibilityRole="link" onPress={() => onRouteLink?.(span.route)}>{span.text}</Text>;
      default: return <React.Fragment key={i}>{span.text}</React.Fragment>;
    }
  });
}

function Block({ block, first, onRouteLink }: { block: MdBlock; first: boolean; onRouteLink?: (route: string) => void }) {
  const gap = first ? null : styles.gap;
  switch (block.kind) {
    case 'heading':
      return (
        <Text style={[styles.heading, { fontSize: [24, 22, 16, 16, 14, 14][block.level - 1] ?? 14 }, first ? styles.headingFirst : null]} {...headingA11y(block.level)}>
          {renderSpans(block.text, onRouteLink)}
        </Text>
      );
    case 'paragraph':
      return <Text style={[styles.text, gap]}>{renderSpans(block.text, onRouteLink)}</Text>;
    case 'rule':
      return <View style={styles.rule} />;
    case 'code':
      return (
        <ScrollView horizontal style={[styles.codeBlock, gap]} contentContainerStyle={styles.codeContent} accessibilityLabel={block.lang ? `${block.lang} code` : 'code'}>
          <Text style={styles.codeText} selectable>{block.text}</Text>
        </ScrollView>
      );
    case 'quote':
      return (
        <View style={[styles.quote, gap]}>
          {block.blocks.map((b, i) => <Block key={i} block={b} first={i === 0} onRouteLink={onRouteLink} />)}
        </View>
      );
    case 'list':
      return (
        <View style={gap}>
          {block.items.map((item, i) => (
            <View key={i} style={[styles.listItem, { paddingLeft: 4 + item.depth * 18 }]}>
              <Text style={[styles.text, styles.marker]}>{item.marker === '•' ? (item.depth % 2 ? '◦' : '•') : item.marker}</Text>
              <Text style={[styles.text, styles.itemText]}>{renderSpans(item.text, onRouteLink)}</Text>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <ScrollView horizontal style={gap} accessibilityRole="none">
          <View style={styles.table}>
            {[block.header, ...block.rows].map((row, r) => (
              <View key={r} style={[styles.tableRow, r === 0 ? styles.tableHead : null, r > 0 && r % 2 === 0 ? styles.tableStripe : null]}>
                {row.map((cell, c) => (
                  <Text key={c} style={[styles.tableCell, r === 0 ? styles.bold : null, { textAlign: block.align[c] ?? 'left' }]}>
                    {renderSpans(cell, onRouteLink)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      );
  }
}

const styles = themed(() => StyleSheet.create({
  gap: { marginTop: 8 },
  text: { fontSize: 14, color: theme.ink, lineHeight: 21 },
  heading: { fontWeight: '700', color: theme.ink, marginTop: 12, marginBottom: 2 },
  headingFirst: { marginTop: 0 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  strike: { textDecorationLine: 'line-through' },
  inlineCode: { fontFamily: MONO, fontSize: 12, backgroundColor: theme.background, color: theme.ink },
  link: { color: theme.primary, textDecorationLine: 'underline' },
  rule: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border, marginVertical: 10 },
  codeBlock: { backgroundColor: theme.background, borderRadius: theme.radiusSm, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
  codeContent: { padding: 10 },
  codeText: { fontFamily: MONO, fontSize: 12, lineHeight: 18, color: theme.ink },
  quote: { borderLeftWidth: 3, borderLeftColor: theme.border, paddingLeft: 10, paddingVertical: 2 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 },
  marker: { minWidth: 18, marginRight: 4 },
  itemText: { flex: 1, flexShrink: 1 },
  table: { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border, borderRadius: theme.radiusSm },
  tableRow: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  tableHead: { borderTopWidth: 0, backgroundColor: theme.background },
  tableStripe: { backgroundColor: theme.background },
  tableCell: { minWidth: 110, maxWidth: 240, paddingHorizontal: 10, paddingVertical: 6, fontSize: 14, color: theme.ink },
}));
