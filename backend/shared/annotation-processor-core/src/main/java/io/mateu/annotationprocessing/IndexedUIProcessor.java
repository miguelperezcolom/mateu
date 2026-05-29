package io.mateu.annotationprocessing;

import io.mateu.uidl.interfaces.RouteValue;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.*;
import javax.annotation.processing.Filer;

class IndexedUIProcessor {

  static void process(Set<String> compiledClassNames, Filer filer) {
    try {
      ClassLoader cl = IndexedUIProcessor.class.getClassLoader();
      if (cl == null) cl = ClassLoader.getSystemClassLoader();
      Enumeration<URL> resources = cl.getResources("META-INF/mateu/ui-registrations");
      while (resources.hasMoreElements()) {
        URL url = resources.nextElement();
        List<Map<String, String>> entries = parseIndexFile(url);
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
    String path = entry.getOrDefault("path", "");
    String indexHtmlPath = entry.getOrDefault("indexHtmlPath", "/static/_index.html");
    String frontendComponentPath = entry.getOrDefault("frontendComponentPath", "/assets/mateu.js");
    String keycloakUrl = entry.getOrDefault("keycloakUrl", "");
    String keycloakRealm = entry.getOrDefault("keycloakRealm", "");
    String keycloakClientId = entry.getOrDefault("keycloakClientId", "");
    String keycloakJsUrl = entry.getOrDefault("keycloakJsUrl", "");

    System.out.println("MateuUIAnnotationProcessor processing indexed UI: " + simpleClassName);

    String generatedFullClassName = className + "Controller";
    String pkgName = "";
    String generatedClassName = generatedFullClassName;
    if (generatedFullClassName.contains(".")) {
      pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
      generatedClassName =
          generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);
    }
    String caption = Helper.capitalize(simpleClassName);
    String cleanPath = path.endsWith("/") ? path.substring(0, path.length() - 1) : path;

    try {
      UISourceFileGenerator.createIndexControllerFromIndex(
          generatedFullClassName,
          pkgName,
          className,
          simpleClassName,
          generatedClassName,
          caption,
          path,
          indexHtmlPath,
          frontendComponentPath,
          keycloakUrl,
          keycloakRealm,
          keycloakClientId,
          keycloakJsUrl,
          filer);
      UISourceFileGenerator.createController(
          className + "MateuController",
          pkgName,
          className,
          simpleClassName,
          generatedClassName,
          caption,
          cleanPath,
          filer);
      UISourceFileGenerator.createConfig(
          className + "Config",
          pkgName,
          className,
          simpleClassName,
          generatedClassName,
          caption,
          path,
          filer);
      List<RouteValue> routes = new ArrayList<>();
      routes.add(
          new RouteValue(
              path,
              "_empty",
              RouteAnnotationProcessor.toRegex(path),
              RouteAnnotationProcessor.toRegex("_empty")));
      if (path.isEmpty()) {
        routes.add(
            new RouteValue(
                "",
                "_empty",
                RouteAnnotationProcessor.toRegex(""),
                RouteAnnotationProcessor.toRegex("_empty")));
      }
      RouteAnnotationProcessor.createRouteHandlerFromModel(
          className + "UIRouteResolver",
          pkgName,
          className,
          simpleClassName,
          simpleClassName + "UIRouteResolver",
          caption,
          routes,
          filer);
    } catch (IOException ex) {
      ex.printStackTrace();
    }
  }

  static List<Map<String, String>> parseIndexFile(URL url) throws IOException {
    List<Map<String, String>> result = new ArrayList<>();
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(url.openStream()))) {
      Map<String, String> current = new LinkedHashMap<>();
      String line;
      while ((line = reader.readLine()) != null) {
        if (line.trim().equals("---")) {
          if (!current.isEmpty()) {
            result.add(current);
            current = new LinkedHashMap<>();
          }
        } else if (line.contains("=")) {
          int idx = line.indexOf('=');
          current.put(line.substring(0, idx).trim(), line.substring(idx + 1).trim());
        }
      }
      if (!current.isEmpty()) {
        result.add(current);
      }
    }
    return result;
  }

  private IndexedUIProcessor() {}
}
