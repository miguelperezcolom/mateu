package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleOptionsSupplier implements LookupOptionsSupplier {

    @Override
    public ListingData<Option> search(
            String fieldName,
            String searchText,
            Pageable pageable,
            HttpRequest httpRequest) {
        return ListingData.of(List.of(
                new Option("1", "Admin"),
                new Option("2", "Editor"),
                new Option("3", "Viewer")
        ));
    }
}