package io.mateu.dtos;

/**
 * What the host needs to resolve a micro frontend while it builds the view. Server side only: the
 * member holding it is never serialised.
 *
 * @param timeoutMs how long to wait for it; null = the remote's (or the global) default
 * @param remoteId the registered remote it is meant for, when it names one (a content slot); null =
 *     the remote its base url belongs to
 * @param slotKey the content slot key, for a content slot
 * @param fallback what replaces it when it is not embedded and must not degrade to the client; null
 *     = nothing
 * @param degradeToClient whether a fragment that is not embedded is left for the renderer to ask (a
 *     plain micro frontend) or replaced by {@code fallback} (a content slot)
 */
public record ServerResolutionDto(
    Integer timeoutMs,
    String remoteId,
    String slotKey,
    ComponentDto fallback,
    boolean degradeToClient) {}
