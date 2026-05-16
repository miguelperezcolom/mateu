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
 * Companion to {@link MateuUIAnnotationProcessor} that handles @UI classes coming from indexed
 * dependencies (META-INF/mateu/ui-registrations) even when the current compilation unit has no @UI
 * source files.
 *
 * <p>Declaring {@code @SupportedAnnotationTypes("*")} ensures this processor is invoked in every
 * compilation, including modules that only depend on a module with @UI classes. If source-level @UI
 * classes are present, {@link MateuUIAnnotationProcessor} already processes the index, so this
 * processor skips to avoid duplicate file generation.
 */
@SupportedAnnotationTypes("*")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuIndexedUIProcessor extends MateuUIAnnotationProcessor {

  private final Set<String> sourceCompiledClassNames = new HashSet<>();
  private boolean done = false;

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    // Accumulate source-level @UI class names across all non-final rounds.
    TypeElement uiType =
        processingEnv.getElementUtils().getTypeElement("io.mateu.uidl.annotations.UI");
    if (uiType != null) {
      for (Element e : roundEnv.getElementsAnnotatedWith(uiType)) {
        sourceCompiledClassNames.add(((TypeElement) e).getQualifiedName().toString());
      }
    }

    // In the final round: only run indexed processing if MateuUIAnnotationProcessor
    // was NOT triggered (i.e. no source-level @UI classes in this compilation unit).
    if (roundEnv.processingOver() && !done) {
      done = true;
      if (sourceCompiledClassNames.isEmpty()) {
        processIndexedUIs(Set.of());
      }
    }

    return false; // never claim any annotation — let other processors handle them
  }
}
