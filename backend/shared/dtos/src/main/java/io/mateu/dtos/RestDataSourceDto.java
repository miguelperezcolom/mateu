package io.mateu.dtos;

import java.util.Map;

/**
 * A declarative descriptor for consuming an arbitrary (non-Mateu) REST endpoint CLIENT-SIDE: the
 * renderer fetches the URL directly (no Mateu server mediating) and shapes the JSON response into
 * whatever the surface expects — a select's options, a listing's rows, a form's state.
 *
 * <p>This is the shared artifact of the "decouple the UI from the Mateu backend" line: the same
 * descriptor serves every surface, only the mapping paths differ. For a select the mapping is
 * {@code itemsPath} → the array, then {@code valuePath}/{@code labelPath} per item.
 *
 * @param url the endpoint URL; supports {@code ${state.x}}/{@code ${data.y}} interpolation
 * @param method the HTTP method (GET, POST, …); defaults to GET when blank
 * @param headers request headers (values interpolated) — e.g. an Authorization bearer token
 * @param body a request body template (interpolated) for non-GET methods; null/blank sends none
 * @param itemsPath a dot path to the array inside the JSON response (e.g. {@code data.items});
 *     blank means the response root IS the array
 * @param valuePath a dot path within each item to the option value / row id
 * @param labelPath a dot path within each item to the option label
 */
public record RestDataSourceDto(
    String url,
    String method,
    Map<String, String> headers,
    String body,
    String itemsPath,
    String valuePath,
    String labelPath,
    boolean proxy) {}
