import { buttonPressOf, warnUnresolvedButtonRoute } from '@rn/core/buttonRoute'
import { useController } from './ViewHost'

type Dict = Record<string, unknown>

/**
 * How a button is pressed wherever it is drawn: one with a `route` NAVIGATES (disabled while a
 * `${…}` of the route has no value), any other runs its action — the contract every Mateu
 * renderer keeps (core/buttonRoute.ts, shared with React Native).
 */
export function useButtonPress() {
  const controller = useController()
  return (button: Dict, ctx: { state?: unknown; data?: unknown }, runAction: () => void, label = '') => {
    const press = buttonPressOf(button, ctx)
    const onPress = () => {
      if (press.kind === 'route') {
        if (/^[a-z][a-z0-9+.-]*:/i.test(press.route)) {
          if (/^https?:/i.test(press.route)) window.open(press.route, '_blank', 'noopener')
        } else {
          controller.session.openView({ label: label || press.route, route: press.route, consumedRoute: '', serverSideType: '' })
        }
      } else if (press.kind === 'unresolvedRoute') warnUnresolvedButtonRoute(press.template)
      else runAction()
    }
    return { onPress, disabled: press.kind === 'unresolvedRoute' }
  }
}
