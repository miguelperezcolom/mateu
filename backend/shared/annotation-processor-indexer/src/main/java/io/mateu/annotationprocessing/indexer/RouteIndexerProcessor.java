package io.mateu.annotationprocessing.indexer;

import com.google.auto.service.AutoService;
import io.mateu.uidl.annotations.Route;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.Filer;
import javax.annotation.processing.Processor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.FileObject;
import javax.tools.StandardLocation;

/**
 * Framework-agnostic annotation processor that indexes @Route classes into
 * META-INF/mateu/route-registrations so that framework-specific APs can read them from the
 * classpath of dependent modules without needing the sources.
 */
@AutoService(Processor.class)
@SupportedAnnotationTypes({"io.mateu.uidl.annotations.Route", "io.mateu.uidl.annotations.Routes"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class RouteIndexerProcessor extends AbstractProcessor {

  /** Accumulated entries across all processing rounds. key = fully-qualified class name */
  private final Map<String, String> entries = new LinkedHashMap<>();

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    // Collect all elements annotated with @Route or @Routes, deduplicating by class name
    Set<Element> allElements = new java.util.LinkedHashSet<>();
    for (TypeElement annotation : annotations) {
      allElements.addAll(roundEnv.getElementsAnnotatedWith(annotation));
    }

    for (Element e : allElements) {
      String className = ((TypeElement) e).getQualifiedName().toString();
      String simpleClassName = e.getSimpleName().toString();

      Route[] routeAnnotations =
          Optional.ofNullable(e.getAnnotationsByType(Route.class)).orElse(new Route[0]);

      StringBuilder sb = new StringBuilder();
      sb.append("class=").append(className).append("\n");
      sb.append("simpleClassName=").append(simpleClassName).append("\n");

      // Serialize each Route annotation as "value|parentRoute|uis..."
      String routes =
          Arrays.stream(routeAnnotations)
              .map(
                  r -> {
                    String uis = r.uis().length > 0 ? String.join(",", r.uis()) : "";
                    return r.value() + "|" + r.parentRoute() + "|" + uis;
                  })
              .collect(Collectors.joining(";"));
      sb.append("routes=").append(routes).append("\n");

      entries.put(className, sb.toString());
      System.out.println("RouteIndexerProcessor indexed " + simpleClassName);
    }

    if (roundEnv.processingOver() && !entries.isEmpty()) {
      writeIndex();
    }

    // Return false so that framework-specific APs can still see @Route in the same compilation
    return false;
  }

  private void writeIndex() {
    Filer filer = processingEnv.getFiler();
    try {
      FileObject resource =
          filer.createResource(
              StandardLocation.CLASS_OUTPUT, "", "META-INF/mateu/route-registrations");
      try (PrintWriter out = new PrintWriter(resource.openWriter())) {
        boolean first = true;
        for (String entry : entries.values()) {
          if (!first) {
            out.println("---");
          }
          out.print(entry);
          first = false;
        }
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
