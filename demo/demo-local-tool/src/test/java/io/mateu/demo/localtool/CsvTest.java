package io.mateu.demo.localtool;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CsvTest {

  @Test
  void headerRowNamesTheKeys() {
    assertThat(Csv.toJson("name,age\nAna,34\nLuis,\n"))
        .isEqualTo("[\n  {\"name\": \"Ana\", \"age\": \"34\"},\n  {\"name\": \"Luis\", \"age\": \"\"}\n]");
  }

  @Test
  void quotedFieldsKeepSeparatorsQuotesAndLineBreaks() {
    assertThat(Csv.toJson("a;b\r\n\"x;y\";\"say \"\"hi\"\"\nthere\"\r\n"))
        .isEqualTo("[\n  {\"a\": \"x;y\", \"b\": \"say \\\"hi\\\"\\nthere\"}\n]");
  }

  @Test
  void emptyInputIsAnEmptyArray() {
    assertThat(Csv.toJson("")).isEqualTo("[]");
    assertThat(Csv.toJson("only,header")).isEqualTo("[]");
  }
}
