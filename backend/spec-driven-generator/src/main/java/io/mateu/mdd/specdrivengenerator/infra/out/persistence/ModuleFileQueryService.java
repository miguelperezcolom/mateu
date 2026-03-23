package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.ModuleQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ModuleFileQueryService implements ModuleQueryService {
    @Override
    public ListingData<ModuleRow> findAll(String searchText, Object filters, Pageable pageable) {
        return null;
    }

    @Override
    public String getLabel(String id) {
        return "";
    }

    @Override
    public Optional<ModuleDto> getById(String id) {
        return Optional.empty();
    }
}
