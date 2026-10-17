package io.mateu.core.application.openapi;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import org.junit.jupiter.api.Test;

/**
 * The server generator turns each response schema of the derived contract into Java records: every
 * OpenAPI type/format gets its Java type, nested objects and arrays of objects get records of their
 * own (named after the property, singularised for arrays), and the operation's return type is the
 * record, a list of it, or the plain Java type.
 */
class SchemaToJavaTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  private static JsonNode schema(String json) throws Exception {
    return JSON.readTree(json);
  }

  @Test
  void everyOpenApiTypeAndFormatHasItsJavaType() throws Exception {
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"integer\"}"))).isEqualTo("Integer");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"integer\",\"format\":\"int64\"}")))
        .isEqualTo("Long");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"number\",\"format\":\"double\"}")))
        .isEqualTo("Double");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"number\"}")))
        .isEqualTo("java.math.BigDecimal");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"boolean\"}"))).isEqualTo("Boolean");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"object\"}")))
        .isEqualTo("java.util.Map<String, Object>");
    assertThat(
            SchemaToJava.javaType(
                schema("{\"type\":\"array\",\"items\":{\"type\":\"string\",\"format\":\"date\"}}")))
        .isEqualTo("java.util.List<java.time.LocalDate>");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"string\",\"format\":\"date-time\"}")))
        .isEqualTo("java.time.OffsetDateTime");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"string\",\"format\":\"time\"}")))
        .isEqualTo("java.time.LocalTime");
    assertThat(SchemaToJava.javaType(schema("{\"type\":\"string\",\"format\":\"uuid\"}")))
        .isEqualTo("String");
    assertThat(SchemaToJava.javaType(schema("{}"))).isEqualTo("String");
    assertThat(SchemaToJava.javaType(null)).isEqualTo("String");
  }

  @Test
  void importsAndSimpleNamesOfGeneratedTypes() {
    assertThat(SchemaToJava.importOf("java.time.LocalDate")).contains("java.time.LocalDate");
    assertThat(SchemaToJava.importOf("java.util.List<java.time.LocalDate>"))
        .contains("java.util.List");
    assertThat(SchemaToJava.importOf("java.lang.Integer")).isEmpty();
    assertThat(SchemaToJava.importOf("String")).isEmpty();
    assertThat(SchemaToJava.importOf(" ")).isEmpty();
    assertThat(SchemaToJava.simpleName("java.util.List<java.time.LocalDate>"))
        .isEqualTo("List<LocalDate>");
    assertThat(SchemaToJava.simpleName(null)).isEqualTo("String");
  }

  @Test
  void anObjectResponseBecomesARecordWithNestedRecordsForObjectsAndArraysOfObjects()
      throws Exception {
    var records = new LinkedHashMap<String, String>();
    var returnType =
        SchemaToJava.returnTypeOf(
            "com.acme.api",
            "LibraryResponse",
            schema(
                """
                {"type":"object","properties":{
                  "name":{"type":"string"},
                  "opened":{"type":"string","format":"date"},
                  "tags":{"type":"array","items":{"type":"string"}},
                  "address":{"type":"object","properties":{"street":{"type":"string"}}},
                  "books":{"type":"array","items":{"type":"object","properties":{
                      "title":{"type":"string"},"pages":{"type":"integer"}}}},
                  "categories":{"type":"array","items":{"type":"object","properties":{
                      "code":{"type":"string"}}}},
                  "news":{"type":"array","items":{"type":"object","properties":{
                      "headline":{"type":"string"}}}},
                  "access":{"type":"array","items":{"type":"object","properties":{
                      "who":{"type":"string"}}}}
                }}
                """),
            records);

    assertThat(returnType).isEqualTo("LibraryResponse");
    assertThat(records)
        .containsOnlyKeys(
            "LibraryResponse",
            "LibraryAddress",
            "LibraryBook",
            "LibraryCategory",
            "LibraryNew",
            "LibraryAccessItem");
    var library = records.get("LibraryResponse");
    assertThat(library)
        .startsWith("package com.acme.api;")
        .contains("import java.time.LocalDate;", "import java.util.List;")
        .contains("public record LibraryResponse(")
        .contains("String name", "LocalDate opened", "List<String> tags")
        .contains("LibraryAddress address", "List<LibraryBook> books")
        .contains("List<LibraryCategory> categories");
    assertThat(records.get("LibraryBook")).contains("String title", "Integer pages");
  }

  @Test
  void theReturnTypeOfArraysAndScalars() throws Exception {
    var records = new LinkedHashMap<String, String>();
    assertThat(
            SchemaToJava.returnTypeOf(
                "p",
                "RowsResponse",
                schema(
                    "{\"type\":\"array\",\"items\":{\"type\":\"object\",\"properties\":"
                        + "{\"id\":{\"type\":\"string\"}}}}"),
                records))
        .isEqualTo("java.util.List<RowsResponse>");
    assertThat(records).containsKey("RowsResponse");
    assertThat(
            SchemaToJava.returnTypeOf(
                "p",
                "IdsResponse",
                schema("{\"type\":\"array\",\"items\":{\"type\":\"integer\"}}"),
                records))
        .isEqualTo("java.util.List<Integer>");
    assertThat(SchemaToJava.returnTypeOf("p", "X", schema("{\"type\":\"boolean\"}"), records))
        .isEqualTo("Boolean");
    assertThat(SchemaToJava.returnTypeOf("p", "X", schema("{\"type\":\"object\"}"), records))
        .isEqualTo("java.util.Map<String, Object>");
    assertThat(SchemaToJava.returnTypeOf("p", "X", null, records))
        .isEqualTo("java.util.Map<String, Object>");
  }

  @Test
  void recordsOfAStandaloneSchema() throws Exception {
    var records =
        SchemaToJava.records(
            "p",
            "Thing",
            schema("{\"type\":\"object\",\"properties\":{\"a\":{\"type\":\"string\"}}}"));
    assertThat(records).containsOnlyKeys("Thing");
    assertThat(SchemaToJava.records("p", "Thing", null)).isEmpty();
    assertThat(SchemaToJava.records("p", "Thing", schema("{\"type\":\"object\"}"))).isEmpty();
  }
}
