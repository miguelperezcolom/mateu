package ${pkgName};

import io.mateu.uidl.interfaces.CompiledRouteValue;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import jakarta.inject.Singleton;

import java.util.List;
import java.util.regex.Pattern;

// @Singleton: ArC does not treat @Named as bean-defining (the adapter used to rely on
// quarkus-spring-di for that).
@Named
@Singleton
public class ${generatedClassName} implements RouteResolver {

    private final List<CompiledRouteValue> patterns = List.of(
    <#list routes>
        <#items as route>
            new CompiledRouteValue("${route.route()}", "${route.parentRoute()}", Pattern.compile("${route.routeRegex()}"), Pattern.compile("${route.parentRouteRegex()}"))<#sep>,
        </#items>
    </#list>
    );

    @Override
    public Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest) {
        return ${simpleClassName}.class;
    }

    @Override
    public List<CompiledRouteValue> supportedRoutesPatterns() {
        return patterns;
    }

}
