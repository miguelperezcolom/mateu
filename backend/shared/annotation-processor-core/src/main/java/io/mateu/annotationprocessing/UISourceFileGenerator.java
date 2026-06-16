package io.mateu.annotationprocessing;

import com.google.common.base.Strings;
import freemarker.template.TemplateException;
import io.mateu.uidl.annotations.KeycloakSecured;
import io.mateu.uidl.annotations.Link;
import io.mateu.uidl.annotations.Meta;
import io.mateu.uidl.annotations.Script;
import io.mateu.uidl.annotations.UI;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.processing.Filer;
import javax.lang.model.element.Element;
import javax.tools.JavaFileObject;

class UISourceFileGenerator {

  static void createIndexController(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      Element e,
      String generatedClassName,
      String caption,
      String path,
      Filer filer)
      throws IOException {
    JavaFileObject builderFile = filer.createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      String[] externalScripts = new String[0];
      String indexHtmlPath = "/index/index.html";
      String frontendPath = path + "/dist/assets/mateu.js";
      if (e.getAnnotation(UI.class) != null) {
        if (!Strings.isNullOrEmpty(e.getAnnotation(UI.class).indexHtmlPath())) {
          indexHtmlPath = e.getAnnotation(UI.class).indexHtmlPath();
        }
        if (!Strings.isNullOrEmpty(e.getAnnotation(UI.class).frontendComponentPath())) {
          frontendPath = e.getAnnotation(UI.class).frontendComponentPath();
          if (!frontendPath.startsWith("http:") && !frontendPath.startsWith("https:")) {
            frontendPath = path + frontendPath;
          }
        }
      }
      System.out.println("Using " + indexHtmlPath + " for index.html");
      System.out.println("Using " + frontendPath + " for frontend component");

      Map<String, Object> model =
          new HashMap<>(
              Map.of(
                  "pkgName", pkgName,
                  "className", className,
                  "simpleClassName", simpleClassName,
                  "generatedClassName", generatedClassName,
                  "generatedFullClassName", generatedFullClassName,
                  "pageTitle", caption,
                  "path", path,
                  "externalScripts", externalScripts,
                  "frontendPath", frontendPath,
                  "indexHtmlPath", indexHtmlPath));
      model.put("favicon", "");
      model.put("scripts", extractScripts(e));
      model.put("links", extractLinks(e));
      model.put("metas", extractMetas(e));

      KeycloakSecured keycloakAnnotation = e.getAnnotation(KeycloakSecured.class);
      if (keycloakAnnotation != null) {
        String keycloakJsUrl = keycloakAnnotation.jsUrl();
        if (keycloakJsUrl == null || keycloakJsUrl.isEmpty()) {
          keycloakJsUrl = "https://esm.sh/keycloak-js@26.2.2";
        }
        model.put(
            "keycloak",
            Map.of(
                "url", keycloakAnnotation.url(),
                "realm", keycloakAnnotation.realm(),
                "clientId", keycloakAnnotation.clientId(),
                "jsUrl", keycloakJsUrl));
      }

      Formatter formatter = new Formatter("index.ftl", model);
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  static void createIndexControllerFromIndex(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      String generatedClassName,
      String caption,
      String path,
      String indexHtmlPath,
      String frontendComponentPath,
      String keycloakUrl,
      String keycloakRealm,
      String keycloakClientId,
      String keycloakJsUrl,
      List<Map<String, Object>> scripts,
      List<Map<String, Object>> links,
      List<Map<String, Object>> metas,
      Filer filer)
      throws IOException {
    JavaFileObject builderFile = filer.createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      String frontendPath = frontendComponentPath;
      if (!frontendPath.startsWith("http:") && !frontendPath.startsWith("https:")) {
        frontendPath = path + frontendPath;
      }
      Map<String, Object> model =
          new HashMap<>(
              Map.of(
                  "pkgName", pkgName,
                  "className", className,
                  "simpleClassName", simpleClassName,
                  "generatedClassName", generatedClassName,
                  "generatedFullClassName", generatedFullClassName,
                  "pageTitle", caption,
                  "path", path,
                  "externalScripts", new String[0],
                  "frontendPath", frontendPath,
                  "indexHtmlPath", indexHtmlPath));
      model.put("favicon", "");
      model.put("scripts", scripts);
      model.put("links", links);
      model.put("metas", metas);
      if (!keycloakUrl.isEmpty()) {
        String jsUrl =
            keycloakJsUrl.isEmpty() ? "https://esm.sh/keycloak-js@26.2.2" : keycloakJsUrl;
        model.put(
            "keycloak",
            Map.of(
                "url", keycloakUrl,
                "realm", keycloakRealm,
                "clientId", keycloakClientId,
                "jsUrl", jsUrl));
      }
      Formatter formatter = new Formatter("index.ftl", model);
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  static void createController(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      String generatedClassName,
      String caption,
      String path,
      Filer filer)
      throws IOException {
    JavaFileObject builderFile = filer.createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      Formatter formatter =
          new Formatter(
              "controller.ftl",
              Map.of(
                  "pkgName", pkgName,
                  "className", className,
                  "simpleClassName", simpleClassName,
                  "generatedClassName", generatedClassName,
                  "generatedFullClassName", generatedFullClassName,
                  "pageTitle", caption,
                  "path", path));
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  static void createConfig(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      String generatedClassName,
      String caption,
      String path,
      Filer filer)
      throws IOException {
    JavaFileObject builderFile = filer.createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      Formatter formatter =
          new Formatter(
              "config.ftl",
              Map.of(
                  "pkgName", pkgName,
                  "className", className,
                  "simpleClassName", simpleClassName,
                  "generatedClassName", generatedClassName,
                  "generatedFullClassName", generatedFullClassName,
                  "pageTitle", caption,
                  "path", path));
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  static List<Map<String, Object>> extractScripts(Element e) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (Script s : e.getAnnotationsByType(Script.class)) {
      Map<String, Object> m = new HashMap<>();
      m.put("src", s.src());
      m.put("type", s.type());
      m.put("crossorigin", s.crossorigin());
      m.put("defer", s.defer());
      m.put("async", s.async());
      list.add(m);
    }
    return list;
  }

  static List<Map<String, Object>> extractLinks(Element e) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (Link l : e.getAnnotationsByType(Link.class)) {
      Map<String, Object> m = new HashMap<>();
      m.put("rel", l.rel());
      m.put("href", l.href());
      m.put("type", l.type());
      m.put("as", l.as());
      m.put("crossorigin", l.crossorigin());
      list.add(m);
    }
    return list;
  }

  static List<Map<String, Object>> extractMetas(Element e) {
    List<Map<String, Object>> list = new ArrayList<>();
    for (Meta mt : e.getAnnotationsByType(Meta.class)) {
      Map<String, Object> m = new HashMap<>();
      m.put("name", mt.name());
      m.put("content", mt.content());
      m.put("httpEquiv", mt.httpEquiv());
      m.put("charset", mt.charset());
      list.add(m);
    }
    return list;
  }

  private UISourceFileGenerator() {}
}
