package ${pkgName};

import io.mateu.uidl.interfaces.HandlesRoute;
import reactor.core.publisher.Mono;


@Managed
public class ${simpleClassName}RouteHandler implements HandlesRoute {

    boolean supportsAction(String route) {
        return route != null && route.startsWith("${path}");
    }

    default int weight(String route) {
        if (route != null) {
            return route.split("/").length;
        }
        return Integer.MIN_VALUE;
    }

    Mono<?> handleRoute(String route, HttpRequest httpRequest) {
        return Mono.empty();
    }


}
