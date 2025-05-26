package ${pkgName};

import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Named
public class ${simpleClassName}RouteResolver implements RouteResolver {

    private final List<Pattern> patterns = List.of(
        Pattern.compile(io.mateu.uidl.interfaces.App.class
                        .isAssignableFrom(${simpleClassName}.class)
            && !"${route}".endsWith(".*")?"${route}" + ".*":"${route}")
    );

    @Override
    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
        return ${simpleClassName}.class;
    }

    @Override
    public List<Pattern> getSupportedRoutesPatterns() {
        return patterns;
    }

}
