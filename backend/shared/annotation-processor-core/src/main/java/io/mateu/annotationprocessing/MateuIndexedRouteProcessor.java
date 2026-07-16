package io.mateu.annotationprocessing;

import java.util.HashSet;
import java.util.Set;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;

/**
 * Companion to {@link RouteAnnotationProcessor} that handles @Route classes coming from indexed
 * dependencies (META-INF/mateu/route-registrations) even when the current compilation unit has
 * no @Route source files.
 *
 * <p>Without this processor, a composition module that only aggregates library modules with
 * indexed @Route views (e.g. a shell app whose views live in feature modules compiled with the
 * indexer) would generate no RouteResolvers at all, because javac never invokes {@link
 * RouteAnnotationProcessor} when none of its supported annotations appear in the sources being
 * compiled. Declaring {@code @SupportedAnnotationTypes("*")} ensures this processor is invoked in
 * every compilation. If source-level @Route classes are present, {@link RouteAnnotationProcessor}
 * already processes the index, so this processor skips to avoid duplicate file generation. Mirrors
 * {@link MateuIndexedUIProcessor}.
 */
@SupportedAnnotationTypes("*")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuIndexedRouteProcessor extends RouteAnnotationProcessor {

  private final Set<String> sourceCompiledClassNames = new HashSet<>();
  private boolean done = false;

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    // Accumulate source-level @Route/@Routes class names across all non-final rounds.
    for (String annotationName :
        new String[] {"io.mateu.uidl.annotations.Route", "io.mateu.uidl.annotations.Routes"}) {
      TypeElement routeType = processingEnv.getElementUtils().getTypeElement(annotationName);
      if (routeType != null) {
        for (Element e : roundEnv.getElementsAnnotatedWith(routeType)) {
          sourceCompiledClassNames.add(((TypeElement) e).getQualifiedName().toString());
        }
      }
    }

    // In the final round: only run indexed processing if RouteAnnotationProcessor
    // was NOT triggered (i.e. no source-level @Route classes in this compilation unit).
    if (roundEnv.processingOver() && !done) {
      done = true;
      if (sourceCompiledClassNames.isEmpty()) {
        processIndexedRoutes(Set.of());
      }
    }

    return false; // never claim any annotation — let other processors handle them
  }
}
