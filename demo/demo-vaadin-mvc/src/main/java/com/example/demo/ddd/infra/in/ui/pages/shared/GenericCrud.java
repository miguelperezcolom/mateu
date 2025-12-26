package com.example.demo.ddd.infra.in.ui.pages.shared;

import com.example.demo.ddd.domain.hotel.shared.Repository;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

public abstract class GenericCrud<EntityType> implements ComponentTreeSupplier {

    public abstract Repository<EntityType, String> repository();

    @Override
    public Component component(HttpRequest httpRequest) {
        return null;
    }


}
