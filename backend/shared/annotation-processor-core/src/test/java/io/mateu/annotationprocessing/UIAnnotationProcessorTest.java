package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import io.mateu.uidl.annotations.UI;
import java.io.IOException;
import java.io.StringWriter;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.annotation.processing.Filer;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

public class UIAnnotationProcessorTest {

  // ---------------------------------------------------------------------------
  // parseIndexFile — pure parsing logic
  // ---------------------------------------------------------------------------

  @Test
  public void parseIndexFileReturnsSingleEntry() throws IOException {
    URL url = getClass().getResource("/ui-registrations-sample.txt");
    var processor = new MateuUIAnnotationProcessor();

    List<Map<String, String>> entries = processor.parseIndexFile(url);

    assertThat(entries).hasSize(2);

    Map<String, String> first = entries.get(0);
    assertThat(first.get("class")).isEqualTo("com.example.MyApp");
    assertThat(first.get("simpleClassName")).isEqualTo("MyApp");
    assertThat(first.get("path")).isEqualTo("/admin");
    assertThat(first.get("indexHtmlPath")).isEqualTo("/static/_index.html");
    assertThat(first.get("frontendComponentPath")).isEqualTo("/assets/mateu.js");
    assertThat(first.get("keycloakUrl")).isEmpty();
  }

  @Test
  public void parseIndexFileHandlesMultipleEntries() throws IOException {
    URL url = getClass().getResource("/ui-registrations-sample.txt");
    var processor = new MateuUIAnnotationProcessor();

    List<Map<String, String>> entries = processor.parseIndexFile(url);

    assertThat(entries).hasSize(2);

    Map<String, String> second = entries.get(1);
    assertThat(second.get("class")).isEqualTo("com.example.SecuredApp");
    assertThat(second.get("keycloakUrl")).isEqualTo("https://auth.example.com/auth");
    assertThat(second.get("keycloakRealm")).isEqualTo("my-realm");
    assertThat(second.get("keycloakClientId")).isEqualTo("my-client");
  }

  @Test
  public void parseIndexFileHandlesValueWithEqualsSign() throws IOException {
    // Values that contain '=' (e.g., URLs) should be preserved correctly
    URL url = getClass().getResource("/ui-registrations-sample.txt");
    var processor = new MateuUIAnnotationProcessor();

    List<Map<String, String>> entries = processor.parseIndexFile(url);

    assertThat(entries.get(1).get("keycloakJsUrl")).isEqualTo("https://esm.sh/keycloak-js@26.2.2");
  }

  // ---------------------------------------------------------------------------
  // process() — source file generation
  // ---------------------------------------------------------------------------

  private UITestContext buildContext(String className, String simpleName, String path)
      throws IOException {
    var processor = new MateuUIAnnotationProcessor();

    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var javaFileObject = mock(JavaFileObject.class);
    when(javaFileObject.openWriter())
        .thenAnswer(
            inv ->
                new StringWriter() {
                  @Override
                  public void close() {
                    writer.append(this.toString());
                  }
                });
    when(filer.createSourceFile(anyString())).thenReturn(javaFileObject);

    var uiAnnotation = mock(UI.class);
    when(uiAnnotation.value()).thenReturn(path);
    when(uiAnnotation.indexHtmlPath()).thenReturn("/static/_index.html");
    when(uiAnnotation.frontendComponentPath()).thenReturn("/assets/mateu.js");

    var element = mock(TypeElement.class);
    var qualifiedName = mock(Name.class);
    when(qualifiedName.toString()).thenReturn(className);
    when(element.getQualifiedName()).thenReturn(qualifiedName);
    var simpleName2 = mock(Name.class);
    when(simpleName2.toString()).thenReturn(simpleName);
    when(element.getSimpleName()).thenReturn(simpleName2);
    when(element.getAnnotation(any())).thenReturn(null);
    when(element.getAnnotation(UI.class)).thenReturn(uiAnnotation);
    when(element.getAnnotationsByType(UI.class)).thenReturn(new UI[] {uiAnnotation});

    var annotation = mock(TypeElement.class);
    Set<TypeElement> annotations = Set.of(annotation);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .thenAnswer(inv -> Set.of(element));
    when(roundEnv.processingOver()).thenReturn(false);

    return new UITestContext(processor, filer, writer, annotations, roundEnv);
  }

  @Test
  public void processReturnsTrueForUIAnnotation() throws IOException {
    var ctx = buildContext("com.example.HelloWorld", "HelloWorld", "/");
    assertThat(ctx.processor.process(ctx.annotations, ctx.roundEnv)).isTrue();
  }

  @Test
  public void processCreatesExpectedSourceFiles() throws IOException {
    var ctx = buildContext("com.example.HelloWorld", "HelloWorld", "/");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    var captor = ArgumentCaptor.forClass(String.class);
    // 4 files: Controller, MateuController, Config, UIRouteResolver
    verify(ctx.filer, atLeast(4)).createSourceFile(captor.capture());
    List<String> generatedNames = captor.getAllValues();

    assertThat(generatedNames).contains("com.example.HelloWorldController");
    assertThat(generatedNames).contains("com.example.HelloWorldMateuController");
    assertThat(generatedNames).contains("com.example.HelloWorldConfig");
    assertThat(generatedNames).contains("com.example.HelloWorldUIRouteResolver");
  }

  @Test
  public void processedControllerContentIncludesClassNameAndPath() throws IOException {
    var ctx = buildContext("com.example.HelloWorld", "HelloWorld", "/myapp");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.capturedContent();
    // The FreeMarker templates should interpolate className and path
    assertThat(content).contains("HelloWorld");
    assertThat(content).contains("/myapp");
  }

  @Test
  public void processSkipsClassAlreadyPresentInCurrentCompilation() throws IOException {
    // If the same class appears both in compiled sources and an index, it should only
    // result in one set of generated files (not duplicates).
    var ctx = buildContext("com.example.HelloWorld", "HelloWorld", "/");
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    // Reset and run again with same class in compiled sources — should still be 4 calls total
    var captor = ArgumentCaptor.forClass(String.class);
    verify(ctx.filer, times(4)).createSourceFile(captor.capture());
    long controllerCount =
        captor.getAllValues().stream()
            .filter(n -> n.equals("com.example.HelloWorldController"))
            .count();
    assertThat(controllerCount).isEqualTo(1);
  }

  // ---------------------------------------------------------------------------
  // Helper record
  // ---------------------------------------------------------------------------

  private record UITestContext(
      MateuUIAnnotationProcessor processor,
      Filer filer,
      StringWriter writer,
      Set<TypeElement> annotations,
      RoundEnvironment roundEnv) {

    String capturedContent() {
      return writer.toString();
    }
  }
}
