package com.example.demo.infra.ircs.environments;

import io.mateu.core.domain.uidefinition.core.interfaces.Message;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.Badge;
import io.mateu.core.domain.uidefinition.shared.data.BadgeTheme;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import io.mateu.dtos.ResultType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@Slf4j
@ReadOnly
public class ViewEnvironmentForm implements HasBadges, HasStatus {

    final ApplicationContext applicationContext;

    @Section(value = "", columns = 2)
    Customer customer;

    String name;

    @Colspan(2)
    String targetTenancy;

    @Colspan(2)
    String EHR;


    public ViewEnvironmentForm(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }


    @Action(order = 0, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(EnvironmentsCrud.class);
    }


    @Action(type = ActionType.Primary, order = 1)
    Object edit() {
        return applicationContext.getBean(EditEnvironmentForm.class);
    }

    @Action(type = ActionType.Primary, confirmationMessage = "Are you sure you want to deploy this environment?", order = 2)
    Message deploy() {
        return new Message(ResultType.Success, "Environment deployed", "This environment has been successfully deployed.", 5000);
    }

    @Override
    public List<Badge> getBadges() {
        return List.of(new Badge(BadgeTheme.WARNING, "Not deployed"));
    }

    @Override
    public Status getStatus() {
        return new Status(StatusType.SUCCESS, "Valid");
    }
}
