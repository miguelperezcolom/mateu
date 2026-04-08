package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;

public interface LookupOptionsSupplier {

  ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest);
}
