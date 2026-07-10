import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CrudRenderer } from './CrudRenderer';
import { interpolate } from '../core/expressions';
import { FormFieldRenderer } from './FormFieldRenderer';
import { FormRenderer } from './FormRenderer';
import { LayoutRenderer } from './LayoutRenderer';
import { PageRenderer } from './PageRenderer';
import {
  SectionRenderer, SubSectionRenderer, CardRenderer, TabsRenderer, AccordionRenderer,
  SplitRenderer, BadgeRenderer, AnchorRenderer, ProgressBarRenderer, DialogRenderer, ConfirmDialogRenderer,
} from './ContainerRenderer';
import {
  MetricCardRenderer, ScoreboardRenderer, DashboardPanelRenderer, DashboardLayoutRenderer,
} from './DashboardRenderer';
import {
  FoldoutRenderer, HeroSectionRenderer, EmptyStateRenderer, SkeletonRenderer, GanttRenderer,
} from './DisplayRenderer';
import { EmptyState, MetricCard, Skeleton } from '../api/metadata';
import { useAppContext } from '../context/AppContext';
import { MateuViewHost, useViewController } from './MateuViewHost';

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

function ClientSideComponent({ component, state, data }: { component: Record<string, unknown>; state: Record<string, unknown>; data: unknown }) {
  const controller = useViewController();
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
        />
      );

    case 'Button': {
      const id = (metadata['actionId'] as string) ?? (metadata['id'] as string) ?? '';
      const label = interpolate((metadata['label'] as string) ?? id, { state });
      return (
        <TouchableOpacity style={styles.btnDefault} onPress={() => runAction(id)}>
          <Text style={styles.btnDefaultText}>{label}</Text>
        </TouchableOpacity>
      );
    }

    case 'Text': {
      const text = interpolate((metadata['text'] as string) ?? '', { state });
      return <Text style={styles.text}>{text}</Text>;
    }

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
    case 'Gantt':
      return <GanttRenderer component={component} />;

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

const styles = StyleSheet.create({
  centered: { alignSelf: 'center', margin: 20 },
  error: { color: '#cc0000', padding: 8, fontSize: 13 },
  text: { fontSize: 14, color: '#333', flexShrink: 1 },
  unknown: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  btnDefault: { backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', alignSelf: 'flex-start' },
  btnDefaultText: { color: '#333', fontSize: 14 },
});
