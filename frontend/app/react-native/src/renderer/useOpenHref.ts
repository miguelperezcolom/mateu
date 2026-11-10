import { hrefIntent } from '../core/linkTarget';
import { useViewController } from './MateuViewHost';
import { openExternal } from './openExternal';

/** Opens a link the server sent: in the app when it is relative (core/linkTarget hrefIntent), else
 *  in the OS (http(s)/mailto/tel only). */
export function useOpenHref() {
  const controller = useViewController();
  return (href: unknown, label = ''): void => {
    const intent = hrefIntent(href);
    if (intent.kind === 'external') openExternal(intent.url);
    else if (intent.kind === 'inApp') {
      controller.session.openView({ label: label || intent.route, route: intent.route, consumedRoute: '', serverSideType: '' });
    }
  };
}
