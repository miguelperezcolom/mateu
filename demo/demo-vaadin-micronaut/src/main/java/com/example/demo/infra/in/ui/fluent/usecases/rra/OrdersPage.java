package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Order;
import com.example.demo.domain.OrderRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

record OrdersFilters() {

}

@Route("/fluent-app/use-cases/rra/orders")
@Singleton
public class OrdersPage implements ComponentTreeSupplier, CrudlBackend<OrdersFilters, Order>, HasTriggers, HandlesActions {

    private final OrderRepository orderRepository;
    private final CreateOrderPage createOrderPage;

    @Inject
    public OrdersPage(OrderRepository orderRepository, CreateOrderPage createOrderPage) {
        this.orderRepository = orderRepository;
        this.createOrderPage = createOrderPage;
    }



    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Orders")
                .id("crud")
                .toolbar(List.of(new Button("Create", "create")))
                .content(List.of(Crudl.builder()
                                .columns(List.of(
                                        GridColumn.builder()
                                                .id("status")
                                                .label("Status")
                                                .build(),
                                        GridColumn.builder()
                                                .id("customer.name")
                                                .label("Customer")
                                                .build(),
                                        GridColumn.builder()
                                                .id("idAndDate")
                                                .label("Id and date")
                                                .build(),
                                        GridColumn.builder()
                                                .id("totalValue")
                                                .label("Total")
                                                .build(),
                                        GridColumn.builder()
                                                .id("actions")
                                                .label("Actions")
                                                .build()
                                ))
                                .searchable(true)
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
    public CrudlData<Order> search(String searchText, OrdersFilters ordersFilters, Pageable pageable, HttpRequest httpRequest) {
        return new CrudlData<>(new Page<>(
                pageable.size(),
                0,
                orderRepository.findAll().size(),
                orderRepository.findAll().stream().limit(pageable.size()).toList()
        ),
                "No orders.");
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("create".equals(actionId)) {
            return true;
        }
        return CrudlBackend.super.supportsAction(actionId);
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("create".equals(actionId)) {
            return createOrderPage;
        }
        return CrudlBackend.super.handleAction(actionId, httpRequest);
    }
}
