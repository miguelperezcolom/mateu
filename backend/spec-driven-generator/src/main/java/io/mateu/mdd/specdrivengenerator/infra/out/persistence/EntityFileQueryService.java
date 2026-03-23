package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.EntityQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EntityFileQueryService implements EntityQueryService {
    @Override
    public ListingData<EntityRow> findAll(String searchText, Object filters, Pageable pageable) {
        return null;
    }

    @Override
    public String getLabel(String id) {
        return "";
    }

    @Override
    public Optional<EntityDto> getById(String id) {
        return Optional.empty();
    }
}
