package com.example.demo.infra.ircs.environments;

import com.example.demo.infra.ircs.environments.services.ContractedServicesCrud;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
public class EditEnvironmentForm {

    final ApplicationContext applicationContext;

    @Tab("General")
    @Section(value = "", columns = 2)
    Customer customer;

    String name;

    String country;

    String city;

    LocalDate date;

    String contact;

    @Tab("Tenancy")
    @Section(value = "", columns = 2)
    @Colspan(2)
    String ocid;

    Region region;

    String compartment;

    @Colspan(2)
    @TextArea
    String key;

    @Tab("EHR")
    @Section(value = "", columns = 2)
    EHRType type;

    String url;

    String username;

    @Password
    String password;




    public EditEnvironmentForm(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }


    @MainAction(type = ActionType.Tertiary, position = ActionPosition.Left)
    Object back() {
        return applicationContext.getBean(ViewEnvironment.class);
    }

    @MainAction
    Object save() {
        return applicationContext.getBean(ViewEnvironment.class);
    }

}
