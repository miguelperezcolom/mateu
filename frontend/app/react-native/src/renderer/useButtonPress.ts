import { Linking } from 'react-native';
import { buttonPressOf, warnUnresolvedButtonRoute } from '../core/buttonRoute';
import { useViewController } from './MateuViewHost';

type Dict = Record<string, unknown>;

/**
 * How a button is pressed, wherever it is drawn (a Button component, a page header toolbar, the
 * bottom bar): a button with a `route` NAVIGATES like the web does — and is disabled while a
 * `${…}` of the route has no value —; any other button runs `runAction(actionId)`.
 */
export function useButtonPress() {
  const controller = useViewController();
  return (button: Dict, ctx: { state?: unknown; data?: unknown }, runAction: () => void, label = '') => {
    const press = buttonPressOf(button, ctx);
    const onPress = () => {
      if (press.kind === 'route') {
        if (/^[a-z][a-z0-9+.-]*:/i.test(press.route)) void Linking.openURL(press.route);
        else controller.session.openView({ label: label || press.route, route: press.route, consumedRoute: '', serverSideType: '' });
      } else if (press.kind === 'unresolvedRoute') warnUnresolvedButtonRoute(press.template);
      else runAction();
    };
    return { onPress, disabled: press.kind === 'unresolvedRoute' };
  };
}
