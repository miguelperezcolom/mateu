package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.ModuleQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.ProjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleRow;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ModuleEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.ProjectEntity;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectFileQueryService implements ProjectQueryService {

    final CommonFileRepository repository;

    @Override
    public ListingData<ProjectRow> findAll(String searchText, Object filters, Pageable pageable) {
        var data = repository.findAll(searchText, filters, pageable, ProjectEntity.class);
        return new ListingData<>(new Page<>(
                data.page().searchSignature(),
                data.page().pageSize(),
                data.page().pageNumber(),
                data.page().totalElements(),
                data.page().content().stream()
                        .map(entity -> new ProjectRow(entity.id(), entity.name(), entity.outputPath(), entity.packageName()))
                        .toList()));
    }

    @Override
    public String getLabel(String id) {
        return repository.findById(id, ProjectEntity.class).map(ProjectEntity::name).orElseThrow();
    }

    @Override
    public Optional<ProjectDto> getById(String id) {
        return repository.findById(id, ProjectEntity.class)
                .map(entity -> new ProjectDto(
                        entity.id(),
                        entity.name(),
                        entity.outputPath(),
                        entity.packageName(),
                        entity.moduleIds()));
    }
}
