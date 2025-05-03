package io.mateu.core.infra;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class InputStreamReaderTest {

  final String sampleContent =
      """
Hola
que tal?
""";

  @Test
  void fileIsRead() {
    var content =
        InputStreamReader.readFromClasspath(
            InputStreamReaderTest.class, "/io/mateu/core/infra/inputstreamreader/sample-file.txt");
    assertEquals(sampleContent, content);
  }

  @Test
  void exceptionIsThrown() {
    var exception =
        assertThrows(
            RuntimeException.class,
            () -> InputStreamReader.readFromClasspath(InputStreamReaderTest.class, "xxx"));
    assertEquals(exception.getMessage(), "Resource not found: xxx");
  }
}
