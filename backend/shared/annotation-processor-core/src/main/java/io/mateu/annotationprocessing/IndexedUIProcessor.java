package io.mateu.annotationprocessing;

import io.mateu.uidl.interfaces.RouteValue;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.*;
import java.util.HashMap;
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
    List<Map<String, Object>> scripts = parseIndexedScripts(entry);
    List<Map<String, Object>> links = parseIndexedLinks(entry);
    List<Map<String, Object>> metas = parseIndexedMetas(entry);

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
          scripts,
          links,
          metas,
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

  private static List<Map<String, Object>> parseIndexedScripts(Map<String, String> entry) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (int i = 0; entry.containsKey("script." + i + ".src"); i++) {
      Map<String, Object> m = new HashMap<>();
      m.put("src", entry.get("script." + i + ".src"));
      m.put("type", entry.getOrDefault("script." + i + ".type", ""));
      m.put(
          "crossorigin",
          Boolean.parseBoolean(entry.getOrDefault("script." + i + ".crossorigin", "false")));
      m.put("defer", Boolean.parseBoolean(entry.getOrDefault("script." + i + ".defer", "false")));
      m.put("async", Boolean.parseBoolean(entry.getOrDefault("script." + i + ".async", "false")));
      list.add(m);
    }
    return list;
  }

  private static List<Map<String, Object>> parseIndexedLinks(Map<String, String> entry) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (int i = 0; entry.containsKey("link." + i + ".rel"); i++) {
      Map<String, Object> m = new HashMap<>();
      m.put("rel", entry.get("link." + i + ".rel"));
      m.put("href", entry.getOrDefault("link." + i + ".href", ""));
      m.put("type", entry.getOrDefault("link." + i + ".type", ""));
      m.put("as", entry.getOrDefault("link." + i + ".as", ""));
      m.put(
          "crossorigin",
          Boolean.parseBoolean(entry.getOrDefault("link." + i + ".crossorigin", "false")));
      list.add(m);
    }
    return list;
  }

  private static List<Map<String, Object>> parseIndexedMetas(Map<String, String> entry) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (int i = 0; entry.containsKey("meta." + i + ".content"); i++) {
      Map<String, Object> m = new HashMap<>();
      m.put("name", entry.getOrDefault("meta." + i + ".name", ""));
      m.put("content", entry.getOrDefault("meta." + i + ".content", ""));
      m.put("httpEquiv", entry.getOrDefault("meta." + i + ".httpEquiv", ""));
      m.put("charset", entry.getOrDefault("meta." + i + ".charset", ""));
      list.add(m);
    }
    return list;
  }

  private IndexedUIProcessor() {}
}
