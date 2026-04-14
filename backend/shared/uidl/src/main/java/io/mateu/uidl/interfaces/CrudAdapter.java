package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import java.util.List;

public interface CrudAdapter<View, Editor, CreationForm, Filters, Row, IdType> {

  ListingData<Row> search(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);

  void deleteAllById(List<IdType> selectedIds, HttpRequest httpRequest);

  View getView(IdType id, HttpRequest httpRequest);

  Editor getEditor(IdType id, HttpRequest httpRequest);

  CreationForm getCreationForm(HttpRequest httpRequest);
}
