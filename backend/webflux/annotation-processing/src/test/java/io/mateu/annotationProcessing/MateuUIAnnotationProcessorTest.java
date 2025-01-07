package io.mateu.annotationProcessing;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import org.junit.Test;

public class MateuUIAnnotationProcessorTest {

  @Test
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

  @Test
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

  @Test
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
