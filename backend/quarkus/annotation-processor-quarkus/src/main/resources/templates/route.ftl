package ${pkgName};

import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

@Named
public class ${simpleClassName}RouteResolver implements RouteResolver {

    @Override
    public boolean supportsRoute(String route) {
        return route != null && route.startsWith("${route}");
    }

    @Override
    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
        return ${simpleClassName}.class;
    }

}
