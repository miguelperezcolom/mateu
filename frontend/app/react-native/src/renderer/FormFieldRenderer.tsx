import React, { useState } from 'react';
import {
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppContext } from '../context/AppContext';

interface Option {
  label: string;
  value: string;
}

interface FieldMeta {
  fieldId: string;
  label?: string;
  dataType?: string;
  stereotype?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  initialValue?: unknown;
  options?: Option[];
}

interface Props {
  metadata: FieldMeta;
  state: Record<string, unknown>;
  onStateChange: (fieldId: string, value: unknown) => void;
}

export function FormFieldRenderer({ metadata, state, onStateChange }: Props) {
  const { fieldId, label, dataType = 'string', stereotype = '', required = false, readOnly = false, disabled = false, options = [] } = metadata;

  const rawValue = state[fieldId] ?? metadata.initialValue ?? '';
  const stringValue = rawValue === null || rawValue === undefined ? '' : String(rawValue);

  const editable = !readOnly && !disabled;

  const renderInput = () => {
    // Boolean
    if (dataType === 'bool' || dataType === 'boolean' || dataType === 'Boolean') {
      return (
        <Switch
          value={Boolean(rawValue)}
          onValueChange={(v) => onStateChange(fieldId, v)}
          disabled={!editable}
        />
      );
    }

    // Options (enum / static list)
    if (options.length > 0) {
      return <OptionsField options={options} value={stringValue} editable={editable} onChange={(v) => onStateChange(fieldId, v)} />;
    }

    // Textarea
    if (stereotype === 'textarea') {
      return (
        <TextInput
          style={[styles.input, styles.textarea]}
          value={stringValue}
          onChangeText={(v) => onStateChange(fieldId, v)}
          multiline
          numberOfLines={4}
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Password
    if (stereotype === 'password') {
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => onStateChange(fieldId, v)}
          secureTextEntry
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Integer / long
    if (['integer', 'int', 'long', 'Integer', 'Long'].includes(dataType)) {
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => onStateChange(fieldId, v === '' ? null : parseInt(v, 10))}
          keyboardType="number-pad"
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Decimal / money
    if (['number', 'double', 'float', 'decimal', 'BigDecimal'].includes(dataType) || ['money', 'currency'].includes(stereotype)) {
      return (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={(v) => onStateChange(fieldId, v === '' ? null : parseFloat(v))}
          keyboardType="decimal-pad"
          editable={editable}
          placeholder={label}
        />
      );
    }

    // Default text
    return (
      <TextInput
        style={styles.input}
        value={stringValue}
        onChangeText={(v) => onStateChange(fieldId, v)}
        editable={editable}
        placeholder={label}
        autoCapitalize="none"
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label ?? fieldId}{required ? ' *' : ''}</Text>
      {renderInput()}
    </View>
  );
}

function OptionsField({ options, value, editable, onChange }: { options: Option[]; value: string; editable: boolean; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity style={styles.input} onPress={() => editable && setOpen(!open)} activeOpacity={editable ? 0.7 : 1}>
        <Text style={!selected ? styles.placeholder : undefined}>{selected?.label ?? (value || 'Select…')}</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          <ScrollView style={{ maxHeight: 200 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.dropdownItem}
                onPress={() => { onChange(opt.value); setOpen(false); }}
              >
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 42,
    justifyContent: 'center',
  },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
  placeholder: { color: '#aaa' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginTop: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 100,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
});
