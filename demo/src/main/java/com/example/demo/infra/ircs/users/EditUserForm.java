package com.example.demo.infra.ircs.users;

import io.mateu.core.domain.uidefinition.shared.annotations.ActionPosition;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionType;
import io.mateu.core.domain.uidefinition.shared.annotations.MainAction;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EditUserForm {

    final ApplicationContext applicationContext;

    String name;

    String email;

    public EditUserForm(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    @MainAction(position = ActionPosition.Left, type = ActionType.Tertiary)
    Object back() {
        return applicationContext.getBean(UsersCrud.class);
    }

    @MainAction
    Object save() {
        return applicationContext.getBean(UsersCrud.class);
    }

}
