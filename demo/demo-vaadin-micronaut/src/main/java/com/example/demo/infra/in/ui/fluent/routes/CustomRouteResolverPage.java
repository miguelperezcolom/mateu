package com.example.demo.infra.in.ui.fluent.routes;

import io.mateu.uidl.data.Text;
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
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Custom Route Resolver")
                .content(List.of(
                        new Text("This page is not annotated with @Route, but implements the RouteResolver interface.")
                ))
                .build();
    }

    @Override
    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
        return CustomRouteResolverPage.class;
    }

    @Override
    public List<Pattern> supportedRoutesPatterns() {
        return List.of(Pattern.compile("/routes/custom-route-resolver"));
    }
}
