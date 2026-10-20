package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.sameInstance;

import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.micronaut.context.ApplicationContext;
import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonMapper;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The JSON mappers the Micronaut adapter installs in place of micronaut-serde's / micronaut's own:
 * they must keep the wire format the renderers read — the {@code "type"} discriminator of every
 * polymorphic DTO, and null fields (which micronaut's mappers trim) — on every write and read path
 * Micronaut uses (bytes, streams, with or without an {@link Argument}).
 */
class MicronautJsonMappersTest {

  private static final List<JsonMapper> MAPPERS =
      List.of(new MateuMicronautJsonMapper(), new MateuMicronautJacksonDatabindMapper());

  private static final ComponentMetadataDto TEXT =
      new TextDto(TextContainerDto.p, Map.of(), "Hello", null, false);

  private static final Argument<ComponentMetadataDto> METADATA =
      Argument.of(ComponentMetadataDto.class);

  @Test
  void writesTheTypeDiscriminatorAndKeepsNullFields() throws Exception {
    for (JsonMapper mapper : MAPPERS) {
      var plain = new ByteArrayOutputStream();
      mapper.writeValue(plain, TEXT);
      var typed = new ByteArrayOutputStream();
      mapper.writeValue(typed, METADATA, TEXT);
      for (String json :
          new String[] {
            new String(mapper.writeValueAsBytes(TEXT), StandardCharsets.UTF_8),
            new String(mapper.writeValueAsBytes(METADATA, TEXT), StandardCharsets.UTF_8),
            plain.toString(StandardCharsets.UTF_8),
            typed.toString(StandardCharsets.UTF_8)
          }) {
        assertThat(json, containsString("\"type\":\"Text\""));
        assertThat(json, containsString("\"size\":null"));
      }
    }
  }

  @Test
  void readsAPolymorphicDtoBackFromItsDiscriminator() throws Exception {
    for (JsonMapper mapper : MAPPERS) {
      byte[] json = mapper.writeValueAsBytes(TEXT);
      assertThat(mapper.readValue(json, METADATA), is(TEXT));
      assertThat(mapper.readValue(new ByteArrayInputStream(json), METADATA), is(TEXT));
    }
  }

  @Test
  void writesJavaTimeValuesAsIsoStringsNotArrays() throws Exception {
    var data =
        Map.of(
            "date", LocalDate.of(2025, 12, 19),
            "dateTime", LocalDateTime.of(2025, 12, 19, 10, 30),
            "time", LocalTime.of(10, 30));
    for (JsonMapper mapper : MAPPERS) {
      var json = new String(mapper.writeValueAsBytes(data), StandardCharsets.UTF_8);
      assertThat(json, containsString("\"date\":\"2025-12-19\""));
      assertThat(json, containsString("\"dateTime\":\"2025-12-19T10:30:00\""));
      assertThat(json, containsString("\"time\":\"10:30:00\""));
      assertThat(
          mapper.readValue(
              "\"2025-12-19\"".getBytes(StandardCharsets.UTF_8), Argument.of(LocalDate.class)),
          is(LocalDate.of(2025, 12, 19)));
    }
  }

  @Test
  void keepsItselfWhenMicronautAsksForAReconfiguredCopy() {
    var mapper = new MateuMicronautJsonMapper();
    assertThat(mapper.cloneWithConfiguration(null), sameInstance(mapper));
  }

  @Test
  void replacesMicronautsMapperUnlessTheAppOptsOut() {
    try (var context = ApplicationContext.run()) {
      assertThat(context.getBean(JsonMapper.class), instanceOf(MateuMicronautJsonMapper.class));
    }
    try (var context =
        ApplicationContext.run(Map.of("mateu.micronaut.replace-json-mapper", "false"))) {
      assertThat(
          context.getBean(JsonMapper.class), not(instanceOf(MateuMicronautJsonMapper.class)));
      assertThat(
          context.getBean(JsonMapper.class),
          not(instanceOf(MateuMicronautJacksonDatabindMapper.class)));
    }
  }
}
