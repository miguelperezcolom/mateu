package com.example.demo.infra.ircs.environments.services;

import com.example.demo.infra.ircs.environments.EditEnvironmentForm;
import com.example.demo.infra.ircs.environments.ViewEnvironment;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionPosition;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EditContractedServiceForm {

    final ApplicationContext applicationContext;

    String name;

    String email;

    public EditContractedServiceForm(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @MainAction(position = ActionPosition.Left, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(ViewEnvironment.class);
    }

    @MainAction
    Object save() {
        return applicationContext.getBean(ViewEnvironment.class);
    }

}
