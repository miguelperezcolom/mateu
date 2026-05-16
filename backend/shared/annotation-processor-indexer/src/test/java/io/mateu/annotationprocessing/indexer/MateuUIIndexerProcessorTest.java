package io.mateu.annotationprocessing.indexer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import io.mateu.uidl.annotations.KeycloakSecured;
import io.mateu.uidl.annotations.UI;
import java.io.IOException;
import java.io.StringWriter;
import java.util.Set;
import javax.annotation.processing.Filer;
import javax.annotation.processing.ProcessingEnvironment;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.tools.FileObject;
import org.junit.Test;

public class MateuUIIndexerProcessorTest {

  // ---------------------------------------------------------------------------
  // Helper
  // ---------------------------------------------------------------------------

  private TestContext buildContext(
      String className, String simpleName, String path, KeycloakSecured keycloak)
      throws IOException {
    var processor = new MateuUIIndexerProcessor();

    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var fileObject = mock(FileObject.class);
    when(fileObject.openWriter()).thenReturn(writer);
    when(filer.createResource(any(), anyString(), anyString())).thenReturn(fileObject);

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
    when(element.getAnnotation(KeycloakSecured.class)).thenReturn(keycloak);

    var annotation = mock(TypeElement.class);
    Set<TypeElement> annotations = Set.of(annotation);

    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .thenAnswer(inv -> Set.of(element));

    return new TestContext(processor, filer, writer, annotations, roundEnv);
  }

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  @Test
  public void processReturnsFalseSoFrameworkAPCanAlsoSeeAnnotation() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    when(ctx.roundEnv.processingOver()).thenReturn(false);

    boolean result = ctx.processor.process(ctx.annotations, ctx.roundEnv);

    assertThat(result).isFalse();
  }

  @Test
  public void noIndexFileWrittenUntilProcessingOver() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    when(ctx.roundEnv.processingOver()).thenReturn(false);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    verify(ctx.filer, never()).createResource(any(), anyString(), anyString());
  }

  @Test
  public void indexFileWrittenOnProcessingOver() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    // First round: accumulate entries
    when(ctx.roundEnv.processingOver()).thenReturn(false);
    ctx.processor.process(ctx.annotations, ctx.roundEnv);
    // Final round: processingOver = true, no new elements
    when(ctx.roundEnv.processingOver()).thenReturn(true);
    when(ctx.roundEnv.getElementsAnnotatedWith(any(TypeElement.class))).thenAnswer(inv -> Set.of());
    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    verify(ctx.filer).createResource(any(), eq(""), eq("META-INF/mateu/ui-registrations"));
  }

  @Test
  public void writtenIndexContainsClassName() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    assertThat(ctx.writer.toString()).contains("class=com.example.MyApp");
    assertThat(ctx.writer.toString()).contains("simpleClassName=MyApp");
  }

  @Test
  public void writtenIndexContainsPath() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    assertThat(ctx.writer.toString()).contains("path=/admin");
  }

  @Test
  public void writtenIndexContainsFrontendPaths() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.writer.toString();
    assertThat(content).contains("indexHtmlPath=/static/_index.html");
    assertThat(content).contains("frontendComponentPath=/assets/mateu.js");
  }

  @Test
  public void writtenIndexContainsEmptyKeycloakFieldsWhenNotAnnotated() throws IOException {
    var ctx = buildContext("com.example.MyApp", "MyApp", "/admin", null);
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.writer.toString();
    assertThat(content).contains("keycloakUrl=\n");
    assertThat(content).contains("keycloakRealm=\n");
    assertThat(content).contains("keycloakClientId=\n");
  }

  @Test
  public void writtenIndexContainsKeycloakFieldsWhenAnnotated() throws IOException {
    var keycloak = mock(KeycloakSecured.class);
    when(keycloak.url()).thenReturn("https://auth.example.com/auth");
    when(keycloak.realm()).thenReturn("my-realm");
    when(keycloak.clientId()).thenReturn("my-client");
    when(keycloak.jsUrl()).thenReturn("https://esm.sh/keycloak-js@26.2.2");

    var ctx = buildContext("com.example.SecuredApp", "SecuredApp", "/secure", keycloak);
    when(ctx.roundEnv.processingOver()).thenReturn(true);

    ctx.processor.process(ctx.annotations, ctx.roundEnv);

    String content = ctx.writer.toString();
    assertThat(content).contains("keycloakUrl=https://auth.example.com/auth");
    assertThat(content).contains("keycloakRealm=my-realm");
    assertThat(content).contains("keycloakClientId=my-client");
  }

  @Test
  public void multipleUIClassesAreSeparatedByDashes() throws IOException {
    var processor = new MateuUIIndexerProcessor();
    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var writer = new StringWriter();
    var fileObject = mock(FileObject.class);
    when(fileObject.openWriter()).thenReturn(writer);
    when(filer.createResource(any(), anyString(), anyString())).thenReturn(fileObject);

    // Build two elements
    var uiA = mockUI("/a");
    var uiB = mockUI("/b");
    var elemA = mockElement("com.example.AppA", "AppA", uiA, null);
    var elemB = mockElement("com.example.AppB", "AppB", uiB, null);

    var annotation = mock(TypeElement.class);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .thenAnswer(inv -> Set.of(elemA, elemB));
    when(roundEnv.processingOver()).thenReturn(true);

    processor.process(Set.of(annotation), roundEnv);

    String content = writer.toString();
    assertThat(content).contains("---");
    // Both classes must appear
    assertThat(content).contains("com.example.AppA");
    assertThat(content).contains("com.example.AppB");
  }

  @Test
  public void noIndexFileWrittenWhenNoUIClassesPresent() throws IOException {
    var processor = new MateuUIIndexerProcessor();
    var processingEnv = mock(ProcessingEnvironment.class);
    var filer = mock(Filer.class);
    when(processingEnv.getFiler()).thenReturn(filer);
    processor.init(processingEnv);

    var annotation = mock(TypeElement.class);
    var roundEnv = mock(RoundEnvironment.class);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class))).thenAnswer(inv -> Set.of());
    when(roundEnv.processingOver()).thenReturn(true);

    processor.process(Set.of(annotation), roundEnv);

    verify(filer, never()).createResource(any(), anyString(), anyString());
  }

  // ---------------------------------------------------------------------------
  // Helpers for building mocks
  // ---------------------------------------------------------------------------

  private UI mockUI(String path) {
    var ui = mock(UI.class);
    when(ui.value()).thenReturn(path);
    when(ui.indexHtmlPath()).thenReturn("/static/_index.html");
    when(ui.frontendComponentPath()).thenReturn("/assets/mateu.js");
    return ui;
  }

  private TypeElement mockElement(
      String className, String simpleName, UI ui, KeycloakSecured keycloak) {
    var element = mock(TypeElement.class);
    var qualifiedName = mock(Name.class);
    when(qualifiedName.toString()).thenReturn(className);
    when(element.getQualifiedName()).thenReturn(qualifiedName);
    var simpleName2 = mock(Name.class);
    when(simpleName2.toString()).thenReturn(simpleName);
    when(element.getSimpleName()).thenReturn(simpleName2);
    when(element.getAnnotation(any())).thenReturn(null);
    when(element.getAnnotation(UI.class)).thenReturn(ui);
    when(element.getAnnotation(KeycloakSecured.class)).thenReturn(keycloak);
    return element;
  }

  private record TestContext(
      MateuUIIndexerProcessor processor,
      Filer filer,
      StringWriter writer,
      Set<TypeElement> annotations,
      RoundEnvironment roundEnv) {}
}
