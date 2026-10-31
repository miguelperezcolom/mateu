import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../ui/Text';
import { CrudRenderer } from './CrudRenderer';
import { interpolate } from '../core/expressions';
import { useButtonPress } from './useButtonPress';
import { islandSession } from '../core/MateuSession';
import { resolvedPreviewOf } from '../core/resolvedMicroFrontends';
import { RichText } from './FieldWidgets';
import { ChartRenderer } from './ChartRenderer';
import { FormFieldRenderer } from './FormFieldRenderer';
import { FormRenderer } from './FormRenderer';
import { LayoutRenderer } from './LayoutRenderer';
import { PageRenderer } from './PageRenderer';
import {
  SectionRenderer, SubSectionRenderer, CardRenderer, TabsRenderer, AccordionRenderer,
  SplitRenderer, BadgeRenderer, AnchorRenderer, ProgressBarRenderer, DialogRenderer, ConfirmDialogRenderer,
  PopoverRenderer,
} from './ContainerRenderer';
import {
  MetricCardRenderer, ScoreboardRenderer, DashboardPanelRenderer, DashboardLayoutRenderer,
} from './DashboardRenderer';
import {
  FoldoutRenderer, HeroSectionRenderer, EmptyStateRenderer, SkeletonRenderer, GanttRenderer, KanbanRenderer,
  TimelineRenderer, ProgressStepsRenderer, StatRenderer, CalendarRenderer, PricingTableRenderer,
  OrgChartRenderer, HeatmapRenderer, FunnelRenderer, TrendChartRenderer, FeatureGridRenderer,
  TestimonialsRenderer, FaqRenderer, CalloutCardRenderer, CommentThreadRenderer, FileListRenderer,
  ChecklistRenderer,
  ComparisonCardRenderer,
  EntityHeaderRenderer, MeterRenderer, TaskProgressRenderer, StatusListRenderer, BulletedListRenderer, NoticeRenderer, TaskQueueRenderer,
  ResourceGridRenderer, OfferCardRenderer, AddOnPickerRenderer, LedgerRenderer, PaymentPickerRenderer,
  ProcessMonitorRenderer,
} from './DisplayRenderer';
import { PlanningBoardRenderer } from './PlanningBoardRenderer';
import { ActionPanelRenderer } from './ActionPanelRenderer';
import { RecordMergeRenderer } from './RecordMergeRenderer';
import { MatrixGridRenderer } from './MatrixGridRenderer';
import { MapRenderer } from './MapRenderer';
import { DropZoneRenderer } from './DropZoneRenderer';
import { EmptyState, MetricCard, PlanningBoard, Skeleton } from '../api/metadata';
import { useAppContext } from '../context/AppContext';
import { MateuViewHost, useViewController } from './MateuViewHost';
import { theme, themed } from '../theme';
import { MateuButton } from '../ui/controls';
import { buttonA11y, headingA11y, imageA11y } from '../a11y/a11y';
import { headingLevel } from '../core/uxRules';

// h1–h6 sizes on the renderer's type scale (22 = page title, then 20/18/16/15/14)
const HEADING_SIZES = [22, 20, 18, 16, 15, 14];
import { resolveCustomComponent } from './customComponents';
import {
  AvatarGroupRenderer, AvatarRenderer, BoardLayoutRenderer, BoardLayoutRowRenderer, BpmnRenderer, BreadcrumbRenderer,
  BreadcrumbsRenderer, CarouselRenderer, ChatRenderer, ContentLayoutRenderer, ContextMenuRenderer, CookieConsentRenderer,
  DetailsRenderer, DirectoryRenderer, DrawerInlineRenderer, ElementRenderer, FormEditorRenderer, GridColumnRenderer,
  GridRenderer, IconRenderer, LabelledChildrenRenderer, MasterDetailRenderer, MenuBarRenderer, MessageInputRenderer,
  MessageListRenderer, NestedAppRenderer, NotFoundRenderer, NotificationRenderer, ResponsiveGridRenderer,
  ResultRenderer, StepperRenderer, TooltipRenderer, VirtualListRenderer, WorkflowRenderer,
} from './WireComponents';

interface Props {
  component: unknown;
  state: Record<string, unknown>;
  data?: unknown;
}

export function ComponentRenderer({ component, state, data }: Props) {
  if (!component) return null;

  const comp = component as Record<string, unknown>;
  const type = (comp['type'] as string) ?? 'ClientSide';

  if (type === 'ServerSide') {
    // A nested ServerSide inside a rendered tree is an embedded ISLAND (an @Inline
    // orchestrator, a CustomField adapter, an overlay's content): it gets its own
    // controller so its state/actions never clobber the host view's.
    return <ServerSideIsland component={comp} />;
  }

  return <ClientSideComponent component={comp} state={state} data={data} />;
}

function ServerSideIsland({ component }: { component: Record<string, unknown> }) {
  const { session } = useAppContext();
  return <MateuViewHost session={session} serverSideNode={component} silent />;
}

/**
 * A federated remote app (MicroFrontend): host it in its own MateuViewHost. When it declares its
 * own baseUrl we spin a dedicated session for that origin; otherwise it shares the host session.
 */
function MicroFrontendIsland({ metadata }: { metadata: Record<string, unknown> }) {
  const { session } = useAppContext();
  const baseUrl = (metadata['baseUrl'] as string) ?? '';
  const remoteSession = React.useMemo(() => islandSession(session, baseUrl), [baseUrl, session]);
  return (
    <MateuViewHost
      session={remoteSession}
      target={{
        label: '',
        route: (metadata['route'] as string) ?? '',
        consumedRoute: (metadata['consumedRoute'] as string) ?? '',
        serverSideType: (metadata['serverSideType'] as string) ?? '',
      }}
      // resolved by the host (resolve = SERVER): painted without asking; its actions still go to
      // the island's own session — the remote
      preview={resolvedPreviewOf(metadata)}
      silent
    />
  );
}

function ClientSideComponent({ component, state, data }: { component: Record<string, unknown>; state: Record<string, unknown>; data: unknown }) {
  const controller = useViewController();
  const pressButton = useButtonPress();
  const runAction = (actionId: string) => void controller.runAction(actionId);

  const metadata = (component['metadata'] as Record<string, unknown>) ?? {};
  const metaType = (metadata['type'] as string) ?? '';

  const renderComponent = (comp: unknown, st: Record<string, unknown>, onStateChange: (id: string, v: unknown) => void) => (
    <ComponentRenderer component={comp} state={st} />
  );

  switch (metaType) {
    case 'Page':
      return <PageRenderer component={component} metadata={metadata} state={state} data={data} />;

    case 'Form':
      return <FormRenderer component={component} metadata={metadata} state={state} />;

    case 'Crud':
      return <CrudRenderer component={component} metadata={metadata} state={state} data={data} />;

    case 'FormField':
      return (
        <FormFieldRenderer
          metadata={metadata as any}
          state={state}
          onStateChange={(fieldId, value) => controller.putState(fieldId, value)}
          error={controller.fieldErrors[(metadata['fieldId'] as string) ?? '']}
        />
      );

    case 'FormLayout':
    case 'VerticalLayout':
      return (
        <LayoutRenderer
          component={component}
          state={state}
          onStateChange={() => {}}
          renderComponent={renderComponent}
          direction="column"
        />
      );

    case 'FormRow':
    case 'HorizontalLayout':
      return (
        <LayoutRenderer
          component={component}
          state={state}
          onStateChange={() => {}}
          renderComponent={renderComponent}
          direction="row"
          formRow={metaType === 'FormRow'}
        />
      );

    case 'Button': {
      const id = (metadata['actionId'] as string) ?? (metadata['id'] as string) ?? '';
      const label = interpolate((metadata['label'] as string) ?? id, { state });
      // Button.parameters travel with the dispatched action (e.g. the conflict dialog's
      // keep-mine/take-theirs buttons) — same contract as the web's buttonRenderer.
      const parameters = (metadata['parameters'] as Record<string, unknown> | undefined) ?? undefined;
      // disabled (e.g. a wizard's Toggle.disabled affordance): shown but inert. buttonStyle picks
      // the emphasis — primary filled, tertiary a borderless text button (section Add/Edit/View more).
      // A button with a `route` NAVIGATES (like the web): its ${…} must all resolve to a value,
      // else the button is disabled — never a navigation to "/p/" nor a fall-through to the action.
      const press = pressButton(metadata, { state, data }, () => void controller.runAction(id, parameters), label);
      const disabled = metadata['disabled'] === true || press.disabled;
      const onPress = press.onPress;
      return (
        <MateuButton
          label={label}
          buttonStyle={metadata['buttonStyle'] as string | undefined}
          color={metadata['color'] as string | undefined}
          disabled={disabled}
          onPress={onPress}
          style={styles.wireButton}
        />
      );
    }

    case 'Text': {
      const text = interpolate((metadata['text'] as string) ?? '', { state });
      // Text size: xl/l/s/xs enlarge or reduce the font; m (or absent) applies nothing.
      const TEXT_SIZES: Record<string, number> = { xl: 22, l: 18, s: 12.5, xs: 11 };
      const size = TEXT_SIZES[(metadata['size'] as string) ?? ''];
      // RN-17: a Text in an h1–h6 container IS a heading (a wizard's title arrives as an h2): it
      // gets a heading's size and weight and is exposed as a header to the screen reader's
      // heading navigation — it used to render as body text, flush against the screen edge.
      const level = headingLevel(metadata['container'] as string | undefined);
      if (level > 0) {
        return (
          <Text style={[styles.heading, { fontSize: HEADING_SIZES[level - 1] }, size ? { fontSize: size } : null]} {...headingA11y(level)}>
            {text}
          </Text>
        );
      }
      return <Text style={[styles.text, size ? { fontSize: size } : null]}>{text}</Text>;
    }

    // A horizontal divider line (<hr>) separating contents inside a section or form.
    case 'Separator':
      return <View style={styles.separator} />;

    case 'FormSection':
      return <SectionRenderer component={component} state={state} />;
    case 'FormSubSection':
      return <SubSectionRenderer component={component} state={state} />;
    case 'Card':
      return <CardRenderer component={component} state={state} />;
    case 'TabLayout':
      return <TabsRenderer component={component} state={state} />;
    case 'AccordionLayout':
      return <AccordionRenderer component={component} state={state} />;
    case 'SplitLayout':
      return <SplitRenderer component={component} state={state} />;
    case 'Scroller':
    case 'FullWidth':
    case 'Container':
    case 'Div':
      return (
        <LayoutRenderer component={component} state={state} onStateChange={() => {}} renderComponent={renderComponent} direction="column" />
      );
    case 'Badge':
      return <BadgeRenderer metadata={metadata} />;
    case 'Anchor':
      return <AnchorRenderer metadata={metadata} />;
    case 'ProgressBar':
      return <ProgressBarRenderer metadata={metadata} state={state} />;
    case 'Dialog':
      return <DialogRenderer component={component} state={state} />;
    case 'ConfirmDialog':
      return <ConfirmDialogRenderer metadata={metadata} state={state} />;
    // Popover: on touch both triggers open on press (no hover) — see PopoverRenderer.
    case 'Popover':
      return <PopoverRenderer component={component} state={state} />;

    case 'MetricCard':
      return <MetricCardRenderer metadata={metadata as unknown as MetricCard} />;
    case 'Scoreboard':
      return <ScoreboardRenderer component={component} state={state} />;
    case 'DashboardPanel':
      return <DashboardPanelRenderer component={component} state={state} />;
    case 'DashboardLayout':
      return <DashboardLayoutRenderer component={component} state={state} />;
    case 'FoldoutLayout':
      return <FoldoutRenderer component={component} state={state} />;
    case 'HeroSection':
      return <HeroSectionRenderer component={component} state={state} />;
    case 'EmptyState':
      return <EmptyStateRenderer metadata={metadata as unknown as EmptyState} />;
    case 'Skeleton':
      return <SkeletonRenderer metadata={metadata as unknown as Skeleton} />;
    case 'Chart':
      return <ChartRenderer metadata={metadata} />;
    case 'Gantt':
      return <GanttRenderer component={component} />;
    case 'Kanban':
      return <KanbanRenderer component={component} />;
    case 'Timeline':
      return <TimelineRenderer component={component} />;
    case 'ProgressSteps':
      return <ProgressStepsRenderer component={component} />;
    case 'Stat':
      return <StatRenderer component={component} />;
    case 'Calendar':
      return <CalendarRenderer component={component} />;
    case 'PricingTable':
      return <PricingTableRenderer component={component} />;
    case 'OrgChart':
      return <OrgChartRenderer component={component} />;
    case 'Heatmap':
      return <HeatmapRenderer component={component} />;
    case 'Funnel':
      return <FunnelRenderer component={component} />;
    case 'TrendChart':
      return <TrendChartRenderer component={component} />;
    case 'FeatureGrid':
      return <FeatureGridRenderer component={component} />;
    case 'Testimonials':
      return <TestimonialsRenderer component={component} />;
    case 'Faq':
      return <FaqRenderer component={component} />;
    case 'CalloutCard':
      return <CalloutCardRenderer component={component} />;
    case 'CommentThread':
      return <CommentThreadRenderer component={component} />;
    case 'FileList':
      return <FileListRenderer component={component} />;
    case 'Checklist':
      return <ChecklistRenderer component={component} />;
    case 'ComparisonCard':
      return <ComparisonCardRenderer component={component} />;
    case 'EntityHeader':
      return <EntityHeaderRenderer component={component} />;
    case 'Meter':
      return <MeterRenderer component={component} />;
    case 'TaskProgress':
      return <TaskProgressRenderer component={component} />;
    case 'StatusList':
      return <StatusListRenderer component={component} />;
    case 'BulletedList':
      return <BulletedListRenderer component={component} />;
    case 'Notice':
      return <NoticeRenderer component={component} state={state} renderComponent={renderComponent} />;
    case 'TaskQueue':
      return <TaskQueueRenderer component={component} />;
    case 'ResourceGrid':
      return <ResourceGridRenderer component={component} />;
    case 'OfferCard':
      return <OfferCardRenderer component={component} />;
    case 'AddOnPicker':
      return <AddOnPickerRenderer component={component} />;
    case 'Ledger':
      return <LedgerRenderer component={component} />;
    case 'PaymentPicker':
      return <PaymentPickerRenderer component={component} />;
    case 'ProcessMonitor':
      return <ProcessMonitorRenderer component={component} />;
    case 'ActionPanel':
      return <ActionPanelRenderer metadata={metadata} state={state} />;
    case 'RecordMerge':
      return <RecordMergeRenderer metadata={metadata} />;
    case 'MatrixGrid':
      return <MatrixGridRenderer metadata={metadata} />;
    case 'Map':
      return <MapRenderer metadata={metadata} />;
    case 'DropZone':
      return <DropZoneRenderer component={component} state={state} renderComponent={renderComponent} />;
    case 'PlanningBoard':
      return <PlanningBoardRenderer metadata={metadata as unknown as PlanningBoard} />;

    case 'Markdown':
      return <RichText value={(metadata['markdown'] as string) ?? ''} kind="markdown" />;
    case 'Image': {
      // src/alt may be templates over the page state (a YAML record page shows `${state.image}`)
      const src = interpolate((metadata['src'] as string) ?? '', { state });
      const alt = metadata['alt'] == null ? undefined : interpolate(String(metadata['alt']), { state });
      // the two shapes a page template asks for: a round avatar, a 4:3 photo
      const css = String(component['style'] ?? '');
      const shape = /border-radius:\s*50%/.test(css) ? styles.imageRound : /aspect-ratio:\s*4\s*\/\s*3/.test(css) ? styles.imagePhoto : styles.image;
      return src && !src.includes('${') ? (
        <Image
          source={{ uri: src }}
          style={shape}
          resizeMode={shape === styles.image ? 'contain' : 'cover'}
          {...imageA11y(alt)}
        />
      ) : null;
    }
    case 'CustomField':
      // ComponentAdapter's nested island / a custom field: render its content node.
      return metadata['content'] ? <ComponentRenderer component={metadata['content']} state={state} /> : null;
    case 'MicroFrontend':
      return <MicroFrontendIsland metadata={metadata} />;

    // ── the rest of the wire catalogue (WireComponents.tsx) ──
    case 'App':
      return <NestedAppRenderer metadata={metadata} />;
    case 'Grid':
      return <GridRenderer component={component} state={state} data={data} />;
    // a column (or a column group) outside its Grid/Crud: just its header text
    case 'GridGroupColumn':
    case 'GridColumn':
      return <GridColumnRenderer metadata={metadata} />;
    case 'VirtualList':
      return <VirtualListRenderer metadata={metadata} state={state} data={data} />;
    case 'Details':
      return <DetailsRenderer metadata={metadata} state={state} data={data} />;
    case 'Breadcrumbs':
      return <BreadcrumbsRenderer metadata={metadata} />;
    case 'Breadcrumb':
      return <BreadcrumbRenderer metadata={metadata} />;
    case 'Avatar':
      return <AvatarRenderer metadata={metadata} />;
    case 'AvatarGroup':
      return <AvatarGroupRenderer metadata={metadata} />;
    case 'Icon':
      return <IconRenderer metadata={metadata} />;
    case 'MenuBar':
      return <MenuBarRenderer metadata={metadata} />;
    case 'ContextMenu':
      return <ContextMenuRenderer metadata={metadata} state={state} data={data} />;
    case 'Tooltip':
      return <TooltipRenderer metadata={metadata} state={state} data={data} />;
    case 'Directory':
      return <DirectoryRenderer metadata={metadata} />;
    case 'MasterDetailLayout':
      return <MasterDetailRenderer component={component} state={state} data={data} />;
    case 'CarouselLayout':
      return <CarouselRenderer component={component} metadata={metadata} state={state} data={data} />;
    case 'ContentLayout':
      return <ContentLayoutRenderer component={component} metadata={metadata} state={state} data={data} />;
    case 'ResponsiveGrid':
      return <ResponsiveGridRenderer component={component} metadata={metadata} state={state} data={data} />;
    case 'BoardLayout':
      return <BoardLayoutRenderer component={component} state={state} data={data} />;
    case 'BoardLayoutRow':
      return <BoardLayoutRowRenderer component={component} state={state} data={data} />;
    case 'BoardLayoutItem':
    case 'FormItem':
    case 'Tab':
    case 'AccordionPanel':
      return <LabelledChildrenRenderer component={component} state={state} data={data} />;
    case 'Stepper':
      return <StepperRenderer component={component} state={state} data={data} />;
    case 'Chat':
      return <ChatRenderer metadata={metadata} />;
    case 'MessageList':
      return <MessageListRenderer metadata={metadata} />;
    case 'MessageInput':
      return <MessageInputRenderer metadata={metadata} />;
    case 'Result':
      return <ResultRenderer metadata={metadata} />;
    case 'NotFound':
      return <NotFoundRenderer metadata={metadata} />;
    case 'Drawer':
      return <DrawerInlineRenderer metadata={metadata} state={state} data={data} />;
    case 'Notification':
      return <NotificationRenderer metadata={metadata} />;
    case 'CookieConsent':
      return <CookieConsentRenderer metadata={metadata} />;
    case 'Element':
      return <ElementRenderer metadata={metadata} state={state} data={data} />;
    case 'Bpmn':
      return <BpmnRenderer metadata={metadata} />;
    case 'Workflow':
      return <WorkflowRenderer metadata={metadata} />;
    case 'FormEditor':
      return <FormEditorRenderer metadata={metadata} />;

    case 'CustomComponent': {
      // The per-renderer escape hatch (#14): a registered renderer paints it; otherwise degrade to a
      // visible placeholder that still shows the slotted children (never a broken screen).
      const name = (metadata['name'] as string) ?? '';
      const props = (metadata['props'] as Record<string, unknown>) ?? {};
      const kids = ((component['children'] as unknown[]) ?? []).map((c, i) => (
        <ComponentRenderer key={i} component={c} state={state} />
      ));
      const custom = resolveCustomComponent(name);
      if (custom) return <>{custom(props, kids)}</>;
      return (
        <View>
          <Text style={styles.unknown}>Custom component “{name}” is not registered on this renderer</Text>
          {kids}
        </View>
      );
    }

    default: {
      if (metaType) {
        return <Text style={styles.unknown}>Unsupported component: {metaType}</Text>;
      }
      // No type: try to render children as vertical layout
      return (
        <LayoutRenderer
          component={component}
          state={state}
          onStateChange={() => {}}
          renderComponent={renderComponent}
          direction="column"
        />
      );
    }
  }
}

const styles = themed(() => StyleSheet.create({
  centered: { alignSelf: 'center', margin: 20 },
  error: { color: theme.danger, padding: 8, fontSize: 13 },
  text: { fontSize: 14, color: theme.ink, flexShrink: 1 },
  heading: { fontWeight: '700', color: theme.ink, paddingTop: 8, paddingBottom: 8 },
  separator: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border, width: '100%', marginVertical: 8 },
  unknown: { fontSize: 12, color: theme.faint, fontStyle: 'italic' },
  image: { width: '100%', height: 200, borderRadius: theme.radiusSm, backgroundColor: theme.background },
  imageRound: { width: 112, height: 112, borderRadius: 56, alignSelf: 'center', backgroundColor: theme.background },
  imagePhoto: { width: '100%', aspectRatio: 4 / 3, borderRadius: theme.radiusSm, backgroundColor: theme.background },
  wireButton: { alignSelf: 'flex-start' },
}));
