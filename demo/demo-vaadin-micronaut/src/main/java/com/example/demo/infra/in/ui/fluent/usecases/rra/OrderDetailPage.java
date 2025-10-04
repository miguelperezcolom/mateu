package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.OrderRepository;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.FormSubSection;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Singleton
public class OrderDetailPage implements ComponentTreeSupplier, PostHydrationHandler, ActionHandler {

    String orderId;
    String name;
    String phoneNumber;
    String email;
    String address;
    String totalAmount;
    String date;
    List<OrderDetailLine> lines;
    String comments;

    private final OrderProductList orderProductList;
    private final OrderRepository orderRepository;

    @Inject
    public OrderDetailPage(OrderProductList orderProductList, OrderRepository orderRepository) {
        this.orderProductList = orderProductList;
        this.orderRepository = orderRepository;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
        return Page.builder()
                .title("Order " + orderId)
                .subtitle("${state.name} &nbsp;&nbsp;&nbsp; ${state.date} &nbsp;&nbsp;&nbsp; Total Amount: ${state.totalAmount}")
                .content(List.of(Form.builder()
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
                                        .style("width: 100%;")
                                        .content(List.of(
                                                FormField.builder()
                                                        .id("lines")
                                                        .dataType(FieldDataType.array)
                                                        .stereotype(FieldStereotype.grid)
                                                        .readOnly(true)
                                                        .label("")
                                                        .columns(List.of(
                                                                GridColumn.builder()
                                                                        .dataType(FieldDataType.string)
                                                                        .id("productName")
                                                                        .label("Product")
                                                                        .build(),
                                                                GridColumn.builder()
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.link)
                                                                        .id("productId")
                                                                        .label("Product Number")
                                                                        .actionId("view-product")
                                                                        .build(),
                                                                GridColumn.builder()
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.image)
                                                                        .id("image")
                                                                        .label("Image")
                                                                        .build(),
                                                                GridColumn.builder()
                                                                        .dataType(FieldDataType.money)
                                                                        .id("listPrice")
                                                                        .label("List Price")
                                                                        .build(),
                                                                GridColumn.builder()
                                                                        .dataType(FieldDataType.number)
                                                                        .id("quantity")
                                                                        .label("Quantity")
                                                                        .build(),
                                                                GridColumn.builder()
                                                                        .dataType(FieldDataType.money)
                                                                        .id("amount")
                                                                        .label("Amount")
                                                                        .build()
                                                        ))
                                                        .style("width: 100%;")
                                                        .build())
                                        )
                                        .build(),
                                FormSubSection.builder()
                                        .title("Attachments")
                                        .content(List.of(
                                                FormField.builder()
                                                        .id("attachments")
                                                        .dataType(FieldDataType.file)
                                                        .stereotype(FieldStereotype.html)
                                                        .label("Attachments")
                                                        .build(),
                                                FormField.builder()
                                                        .dataType(FieldDataType.string)
                                                        .stereotype(FieldStereotype.html)
                                                        .id("comments")
                                                        .label("Comments")
                                                        .build()
                                        ))
                                        .build()
                        ))
                        .build()))
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        orderId = httpRequest.lastPathItem();
        if ("".equals(httpRequest.runActionRq().actionId())) {
            var order = orderRepository.findById(orderId).get();
            var customer = order.customer();
            name = customer.name();
            phoneNumber = customer.phoneNumber();
            email = customer.email();
            address = customer.billingAddress().toString();
            totalAmount = order.totalAmount().toString();
            date = order.date().toString();
            lines = order.lines().stream().map(line -> new OrderDetailLine(
                    line.lineId(),
                    line.product().id(),
                    line.product().name(),
                    line.product().image(),
                    new Amount(line.product().listPrice().currencyCode(), line.product().listPrice().value()),
                    line.quantity(),
                    new Amount(line.product().listPrice().currencyCode(), line.product().listPrice().value() * line.quantity())

            )).toList();
            comments = order.comments();
        }
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("view-product".equals(actionId)) {
            var productId = (String) httpRequest.runActionRq().parameters().get("productId");
            var dialog = Dialog.builder()
                    .style("background-color: red;")
                    .left("0")
                    .height("100vh")
                    .content(orderProductList.load(lines.stream().map(OrderDetailLine::productId).distinct().toList(), productId))
                    .build();
            return dialog;
        }
        return null;
    }
}
