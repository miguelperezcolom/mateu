package io.mateu.uidl.interfaces;

/**
 * Marker interface identifying a class as page-level content (a routed view) rather than an app
 * shell or a plain data/component object. The framework treats any implementer as a page in {@code
 * ViewTypeClassifier}. See {@link Page}, which extends it.
 */
public interface Content {}
