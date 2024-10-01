package com.example.demo.infra.ircs.environments;

import com.example.demo.infra.ircs.environments.creationwizard.NewEnvironmentWizardStep1;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Caption;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.dtos.SortCriteria;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@Caption("Environments")
public class EnvironmentsCrud implements Crud<EnvironmentsSearchForm, EnvironmentRow> {

    private final NewEnvironmentWizardStep1 newEnvironmentWizardStep1;
    private final ViewEnvironment viewEnvironment;

    public EnvironmentsCrud(NewEnvironmentWizardStep1 newEnvironmentWizardStep1, ViewEnvironment viewEnvironment) {
        this.newEnvironmentWizardStep1 = newEnvironmentWizardStep1;
        this.viewEnvironment = viewEnvironment;
    }

    @Override
    public Flux<EnvironmentRow> fetchRows(String searchText, EnvironmentsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
        return Flux.just(
                new EnvironmentRow("<img style='height: 20px; vertical-align: text-bottom;' src='/images/tgss.svg'></img> <span style='display: inline-block; width: 15px;'></span> Seguridad Social", "ES", "Madrid", "La Paz",  EHRType.IshMed, LocalDate.of(2004, 02, 15), new Status(StatusType.SUCCESS, "Deployed")),
                new EnvironmentRow("<img style='height: 20px; vertical-align: text-bottom;' src='/images/tgss.svg'></img> <span style='display: inline-block; width: 15px;'></span> Seguridad Social", "ES", "Palma de Mallorca", "Son Espases",  EHRType.IshMed, LocalDate.of(2008, 10, 23), new Status(StatusType.DANGER, "Not valid")),
                new EnvironmentRow("<img style='height: 20px; vertical-align: text-bottom;' src='/images/nhs.svg'></img> <span style='display: inline-block; width: 15px;'></span> NHS (National Health Service) ", "GB", "London", "St George's Hospital",  EHRType.Millennium, LocalDate.of(2008, 10, 23), new Status(StatusType.SUCCESS, "Deployed"))
        );
    }

    @Override
    public Mono<Long> fetchCount(String searchText, EnvironmentsSearchForm filters) {
        return Mono.just(3L);
    }

    @Override
    public Object getNewRecordForm() {
        return newEnvironmentWizardStep1;
    }

    @Override
    public Object getDetail(EnvironmentRow userRow) {
        viewEnvironment.form.name = userRow.name();
        return viewEnvironment;
    }
}
