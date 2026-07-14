package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only list of attached files, each shown with a type icon, name and size. A file with a
 * {@code url} renders as a download link; one with an {@code actionId} dispatches the standard
 * {@code action-requested} event on click. Design-system neutral, dark-mode aware.
 */
@Builder
public record FileList(String id, List<FileItem> files, String style, String cssClasses)
    implements Component {}
