package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.AvatarGroup;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/avatar")
public class AvatarComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Avatar")
                .content(List.of(
                        Avatar.builder().name("Mateu Pérez").build(),
                        Avatar.builder().name("Mateu Pérez").image("/images/mateu.png").build(),
                    new AvatarGroup(List.of(
                            Avatar.builder().name("Mateu Pérez").build(),
                            Avatar.builder().name("Antònia Galmés").build(),
                            Avatar.builder().name("Miguel Pérez").build()
                    ), 2)
                ))
                .build();
    }
}
