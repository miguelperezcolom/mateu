package io.mateu.core.application.microfrontends;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.WireMapper;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ContentSlotDescriptorsTest {

  static Path module(String... keys) throws Exception {
    var dir = Files.createTempDirectory("module");
    var file = dir.resolve(ContentSlotDescriptors.RESOURCE);
    Files.createDirectories(file.getParent());
    var slots = new StringBuilder();
    for (var key : keys) {
      if (!slots.isEmpty()) slots.append(",");
      slots
          .append("{\"key\":\"")
          .append(key)
          .append("\",\"declaredIn\":\"")
          .append(dir)
          .append("\"}");
    }
    Files.writeString(file, "{\"version\":1,\"slots\":[" + slots + "]}");
    return dir;
  }

  @Test
  void theSlotsOfEveryModuleAreMergedAndAKeyInTwoModulesIsReported() throws Exception {
    var a = module("app.home.a", "app.home.shared");
    var b = module("app.other.b", "app.home.shared");
    try (var loader = new URLClassLoader(new URL[] {a.toUri().toURL(), b.toUri().toURL()}, null)) {
      var descriptor = ContentSlotDescriptors.load(loader, WireMapper.shared());
      @SuppressWarnings("unchecked")
      var slots = (List<Map<String, Object>>) descriptor.get("slots");
      assertThat(slots)
          .extracting(slot -> slot.get("key"))
          .containsExactly("app.home.a", "app.home.shared", "app.other.b");
      assertThat(descriptor.get("duplicates")).isEqualTo(List.of("app.home.shared"));
    }
  }
}
