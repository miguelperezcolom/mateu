package io.mateu.annotationprocessing.indexer;

import com.google.auto.service.AutoService;
import io.mateu.uidl.annotations.KeycloakSecured;
import io.mateu.uidl.annotations.UI;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
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
 * Framework-agnostic annotation processor that indexes @UI classes into
 * META-INF/mateu/ui-registrations so that framework-specific APs can read them from the classpath
 * of dependent modules without needing the sources.
 */
@AutoService(Processor.class)
@SupportedAnnotationTypes({"io.mateu.uidl.annotations.UI"})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuUIIndexerProcessor extends AbstractProcessor {

  /** Accumulated entries across all processing rounds. key = fully-qualified class name */
  private final Map<String, String> entries = new LinkedHashMap<>();

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    for (TypeElement annotation : annotations) {
      for (Element e : roundEnv.getElementsAnnotatedWith(annotation)) {
        String className = ((TypeElement) e).getQualifiedName().toString();
        String simpleClassName = e.getSimpleName().toString();
        UI uiAnnotation = e.getAnnotation(UI.class);
        String path = uiAnnotation.value();
        String indexHtmlPath = uiAnnotation.indexHtmlPath();
        String frontendComponentPath = uiAnnotation.frontendComponentPath();

        StringBuilder sb = new StringBuilder();
        sb.append("class=").append(className).append("\n");
        sb.append("simpleClassName=").append(simpleClassName).append("\n");
        sb.append("path=").append(path).append("\n");
        sb.append("indexHtmlPath=").append(indexHtmlPath).append("\n");
        sb.append("frontendComponentPath=").append(frontendComponentPath).append("\n");

        KeycloakSecured keycloak = e.getAnnotation(KeycloakSecured.class);
        if (keycloak != null) {
          sb.append("keycloakUrl=").append(keycloak.url()).append("\n");
          sb.append("keycloakRealm=").append(keycloak.realm()).append("\n");
          sb.append("keycloakClientId=").append(keycloak.clientId()).append("\n");
          sb.append("keycloakJsUrl=").append(keycloak.jsUrl()).append("\n");
        } else {
          sb.append("keycloakUrl=\n");
          sb.append("keycloakRealm=\n");
          sb.append("keycloakClientId=\n");
          sb.append("keycloakJsUrl=\n");
        }

        entries.put(className, sb.toString());
        System.out.println("MateuUIIndexerProcessor indexed " + simpleClassName);
      }
    }

    if (roundEnv.processingOver() && !entries.isEmpty()) {
      writeIndex();
    }

    // Return false so that framework-specific APs can still see @UI in the same compilation
    return false;
  }

  private void writeIndex() {
    Filer filer = processingEnv.getFiler();
    try {
      FileObject resource =
          filer.createResource(
              StandardLocation.CLASS_OUTPUT, "", "META-INF/mateu/ui-registrations");
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
