package io.mateu.uidl.interfaces;

/**
 * Lets an entity/row expose the text used for free-text listing searches. Implement {@link
 * #searchableText()} to return the concatenated searchable content; the default {@code
 * CrudStore.find} filters {@code findAll()} by matching the query against this (falling back to
 * {@code toString()} when not implemented).
 */
public interface Searchable {

  String searchableText();
}
