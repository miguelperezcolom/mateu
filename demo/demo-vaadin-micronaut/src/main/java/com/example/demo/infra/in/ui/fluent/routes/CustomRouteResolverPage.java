package com.example.demo.infra.in.ui.fluent.routes;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Named;
import jakarta.inject.Singleton;

import java.util.List;
import java.util.regex.Pattern;

@Named
@Singleton
public class CustomRouteResolverPage implements ComponentTreeSupplier, RouteResolver {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Custom Route Resolver")
                .content(List.of(
                ))
                .build();
    }

    @Override
    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
        return CustomRouteResolverPage.class;
    }

    @Override
    public List<Pattern> getSupportedRoutesPatterns() {
        return List.of(Pattern.compile("/fluent-app/routes/custom-route-resolver"));
    }
}
