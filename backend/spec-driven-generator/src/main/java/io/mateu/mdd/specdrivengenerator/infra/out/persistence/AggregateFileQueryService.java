package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.AggregateQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AggregateFileQueryService implements AggregateQueryService {
    @Override
    public ListingData<AggregateRow> findAll(String searchText, Object filters, Pageable pageable) {
        return null;
    }

    @Override
    public String getLabel(String id) {
        return "";
    }

    @Override
    public Optional<AggregateDto> getById(String id) {
        return Optional.empty();
    }
}
