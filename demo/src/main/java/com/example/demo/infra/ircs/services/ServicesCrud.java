package com.example.demo.infra.ircs.services;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.dtos.SortCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
    public Flux<ServiceRow> fetchRows(String searchText, ServicesSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
        return Flux.just(
                new ServiceRow("PAS", new Status(StatusType.SUCCESS, "Active")),
                new ServiceRow("HIM", new Status(StatusType.SUCCESS, "Active")),
                new ServiceRow("RevElate", new Status(StatusType.SUCCESS, "Active"))
                );
    }

    @Override
    public Mono<Long> fetchCount(String searchText, ServicesSearchForm filters) {
        return Mono.just(3L);
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
