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
    public Flux<ServiceRow> fetchRows(ServicesSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return Flux.just(
                new ServiceRow("PAS", new Status(StatusType.SUCCESS, "Active")),
                new ServiceRow("HIM", new Status(StatusType.SUCCESS, "Active")),
                new ServiceRow("RevElate", new Status(StatusType.SUCCESS, "Active"))
                );
    }

    @Override
    public Mono<Long> fetchCount(ServicesSearchForm filters) throws Throwable {
        return Mono.just(3L);
    }

    @Override
    public Object getNewRecordForm() throws Throwable {
        return newServiceForm;
    }

    @Override
    public Object getDetail(ServiceRow userRow) throws Throwable {
        editServiceForm.name = userRow.name();
        return editServiceForm;
    }
}
