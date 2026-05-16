package io.mateu.annotationprocessing;

import static io.mateu.annotationprocessing.RouteAnnotationProcessor.createRouteHandler;
import static io.mateu.annotationprocessing.RouteAnnotationProcessor.toRegex;

import com.google.common.base.Strings;
import freemarker.template.TemplateException;
import io.mateu.uidl.annotations.*;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.util.*;
import java.util.List;
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;

@SupportedAnnotationTypes({"io.mateu.uidl.annotations.UI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    // Track classes being compiled in this round so we skip them when reading index files
    Set<String> compiledClassNames = new HashSet<>();

    for (TypeElement annotation : annotations) {
      Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

      for (Element e : annotatedElements) {
        String className = ((TypeElement) e).getQualifiedName().toString();
        compiledClassNames.add(className);
        String simpleClassName = e.getSimpleName().toString();
        String path = e.getAnnotation(UI.class).value();

        System.out.println("MateuUIAnnotationProcessor running on " + simpleClassName);

        String generatedFullClassName = className + "Controller";
        String pkgName = "";
        String generatedClassName = generatedFullClassName;
        if (generatedFullClassName.contains(".")) {
          pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
          generatedClassName =
              generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);
        }
        String caption = getCaption(e, simpleClassName);

        try {
          createIndexController(
              generatedFullClassName,
              pkgName,
              className,
              simpleClassName,
              e,
              generatedClassName,
              caption,
              path);
          createController(
              className + "MateuController",
              pkgName,
              className,
              simpleClassName,
              e,
              generatedClassName,
              caption,
              removeTrailingSlash(path));
          createConfig(
              className + "Config",
              pkgName,
              className,
              simpleClassName,
              e,
              generatedClassName,
              caption,
              path);
          List<io.mateu.uidl.interfaces.RouteValue> routes =
              new ArrayList<>(
                  Arrays.stream(
                          Optional.ofNullable(e.getAnnotationsByType(UI.class)).orElse(new UI[0]))
                      .map(
                          routeAnnotation ->
                              new io.mateu.uidl.interfaces.RouteValue(
                                  routeAnnotation.value(),
                                  "_empty",
                                  toRegex(routeAnnotation.value()),
                                  toRegex("_empty")))
                      .toList());
          Arrays.stream(Optional.ofNullable(e.getAnnotationsByType(UI.class)).orElse(new UI[0]))
              .filter(routeAnnotation -> routeAnnotation.value().isEmpty())
              .map(
                  routeAnnotation ->
                      new io.mateu.uidl.interfaces.RouteValue(
                          "", "_empty", toRegex(""), toRegex("_empty")))
              .forEach(routes::add);

          createRouteHandler(
              className + "UIRouteResolver",
              pkgName,
              className,
              simpleClassName,
              e,
              simpleClassName + "UIRouteResolver",
              caption,
              routes,
              getFiler());
        } catch (IOException ex) {
          ex.printStackTrace();
        }
      }
    }

    // Also process @UI classes indexed from classpath (from dependent library modules)
    processIndexedUIs(compiledClassNames);

    return true;
  }

  protected void processIndexedUIs(Set<String> compiledClassNames) {
    try {
      ClassLoader cl = getClass().getClassLoader();
      if (cl == null) cl = ClassLoader.getSystemClassLoader();
      Enumeration<URL> resources = cl.getResources("META-INF/mateu/ui-registrations");
      while (resources.hasMoreElements()) {
        URL url = resources.nextElement();
        List<Map<String, String>> entries = parseIndexFile(url);
        for (Map<String, String> entry : entries) {
          String className = entry.get("class");
          if (className == null || compiledClassNames.contains(className)) {
            continue; // skip classes being compiled in this round
          }
          String simpleClassName = entry.getOrDefault("simpleClassName", className);
          String path = entry.getOrDefault("path", "");
          String indexHtmlPath = entry.getOrDefault("indexHtmlPath", "/static/_index.html");
          String frontendComponentPath =
              entry.getOrDefault("frontendComponentPath", "/assets/mateu.js");
          String keycloakUrl = entry.getOrDefault("keycloakUrl", "");
          String keycloakRealm = entry.getOrDefault("keycloakRealm", "");
          String keycloakClientId = entry.getOrDefault("keycloakClientId", "");
          String keycloakJsUrl = entry.getOrDefault("keycloakJsUrl", "");

          System.out.println(
              "MateuUIAnnotationProcessor processing indexed UI: " + simpleClassName);

          String generatedFullClassName = className + "Controller";
          String pkgName = "";
          String generatedClassName = generatedFullClassName;
          if (generatedFullClassName.contains(".")) {
            pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
            generatedClassName =
                generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);
          }
          String caption = Helper.capitalize(simpleClassName);

          try {
            createIndexControllerFromIndex(
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
                keycloakJsUrl);
            createControllerFromIndex(
                className + "MateuController",
                pkgName,
                className,
                simpleClassName,
                generatedClassName,
                caption,
                removeTrailingSlash(path));
            createConfigFromIndex(
                className + "Config",
                pkgName,
                className,
                simpleClassName,
                generatedClassName,
                caption,
                path);
            List<io.mateu.uidl.interfaces.RouteValue> routes = new ArrayList<>();
            routes.add(
                new io.mateu.uidl.interfaces.RouteValue(
                    path,
                    "_empty",
                    RouteAnnotationProcessor.toRegex(path),
                    RouteAnnotationProcessor.toRegex("_empty")));
            if (path.isEmpty()) {
              routes.add(
                  new io.mateu.uidl.interfaces.RouteValue(
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
                getFiler());
          } catch (IOException ex) {
            ex.printStackTrace();
          }
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  List<Map<String, String>> parseIndexFile(URL url) throws IOException {
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

  private void createIndexControllerFromIndex(
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
      String keycloakJsUrl)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
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
      } catch (freemarker.template.TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  private void createControllerFromIndex(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      String generatedClassName,
      String caption,
      String path)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
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
      } catch (freemarker.template.TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  private void createConfigFromIndex(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      String generatedClassName,
      String caption,
      String path)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
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
      } catch (freemarker.template.TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  private String removeTrailingSlash(String path) {
    if (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    return path;
  }

  private String getCaption(Element e, String simpleClassName) {
    /*
    todo: bring back at some point
    if (e.getAnnotation(PageTitle.class) != null) {
      return e.getAnnotation(PageTitle.class).initialValue();
    }
    if (e.getAnnotation(AppTitle.class) != null) {
      return e.getAnnotation(AppTitle.class).initialValue();
    }
    if (e.getAnnotation(Title.class) != null) {
      return e.getAnnotation(Title.class).initialValue();
    }
     */
    return Helper.capitalize(simpleClassName);
  }

  private void createIndexController(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      Element e,
      String generatedClassName,
      String caption,
      String path)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      String[] externalScripts = null;
      /*
      todo: bring back at some point
      if (e.getAnnotation(ExternalScripts.class) != null) {
        externalScripts = e.getAnnotation(ExternalScripts.class).initialValue();
      }
       */
      if (externalScripts == null) externalScripts = new String[0];

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
                  "pkgName",
                  pkgName,
                  "className",
                  className,
                  "simpleClassName",
                  simpleClassName,
                  "generatedClassName",
                  generatedClassName,
                  "generatedFullClassName",
                  generatedFullClassName,
                  "pageTitle",
                  caption,
                  "path",
                  path,
                  "externalScripts",
                  externalScripts,
                  "frontendPath",
                  frontendPath,
                  "indexHtmlPath",
                  indexHtmlPath));

      /*
      todo: bring back at some point
      FavIcon favIconAnnotation = e.getAnnotation(FavIcon.class);
      if (favIconAnnotation != null) {
        model.put(
            "favicon", "<link rel=\\\"icon\\\" href=\\\"" + favIconAnnotation.initialValue() + "\\\" />");
      } else {
        model.put("favicon", "");
      }
       */
      model.put("favicon", "");

      KeycloakSecured keycloakAnnotation = e.getAnnotation(KeycloakSecured.class);
      if (keycloakAnnotation != null) {
        String keycloakUrl = keycloakAnnotation.url();
        String keycloakRealm = keycloakAnnotation.realm();
        String keycloakClientId = keycloakAnnotation.clientId();
        String keycloakJsUrl = keycloakAnnotation.jsUrl();
        if (keycloakJsUrl == null || keycloakJsUrl.isEmpty()) {
          // keycloakJsUrl = path + "/dist/assets/keycloak.js";
          keycloakJsUrl = "https://esm.sh/keycloak-js@26.2.2";
        }

        model.put(
            "keycloak",
            Map.of(
                "url",
                keycloakUrl,
                "realm",
                keycloakRealm,
                "clientId",
                keycloakClientId,
                "jsUrl",
                keycloakJsUrl));
      }

      io.mateu.annotationprocessing.Formatter formatter =
          new io.mateu.annotationprocessing.Formatter("index.ftl", model);
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  public Filer getFiler() {
    return processingEnv.getFiler();
  }

  private void createConfig(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      Element e,
      String generatedClassName,
      String caption,
      String path)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      io.mateu.annotationprocessing.Formatter formatter =
          new io.mateu.annotationprocessing.Formatter(
              "config.ftl",
              Map.of(
                  "pkgName",
                  pkgName,
                  "className",
                  className,
                  "simpleClassName",
                  simpleClassName,
                  "generatedClassName",
                  generatedClassName,
                  "generatedFullClassName",
                  generatedFullClassName,
                  "pageTitle",
                  caption,
                  "path",
                  path));
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }

  private void createController(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      Element e,
      String generatedClassName,
      String caption,
      String path)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      io.mateu.annotationprocessing.Formatter formatter =
          new Formatter(
              "controller.ftl",
              Map.of(
                  "pkgName",
                  pkgName,
                  "className",
                  className,
                  "simpleClassName",
                  simpleClassName,
                  "generatedClassName",
                  generatedClassName,
                  "generatedFullClassName",
                  generatedFullClassName,
                  "pageTitle",
                  caption,
                  "path",
                  path));
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }
}
