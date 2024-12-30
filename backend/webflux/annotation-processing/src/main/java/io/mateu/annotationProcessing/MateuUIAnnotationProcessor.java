package io.mateu.annotationProcessing;

import com.google.auto.service.AutoService;
import com.google.common.base.Strings;
import freemarker.template.TemplateException;
import io.mateu.uidl.annotations.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;

@SupportedAnnotationTypes({"io.mateu.uidl.annotations.MateuUI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
@AutoService(Processor.class)
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
        String pkgName =
            generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
        String generatedClassName =
            generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);
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
    if (e.getAnnotation(PageTitle.class) != null) {
      return e.getAnnotation(PageTitle.class).value();
    }
    if (e.getAnnotation(AppTitle.class) != null) {
      return e.getAnnotation(AppTitle.class).value();
    }
    if (e.getAnnotation(Title.class) != null) {
      return e.getAnnotation(Title.class).value();
    }
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
    JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      String[] externalScripts = null;
      if (e.getAnnotation(ExternalScripts.class) != null) {
        externalScripts = e.getAnnotation(ExternalScripts.class).value();
      }
      if (externalScripts == null) externalScripts = new String[0];

      String indexHtmlPath = "/index/index.html";
      String frontendPath = path + "/dist/assets/mateu.js";
      if (e.getAnnotation(MateuUI.class) != null) {
        if (!Strings.isNullOrEmpty(e.getAnnotation(MateuUI.class).indexHtmlPath())) {
          indexHtmlPath = e.getAnnotation(MateuUI.class).indexHtmlPath();
        }
        if (!Strings.isNullOrEmpty(e.getAnnotation(MateuUI.class).frontendComponenPath())) {
          frontendPath = e.getAnnotation(MateuUI.class).frontendComponenPath();
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
                  "caption",
                  caption,
                  "path",
                  path,
                  "externalScripts",
                  externalScripts,
                  "frontendPath",
                  frontendPath,
                  "indexHtmlPath",
                  indexHtmlPath));

      FavIcon favIconAnnotation = e.getAnnotation(FavIcon.class);
      if (favIconAnnotation != null) {
        model.put(
            "favicon", "<link rel=\\\"icon\\\" href=\\\"" + favIconAnnotation.value() + "\\\" />");
      } else {
        model.put("favicon", "");
      }

      KeycloakSecured keycloakAnnotation = e.getAnnotation(KeycloakSecured.class);
      if (keycloakAnnotation != null) {
        String keycloakUrl = keycloakAnnotation.url();
        String keycloakRealm = keycloakAnnotation.realm();
        String keycloakClientId = keycloakAnnotation.clientId();
        String keycloakJsUrl = keycloakAnnotation.jsUrl();
        if (keycloakJsUrl == null || keycloakJsUrl.isEmpty()) {
          keycloakJsUrl = "https://www.unpkg.com/keycloak-js/dist/keycloak.min.js";
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

      io.mateu.annotationProcessing.Formatter formatter =
          new io.mateu.annotationProcessing.Formatter("index.ftl", model);
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
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
    JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      io.mateu.annotationProcessing.Formatter formatter =
          new io.mateu.annotationProcessing.Formatter(
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
                  "caption",
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
    JavaFileObject builderFile = processingEnv.getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      io.mateu.annotationProcessing.Formatter formatter =
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
                  "caption",
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
