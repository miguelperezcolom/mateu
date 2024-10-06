package com.example.demo.infra.ircs.services;

import com.example.demo.infra.ircs.environments.EHRType;
import com.example.demo.infra.ircs.environments.EnvironmentRow;
import com.example.demo.infra.ircs.environments.EnvironmentsSearchForm;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.dtos.SortCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@Caption("Services")
public class ServicesCrud implements Crud<ServicesSearchForm, ServiceRow> {

    private final NewServiceForm newServiceForm;
    private final EditServiceForm editServiceForm;

    public ServicesCrud(NewServiceForm newServiceForm, EditServiceForm editServiceForm) {
        this.newServiceForm = newServiceForm;
        this.editServiceForm = editServiceForm;
    }

    @Override
    public Mono<Page<ServiceRow>> fetchRows(
            String searchText, ServicesSearchForm filters, Pageable pageable) {
        var items = List.of(
                new ServiceRow("PAS", new Status(StatusType.SUCCESS, "Active")),
                new ServiceRow("HIM", new Status(StatusType.SUCCESS, "Active")),
                new ServiceRow("RevElate", new Status(StatusType.SUCCESS, "Active"))
        );
        return Mono.just(new PageImpl<>(items, pageable, items.size()));
    }

    @Override
    public Object getNewRecordForm() {
        return newServiceForm;
    }

    @Override
    public Object getDetail(ServiceRow userRow) {
        editServiceForm.name = userRow.name();
        return editServiceForm;
    }
}
