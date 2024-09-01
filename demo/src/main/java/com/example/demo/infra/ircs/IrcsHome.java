package com.example.demo.infra.ircs;


import com.example.demo.infra.ircs.environments.EnvironmentsCrud;
import com.example.demo.infra.ircs.services.ServicesCrud;
import com.example.demo.infra.ircs.users.UsersCrud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasAppTitle;
import io.mateu.core.domain.uidefinition.core.interfaces.HasLogout;
import io.mateu.core.domain.uidefinition.shared.annotations.KeycloakSecured;
import io.mateu.core.domain.uidefinition.shared.annotations.MateuUI;
import io.mateu.core.domain.uidefinition.shared.annotations.MenuOption;

@MateuUI("/ircs")
@KeycloakSecured(url = "https://lemur-10.cloud-iam.com/auth", realm = "mateu", clientId = "cliente")
public class IrcsHome implements HasLogout, HasAppTitle {

    @MenuOption
    EnvironmentsCrud environments;

    @MenuOption
    ServicesCrud services;

    @MenuOption
    UsersCrud users;


    @Override
    public String getLogoutUrl() {
        return "/logout";
    }

    @Override
    public String getAppTitle() {
        return "IRCS Control Plane";
    }
}
