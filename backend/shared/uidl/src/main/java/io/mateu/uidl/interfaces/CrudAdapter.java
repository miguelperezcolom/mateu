package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import java.util.List;

/**
 * Low-level SPI backing a CRUD orchestrator when the standard {@link CrudStore} is not enough: it
 * owns the whole lifecycle, returning distinct objects for the listing ({@link #search}), the
 * read-only view ({@link #getView}), the {@link #getEditor} form and the {@link #getCreationForm},
 * plus bulk delete ({@link #deleteAllById}).
 *
 * @param <Editor> the edit-form type
 * @param <CreationForm> the creation-form type
 * @param <Filters> the filter object type driving the listing
 * @param <Row> the listing row type
 * @param <IdType> the entity id type
 */
public interface CrudAdapter<Editor, CreationForm, Filters, Row, IdType> {

  ListingData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);

  void deleteAllById(List<IdType> selectedIds, HttpRequest httpRequest);

  Object getView(IdType id, HttpRequest httpRequest);

  Object getEditor(IdType id, HttpRequest httpRequest);

  Object getCreationForm(HttpRequest httpRequest);
}
