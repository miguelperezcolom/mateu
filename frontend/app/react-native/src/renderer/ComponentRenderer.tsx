import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { CrudRenderer } from './CrudRenderer';
import { FormFieldRenderer } from './FormFieldRenderer';
import { FormRenderer } from './FormRenderer';
import { LayoutRenderer } from './LayoutRenderer';
import { PageRenderer } from './PageRenderer';

interface Props {
  component: unknown;
  state: Record<string, unknown>;
  data?: unknown;
}

export function ComponentRenderer({ component, state, data }: Props) {
  const { runAction, loadServerSideComponent } = useAppContext();

  if (!component) return null;

  const comp = component as Record<string, unknown>;
  const type = (comp['type'] as string) ?? 'ClientSide';

  if (type === 'ServerSide') {
    return <ServerSideComponent component={comp} />;
  }

  return <ClientSideComponent component={comp} state={state} data={data} />;
}

function ServerSideComponent({ component }: { component: Record<string, unknown> }) {
  const { loadServerSideComponent } = useAppContext();
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadServerSideComponent(component)
      .then(setResult)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={styles.centered} />;
  if (error) return <Text style={styles.error}>Error: {error}</Text>;
  if (!result) return null;

  const res = result as Record<string, unknown>;
  const comp = (res['components'] as unknown[])?.[0] ?? result;
  const st = (res['state'] as Record<string, unknown>) ?? {};
  const dt = res['data'];

  return <ComponentRenderer component={comp} state={st} data={dt} />;
}

function ClientSideComponent({ component, state, data }: { component: Record<string, unknown>; state: Record<string, unknown>; data: unknown }) {
  const { runAction } = useAppContext();

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
          onStateChange={() => {}}
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
      const label = (metadata['label'] as string) ?? id;
      return (
        <TouchableOpacity style={styles.btnDefault} onPress={() => runAction(id)}>
          <Text style={styles.btnDefaultText}>{label}</Text>
        </TouchableOpacity>
      );
    }

    case 'Text': {
      const text = (metadata['text'] as string) ?? '';
      return <Text style={styles.text}>{text}</Text>;
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

const styles = StyleSheet.create({
  centered: { alignSelf: 'center', margin: 20 },
  error: { color: '#cc0000', padding: 8, fontSize: 13 },
  text: { fontSize: 14, color: '#333', flexShrink: 1 },
  unknown: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  btnDefault: { backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', alignSelf: 'flex-start' },
  btnDefaultText: { color: '#333', fontSize: 14 },
});
