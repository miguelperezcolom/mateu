package io.mateu.annotationprocessing.indexer;

import io.mateu.uidl.annotations.ContentSlot;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.TypeElement;
import javax.tools.StandardLocation;

/**
 * Checks the {@code @ContentSlot} keys of the module being compiled (a malformed or repeated key is
 * a compile error) and writes them to {@code META-INF/mateu/content-slots.json}.
 *
 * <p>Its own processor in its own jar, with NO services file: it runs where a services file names
 * it — the indexer's and every framework annotation processor's (mvc, webflux…), since a
 * single-module app is compiled with its framework AP only. On a processor path that carries both,
 * the service loader instantiates it once. Being a dependency of the framework APs never makes the
 * INDEXER run.
 */
@SupportedAnnotationTypes("io.mateu.uidl.annotations.ContentSlot")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class ContentSlotProcessor extends AbstractProcessor {

  /** This processor's own Mateu version (Maven's pom.properties), or null outside a jar. */
  static final String MATEU_VERSION =
      versionFrom(
          ContentSlotProcessor.class.getResourceAsStream(
              "/META-INF/maven/io.mateu/mateu-annotation-processor-slots/pom.properties"));

  /**
   * The {@code version} of a Maven {@code pom.properties} stream (closed here); null when absent or
   * blank.
   */
  static String versionFrom(java.io.InputStream stream) {
    if (stream == null) {
      return null;
    }
    try (var in = stream) {
      var properties = new java.util.Properties();
      properties.load(in);
      var version = properties.getProperty("version", "").trim();
      return version.isEmpty() ? null : version;
    } catch (IOException e) {
      return null;
    }
  }

  private final ContentSlotIndex slots = new ContentSlotIndex();

  @Override
  public SourceVersion getSupportedSourceVersion() {
    return SourceVersion.latestSupported();
  }

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (Element e : roundEnv.getElementsAnnotatedWith(ContentSlot.class)) {
      slots.add(e, processingEnv.getMessager());
    }
    if (roundEnv.processingOver() && !slots.isEmpty()) {
      try {
        var resource =
            processingEnv
                .getFiler()
                .createResource(StandardLocation.CLASS_OUTPUT, "", ContentSlotIndex.RESOURCE);
        try (var out = new PrintWriter(resource.openWriter())) {
          out.print(slots.toJson(MATEU_VERSION));
        }
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
    return false;
  }
}
