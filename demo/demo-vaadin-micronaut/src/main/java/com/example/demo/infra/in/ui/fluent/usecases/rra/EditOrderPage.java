package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.Order;
import com.example.demo.domain.OrderLine;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.FormSubSection;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Singleton
@Serdeable
public class EditOrderPage implements ComponentTreeSupplier, HandlesActions, HasTriggers, HasPostHydrationMethod {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    String orderId;

    String totalAmount;
    String date;
    String customer;
    String phoneNumber;
    String email;
    String address;

    String comments;

    String new_product;
    int new_quantity;
    String edit_product;
    int edit_quantity;

    boolean lines_editing = false;
    boolean lines_show_detail = false;

    List<OrderDetailLine> lines = new ArrayList<>();

    List<OrderDetailLine> lines_selected_items;


    @Inject
    public EditOrderPage(CustomerRepository customerRepository, OrderRepository orderRepository, ProductRepository productRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title(getTitle())
                .subtitle("${state.customerName} ${state.date} Total Amount: ${state.customerName}")
                .toolbar(List.of(
                        Button.builder()
                                .label("Cancel")
                                .actionId("cancel")
                                .build(),
                        Button.builder()
                                .label("Save")
                                .actionId("save")
                                .build(),
                        Button.builder()
                                .label("Submit")
                                .actionId("submit")
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
                                                                                        .dataType(FieldDataType.reference)
                                                                                        .stereotype(FieldStereotype.combobox)
                                                                                        .id("customer")
                                                                                        .label("Name")
                                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                                .action("search-customers")
                                                                                                .build())
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
                                                                .label("")
                                                                .columns(List.of(
                                                                        GridColumn.builder()
                                                                                .dataType(FieldDataType.string)
                                                                                .id("productName")
                                                                                .label("Product")
                                                                                .build(),
                                                                        GridColumn.builder()
                                                                                .dataType(FieldDataType.string)
                                                                                .id("productId")
                                                                                .label("Product Number")
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
                                                                                .dataType(FieldDataType.decimal)
                                                                                .id("quantity")
                                                                                .label("Quantity")
                                                                                .build(),
                                                                        GridColumn.builder()
                                                                                .dataType(FieldDataType.money)
                                                                                .id("amount")
                                                                                .label("Amount")
                                                                                .build(),
                                                                        GridColumn.builder()
                                                                                .dataType(FieldDataType.string)
                                                                                .id("actions")
                                                                                .label("Actions")
                                                                                .build()
                                                                ))
                                                                .createForm(Form.builder()
                                                                        .title("New line")
                                                                        .content(List.of(
                                                                                FormField.builder()
                                                                                        .id("new_product")
                                                                                        .dataType(FieldDataType.reference)
                                                                                        .stereotype(FieldStereotype.combobox)
                                                                                        .label("Product Name")
                                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                                .action("search-products")
                                                                                                .build())
                                                                                        .build(),
                                                                                FormField.builder()
                                                                                        .id("new_quantity")
                                                                                        .dataType(FieldDataType.integer)
                                                                                        .label("Quantity")
                                                                                        .build()
                                                                        ))
                                                                        .buttons(List.of(
                                                                                Button.builder()
                                                                                        .label("Cancel")
                                                                                        .actionId("cancel_line")
                                                                                        .build(),
                                                                                Button.builder()
                                                                                        .label("Save")
                                                                                        .actionId("add_line")
                                                                                        .build()
                                                                        ))
                                                                        .build())
                                                                .editor(Form.builder()
                                                                        .title("Update line")
                                                                        .content(List.of(
                                                                                FormField.builder()
                                                                                        .id("edit_product")
                                                                                        .dataType(FieldDataType.reference)
                                                                                        .stereotype(FieldStereotype.combobox)
                                                                                        .label("Product Name")
                                                                                        .remoteCoordinates(RemoteCoordinates.builder()
                                                                                                .action("search-products")
                                                                                                .build())
                                                                                        .build(),
                                                                                FormField.builder()
                                                                                        .id("edit_quantity")
                                                                                        .label("Quantity")
                                                                                        .dataType(FieldDataType.integer)
                                                                                        .build()
                                                                        ))
                                                                        .buttons(List.of(
                                                                                Button.builder()
                                                                                        .label("Cancel")
                                                                                        .actionId("cancel_line")
                                                                                        .build(),
                                                                                Button.builder()
                                                                                        .label("Save")
                                                                                        .actionId("save_line")
                                                                                        .build()
                                                                        ))
                                                                        .build())
                                                                .onItemSelectionActionId("line_selected")
                                                                .style("width: 100%;")
                                                                .build()))
                                .build(),
                        FormSubSection.builder()
                                .title("Attachments")
                                .content(List.of(
                                        FormField.builder()
                                                .id("attachments")
                                                .dataType(FieldDataType.file)
                                                .label("Attachments")
                                                .build(),
                                        FormField.builder()
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.textarea)
                                                .id("comments")
                                                .label("Comments")
                                                .build()
                                ))
                                .build()
                ))
                .build();
    }

    String getTitle() {
        return "Order " + orderId;
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
        if ("search-products".equals(actionId)) {
            Pageable pageable = httpRequest.getParameters(Pageable.class);
            String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
            if (searchText == null) {
                searchText = "";
            }
            var cleanSearchText = searchText.toLowerCase();
            var found = productRepository.findAll().stream()
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
        if ("load-customer".equals(actionId)) {
            String customerId = customer;
            if (customerId != null && !customerId.isEmpty()) {
                var customer = customerRepository.findById(customerId).get();
                phoneNumber = customer.phoneNumber();
                email = customer.email();
                address = customer.shippingAddress().toString();
            } else {
                phoneNumber = "";
                email = "";
                address = "";
            }
            return new State(this);
        }
        if ("load-new-product".equals(actionId)) {
            return new State(this);
        }
        if ("load-edit-product".equals(actionId)) {
            return new State(this);
        }
        if ("line_selected".equals(actionId)) {
            lines_show_detail = true;
            lines_editing = true;
            lines_selected_items.forEach(line -> {
                edit_product = line.productId();
                edit_quantity = line.quantity();
            });
            var product = productRepository.findById(edit_product).get();
            return List.of(new State(this), new Data(Map.of("edit_product",
                    new Page<>("xxxx", 1, 0, 1,
                            List.of(new Option(product.id(), product.name()))))));
        }
        if ("lines_add".equals(actionId)) {
            lines_show_detail = true;
            lines_editing = false;
            return new State(this);
        }
        if ("lines_remove".equals(actionId)) {
            lines_show_detail = false;
            lines = lines.stream()
                    .filter(line -> lines_selected_items.stream()
                            .filter(selected -> selected.lineId().equals(line.lineId()))
                            .findAny()
                            .isEmpty()).toList();
            return new State(this);
        }
        if ("cancel_line".equals(actionId)) {
            lines_show_detail = false;
            return new State(this);
        }
        if ("add_line".equals(actionId)) {
            String productId = new_product;
            var product = productRepository.findById(productId).get();
            lines.add(new OrderDetailLine(
                    getOrderId(),
                    product.id(),
                    product.name(),
                    product.image(),
                    new Amount(product.listPrice().currencyCode(), product.listPrice().value()),
                    new_quantity,
                    new Amount(product.listPrice().currencyCode(), new_quantity * product.listPrice().value())
            ));
            return new State(this);
        }
        if ("save_line".equals(actionId)) {
            String productId = edit_product;
            var product = productRepository.findById(productId).get();
            var selectedLineIds = lines_selected_items.stream()
                    .map(OrderDetailLine::lineId)
                    .toList();
            lines = lines.stream()
                    .map(line -> selectedLineIds.contains(line.lineId()) ?
                            new OrderDetailLine(
                                    line.lineId(),
                                    product.id(),
                                    product.name(),
                                    product.image(),
                                    new Amount(product.listPrice().currencyCode(), product.listPrice().value()),
                                    edit_quantity,
                                    new Amount(product.listPrice().currencyCode(), edit_quantity * product.listPrice().value()))
                            :
                            line)
                    .toList();
            return new State(this);
        }
        if ("save".equals(actionId)) {
            orderRepository.save(new Order(
                    getOrderId(),
                    OrderStatus.Draft,
                    customerRepository.findById(customer).get(),
                    LocalDate.now(),
                    sum(lines),
                    LocalDateTime.now(),
                    comments,
                    lines.stream().map(line -> {
                        var product = productRepository.findById(line.productId()).get();
                        return new OrderLine(line.lineId(), product, line.quantity());
                    }).toList()
            ));
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders");
        }
        if ("cancel".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders");
        }
        if ("submit".equals(actionId)) {
            orderRepository.save(new Order(
                    getOrderId(),
                    OrderStatus.Completed,
                    customerRepository.findById(customer).get(),
                    LocalDate.now(),
                    sum(lines),
                    LocalDateTime.now(),
                    comments,
                    lines.stream().map(line -> {
                        var product = productRepository.findById(line.productId()).get();
                        return new OrderLine(line.lineId(), product, line.quantity());
                    }).toList()
            ));
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders");
        }
        System.out.println("unknown action: " + actionId);
        return new State(this);
    }

    String getOrderId() {
        return orderId;
    }

    private com.example.demo.domain.Amount sum(List<OrderDetailLine> lines) {
        double total = 0;
        String currency = "EUR";
        for (OrderDetailLine line : lines) {
            total += line.quantity() * line.listPrice().value();
            currency = line.listPrice().currency();
        }
        return new com.example.demo.domain.Amount(total, currency);
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnValueChangeTrigger("load-customer", "customer", ""),
                new OnValueChangeTrigger("load-new-product", "new_product", ""),
                new OnValueChangeTrigger("load-edit-product", "edit_product", "")
        );
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {

        var data = new HashMap<String, Object>();

        orderId = httpRequest.lastPathItem();
        if (!"create".equals(orderId)) {
            if ("".equals(httpRequest.runActionRq().actionId())) {
                var order = orderRepository.findById(orderId).get();
                customer = order.customer().id();
                var customer = order.customer();

                data.put("customer",
                        new Page<>("xxxx", 1, 0, 1,
                                List.of(new Option(customer.id(), customer.name()))));

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

        if (edit_product != null && !edit_product.isEmpty()) {
            var product = productRepository.findById(edit_product).get();
            data.put("edit_product",
                    new Page<>("xxxx", 1, 0, 1,
                            List.of(new Option(product.id(), product.name()))));
        }
        if (new_product != null && !new_product.isEmpty()) {
            var product = productRepository.findById(new_product).get();
            data.put("new_product",
                    new Page<>("xxxx", 1, 0, 1,
                            List.of(new Option(product.id(), product.name()))));
        }
        if (customer != null && !customer.isEmpty()) {
            var customer = customerRepository.findById(this.customer).get();
            data.put("customer",
                    new Page<>("xxxx", 1, 0, 1,
                            List.of(new Option(customer.id(), customer.name()))));
        }
        httpRequest.setAttribute("data", data);
    }
}
