package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.OrderRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Route("/fluent-app/use-cases/rra/orders/.*")
@Singleton
public class OrderDetailPage implements ComponentTreeSupplier, HasPostHydrationMethod {

    String orderId;
    String name;
    String phoneNumber;
    String email;
    String address;
    String totalAmount;
    String date;

    private final OrderRepository orderRepository;

    @Inject
    public OrderDetailPage(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Order " + orderId)
                .subtitle("${state.name} &nbsp;&nbsp;&nbsp; ${state.date} &nbsp;&nbsp;&nbsp; Total Amount: ${state.totalAmount}")
                .toolbar(List.of(
                        Button.builder()
                                .label("Cancel")
                                .build(),
                        Button.builder()
                                .label("Save")
                                .build(),
                        Button.builder()
                                .label("Submit")
                                .build()
                ))
                .content(List.of(
                        FormSection.builder()
                                .title("Customer information")
                                .content(List.of(FormLayout.builder()
                                                .maxColumns(3)
                                                .content(
                                                        List.of(
                                                                FormRow.builder()
                                                                        .content(List.of(
                                                                                FormField.builder()
                                                                                        .dataType(FieldDataType.string)
                                                                                        .stereotype(FieldStereotype.html)
                                                                                        .id("name")
                                                                                        .label("Name")
                                                                                        .build(),
                                                                                FormField.builder()
                                                                                        .dataType(FieldDataType.string)
                                                                                        .stereotype(FieldStereotype.html)
                                                                                        .id("phoneNumber")
                                                                                        .label("Phone Number")
                                                                                        .build(),
                                                                                FormField.builder()
                                                                                        .dataType(FieldDataType.string)
                                                                                        .stereotype(FieldStereotype.html)
                                                                                        .id("email")
                                                                                        .label("Email")
                                                                                        .build()
                                                                        ))
                                                                        .build(),
                                                                FormRow.builder()
                                                                        .content(List.of(
                                                                                FormField.builder()
                                                                                        .dataType(FieldDataType.string)
                                                                                        .stereotype(FieldStereotype.html)
                                                                                        .id("address")
                                                                                        .label("Address")
                                                                                        .build()
                                                                        ))
                                                                        .build()
                                                        )
                                                )
                                        .build()))
                                .build(),
                        FormSection.builder()
                                .title("Lines")
                                .content(List.of(FormLayout.builder()
                                        .maxColumns(3)
                                        .content(
                                                List.of(
                                                        FormField.builder()
                                                                .id("lines")
                                                                .dataType(FieldDataType.array)
                                                                .label("")
                                                                .build()
                                                )
                                        )
                                        .build()))
                                .build(),
                        FormField.builder()
                                .id("attachments")
                                .dataType(FieldDataType.file)
                                .label("Attachments")
                                .build(),
                        FormField.builder()
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.textarea)
                                .label("Comments")
                                .build()
                ))
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        orderId = httpRequest.lastPathItem();
        var order = orderRepository.findById(orderId).get();
        var customer = order.customer();
        name = customer.name();
        phoneNumber = customer.phoneNumber();
        email = customer.email();
        address = customer.billingAddress().toString();
        totalAmount = order.totalAmount().toString();
        date = order.date().toString();
    }
}
