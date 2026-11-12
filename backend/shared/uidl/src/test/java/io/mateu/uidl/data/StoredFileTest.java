package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class StoredFileTest {

  @Test
  void theReferenceStringRoundTrips() {
    var file =
        new StoredFile("a/b c", "Café + más.pdf", "application/pdf", 1234, "https://x/y?z=1");
    var value = file.toValue();
    assertThat(value)
        .isEqualTo(
            "mateu-file:a%2Fb%20c?name=Caf%C3%A9%20%2B%20m%C3%A1s.pdf&type=application%2Fpdf"
                + "&size=1234&url=https%3A%2F%2Fx%2Fy%3Fz%3D1");
    assertThat(StoredFile.parse(value)).isEqualTo(file);
  }

  @Test
  void absentAndEmptyPartsAreLeftOut() {
    assertThat(new StoredFile("1", "", null, -1, null).toValue()).isEqualTo("mateu-file:1");
    assertThat(StoredFile.parse("mateu-file:1"))
        .isEqualTo(new StoredFile("1", null, null, -1, null));
  }

  @Test
  void aPlusIsAPlusAndOtherValuesAreNotReferences() {
    assertThat(StoredFile.parse("mateu-file:x?name=a+b").name()).isEqualTo("a+b");
    assertThat(StoredFile.parse("mateu-file:x?name=100%25&size=abc").name()).isEqualTo("100%");
    assertThat(StoredFile.parse("mateu-file:x?name=%zz").name()).isEqualTo("%zz");
    assertThat(StoredFile.parse("data:text/plain;base64,AA")).isNull();
    assertThat(StoredFile.parse(null)).isNull();
  }
}
