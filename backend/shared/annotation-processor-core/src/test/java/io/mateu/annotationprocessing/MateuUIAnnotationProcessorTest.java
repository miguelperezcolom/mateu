package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import io.mateu.uidl.annotations.MateuUI;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.file.Files;
import java.util.Set;
import javax.annotation.processing.Filer;
import javax.annotation.processing.RoundEnvironment;
import javax.lang.model.element.Element;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;
import org.junit.Test;

public class MateuUIAnnotationProcessorTest {

  @Test
  public void runs() throws IOException {
    var processor = mock(MateuUIAnnotationProcessor.class);
    when(processor.process(any(), any())).thenCallRealMethod();

    var filer = mock(Filer.class);
    var javaFileObject = mock(JavaFileObject.class);
    Writer writer = new StringWriter();
    when(javaFileObject.openWriter()).thenReturn(writer);
    when(filer.createSourceFile(any())).thenReturn(javaFileObject);
    when(processor.getFiler()).thenReturn(filer);
    var mateuUiAnnotation = mock(MateuUI.class);
    when(mateuUiAnnotation.value()).thenReturn("/");
    var mateuUi = mock(TypeElement.class);
    Set<? extends TypeElement> annotations = Set.of(mateuUi);
    RoundEnvironment roundEnv = mock(RoundEnvironment.class);
    var helloWorld = mock(TypeElement.class);
    when(helloWorld.toString()).thenReturn("com.example.HelloWorld");
    var name = mock(Name.class);
    when(name.toString()).thenReturn("com.example.HelloWorld");
    when(helloWorld.getQualifiedName()).thenReturn(name);
    var simpleName = mock(Name.class);
    when(simpleName.toString()).thenReturn("HelloWorld");
    when(helloWorld.getSimpleName()).thenReturn(simpleName);
    when(helloWorld.getAnnotation(any())).thenReturn(null);
    when(helloWorld.getAnnotation(MateuUI.class)).thenReturn(mateuUiAnnotation);

    Set<? extends Element> annotatedTypes = Set.of(helloWorld);
    when(roundEnv.getElementsAnnotatedWith(any(TypeElement.class)))
        .then(invocation -> annotatedTypes);
    var worked = processor.process(annotations, roundEnv);
    assertThat(worked).isTrue();
  }

  // @Test
  public void configIsGeneratedAsExpected() throws IOException {
    File expected =
        new File(getClass().getResource("/testcases/helloworld/HelloWorldConfig.java").getFile());
    File generated =
        new File(
            "target/generated-test-sources/test-annotations/io/mateu/annotationProcessing/testcases/helloworld/HelloWorldConfig.java");
    assertThat(generated).exists();
    assertThat(read(generated)).isEqualToIgnoringWhitespace(read(expected));
  }

  private String read(File file) throws IOException {
    return String.valueOf(Files.readAllLines(file.toPath()));
  }

  // @Test
  public void controllerIsGeneratedAsExpected() throws IOException {
    File expected =
        new File(
            getClass().getResource("/testcases/helloworld/HelloWorldController.java").getFile());
    File generated =
        new File(
            "target/generated-test-sources/test-annotations/io/mateu/annotationProcessing/testcases/helloworld/HelloWorldController.java");
    assertThat(generated).exists();
    assertThat(read(generated)).isEqualToIgnoringWhitespace(read(expected));
  }

  // @Test
  public void mateuControllerIsGeneratedAsExpected() throws IOException {
    File expected =
        new File(
            getClass()
                .getResource("/testcases/helloworld/HelloWorldMateuController.java")
                .getFile());
    File generated =
        new File(
            "target/generated-test-sources/test-annotations/io/mateu/annotationProcessing/testcases/helloworld/HelloWorldMateuController.java");
    assertThat(generated).exists();
    assertThat(read(generated)).isEqualToIgnoringWhitespace(read(expected));
  }
}
