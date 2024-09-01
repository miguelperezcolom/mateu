package com.example.demo.infra.ircs.environments.creationwizard;

import com.example.demo.infra.ircs.environments.Customer;
import com.example.demo.infra.ircs.environments.EHRType;
import com.example.demo.infra.ircs.environments.EnvironmentsCrud;
import com.example.demo.infra.ircs.environments.Region;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@Slf4j
@Caption("New environment: target tenancy")
public class NewEnvironmentWizardStep2 {

    final ApplicationContext applicationContext;

    @Section(value = "", columns = 2)
            @Colspan(2)
    String ocid;

    Region region;

    String compartment;

    @Colspan(2)
    @TextArea
    String key;

    public NewEnvironmentWizardStep2(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @MainAction(position = ActionPosition.Left, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(NewEnvironmentWizardStep1.class);
    }

    @MainAction
    Object next() {
        return applicationContext.getBean(NewEnvironmentWizardStep3.class);
    }

}
