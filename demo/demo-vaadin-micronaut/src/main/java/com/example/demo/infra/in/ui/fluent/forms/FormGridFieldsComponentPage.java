package com.example.demo.infra.in.ui.fluent.forms;

import com.example.demo.domain.OrderRepository;
import com.example.demo.infra.in.ui.fluent.usecases.rra.OrderDetailLine;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Route(value="/forms/grid-fields", parentRoute="^$")
@Singleton
public class FormGridFieldsComponentPage implements ComponentTreeSupplier {

    List<OrderDetailLine> lines;

    @Inject
    public FormGridFieldsComponentPage(OrderRepository orderRepository) {
        var order = orderRepository.findById("O0000000001").get();
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
                                                                        .id("lines")
                                                                        .dataType(FieldDataType.array)
                                                                        .stereotype(FieldStereotype.grid)
                                                                        .readOnly(true)
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
                                                                        .build(),
                                                                CustomField.builder()
                                                                        .label("State")
                                                                        .content(new Text("${JSON.stringify(state)}"))
                                                                        .colspan(2)
                                                                        .build()

                                                        ))
                                                        .build()

                                        )
                                )
                                .build()
                        ))
                .build();
    }


}
