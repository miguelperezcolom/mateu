package io.mateu.core.infra;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

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
    // Normalize away the two per-request fields before hashing so the SAME structure always hashes
    // the same: the top-level component id is a fresh UUID on every request (an instance id, not
    // structure), and the hash slot itself must not feed back into the hash. Nested/structural ids
    // (field ids, etc.) are kept — they ARE part of the structure. The client never computes this
    // hash, only echoes the server's, so nulling id here is symmetric across request and response.
    try {
      byte[] json = CANONICAL.writeValueAsBytes(component.withId(null).withStructureHash(null));
      byte[] digest = MessageDigest.getInstance("SHA-256").digest(json);
      return HexFormat.of().formatHex(digest);
    } catch (JsonProcessingException | NoSuchAlgorithmException e) {
      throw new IllegalStateException("Cannot compute structure hash", e);
    }
  }
}
