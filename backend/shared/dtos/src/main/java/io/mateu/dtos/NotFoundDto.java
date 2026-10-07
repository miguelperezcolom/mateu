package io.mateu.dtos;

import lombok.Builder;

/**
 * A not-found page: what a route whose record or screen does not exist renders in place of its
 * content, inside the app shell. Not an error — the server answers it as a component.
 */
@Builder
public record NotFoundDto(String title, String message, String backRoute, String backLabel)
    implements ComponentMetadataDto {}
