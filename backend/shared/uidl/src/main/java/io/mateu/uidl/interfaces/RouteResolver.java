package io.mateu.uidl.interfaces;

public interface RouteResolver {

    boolean supportsRoute(String route);

    default int weight(String route) {
        if (route != null) {
            return route.split("/").length;
        }
        return Integer.MIN_VALUE;
    }

    Class<?> resolveRoute(String route, HttpRequest httpRequest);

}
