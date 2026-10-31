package io.mateu.uidl.remote;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * Another Mateu backend this host may call on the user's behalf, registered explicitly: a {@code
 * MicroFrontend} resolved by the server ({@code resolve = SERVER}) only asks a url under one of
 * these, so a UI definition can never make the host call anywhere else (no server-side request
 * forgery from the definition).
 *
 * @param id a stable name ({@code content}, {@code orders}); a {@code @ContentSlot} names its
 *     remote by id
 * @param baseUrl absolute http(s) base url of the remote Mateu app; a micro frontend belongs to the
 *     remote whose base url its own {@code baseUrl} starts with (scheme, host, port and path
 *     prefix)
 * @param timeoutMs how long the host waits for a fragment of this remote when the micro frontend
 *     declares none; null = the global default ({@code mateu.microfrontends.default-timeout-ms})
 * @param identity the name of the {@link RemoteIdentityStrategy} the host calls it with; null =
 *     {@value RemoteIdentityStrategy#FORWARD_AUTHORIZATION}
 */
@Experimental
@Builder
public record RemoteDescriptor(String id, String baseUrl, Integer timeoutMs, String identity) {}
