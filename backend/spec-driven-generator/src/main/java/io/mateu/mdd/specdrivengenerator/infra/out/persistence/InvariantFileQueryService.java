package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.EntityQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.InvariantQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantRow;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.EntityEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.InvariantEntity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvariantFileQueryService implements InvariantQueryService {

    final CommonFileRepository repository;

    @Override
    public ListingData<InvariantRow> findAll(String searchText, Object filters, Pageable pageable) {
        var data = repository.findAll(searchText, filters, pageable, InvariantEntity.class);
        return new ListingData<>(new Page<>(
                data.page().searchSignature(),
                data.page().pageSize(),
                data.page().pageNumber(),
                data.page().totalElements(),
                data.page().content().stream()
                        .map(entity -> new InvariantRow(entity.id(), entity.name()))
                        .toList()));
    }

    @Override
    public String getLabel(String id) {
        return repository.findById(id, InvariantEntity.class).map(InvariantEntity::name).orElseThrow();
    }

    @Override
    public Optional<InvariantDto> getById(String id) {
        return repository.findById(id, InvariantEntity.class)
                .map(entity -> new InvariantDto(entity.id(), entity.name()));
    }
}
