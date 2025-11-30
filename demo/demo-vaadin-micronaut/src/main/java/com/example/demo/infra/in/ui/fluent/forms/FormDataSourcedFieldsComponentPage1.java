package com.example.demo.infra.in.ui.fluent.forms;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;
import java.util.Map;

@Route(value="/forms/data-sourced-fields-1", parentRoute="^$")
@Singleton
public class FormDataSourcedFieldsComponentPage1 implements ComponentTreeSupplier, ActionHandler {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Inject
    public FormDataSourcedFieldsComponentPage1(CustomerRepository customerRepository, ProductRepository productRepository, OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Data sourced form fields 1")
                .content(List.of(
                        new Text("${JSON.stringify(state)}"),
                        FormLayout.builder()
                                .autoResponsive(true)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("string")
                                                                        .label("String/Combobox")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.combobox)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("search-customers")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("string")
                                                                        .label("String/Radio")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.radio)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("string")
                                                                        .label("String/ListBox")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.listBox)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("string")
                                                                        .label("String/select")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.select)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .id("string")
                                                                        .label("String/Choice")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.choice)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("get-options")
                                                                                .build())
                                                                        .colspan(4)
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

            return new Data(Map.of(fieldId, new io.mateu.uidl.data.Page<>(
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

            return new Data(Map.of(fieldId, new io.mateu.uidl.data.Page<>(
                    "",
                    pageable.size(),
                    pageable.page(),
                    found.size(),
                    found.stream().map(product -> new Option(product.id(), product.name())).toList()
            )));
        }
        return null;
    }
}
