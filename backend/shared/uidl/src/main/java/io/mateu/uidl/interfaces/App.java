package io.mateu.uidl.interfaces;

/**
 * Marker interface that identifies a class as an application shell (top-level navigation container)
 * rather than a page. The framework classifies any implementer as an app in {@code
 * ViewTypeClassifier.isApp(...)}; typically a class carrying {@code @App} menu structure.
 */
public interface App {}
