package io.mateu.core.application.microfrontends;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * The content slots of the whole application: every {@code META-INF/mateu/content-slots.json} the
 * indexer annotation processor wrote into the modules on the classpath, merged — what the content
 * service loads to list the slots in its backoffice. A key used by two modules (each checked on its
 * own at compile time) is reported in {@code duplicates} and warned about.
 */
@Slf4j
public final class ContentSlotDescriptors {

  public static final String RESOURCE = "META-INF/mateu/content-slots.json";

  private ContentSlotDescriptors() {}

  /** {@code {version: 1, slots: [...], duplicates: [...]}}. */
  public static Map<String, Object> load(ClassLoader classLoader, ObjectMapper json) {
    var slots = new ArrayList<Object>();
    var seen = new LinkedHashMap<String, String>();
    var duplicates = new LinkedHashSet<String>();
    try {
      var resources = classLoader.getResources(RESOURCE);
      while (resources.hasMoreElements()) {
        var url = resources.nextElement();
        JsonNode descriptor;
        try (var in = url.openStream()) {
          descriptor = json.readTree(in);
        }
        for (var slot : descriptor.path("slots")) {
          var key = slot.path("key").asText();
          var declaredIn = slot.path("declaredIn").asText();
          var previous = seen.putIfAbsent(key, declaredIn);
          if (previous != null) {
            duplicates.add(key);
            log.warn(
                "@ContentSlot key '{}' is declared by {} and by {}: a key names one slot of the"
                    + " application",
                key,
                previous,
                declaredIn);
            continue;
          }
          slots.add(json.convertValue(slot, Map.class));
        }
      }
    } catch (Exception e) {
      throw new IllegalStateException("Could not read the content slot descriptors", e);
    }
    var out = new LinkedHashMap<String, Object>();
    out.put("version", 1);
    out.put("slots", slots);
    out.put("duplicates", List.copyOf(duplicates));
    return out;
  }
}
