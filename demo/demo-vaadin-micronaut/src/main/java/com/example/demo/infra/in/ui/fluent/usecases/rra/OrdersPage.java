package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.SneakyThrows;

import java.net.URI;
import java.util.List;

record OrdersFilters() {

}

@Serdeable
record OrderRow(
        String id,
        Status status,
        String customerId,
        String customerName,
        String idAndDate,
        Amount totalValue,
        ColumnActionGroup actions) {

}

@Route("/fluent-app/use-cases/rra/orders")
@Singleton
public class OrdersPage implements ComponentTreeSupplier, CrudlBackend<OrdersFilters, OrderRow>, HasTriggers, HandlesActions, HasActions {

    private final OrderRepository orderRepository;

    @Inject
    public OrdersPage(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }



    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Orders")
                .toolbar(List.of(new Button("Create", "create")))
                .content(List.of(
                        Crudl.builder()
                                .infiniteScrolling(true)
                                .columns(List.of(
                                        GridColumn.builder()
                                                .id("status")
                                                .label("Status")
                                                .dataType(FieldDataType.status)
                                                .build(),
                                        GridColumn.builder()
                                                .id("customerName")
                                                .label("Customer")
                                                .build(),
                                        GridColumn.builder()
                                                .id("idAndDate")
                                                .label("Id and date")
                                                .stereotype(FieldStereotype.html)
                                                .build(),
                                        GridColumn.builder()
                                                .id("totalValue")
                                                .dataType(FieldDataType.money)
                                                .label("Total")
                                                .build(),
                                        GridColumn.builder()
                                                .id("actions")
                                                .dataType(FieldDataType.menu)
                                                .label("Actions")
                                                .build()
                                ))
                                .searchable(true)
                                .gridStyle("height: calc(100vh - 240px);")
                        .style("width: 100%;")
                        .build()))
                .style("width: 100%;")
                .build();
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }

    @Override
    public Class<OrdersFilters> filtersClass() {
        return OrdersFilters.class;
    }

    @Override
    public CrudlData<OrderRow> search(String searchText, OrdersFilters ordersFilters, Pageable pageable, HttpRequest httpRequest) {
        return new CrudlData<>(new Page<>(
                pageable.size(),
                pageable.page(),
                orderRepository.findAll().size(),
                orderRepository.findAll().stream()
                        .skip((long) pageable.page() * pageable.size())
                        .limit(pageable.size())
                        .map(order -> new OrderRow(
                                order.id(),
                                map(order.status()),
                                order.customer().id(),
                                order.customer().name(),
                                order.id() + "<br/>" + order.date(),
                                 new Amount(order.totalAmount().currencyCode(), order.totalAmount().value()),
                                new ColumnActionGroup(List.of(
                                        new ColumnAction("go-to-selected-order", "View Order", IconKey.Eye.iconName),
                                        new ColumnAction("delete-order", "Delete", IconKey.Trash.iconName),
                                        new ColumnAction("go-to-selected-customer", "View Customer", IconKey.User.iconName)
                                ).toArray(new ColumnAction[0]))
                        ))
                        .toList()
        ),
                "No orders.");
    }

    public static Status map(OrderStatus status) {
        var type = switch (status) {
            case Draft -> StatusType.NONE;
            case Completed -> StatusType.INFO;
            case ReadyToDeliver -> StatusType.WARNING;
            case Delivered -> StatusType.SUCCESS;
        };
        return new Status(type, status.name());
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("delete-order")
                        .confirmationRequired(true)
                        .confirmationTexts(new ConfirmationTexts("Delete Order xxx?", "-", "Delete", "Cancel"))
                        .build()
        );
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("create".equals(actionId)) {
            return true;
        }
        if ("go-to-selected-order".equals(actionId)) {
            return true;
        }
        if ("delete-order".equals(actionId)) {
            return true;
        }
        if ("go-to-selected-customer".equals(actionId)) {
            return true;
        }
        return CrudlBackend.super.supportsAction(actionId);
    }

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("create".equals(actionId)) {
            return new URI("/fluent-app/use-cases/rra/orders/create");
        }
        if ("go-to-selected-order".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders/" + httpRequest.getClickedRow(OrderRow.class).id());
        }
        if ("delete-order".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders/" + httpRequest.getClickedRow(OrderRow.class).id());
        }
        if ("go-to-selected-customer".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/customers/" + httpRequest.getClickedRow(OrderRow.class).customerId());
        }
        return CrudlBackend.super.handleAction(actionId, httpRequest);
    }
}
