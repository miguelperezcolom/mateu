package com.example.demo.infra.in.ui.fluent.usecases.rra;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Singleton;

import java.util.List;

@Route("/fluent-app/use-cases/rra/customers/.*")
@Singleton
public class CustomerDetailPage implements ComponentTreeSupplier, HasPostHydrationMethod {

    String customerId;

    @Override
    public Component component(HttpRequest httpRequest) {
        return HorizontalLayout.builder()
                .content(List.of(
                        Form.builder()
                                .title("Customer " + customerId)
                                .content(List.of(
                                        FormField.builder()
                                                .id("name")
                                                .label("Name")
                                                .build(),
                                        FormField.builder()
                                                .id("phoneNumber")
                                                .label("Phone Number")
                                                .build(),
                                        FormField.builder()
                                                .id("email")
                                                .label("Email")
                                                .build(),
                                        FormField.builder()
                                                .id("billingAddress")
                                                .label("Billing Address")
                                                .build(),
                                        FormField.builder()
                                                .id("shippingAddress")
                                                .label("Shipping Address")
                                                .build()

                                ))
                                .build(),
                        Crudl.builder()
                                .columns(List.of(
                                        GridColumn.builder()
                                                .id("data")
                                                .dataType(FieldDataType.string)
                                                .build(),
                                        GridColumn.builder()
                                                .id("status")
                                                .dataType(FieldDataType.status)
                                                .build(),
                                        GridColumn.builder()
                                                .id("menu")
                                                .dataType(FieldDataType.menu)
                                                .build()
                                ))
                                .build()
                ))
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        customerId = httpRequest.lastPathItem();
    }
}
