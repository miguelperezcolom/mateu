package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.query.ProjectQueryService;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProjectFileQueryService implements ProjectQueryService {
    @Override
    public ListingData<ProjectRow> findAll(String searchText, Object filters, Pageable pageable) {
        return null;
    }

    @Override
    public String getLabel(String id) {
        return "";
    }

    @Override
    public Optional<ProjectDto> getById(String id) {
        return Optional.empty();
    }
}
