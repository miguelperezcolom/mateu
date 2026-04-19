package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;

import java.util.List;

public class RoleOptionsSupplier implements LookupOptionsSupplier {
    @Override
    public ListingData<Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(List.of(
                new Option("1", "Label for 1"),
                new Option("2", "Label for 2"),
                new Option("3", "Label for 3")
        ));
    }
}
