package io.mateu.core.infra;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import java.io.IOException;
import java.io.OutputStream;
import java.security.DigestOutputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Template-ref / ETag for screen structure (phase b of the client structure cache).
 *
 * <p>After an increment is mapped, this stamps every routed {@link ServerSideComponentDto} with a
 * stable content hash of its STRUCTURE (everything but the per-request state/data, which travel on
 * the fragment). The client stores that hash next to its cached structure and echoes it back as
 * {@code RunActionRqDto.knownStructureHash} on the next load of the route. When the echoed hash
 * still matches the freshly-computed one, the component is OMITTED from the response — only
 * state/data travel and the client reuses its cached structure. So a return visit or an in-place
 * re-render sends the full structure once and only the (small) state/data thereafter.
 *
 * <p>Safe by construction: a client that sends no hash (old client / cache miss) always receives
 * the full structure, and a hash that no longer matches (permissions changed, a new deploy changed
 * the layout) also sends the full structure — the omission only ever happens when the client
 * provably already holds the identical structure. The frontend's existing "state/data-only
 * fragment" merge path renders the omitted-component response with no special casing.
 */
public final class StructureHashPostProcessor {

  // A dedicated mapper with a canonical, deterministic key order so the same structure always
  // serializes to the same bytes (property order and map-entry order are both fixed). A drift here
  // would only ever cause a false miss → a full (correct) send, never a false match.
  private static final ObjectMapper CANONICAL =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
          .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)
          .configure(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY, true)
          .configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);

  private StructureHashPostProcessor() {}

  /**
   * Stamp/strip structure hashes on every fragment of the increment.
   *
   * @param increment the mapped increment (unchanged when it carries no routed component)
   * @param knownStructureHash the hash the client already holds (from {@code
   *     RunActionRqDto.knownStructureHash}); null when the client cached nothing
   */
  public static UIIncrementDto apply(UIIncrementDto increment, String knownStructureHash) {
    if (increment == null || increment.fragments() == null || increment.fragments().isEmpty()) {
      return increment;
    }
    List<UIFragmentDto> out = new ArrayList<>(increment.fragments().size());
    boolean changed = false;
    for (UIFragmentDto fragment : increment.fragments()) {
      UIFragmentDto processed = process(fragment, knownStructureHash);
      changed |= processed != fragment;
      out.add(processed);
    }
    return changed ? increment.withFragments(out) : increment;
  }

  private static UIFragmentDto process(UIFragmentDto fragment, String knownStructureHash) {
    if (fragment == null || !(fragment.component() instanceof ServerSideComponentDto component)) {
      return fragment;
    }
    String hash = hashOf(component);
    // A @StaticView is never omitted: the client caches its FULL response the first time it sees it
    // each session and then skips the round-trip entirely, so it must always receive the component
    // (carrying staticView=true) to learn that — even when it already holds the structure.
    if (knownStructureHash != null && knownStructureHash.equals(hash) && !component.staticView()) {
      // The client already holds this exact structure — drop it, keep only state/data.
      return fragment.withComponent(null);
    }
    return fragment.withComponent(component.withStructureHash(hash));
  }

  private static String hashOf(ServerSideComponentDto component) {
    // Normalize away the per-request fields before hashing so the SAME structure always hashes
    // the same: the top-level component id is a fresh UUID on every request (an instance id, not
    // structure), and so is the id of every nested component that names none (a YAML page's texts,
    // cards…) — those are dropped too, or the hash changed on every request and the client never
    // got the state-only answer: it re-mounted the page it had painted from its cache, which
    // flickered and ran the page's OnLoad (its record fetch) twice. The hash slot itself must not
    // feed back into the hash. Nested ids that are NOT UUIDs (field ids, etc.) are kept — they ARE
    // part of the structure. The client never computes this hash, only echoes the server's, so
    // this is symmetric across request and response.
    //
    // The canonical JSON is digested AS IT IS WRITTEN — the same bytes, so the same hash, as
    // serializing to a byte[] first.
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      JsonNode tree = CANONICAL.valueToTree(component.withId(null).withStructureHash(null));
      withoutInstanceIds(tree);
      try (var out = new DigestOutputStream(OutputStream.nullOutputStream(), digest)) {
        CANONICAL.writeValue(out, tree);
      }
      return HexFormat.of().formatHex(digest.digest());
    } catch (IOException | NoSuchAlgorithmException e) {
      throw new IllegalStateException("Cannot compute structure hash", e);
    }
  }

  /** An id that is a random instance id (a UUID), not one the structure names. */
  private static final Pattern INSTANCE_ID =
      Pattern.compile(
          "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");

  /** Drops every UUID-valued {@code id} from the tree, in place. */
  static void withoutInstanceIds(JsonNode node) {
    if (node instanceof ObjectNode object) {
      var id = object.get("id");
      if (id != null && id.isTextual() && INSTANCE_ID.matcher(id.asText()).matches()) {
        object.putNull("id");
      }
      object.forEach(StructureHashPostProcessor::withoutInstanceIds);
    } else if (node instanceof ArrayNode array) {
      array.forEach(StructureHashPostProcessor::withoutInstanceIds);
    }
  }
}
