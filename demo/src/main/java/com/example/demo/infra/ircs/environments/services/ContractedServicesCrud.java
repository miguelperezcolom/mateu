package com.example.demo.infra.ircs.environments.services;

import com.example.demo.infra.ircs.services.ServiceRow;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.annotations.Child;
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
@Caption("Contracted services")
@Child
public class ContractedServicesCrud implements Crud<ContractedServicesSearchForm, ContractedServiceRow> {

    private final NewContractedServiceForm newContractedServiceForm;
    private final EditContractedServiceForm editContractedServiceForm;

    public ContractedServicesCrud(NewContractedServiceForm newContractedServiceForm, EditContractedServiceForm editContractedServiceForm) {
        this.newContractedServiceForm = newContractedServiceForm;
        this.editContractedServiceForm = editContractedServiceForm;
    }

    @Override
    public Flux<ContractedServiceRow> fetchRows(ContractedServicesSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) throws Throwable {
        return Flux.just(
                new ContractedServiceRow("PAS", new Status(StatusType.SUCCESS, "Active")),
                new ContractedServiceRow("HIM", new Status(StatusType.SUCCESS, "Active")),
                new ContractedServiceRow("RevElate", new Status(StatusType.SUCCESS, "Active"))
                );
    }

    @Override
    public Mono<Long> fetchCount(ContractedServicesSearchForm filters) throws Throwable {
        return Mono.just(2L);
    }

    @Override
    public Object getNewRecordForm() throws Throwable {
        return newContractedServiceForm;
    }

    @Override
    public Object getDetail(ContractedServiceRow userRow) throws Throwable {
        editContractedServiceForm.name = userRow.name();
        return editContractedServiceForm;
    }
}
