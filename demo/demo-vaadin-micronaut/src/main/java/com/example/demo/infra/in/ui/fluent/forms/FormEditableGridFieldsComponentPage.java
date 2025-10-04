package com.example.demo.infra.in.ui.fluent.forms;

import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.ProductRepository;
import com.example.demo.infra.in.ui.fluent.usecases.rra.OrderDetailLine;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormPosition;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/forms/editable-grid-fields")
@Singleton
public class FormEditableGridFieldsComponentPage implements ComponentTreeSupplier, HandlesActions, TriggersSupplier {

    private final ProductRepository productRepository;
    private final String orderId = "O0000000001";

    String formPosition = "right";
    String totalAmount = "";

    String new_product;
    String new_image;
    String new_brand;
    String new_price;
    int new_quantity;
    String edit_product;
    String edit_image;
    String edit_brand;
    String edit_price;
    int edit_quantity;
    boolean lines_editing = false;
    boolean lines_show_detail = false;

    List<OrderDetailLine> lines;
    List<OrderDetailLine> lines_selected_items;


    @Inject
    public FormEditableGridFieldsComponentPage(OrderRepository orderRepository, ProductRepository productRepository) {
        this.productRepository = productRepository;
        var order = orderRepository.findById(orderId).get();
        lines = order.lines().stream().limit(5).map(line -> new OrderDetailLine(
                line.lineId(),
                line.product().id(),
                line.product().name(),
                line.product().image(),
                new Amount(line.product().listPrice().currencyCode(), line.product().listPrice().value()),
                line.quantity(),
                new Amount(line.product().listPrice().currencyCode(), line.product().listPrice().value() * line.quantity())

        )).toList();
    }

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Form fields")
                .content(List.of(
                        FormLayout.builder()
                                .autoResponsive(true)
                                .maxColumns(6)
                                .content(
                                        List.of(
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("formPosition")
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.radio)

                                                                        .options(List.of(
                                                                                new Option("top", "Top"),
                                                                                new Option("right", "Right"),
                                                                                new Option("bottom", "Bottom"),
                                                                                new Option("left", "Left")
                                                                                ))
                                                                        .build()
                                                        ))
                                                        .build(),
                                                FormRow.builder()
                                                        .content(List.of(
                                                                FormField.builder()
                                                                        .id("lines")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.grid)
                                                                        .label("Array/Grid")
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
                                                                        .colspan(4)
                                                                        .formPosition(FormPosition.valueOf(formPosition))
                                                                        .createForm(Form.builder()
                                                                                .title("New line")
                                                                                .content(List.of(
                                                                                        FormLayout.builder()
                                                                                                .style("min-width: 20rem;")
                                                                                                .autoResponsive(true)
                                                                                                .maxColumns(List.of("left", "right").contains(formPosition)?2:10)
                                                                                                .content(List.of(
                                                                                                        FormRow.builder()
                                                                                                                .content(List.of(
                                                                                                                        FormField.builder()
                                                                                                                                .id("new_product")
                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                .stereotype(FieldStereotype.combobox)
                                                                                                                                .label("Product Name")
                                                                                                                                .remoteCoordinates(RemoteCoordinates.builder()
                                                                                                                                        .action("search-products")
                                                                                                                                        .build())
                                                                                                                                .build(),
                                                                                                                        FormField.builder()
                                                                                                                                .id("new_image")
                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                .stereotype(FieldStereotype.html)
                                                                                                                                .label("Image")
                                                                                                                                .build(),
                                                                                                                        FormField.builder()
                                                                                                                                .id("new_brand")
                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                .stereotype(FieldStereotype.html)
                                                                                                                                .label("Brand")
                                                                                                                                .build(),
                                                                                                                        FormField.builder()
                                                                                                                                .id("new_price")
                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                .stereotype(FieldStereotype.html)
                                                                                                                                .label("Price")
                                                                                                                                .build(),
                                                                                                                        FormField.builder()
                                                                                                                                .id("new_quantity")
                                                                                                                                .dataType(FieldDataType.integer)
                                                                                                                                .label("Quantity")
                                                                                                                                .build()
                                                                                                                ))
                                                                                                                .build()
                                                                                                ))
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

                                                                                                FormLayout.builder()
                                                                                                        .style("min-width: 20rem;")
                                                                                                        .autoResponsive(true)
                                                                                                        .maxColumns(List.of("left", "right").contains(formPosition)?2:10)
                                                                                                        .content(List.of(
                                                                                                                        FormRow.builder()
                                                                                                                                .content(List.of(
                                                                                                                                        FormField.builder()
                                                                                                                                                .id("edit_product")
                                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                                .stereotype(FieldStereotype.combobox)
                                                                                                                                                .label("Product Name")
                                                                                                                                                .remoteCoordinates(RemoteCoordinates.builder()
                                                                                                                                                        .action("search-products")
                                                                                                                                                        .build())
                                                                                                                                                .build(),
                                                                                                                                        FormField.builder()
                                                                                                                                                .id("edit_image")
                                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                                .stereotype(FieldStereotype.html)
                                                                                                                                                .label("Image")
                                                                                                                                                .build(),
                                                                                                                                        FormField.builder()
                                                                                                                                                .id("edit_brand")
                                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                                .stereotype(FieldStereotype.html)
                                                                                                                                                .label("Brand")
                                                                                                                                                .build(),
                                                                                                                                        FormField.builder()
                                                                                                                                                .id("edit_price")
                                                                                                                                                .dataType(FieldDataType.string)
                                                                                                                                                .stereotype(FieldStereotype.html)
                                                                                                                                                .label("Price")
                                                                                                                                                .build(),
                                                                                                                                        FormField.builder()
                                                                                                                                                .id("edit_quantity")
                                                                                                                                                .label("Quantity")
                                                                                                                                                .dataType(FieldDataType.integer)
                                                                                                                                                .build()

                                                                                                                                )).build()
                                                                                                                )).build()
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
        if ("line_selected".equals(actionId)) {
            lines_show_detail = true;
            lines_editing = true;
            lines_selected_items.forEach(line -> {
                edit_product = line.productId();
                edit_quantity = line.quantity();
            });
            var product = productRepository.findById(edit_product).get();
            return List.of(new State(this), new Data(Map.of("edit_product",
                    new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1,
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
            totalAmount = calculateTotal();
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
                    orderId,
                    product.id(),
                    product.name(),
                    product.image(),
                    new Amount(product.listPrice().currencyCode(), product.listPrice().value()),
                    new_quantity,
                    new Amount(product.listPrice().currencyCode(), new_quantity * product.listPrice().value())
            ));
            totalAmount = calculateTotal();
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
            totalAmount = calculateTotal();
            return new State(this);
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

            return new Data(Map.of(fieldId, new io.mateu.uidl.data.Page<>(
                    searchText,
                    pageable.size(),
                    pageable.page(),
                    found.size(),
                    found.stream().map(customer -> new Option(customer.id(), customer.name())).toList()
            )));
        }
        if ("load-new-product".equals(actionId)) {
            var found = productRepository.findById(new_product);
            if (found.isPresent()) {
                var product = found.get();
                new_image = "<img src='" + product.image() + "' width='200px'></img>";
                new_price = product.listPrice().toString();
                new_brand = product.brand();
            }
            return new State(this);
        }
        if ("load-edit-product".equals(actionId)) {
            var found = productRepository.findById(edit_product);
            if (found.isPresent()) {
                var product = found.get();
                edit_image = "<img src='" + product.image() + "' width='200px'></img>";
                edit_price = product.listPrice().toString();
                edit_brand = product.brand();
            }
            return new State(this);
        }

        return null;
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnValueChangeTrigger("load-new-product", "new_product", ""),
                new OnValueChangeTrigger("load-edit-product", "edit_product", ""),
                new OnValueChangeTrigger("relocate-form", "formPosition", "")
        );
    }

    private String calculateTotal() {
        var currency = "EUR";
        var total = 0d;
        for (OrderDetailLine line : lines) {
            currency = line.listPrice().currency();
            total += line.quantity() * line.listPrice().value();
        }
        return new Amount(currency, total).toString();
    }
}
