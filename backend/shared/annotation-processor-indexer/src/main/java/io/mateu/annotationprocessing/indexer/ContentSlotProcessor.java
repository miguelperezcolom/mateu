package io.mateu.annotationprocessing.indexer;

import com.google.auto.service.AutoService;
import io.mateu.uidl.annotations.ContentSlot;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.Processor;
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
 * <p>Its own processor, not a part of the indexer's: a single-module app is compiled with its
 * FRAMEWORK annotation processor only (mvc, webflux…), which lists this class too. On a processor
 * path that carries both, the service loader instantiates it once.
 */
@AutoService(Processor.class)
@SupportedAnnotationTypes("io.mateu.uidl.annotations.ContentSlot")
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class ContentSlotProcessor extends AbstractProcessor {

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
          out.print(slots.toJson(MateuUIIndexerProcessor.MATEU_VERSION));
        }
      } catch (IOException e) {
        e.printStackTrace();
      }
    }
    return false;
  }
}
