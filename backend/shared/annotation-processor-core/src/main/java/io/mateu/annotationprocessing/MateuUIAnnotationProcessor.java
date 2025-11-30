package io.mateu.annotationprocessing;

import static io.mateu.annotationprocessing.RouteAnnotationProcessor.createRouteHandler;

import com.google.common.base.Strings;
import freemarker.template.TemplateException;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.Pair;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.List;
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;

@SupportedAnnotationTypes({"io.mateu.uidl.annotations.MateuUI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (TypeElement annotation : annotations) {
      Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

      for (Element e : annotatedElements) {
        String className = ((TypeElement) e).getQualifiedName().toString();
        String simpleClassName = e.getSimpleName().toString();
        String path = e.getAnnotation(MateuUI.class).value();

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
          List<Pair<String, String>> routes = List.of(new Pair("", ""));

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

    return true;
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
      if (e.getAnnotation(MateuUI.class) != null) {
        if (!Strings.isNullOrEmpty(e.getAnnotation(MateuUI.class).indexHtmlPath())) {
          indexHtmlPath = e.getAnnotation(MateuUI.class).indexHtmlPath();
        }
        if (!Strings.isNullOrEmpty(e.getAnnotation(MateuUI.class).frontendComponentPath())) {
          frontendPath = e.getAnnotation(MateuUI.class).frontendComponentPath();
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
          keycloakJsUrl = "https://cdn.jsdelivr.net/npm/keycloak-js@26.2.0/lib/keycloak.min.js";
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
