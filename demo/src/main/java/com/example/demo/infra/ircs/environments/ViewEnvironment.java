package com.example.demo.infra.ircs.environments;

import com.example.demo.infra.ircs.environments.services.ContractedServicesCrud;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ViewEnvironment implements Container {

    final ViewEnvironmentForm form;

    final ContractedServicesCrud crud;

    public ViewEnvironment(ViewEnvironmentForm form, ContractedServicesCrud crud) {
        this.form = form;
        this.crud = crud;
        vl = List.of(form, crud);
    }

    @VerticalLayout
    final
    List<Object> vl;
}
