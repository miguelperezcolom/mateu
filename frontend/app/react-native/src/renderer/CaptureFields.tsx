import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

// Capture fields (@Signature / @PhotoCapture): both commit a data URI through onChange, the same
// self-contained wire contract as the web renderers — the value travels in the field string, no
// upload endpoint involved.

// ── Signature ───────────────────────────────────────────────────────────────────

/**
 * Drawing pad: strokes captured with a PanResponder, rendered as SVG polylines, and rasterized on
 * Accept with react-native-view-shot into a PNG data URI.
 */
export function SignatureField({ value, editable, onChange }: {
  value: string; editable: boolean; onChange: (v: string) => void;
}) {
  const [signing, setSigning] = useState(!value);
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentStroke = useRef<string[]>([]);
  const padRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentStroke.current = [`${locationX},${locationY}`];
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        currentStroke.current = [...currentStroke.current, `${locationX},${locationY}`];
        // re-render with the in-progress stroke appended
        setStrokes((s) => [...s.filter((p) => p !== '__current__'), '__current__']);
      },
      onPanResponderRelease: () => {
        const points = currentStroke.current.join(' ');
        currentStroke.current = [];
        setStrokes((s) => [...s.filter((p) => p !== '__current__'), points]);
      },
    }),
  ).current;

  const committedStrokes = strokes.map((s) => (s === '__current__' ? currentStroke.current.join(' ') : s));
  const hasStrokes = committedStrokes.some((s) => s.includes(' '));

  const accept = async () => {
    if (!padRef.current || !hasStrokes) return;
    try {
      const dataUri = await captureRef(padRef, { format: 'png', quality: 1, result: 'data-uri' });
      onChange(dataUri);
      setSigning(false);
      setStrokes([]);
    } catch {
      // rasterizing failed: keep the pad as is
    }
  };

  if (!signing && value) {
    return (
      <View>
        <Image source={{ uri: value }} style={styles.preview} resizeMode="contain" />
        {editable && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={() => { setStrokes([]); setSigning(true); }}>
              <Text>Sign again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => onChange('')}>
              <Text style={styles.danger}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View>
      <View ref={padRef} collapsable={false} style={styles.pad} {...(editable ? panResponder.panHandlers : {})}>
        <Svg width="100%" height="100%">
          {committedStrokes.filter((s) => s.includes(' ')).map((points, i) => (
            <Polyline key={i} points={points} fill="none" stroke="#1a1a1a" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </Svg>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => setStrokes([])}>
          <Text>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.primary, !hasStrokes && styles.disabled]}
                          onPress={accept} disabled={!hasStrokes}>
          <Text style={styles.primaryText}>Accept</Text>
        </TouchableOpacity>
        {!!value && (
          <TouchableOpacity style={styles.button} onPress={() => setSigning(false)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Photo capture ───────────────────────────────────────────────────────────────

/** Device camera (expo-camera) with a live preview and a shutter; the shot lands as a JPEG data URI. */
export function PhotoCaptureField({ value, editable, onChange }: {
  value: string; editable: boolean; onChange: (v: string) => void;
}) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const open = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setCameraOpen(true);
  };

  const shoot = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.9 });
      if (photo?.base64) {
        onChange(`data:image/jpeg;base64,${photo.base64}`);
      }
    } finally {
      setCameraOpen(false);
    }
  };

  if (cameraOpen) {
    return (
      <View>
        <CameraView ref={cameraRef} style={styles.viewfinder} facing="back" />
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={shoot}>
            <Text style={styles.primaryText}>Capture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setCameraOpen(false)}>
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View>
      {value
        ? <Image source={{ uri: value }} style={styles.preview} resizeMode="contain" />
        : <View style={styles.placeholderBox}><Text style={styles.placeholderIcon}>📷</Text></View>}
      {editable && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={open}>
            <Text style={styles.primaryText}>{value ? 'Retake' : 'Take photo'}</Text>
          </TouchableOpacity>
          {!!value && (
            <TouchableOpacity style={styles.button} onPress={() => onChange('')}>
              <Text style={styles.danger}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {permission && !permission.granted && !permission.canAskAgain && (
        <Text style={styles.hint}>Camera permission denied — enable it in the system settings.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { height: 160, backgroundColor: '#fff', borderWidth: 1, borderStyle: 'dashed', borderColor: '#b0b0b0', borderRadius: 6 },
  viewfinder: { height: 260, borderRadius: 6, overflow: 'hidden' },
  preview: { height: 160, borderWidth: 1, borderColor: '#d0d0d0', borderRadius: 6, backgroundColor: '#fff' },
  placeholderBox: { height: 120, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#b0b0b0', borderRadius: 6 },
  placeholderIcon: { fontSize: 28 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  button: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#ececec', borderRadius: 6 },
  primary: { backgroundColor: '#0b57d0' },
  primaryText: { color: '#fff' },
  danger: { color: '#b3311f' },
  disabled: { opacity: 0.5 },
  hint: { marginTop: 6, fontSize: 12, color: '#707070' },
});
