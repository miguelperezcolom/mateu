package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChangeQueryService {
    public ListingData<ChangeDto> findAll(String searchText, NoFilters filters, Pageable pageable) {
        return ListingData.of(new ChangeDto("1", "x", "c", "l", ChangeStatus.Changed));
    }
}
