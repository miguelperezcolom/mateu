package com.example.demo.infra.ircs.environments.creationwizard;

import com.example.demo.infra.ircs.environments.EHRType;
import com.example.demo.infra.ircs.environments.EnvironmentsCrud;
import com.example.demo.infra.ircs.environments.ServiceType;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@Caption("New environment: contracted services")
public class NewEnvironmentWizardStep4 {

    final ApplicationContext applicationContext;


    @Section(value = "")
    List<ServiceType> services;

    public NewEnvironmentWizardStep4(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @MainAction(position = ActionPosition.Left, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(NewEnvironmentWizardStep3.class);
    }

    @MainAction
    Object createEnvironment() {
        return applicationContext.getBean(EnvironmentsCrud.class);
    }

}
