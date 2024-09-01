package com.example.demo.infra.ircs.environments.creationwizard;

import com.example.demo.infra.ircs.environments.EHRType;
import com.example.demo.infra.ircs.environments.EnvironmentsCrud;
import com.example.demo.infra.ircs.environments.Region;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@Caption("New environment: EHR")
public class NewEnvironmentWizardStep3 {

    final ApplicationContext applicationContext;

    @Section(value = "", columns = 2)
    EHRType type;

    String url;

    String username;

    @Password
    String password;


    public NewEnvironmentWizardStep3(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @MainAction(position = ActionPosition.Left, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(NewEnvironmentWizardStep2.class);
    }

    @MainAction
    Object next() {
        return applicationContext.getBean(NewEnvironmentWizardStep4.class);
    }

}
