package com.example.demo.infra.in.ui.fluent.usecases.rra;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Singleton;

//@Route("/fluent-app/use-cases/rra/orders/create")
@Singleton
public class CreateOrderPage implements ComponentTreeSupplier {


    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Create Order")
                .build();
    }
}
