package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

/**
 * A descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE — the renderer
 * fetches the URL directly and shapes the JSON response into the surface's expected form (a
 * select's options today; listing rows, form state and endpoint actions reuse the same descriptor).
 *
 * <p>{@code url}/{@code headers}/{@code body} support {@code ${state.x}} interpolation; {@code
 * itemsPath} navigates to the response array; {@code valuePath}/{@code labelPath} map each item.
 */
@Builder
public record RestDataSource(
    String url,
    String method,
    Map<String, String> headers,
    String body,
    String itemsPath,
    String valuePath,
    String labelPath) {}
