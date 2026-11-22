package io.mateu.core.infra.nativeimage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import org.junit.jupiter.api.Test;

/**
 * Pins the native-image wiring a Micronaut / Spring Boot / Helidon app gets from mateu-core: the
 * feature that registers Mateu's reflective surface, and the resources and proxy native-image must
 * keep. Verified end to end by building those starters native; a change here breaks native apps
 * silently, at run time.
 */
class NativeImageMetadataTest {

  private static final String DIR = "/META-INF/native-image/io.mateu/mateu-core/";

  @Test
  void theFeatureIsRegistered() throws Exception {
    var properties = new Properties();
    try (InputStream in = getClass().getResourceAsStream(DIR + "native-image.properties")) {
      assertThat(in).isNotNull();
      properties.load(in);
    }
    assertThat(properties.getProperty("Args"))
        .contains("--features=" + MateuNativeImageFeature.class.getName());
  }

  @Test
  void keepsTheRendererAssetsTheSpecsAndThePwaFilesAndTheRequestProxy() throws Exception {
    JsonNode metadata;
    try (InputStream in = getClass().getResourceAsStream(DIR + "reachability-metadata.json")) {
      assertThat(in).isNotNull();
      metadata = new ObjectMapper().readTree(in);
    }
    List<String> globs = new ArrayList<>();
    metadata.get("resources").forEach(r -> globs.add(r.get("glob").asText()));
    assertThat(globs)
        .contains("static/**", "specs/**", "META-INF/mateu/**", "io/mateu/core/infra/pwa/**");
    assertThat(metadata.get("reflection").toString())
        .contains("io.mateu.uidl.interfaces.HttpRequest");
  }
}
