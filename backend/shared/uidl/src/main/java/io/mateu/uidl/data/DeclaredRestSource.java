package io.mateu.uidl.data;

/**
 * One REST source a view declares programmatically, for the surfaces that are not written as
 * annotations. See {@link io.mateu.uidl.interfaces.RestSourceSupplier}.
 *
 * @param kind which surface it feeds
 * @param id what it feeds within that surface: the field id for {@link RestSourceKind#OPTIONS}, the
 *     action id for {@link RestSourceKind#ACTION}, and ignored (use {@code ""}) for {@link
 *     RestSourceKind#ROWS} and {@link RestSourceKind#DATA}, of which a view has at most one
 * @param source the descriptor, exactly as it travels to the renderer
 */
public record DeclaredRestSource(RestSourceKind kind, String id, RestDataSource source) {

  public DeclaredRestSource {
    id = id == null ? "" : id;
  }

  /** The view's single source of a kind that has only one. */
  public DeclaredRestSource(RestSourceKind kind, RestDataSource source) {
    this(kind, "", source);
  }
}
