package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;

public interface CrudlBackend<Filters, Row> {

  Page<Row> search(String searchText, Filters filters, Pageable pageable);
}
