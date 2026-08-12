package io.mateu.uidl.schema;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

/**
 * The Figma ⇄ Mateu contract travels inside the published jar, at {@code
 * META-INF/mateu/contract.json}, so consumers read ONE artifact instead of keeping a copy.
 *
 * <p>Copies are why this exists. The contract was mirrored by hand into two modux modules and both
 * had fallen 15 components behind — the entire Page Templates category — which is not a cosmetic
 * drift: an importer that does not know those kinds cannot handle those frames at all. Packaging it
 * makes "read the contract" a dependency rather than a discipline.
 */
class FigmaContractPackagedTest {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** Where the contract is authored, relative to this module. */
  private static Path source() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../design/figma/contract.json")
        .normalize();
  }

  @Test
  void theContractIsOnTheClasspathOfThePublishedJar() throws Exception {
    try (var in = getClass().getResourceAsStream("/META-INF/mateu/contract.json")) {
      assertThat(in).as("packaged contract").isNotNull();
      assertThat(MAPPER.readTree(in).get("components")).isNotNull();
    }
  }

  @Test
  void thePackagedContractIsTheAuthoredOne() throws Exception {
    // A build-time copy, not a checked-in duplicate: if these ever differ, the packaging broke and
    // consumers would be reading a stale contract while the repo looked correct.
    try (var in = getClass().getResourceAsStream("/META-INF/mateu/contract.json")) {
      assertThat(MAPPER.readTree(in)).isEqualTo(MAPPER.readTree(Files.readString(source())));
    }
  }

  @Test
  void theContractDeclaresThePageTemplateCategory() throws Exception {
    // The category the mirrors were missing. Pinning it here means a consumer that reads the
    // artifact can rely on it being there.
    try (var in = getClass().getResourceAsStream("/META-INF/mateu/contract.json")) {
      var names = new java.util.ArrayList<String>();
      MAPPER.readTree(in).get("components").forEach(c -> names.add(c.get("name").asText()));
      assertThat(names)
          .as("the contract must carry the Page Templates category")
          .anyMatch(n -> n.startsWith("Mateu/Page Templates/"));
    }
  }
}
