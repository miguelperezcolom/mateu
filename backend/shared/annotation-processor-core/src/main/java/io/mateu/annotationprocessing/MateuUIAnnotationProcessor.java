package io.mateu.annotationprocessing;

import static io.mateu.annotationprocessing.UISourceFileGenerator.createRouteHandler;
import static io.mateu.annotationprocessing.UISourceFileGenerator.toRegex;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.RouteValue;
import java.io.IOException;
import java.util.*;
import java.util.List;
import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic.Kind;

@SupportedAnnotationTypes({"io.mateu.uidl.annotations.UI", "io.mateu.uidl.annotations.App"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuUIAnnotationProcessor extends AbstractProcessor {

  private boolean indexedUIsProcessed = false;

  /**
   * The route a class declares (coherence-plan #5): {@code @App(route = "/x")} wins over
   * {@code @UI("/x")} when both are non-blank; a value-less {@code @App} (chrome only) carries no
   * route. Returns {@code null} when the class declares no route.
   */
  private static String routeOf(Element e) {
    App app = e.getAnnotation(App.class);
    if (app != null && app.route() != null && !app.route().isBlank()) {
      return app.route();
    }
    UI ui = e.getAnnotation(UI.class);
    return ui != null ? ui.value() : null;
  }

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    Set<String> compiledClassNames = new HashSet<>();

    // Collect the routed classes across BOTH @UI and @App(route = ...), deduped by name: a class
    // carrying both annotations must generate its controller ONCE (routeOf resolves which route).
    Map<String, Element> routed = new LinkedHashMap<>();
    for (TypeElement annotation : annotations) {
      for (Element e : roundEnv.getElementsAnnotatedWith(annotation)) {
        if (e instanceof TypeElement && routeOf(e) != null) {
          routed.putIfAbsent(((TypeElement) e).getQualifiedName().toString(), e);
        }
      }
    }

    {
      for (Element e : routed.values()) {
        String className = ((TypeElement) e).getQualifiedName().toString();
        compiledClassNames.add(className);
        String simpleClassName = e.getSimpleName().toString();
        String path = routeOf(e);

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
          // The class's single declared route (from @UI or @App(route)); an empty path keeps the
          // legacy double-entry the @UI path produced (a value + an explicit empty route).
          List<RouteValue> routes = new ArrayList<>();
          routes.add(new RouteValue(path, "_empty", toRegex(path), toRegex("_empty")));
          if (path.isEmpty()) {
            routes.add(new RouteValue("", "_empty", toRegex(""), toRegex("_empty")));
          }
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
          processingEnv
              .getMessager()
              .printMessage(
                  Kind.ERROR,
                  "[Mateu] Failed to generate controller for "
                      + simpleClassName
                      + ": "
                      + ex.getMessage(),
                  e);
        }
      }
    }

    // Only once per compilation: javac keeps invoking a processor on every round after its
    // first invocation, and re-running would attempt to recreate the generated files.
    if (!indexedUIsProcessed) {
      indexedUIsProcessed = true;
      processIndexedUIs(compiledClassNames);
    }

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
