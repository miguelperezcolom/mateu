package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.ProjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.ValueObjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectRow;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ProjectEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ValueObjectEntity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ValueObjectFileQueryService implements ValueObjectQueryService {

    final CommonFileRepository repository;

    @Override
    public ListingData<ValueObjectRow> findAll(String searchText, Object filters, Pageable pageable) {
        var data = repository.findAll(searchText, filters, pageable, ValueObjectEntity.class);
        return new ListingData<>(new Page<>(
                data.page().searchSignature(),
                data.page().pageSize(),
                data.page().pageNumber(),
                data.page().totalElements(),
                data.page().content().stream()
                        .map(entity -> new ValueObjectRow(entity.id(), entity.name()))
                        .toList()));
    }

    @Override
    public String getLabel(String id) {
        return repository.findById(id, ValueObjectEntity.class).map(ValueObjectEntity::name).orElseThrow();
    }

    @Override
    public Optional<ValueObjectDto> getById(String id) {
        return repository.findById(id, ValueObjectEntity.class)
                .map(entity -> new ValueObjectDto(entity.id(), entity.name()));
    }
}
