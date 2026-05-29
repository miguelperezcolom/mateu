package io.mateu.annotationprocessing;

import io.mateu.uidl.interfaces.RouteValue;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Filer;

class IndexedRouteProcessor {

  static void process(Set<String> compiledClassNames, Filer filer) {
    try {
      ClassLoader cl = IndexedRouteProcessor.class.getClassLoader();
      if (cl == null) cl = ClassLoader.getSystemClassLoader();
      Enumeration<URL> resources = cl.getResources("META-INF/mateu/route-registrations");
      while (resources.hasMoreElements()) {
        URL url = resources.nextElement();
        List<Map<String, String>> entries = IndexedUIProcessor.parseIndexFile(url);
        for (Map<String, String> entry : entries) {
          String className = entry.get("class");
          if (className == null || compiledClassNames.contains(className)) {
            continue;
          }
          processEntry(entry, className, filer);
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private static void processEntry(Map<String, String> entry, String className, Filer filer) {
    String simpleClassName = entry.getOrDefault("simpleClassName", className);
    String routesRaw = entry.getOrDefault("routes", "");

    List<RouteValue> routes = new ArrayList<>();
    if (!routesRaw.isEmpty()) {
      for (String routePart : routesRaw.split(";")) {
        String[] parts = routePart.split("\\|", -1);
        String value = parts.length > 0 ? parts[0] : "";
        String parentRoute = parts.length > 1 ? parts[1] : "";
        routes.add(
            new RouteValue(
                value,
                parentRoute,
                RouteAnnotationProcessor.toRegex(value),
                RouteAnnotationProcessor.toRegex(parentRoute)));
      }
    }

    System.out.println("RouteAnnotationProcessor processing indexed route: " + simpleClassName);

    String generatedFullClassName = className + "RouteResolver";
    String pkgName = "";
    String generatedClassName = generatedFullClassName;
    if (generatedFullClassName.contains(".")) {
      pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
      generatedClassName =
          generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);
    }
    String caption = Helper.capitalize(simpleClassName);

    try {
      RouteAnnotationProcessor.createRouteHandlerFromModel(
          generatedFullClassName,
          pkgName,
          className,
          simpleClassName,
          generatedClassName,
          caption,
          routes,
          filer);
    } catch (IOException ex) {
      ex.printStackTrace();
    }
  }

  private IndexedRouteProcessor() {}
}
