package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * An image a page template shows in its own place and size: a {@code src} (may hold {@code
 * ${state.x}}) and, for an avatar, the {@code initials} shown when there is no image.
 */
@Experimental("page templates (3.0 beta)")
@Builder
public record TemplateImage(String src, String initials) {}
