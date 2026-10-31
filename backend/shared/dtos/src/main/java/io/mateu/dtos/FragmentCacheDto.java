package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * What a remote allows the hosts that embed its answer to do with it (see {@code
 * io.mateu.uidl.remote.FragmentCachePolicy}).
 *
 * @param maxAgeSeconds how long it may be reused; 0 = not at all
 * @param varyBy {@code none}, {@code shared}, {@code user} or {@code key}
 * @param key the opaque key, for {@code varyBy = key}
 * @param notModified the host told the remote it holds {@code key} ({@code X-Mateu-Fragment-Keys})
 *     and the remote answers "use yours": the response carries no fragments
 */
public record FragmentCacheDto(
    int maxAgeSeconds,
    String varyBy,
    @JsonInclude(JsonInclude.Include.NON_NULL) String key,
    @JsonInclude(JsonInclude.Include.NON_DEFAULT) boolean notModified) {}
