package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.EntityQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.ModuleQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleRow;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.AggregateEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.EntityEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ModuleEntity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ModuleFileQueryService implements ModuleQueryService {

    final CommonFileRepository repository;

    @Override
    public ListingData<ModuleRow> findAll(String searchText, Object filters, Pageable pageable) {
        var data = repository.findAll(searchText, filters, pageable, ModuleEntity.class);
        return new ListingData<>(new Page<>(
                data.page().searchSignature(),
                data.page().pageSize(),
                data.page().pageNumber(),
                data.page().totalElements(),
                data.page().content().stream()
                        .map(entity -> new ModuleRow(entity.id(), entity.name()))
                        .toList()));
    }

    @Override
    public String getLabel(String id) {
        return repository.findById(id, ModuleEntity.class).map(ModuleEntity::name).orElseThrow();
    }

    @Override
    public Optional<ModuleDto> getById(String id) {
        return repository.findById(id, ModuleEntity.class)
                .map(entity -> new ModuleDto(entity.id(), entity.name(),
                        entity.aggregateIds()));
    }
}
