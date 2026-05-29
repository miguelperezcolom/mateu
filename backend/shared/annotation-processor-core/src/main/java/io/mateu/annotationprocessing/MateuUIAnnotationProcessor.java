package io.mateu.annotationprocessing;

import static io.mateu.annotationprocessing.RouteAnnotationProcessor.createRouteHandler;
import static io.mateu.annotationprocessing.RouteAnnotationProcessor.toRegex;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.RouteValue;
import java.io.IOException;
import java.util.*;
import java.util.List;
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;

@SupportedAnnotationTypes({"io.mateu.uidl.annotations.UI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
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
        String caption = Helper.capitalize(simpleClassName);

        try {
          UISourceFileGenerator.createIndexController(
              generatedFullClassName,
              pkgName,
              className,
              simpleClassName,
              e,
              generatedClassName,
              caption,
              path,
              getFiler());
          UISourceFileGenerator.createController(
              className + "MateuController",
              pkgName,
              className,
              simpleClassName,
              generatedClassName,
              caption,
              removeTrailingSlash(path),
              getFiler());
          UISourceFileGenerator.createConfig(
              className + "Config",
              pkgName,
              className,
              simpleClassName,
              generatedClassName,
              caption,
              path,
              getFiler());
          List<RouteValue> routes =
              new ArrayList<>(
                  Arrays.stream(
                          Optional.ofNullable(e.getAnnotationsByType(UI.class)).orElse(new UI[0]))
                      .map(
                          routeAnnotation ->
                              new RouteValue(
                                  routeAnnotation.value(),
                                  "_empty",
                                  toRegex(routeAnnotation.value()),
                                  toRegex("_empty")))
                      .toList());
          Arrays.stream(Optional.ofNullable(e.getAnnotationsByType(UI.class)).orElse(new UI[0]))
              .filter(routeAnnotation -> routeAnnotation.value().isEmpty())
              .map(routeAnnotation -> new RouteValue("", "_empty", toRegex(""), toRegex("_empty")))
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

    processIndexedUIs(compiledClassNames);

    return true;
  }

  protected void processIndexedUIs(Set<String> compiledClassNames) {
    IndexedUIProcessor.process(compiledClassNames, getFiler());
  }

  public Filer getFiler() {
    return processingEnv.getFiler();
  }

  private String removeTrailingSlash(String path) {
    if (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    return path;
  }
}
