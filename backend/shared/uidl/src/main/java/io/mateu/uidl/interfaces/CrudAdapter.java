package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

public interface CrudAdapter<View, Editor, CreationForm, Filters, Row, IdType> {

  ListingData<Row> search(String searchText, Filters filters, Pageable pageable);

  void deleteAllById(List<IdType> selectedIds);

  View getView(IdType id);

  Editor getEditor(IdType id);

  CreationForm getCreationForm();

}
