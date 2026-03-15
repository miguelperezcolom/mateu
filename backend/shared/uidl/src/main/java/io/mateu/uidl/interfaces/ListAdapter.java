package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;

import java.util.List;

public interface ListAdapter<Filters, Row> {

  ListingData<Row> search(String searchText, Filters filters, Pageable pageable);

}
