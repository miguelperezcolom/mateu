package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

/**
 * A descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE — the renderer
 * fetches the URL directly and shapes the JSON response into the surface's expected form (a
 * select's options today; listing rows, form state and endpoint actions reuse the same descriptor).
 *
 * <p>A descriptor says where to go in one of TWO ways, and they are alternatives:
 *
 * <ul>
 *   <li><b>By reference</b> — {@link #ref()} names an entry of the {@link RestSourceCatalog}. The
 *       endpoint is declared once and the surface only points at it, so the URL is not duplicated
 *       across screens and a deployment can be re-pointed by editing the catalogue.
 *   <li><b>Inline</b> — {@link #url()} and the mapping paths, as originally. Still supported, and
 *       still the right thing for a one-off endpoint that no other surface consumes.
 * </ul>
 *
 * <p>{@code url}/{@code headers}/{@code body} support {@code ${state.x}} interpolation; {@code
 * itemsPath} navigates to the response array; {@code valuePath}/{@code labelPath} map each item.
 */
@Builder
public record RestDataSource(
    /**
     * The name of a {@link RestSourceCatalog} entry to take the endpoint from; blank means this
     * descriptor is inline. When set, a consumer resolves the catalogue entry and reads the rest of
     * the request from it — the paths declared HERE still win, so a surface can point at a shared
     * endpoint and still map the response its own way.
     */
    String ref,
    String url,
    String method,
    Map<String, String> headers,
    String body,
    String itemsPath,
    String valuePath,
    String labelPath,
    /**
     * When true the fetch goes through the Mateu server (proxy mode) — it resolves CORS and keeps
     * auth secrets server-side; false (default) = the renderer fetches the endpoint directly.
     */
    boolean proxy) {

  public RestDataSource {
    ref = ref == null ? "" : ref.trim();
  }

  /** True when this descriptor points at a catalogue entry instead of carrying its own URL. */
  public boolean isReference() {
    return !ref.isEmpty();
  }

  /**
   * This descriptor with the endpoint of {@code entry} filled in, keeping whatever this one already
   * declares — so a surface may override the response mapping of a shared source without redefining
   * where it goes. Used server-side (proxy mode) and by any consumer resolving a reference.
   */
  public RestDataSource resolvedAgainst(RestSourceEntry entry) {
    if (entry == null || entry.source() == null) {
      return this;
    }
    var from = entry.source();
    return new RestDataSource(
        ref,
        blank(url) ? from.url() : url,
        blank(method) ? from.method() : method,
        headers == null || headers.isEmpty() ? from.headers() : headers,
        blank(body) ? from.body() : body,
        blank(itemsPath) ? from.itemsPath() : itemsPath,
        blank(valuePath) ? from.valuePath() : valuePath,
        blank(labelPath) ? from.labelPath() : labelPath,
        proxy || from.proxy());
  }

  private static boolean blank(String value) {
    return value == null || value.isBlank();
  }
}
