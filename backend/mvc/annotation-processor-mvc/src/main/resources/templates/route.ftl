package ${pkgName};

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.interfaces.RouteResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

@Named
public class ${generatedClassName} implements RouteResolver {

    private final List<Pattern> patterns = List.of(
    <#list routes>
        <#items as route>
            Pattern.compile((
            io.mateu.uidl.interfaces.App.class
            .isAssignableFrom(${simpleClassName}.class)
            ||
            io.mateu.uidl.fluent.AppSupplier.class
            .isAssignableFrom(${simpleClassName}.class)
            ||
            getAllFields(${simpleClassName}.class).stream()
            .anyMatch(field -> field.isAnnotationPresent(Menu.class))
            )
            && !"${route}".endsWith(".*")?"${route}" + ".*":"${route}")<#sep>,
        </#items>
    </#list>
    );

    @Override
    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
        return ${simpleClassName}.class;
    }

    @Override
    public List<Pattern> supportedRoutesPatterns() {
        return patterns;
    }

}
