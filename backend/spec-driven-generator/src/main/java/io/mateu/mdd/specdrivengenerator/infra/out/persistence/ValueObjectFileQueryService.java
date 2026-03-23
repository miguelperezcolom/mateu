package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.ValueObjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ValueObjectFileQueryService implements ValueObjectQueryService {
    @Override
    public ListingData<ValueObjectRow> findAll(String searchText, Object filters, Pageable pageable) {
        return null;
    }

    @Override
    public String getLabel(String id) {
        return "";
    }

    @Override
    public Optional<ValueObjectDto> getById(String id) {
        return Optional.empty();
    }
}
