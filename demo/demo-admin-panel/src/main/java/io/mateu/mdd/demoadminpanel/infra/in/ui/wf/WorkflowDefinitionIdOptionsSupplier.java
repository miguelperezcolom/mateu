package io.mateu.mdd.demoadminpanel.infra.in.ui.wf;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import io.mateu.workflow.application.out.WorkflowDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.stereotype.Service;

import java.util.List;

@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Service
@RequiredArgsConstructor
public class WorkflowDefinitionIdOptionsSupplier implements LookupOptionsSupplier {

    final WorkflowDefinitionRepository repository;

    @Override
    public ListingData<Option> search(String fieldId, String searchText, Pageable pageable, HttpRequest httpRequest) {
        List<Option> all = repository.findAll().stream()
                .filter(wd -> searchText == null || searchText.isEmpty()
                        || wd.name().toLowerCase().contains(searchText.toLowerCase()))
                .map(wd -> new Option(wd.id(), wd.name()))
                .toList();
        int from = pageable.page() * pageable.size();
        int to = Math.min(from + pageable.size(), all.size());
        List<Option> slice = from < all.size() ? all.subList(from, to) : List.of();
        return new ListingData<>(new Page<>(searchText, slice.size(), pageable.page(), all.size(), slice));
    }
}
