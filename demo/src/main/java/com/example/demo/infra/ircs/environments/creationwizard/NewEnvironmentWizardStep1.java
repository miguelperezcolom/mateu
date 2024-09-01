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
@Caption("New environment: general data")
public class NewEnvironmentWizardStep1 {

    final ApplicationContext applicationContext;

    @Section(value = "", columns = 2)
    Customer customer;

    String name;

    String country;

    String city;

    LocalDate date;

    String contact;

    public NewEnvironmentWizardStep1(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @MainAction(position = ActionPosition.Left, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(EnvironmentsCrud.class);
    }

    @MainAction
    Object next() {
        return applicationContext.getBean(NewEnvironmentWizardStep2.class);
    }

}
