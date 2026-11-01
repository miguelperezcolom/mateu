import React, { useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Text } from '../../ui/Text';
import { updateApp } from '../appUpdate';
import { hubLang } from '../compat';
import { PrimaryButton, hubStyles } from './common';

const TEXTS = {
  en: {
    update: 'Update Mateu',
    store: 'No update could be installed from here: finish it in the store, then come back.',
    failed: 'The update could not be started. Install the latest Mateu app from your store.',
  },
  es: {
    update: 'Actualizar Mateu',
    store: 'No hay una actualización que se pueda instalar desde aquí: termínala en la tienda y vuelve.',
    failed: 'No se ha podido iniciar la actualización. Instala la última app de Mateu desde tu tienda.',
  },
};

/** "Update Mateu": an over-the-air update when one is waiting (the app relaunches on it), else the
 *  store this installable updates from (appUpdate.ts); it says plainly when neither worked. */
export function UpdateAppButton({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = TEXTS[hubLang()];
  const [state, setState] = useState<'idle' | 'busy' | 'store' | 'failed'>('idle');
  if (state === 'busy') return <ActivityIndicator size="large" />;
  return (
    <>
      <PrimaryButton
        label={t.update}
        icon="update"
        style={style}
        onPress={() => {
          setState('busy');
          void updateApp().then((outcome) => setState(outcome === 'reloading' ? 'busy' : outcome));
        }}
      />
      {state !== 'idle' && (
        <Text style={hubStyles.text} accessibilityLiveRegion="polite">
          {state === 'store' ? t.store : t.failed}
        </Text>
      )}
    </>
  );
}
