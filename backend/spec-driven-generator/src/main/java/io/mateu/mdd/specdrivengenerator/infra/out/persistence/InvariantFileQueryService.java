package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.InvariantQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InvariantFileQueryService implements InvariantQueryService {
    @Override
    public ListingData<InvariantRow> findAll(String searchText, Object filters, Pageable pageable) {
        return null;
    }

    @Override
    public String getLabel(String id) {
        return "";
    }

    @Override
    public Optional<InvariantDto> getById(String id) {
        return Optional.empty();
    }
}
