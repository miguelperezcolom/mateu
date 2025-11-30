package ${pkgName};

import io.mateu.uidl.interfaces.Pair;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Named
public class ${generatedClassName} implements RouteResolver {

    private final List<Pair<Pattern, Pattern>> patterns = List.of(
    <#list routes>
        <#items as route>
            new Pair(Pattern.compile("${route.first()}"), Pattern.compile("${route.second()}"))<#sep>,
        </#items>
    </#list>
    );

    @Override
    public Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest) {
        return ${simpleClassName}.class;
    }

    @Override
    public List<Pair<Pattern, Pattern>> supportedRoutesPatterns() {
        return patterns;
    }

}
