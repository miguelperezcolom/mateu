package com.example.demo.infra.in.ui.fluent.forms;

import com.example.demo.domain.CustomerRepository;
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
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Route("/fluent-app/forms/combobox-default-value")
@Singleton
public class FormComboDefaultValueComponentPage implements ComponentTreeSupplier, ActionHandler, PostHydrationHandler {

    private final CustomerRepository customerRepository;

    String string = "C0000000002";
    String[] array = {"C0000000003", "C0000000004"};
    List<String> list = List.of("C0000000003", "C0000000004");
    String[] array2 = {"C0000000003", "C0000000004"};


    @Inject
    public FormComboDefaultValueComponentPage(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Data combobox default value")
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
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("array")
                                                                        .label("Array/Combobox")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.combobox)
                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                .action("search-customers")
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

            return new Data(Map.of(fieldId, new io.mateu.uidl.data.Page<>(
                    searchText,
                    pageable.size(),
                    pageable.page(),
                    found.size(),
                    found.stream().map(customer -> new Option(customer.id(), customer.name())).toList()
            )));
        }
        return null;
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        var data = new HashMap<String, Object>();
        if (string != null && !string.isEmpty()) {
            var found = customerRepository.findById(this.string);
            if (found.isPresent()) {
                var customer = found.get();
                data.put("string",
                        new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1,
                                List.of(new Option(customer.id(), customer.name()))));
            }
        }
        if (array != null) {
            var options = new ArrayList<>();
            for (String customerId : array) {
                var found = customerRepository.findById(customerId);
                if (found.isPresent()) {
                    var customer = found.get();
                    options.add(new Option(customer.id(), customer.name()));
                }
            }
            data.put("array",
                    new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1,
                            options));
        }
        httpRequest.setAttribute("data", data);
    }
}
