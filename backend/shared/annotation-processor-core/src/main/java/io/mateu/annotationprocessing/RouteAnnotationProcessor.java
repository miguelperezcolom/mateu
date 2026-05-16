package io.mateu.annotationprocessing;

import freemarker.template.TemplateException;
import io.mateu.uidl.annotations.Route;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
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
    Set<String> compiledClassNames = new HashSet<>();

    for (TypeElement annotation : annotations) {
      Set<? extends Element> annotatedElements = roundEnv.getElementsAnnotatedWith(annotation);

      for (Element e : annotatedElements) {
        String className = ((TypeElement) e).getQualifiedName().toString();
        compiledClassNames.add(className);
        String simpleClassName = e.getSimpleName().toString();
        List<io.mateu.uidl.interfaces.RouteValue> routes =
            Arrays.stream(
                    Optional.ofNullable(e.getAnnotationsByType(Route.class)).orElse(new Route[0]))
                .map(
                    routeAnnotation ->
                        new io.mateu.uidl.interfaces.RouteValue(
                            routeAnnotation.value(),
                            routeAnnotation.parentRoute(),
                            toRegex(routeAnnotation.value()),
                            toRegex(routeAnnotation.parentRoute())))
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
              routes,
              getFiler());
        } catch (IOException ex) {
          ex.printStackTrace();
        }
      }
    }

    // Also process @Route classes indexed from classpath (from dependent library modules)
    processIndexedRoutes(compiledClassNames);

    return true;
  }

  private void processIndexedRoutes(Set<String> compiledClassNames) {
    try {
      ClassLoader cl = getClass().getClassLoader();
      if (cl == null) cl = ClassLoader.getSystemClassLoader();
      Enumeration<URL> resources = cl.getResources("META-INF/mateu/route-registrations");
      while (resources.hasMoreElements()) {
        URL url = resources.nextElement();
        List<Map<String, String>> entries = parseIndexFile(url);
        for (Map<String, String> entry : entries) {
          String className = entry.get("class");
          if (className == null || compiledClassNames.contains(className)) {
            continue;
          }
          String simpleClassName = entry.getOrDefault("simpleClassName", className);
          String routesRaw = entry.getOrDefault("routes", "");

          List<io.mateu.uidl.interfaces.RouteValue> routes = new ArrayList<>();
          if (!routesRaw.isEmpty()) {
            for (String routePart : routesRaw.split(";")) {
              String[] parts = routePart.split("\\|", -1);
              String value = parts.length > 0 ? parts[0] : "";
              String parentRoute = parts.length > 1 ? parts[1] : "";
              routes.add(
                  new io.mateu.uidl.interfaces.RouteValue(
                      value, parentRoute, toRegex(value), toRegex(parentRoute)));
            }
          }

          System.out.println(
              "RouteAnnotationProcessor processing indexed route: " + simpleClassName);

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
            createRouteHandlerFromModel(
                generatedFullClassName,
                pkgName,
                className,
                simpleClassName,
                generatedClassName,
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

  private List<Map<String, String>> parseIndexFile(URL url) throws IOException {
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

  public static String toRegex(String route) {
    if (route == null) return "";
    return Arrays.stream(route.split("/"))
        .map(token -> token.startsWith(":") ? ".*" : token)
        .collect(Collectors.joining("/"));
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

  public Filer getFiler() {
    return processingEnv.getFiler();
  }

  public static void createRouteHandler(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      Element e,
      String generatedClassName,
      String caption,
      List<io.mateu.uidl.interfaces.RouteValue> paths,
      Filer filer)
      throws IOException {
    createRouteHandlerFromModel(
        generatedFullClassName,
        pkgName,
        className,
        simpleClassName,
        generatedClassName,
        caption,
        paths,
        filer);
  }

  public static void createRouteHandlerFromModel(
      String generatedFullClassName,
      String pkgName,
      String className,
      String simpleClassName,
      String generatedClassName,
      String caption,
      List<io.mateu.uidl.interfaces.RouteValue> paths,
      Filer filer)
      throws IOException {
    JavaFileObject builderFile = filer.createSourceFile(generatedFullClassName);
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
