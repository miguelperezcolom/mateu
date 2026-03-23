package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.AggregateQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.EntityQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateRow;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.AggregateEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.EntityEntity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EntityFileQueryService implements EntityQueryService {

    final CommonFileRepository repository;

    @Override
    public ListingData<EntityRow> findAll(String searchText, Object filters, Pageable pageable) {
        var data = repository.findAll(searchText, filters, pageable, EntityEntity.class);
        return new ListingData<>(new Page<>(
                data.page().searchSignature(),
                data.page().pageSize(),
                data.page().pageNumber(),
                data.page().totalElements(),
                data.page().content().stream()
                        .map(entity -> new EntityRow(entity.id(), entity.name()))
                        .toList()));
    }

    @Override
    public String getLabel(String id) {
        return repository.findById(id, EntityEntity.class).map(EntityEntity::name).orElseThrow();
    }

    @Override
    public Optional<EntityDto> getById(String id) {
        return repository.findById(id, EntityEntity.class)
                .map(entity -> new EntityDto(entity.id(), entity.name()));
    }
}
