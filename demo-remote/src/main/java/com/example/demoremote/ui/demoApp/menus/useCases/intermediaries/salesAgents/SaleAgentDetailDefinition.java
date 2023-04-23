package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents.passwordResets.PasswordResetsCrud;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;

@Getter@Setter
public abstract class SaleAgentDetailDefinition {

    String id;

    String name;

    @Autowired
    PasswordResetsCrud passwordResets;
}
