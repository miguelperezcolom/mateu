package io.mateu.annotationprocessing.indexer;

import com.google.auto.service.AutoService;
import io.mateu.uidl.annotations.KeycloakSecured;
import io.mateu.uidl.annotations.Link;
import io.mateu.uidl.annotations.Meta;
import io.mateu.uidl.annotations.Script;
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

        Script[] scripts = e.getAnnotationsByType(Script.class);
        for (int i = 0; i < scripts.length; i++) {
          sb.append("script.").append(i).append(".src=").append(scripts[i].src()).append("\n");
          sb.append("script.").append(i).append(".type=").append(scripts[i].type()).append("\n");
          sb.append("script.")
              .append(i)
              .append(".crossorigin=")
              .append(scripts[i].crossorigin())
              .append("\n");
          sb.append("script.").append(i).append(".defer=").append(scripts[i].defer()).append("\n");
          sb.append("script.").append(i).append(".async=").append(scripts[i].async()).append("\n");
        }

        Link[] links = e.getAnnotationsByType(Link.class);
        for (int i = 0; i < links.length; i++) {
          sb.append("link.").append(i).append(".rel=").append(links[i].rel()).append("\n");
          sb.append("link.").append(i).append(".href=").append(links[i].href()).append("\n");
          sb.append("link.").append(i).append(".type=").append(links[i].type()).append("\n");
          sb.append("link.").append(i).append(".as=").append(links[i].as()).append("\n");
          sb.append("link.")
              .append(i)
              .append(".crossorigin=")
              .append(links[i].crossorigin())
              .append("\n");
        }

        Meta[] metas = e.getAnnotationsByType(Meta.class);
        for (int i = 0; i < metas.length; i++) {
          sb.append("meta.").append(i).append(".name=").append(metas[i].name()).append("\n");
          sb.append("meta.").append(i).append(".content=").append(metas[i].content()).append("\n");
          sb.append("meta.")
              .append(i)
              .append(".httpEquiv=")
              .append(metas[i].httpEquiv())
              .append("\n");
          sb.append("meta.").append(i).append(".charset=").append(metas[i].charset()).append("\n");
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
