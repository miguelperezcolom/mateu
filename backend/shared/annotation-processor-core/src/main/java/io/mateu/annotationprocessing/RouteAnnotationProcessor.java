package io.mateu.annotationprocessing;

import freemarker.template.TemplateException;
import io.mateu.uidl.annotations.Route;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.Filer;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;

@SupportedAnnotationTypes({"io.mateu.uidl.annotations.Route", "io.mateu.uidl.annotations.Routes"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class RouteAnnotationProcessor extends AbstractProcessor {

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (TypeElement annotation : annotations) {
      Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

      for (Element e : annotatedElements) {
        String className = ((TypeElement) e).getQualifiedName().toString();
        String simpleClassName = e.getSimpleName().toString();
        List<String> routes =
            Arrays.stream(e.getAnnotationsByType(Route.class))
                .map(routeAnnotation -> routeAnnotation.value())
                .toList();

        System.out.println("RouteAnnotationProcessor running on " + simpleClassName);

        String generatedFullClassName = className + "RouteResolver";
        String pkgName = "";
        String generatedClassName = generatedFullClassName;
        if (generatedFullClassName.contains(".")) {
          pkgName = generatedFullClassName.substring(0, generatedFullClassName.lastIndexOf("."));
          generatedClassName =
              generatedFullClassName.substring(generatedFullClassName.lastIndexOf(".") + 1);
        }
        String caption = getCaption(e, simpleClassName);

        try {
          createRouteHandler(
              generatedFullClassName,
              pkgName,
              className,
              simpleClassName,
              e,
              generatedClassName,
              caption,
              routes);
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
      return e.getAnnotation(PageTitle.class).value();
    }
    if (e.getAnnotation(AppTitle.class) != null) {
      return e.getAnnotation(AppTitle.class).value();
    }
    if (e.getAnnotation(Title.class) != null) {
      return e.getAnnotation(Title.class).value();
    }
     */
    return Helper.capitalize(simpleClassName);
  }

  public Filer getFiler() {
    return processingEnv.getFiler();
  }

  private void createRouteHandler(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      Element e,
      String generatedClassName,
      String caption,
      List<String> paths)
      throws IOException {
    JavaFileObject builderFile = getFiler().createSourceFile(generatedFullClassName);
    try (PrintWriter out = new PrintWriter(builderFile.openWriter())) {
      // writing generated file to out …

      Formatter formatter =
          new Formatter(
              "route.ftl",
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
                  "label",
                  caption,
                  "routes",
                  paths));
      try {
        out.println(formatter.apply());
      } catch (TemplateException ex) {
        ex.printStackTrace();
      }
    }
  }
}
