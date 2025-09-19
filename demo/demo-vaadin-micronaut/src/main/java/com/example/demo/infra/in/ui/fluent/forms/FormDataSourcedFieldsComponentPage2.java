package com.example.demo.infra.in.ui.fluent.forms;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.ProductRepository;
import com.example.demo.infra.in.ui.fluent.usecases.rra.OrderDetailLine;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/forms/data-sourced-fields-2")
@Singleton
public class FormDataSourcedFieldsComponentPage2 implements ComponentTreeSupplier, HandlesActions {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Inject
    public FormDataSourcedFieldsComponentPage2(CustomerRepository customerRepository, ProductRepository productRepository, OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Data sourced form fields 2")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .autoResponsive(true)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array/Checkbox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.checkbox)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array/Combobox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.combobox)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array/ListBox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.listBox)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("lines")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.grid)
                                                                        .readOnly(true)
                                                                        .label("Array/Grid (read only)")
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
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-lines")
                                                                                .build())
                                                                        .build()

                                                        ))
                                                        .build()

                                        )
                                )
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("search-customers".equals(actionId)) {
            Pageable pageable = httpRequest.getParameters(Pageable.class);
            String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
            if (searchText == null) {
                searchText = "";
            }
            var cleanSearchText = searchText.toLowerCase();
            var found = customerRepository.findAll().stream()
                    .filter(customer -> customer.name().toLowerCase().contains(cleanSearchText))
                    .toList();
            String fieldId = (String) httpRequest.runActionRq().parameters().get("fieldId");

            return new Data(Map.of(fieldId, new Page<>(
                    searchText,
                    pageable.size(),
                    pageable.page(),
                    found.size(),
                    found.stream().map(customer -> new Option(customer.id(), customer.name())).toList()
            )));
        }
        if ("get-options".equals(actionId)) {
            Pageable pageable = httpRequest.getParameters(Pageable.class);
            var found = productRepository.findAll().stream()
                    .limit(10)
                    .toList();
            String fieldId = (String) httpRequest.runActionRq().parameters().get("fieldId");

            return new Data(Map.of(fieldId, new Page<>(
                    "",
                    pageable.size(),
                    pageable.page(),
                    found.size(),
                    found.stream().map(product -> new Option(product.id(), product.name())).toList()
            )));
        }
        if ("get-lines".equals(actionId)) {
            Pageable pageable = httpRequest.getParameters(Pageable.class);
            var order = orderRepository.findById("O0000000001").get();
            var found = order.lines().stream().limit(5).map(line -> new OrderDetailLine(
                    line.lineId(),
                    line.product().id(),
                    line.product().name(),
                    line.product().image(),
                    new Amount(line.product().listPrice().currencyCode(), line.product().listPrice().value()),
                    line.quantity(),
                    new Amount(line.product().listPrice().currencyCode(), line.product().listPrice().value() * line.quantity())

            )).toList();
            String fieldId = (String) httpRequest.runActionRq().parameters().get("fieldId");

            return new Data(Map.of(fieldId, new Page<>(
                    "",
                    pageable.size(),
                    pageable.page(),
                    found.size(),
                    found
            )));
        }
        return null;
    }
}
