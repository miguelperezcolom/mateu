package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One entry of a {@link FileList}: a {@code name}, a human-readable {@code size} label, a {@code
 * type} (e.g. {@code "pdf"}, {@code "image"} — drives the icon), an optional {@code url} to
 * download and an optional {@code actionId} that makes the row clickable.
 */
@Builder
public record FileItem(String name, String size, String type, String url, String actionId) {}
