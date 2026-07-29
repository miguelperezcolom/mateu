package io.mateu.uidl.interfaces;

/**
 * Input capability: declaring it on a {@link Listing} shows the free-text search box, and the typed
 * text arrives as {@code SearchRequest.searchText()}. A listing that does not implement it shows no
 * search box and always receives an empty {@code searchText}.
 *
 * <p>Not to be confused with {@link SearchableText} (an ENTITY providing its own searchable text
 * for the in-memory {@code CrudStore.find} default) or the {@code @Searchable} annotation (lookup
 * fields).
 */
public interface Searchable {}
