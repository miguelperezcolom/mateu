package io.mateu.uidl.interfaces;

/**
 * Supplies a view's subtitle (the secondary heading shown under the title) at runtime. Implement
 * {@link #subtitle()} to compute it dynamically instead of using a static {@code @Subtitle}
 * annotation.
 */
public interface SubtitleSupplier {

  String subtitle();
}
