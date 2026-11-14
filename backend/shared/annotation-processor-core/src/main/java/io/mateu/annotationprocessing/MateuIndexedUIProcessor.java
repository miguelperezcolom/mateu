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
 *
 * <p>The controllers are generated the FIRST time this processor runs, never in the last round: a
 * source file created in the round where {@code processingOver()} is true is compiled but handed to
 * no processor, so a framework whose own annotation processor turns controllers into beans at
 * compile time (Micronaut's bean-definition processor) never registered them and every mount of a
 * UI living only in a UI module answered 404. The index is readable from the start (it comes from
 * the processor path, not from the sources).
 */
@SupportedAnnotationTypes("*")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuIndexedUIProcessor extends MateuUIAnnotationProcessor {

  static final String MATEU_CONTROLLER_SUFFIX = "MateuController";

  private boolean done = false;

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    if (done) {
      return false;
    }
    done = true;
    // Source-level routed classes in this round: MateuUIAnnotationProcessor runs on them and reads
    // the index itself.
    if (hasRoutedSources(roundEnv)) {
      return false;
    }
    // javac calls a "*" processor only while some annotation of the round is unclaimed, so this
    // can be a LATER round than the one MateuUIAnnotationProcessor ran in: the controllers it
    // generated are then this round's root elements, and are not generated a second time.
    processIndexedUIs(mountsGeneratedBefore(roundEnv));
    return false; // never claim any annotation — let other processors handle them
  }

  private boolean hasRoutedSources(RoundEnvironment roundEnv) {
    for (String annotation :
        new String[] {"io.mateu.uidl.annotations.UI", "io.mateu.uidl.annotations.App"}) {
      TypeElement type = processingEnv.getElementUtils().getTypeElement(annotation);
      if (type == null) {
        continue;
      }
      for (Element e : roundEnv.getElementsAnnotatedWith(type)) {
        if (e instanceof TypeElement) {
          return true;
        }
      }
    }
    return false;
  }

  /** The mounts whose controllers an earlier round of this compilation already generated. */
  private static Set<String> mountsGeneratedBefore(RoundEnvironment roundEnv) {
    Set<String> mounts = new HashSet<>();
    for (Element e : roundEnv.getRootElements()) {
      if (e instanceof TypeElement) {
        String name = ((TypeElement) e).getQualifiedName().toString();
        if (name.endsWith(MATEU_CONTROLLER_SUFFIX)) {
          mounts.add(name.substring(0, name.length() - MATEU_CONTROLLER_SUFFIX.length()));
        }
      }
    }
    return mounts;
  }
}
