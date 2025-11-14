package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.SneakyThrows;

import java.util.List;

@Serdeable
record OrderCrudRow(String id,
                    Status status,
                    String customerId,
                    String customerName,
                    String idAndDate,
                    Amount totalValue,
                    ColumnActionGroup actions) {

}

@Serdeable
class OrdersCrud implements ListingBackend<NoFilters, OrderCrudRow>, ComponentTreeSupplier, TriggersSupplier, ActionSupplier {

    private final OrderRepository orderRepository;
    private final String customerId;

    OrdersCrud(OrderRepository orderRepository, String customerId) {
        this.orderRepository = orderRepository;
        this.customerId = customerId;
    }

    @Override
    public ListingData<OrderCrudRow> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        var orders = orderRepository.findAll().stream()
                .filter(order -> order.customer().id().equals(customerId)).toList();
        return new ListingData<>(new io.mateu.uidl.data.Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                orders.size(),
                        orders.stream()
                        .skip((long) pageable.page() * pageable.size())
                        .limit(pageable.size())
                        .map(order -> new OrderCrudRow(
                                order.id(),
                                OrdersPage.map(order.status()),
                                order.customer().id(),
                                order.customer().name(),
                                "<span style='font-size: 14px;'>New Order</span><br/>" + order.id() + "<br/>" + order.date() + "<br/><br/><span style='font-size: 14px;'>Total Amount</span><br/>" + order.totalAmount() + "<br/>",
                                new Amount(order.totalAmount().currencyCode(), order.totalAmount().value()),
                                new ColumnActionGroup(List.of(
                                        new ColumnAction("go-to-selected-order", "View Order", IconKey.Eye.iconName, OrderStatus.Draft.equals(order.status())),
                                        new ColumnAction("edit-selected-order", "Edit Order", IconKey.Pencil.iconName, !OrderStatus.Draft.equals(order.status())),
                                        new ColumnAction("delete-order", "Delete", IconKey.Trash.iconName, !OrderStatus.Draft.equals(order.status()))
                                ).toArray(new ColumnAction[0]))
                        ))
                        .toList()
        ),
                "No orders.");
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Listing.builder()
                .infiniteScrolling(true)
                .columns(List.of(
                        GridColumn.builder()
                                .id("idAndDate")
                                .label("Id and date")
                                .stereotype(FieldStereotype.html)
                                .build(),
                        GridColumn.builder()
                                .id("status")
                                .label("Status")
                                .dataType(FieldDataType.status)
                                .build(),
                        GridColumn.builder()
                                .id("actions")
                                .dataType(FieldDataType.menu)
                                .label("Actions")
                                .build()
                ))
                .gridStyle("height: calc(100vh - 60px);")
                .style("width: 100%;")
                .build();
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }


    @Override
    public boolean supportsAction(String actionId) {
        if ("delete-order".equals(actionId)) {
            return true;
        }
        if ("go-to-selected-order".equals(actionId)) {
            return true;
        }
        if ("edit-selected-order".equals(actionId)) {
            return true;
        }
        return ListingBackend.super.supportsAction(actionId);
    }

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("delete-order".equals(actionId)) {
            orderRepository.remove(orderRepository.findById(httpRequest.getClickedRow(OrderCrudRow.class).id()).get());
            return UICommand.runAction("search");
        }
        if ("go-to-selected-order".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders/" + httpRequest.getClickedRow(OrderRow.class).id());
        }
        if ("edit-selected-order".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/orders/" + httpRequest.getClickedRow(OrderRow.class).customerId() + "/edit");
        }
        return ListingBackend.super.handleAction(actionId, httpRequest);
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
}

@Route("/fluent-app/use-cases/rra/customers/.*")
@Singleton
public class CustomerDetailPage implements ComponentTreeSupplier, PostHydrationHandler {

    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    String customerId;
    String name;
    String phoneNumber;
    String email;
    String billingAddress;
    String shippingAddress;

    @Inject
    public CustomerDetailPage(CustomerRepository customerRepository, OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
        return HorizontalLayout.builder()
                .flexGrows(List.of(0, 1))
                .content(List.of(
                        Form.builder()
                                .title("Customer " + customerId)
                                .avatar(Avatar.builder()
                                                .name(name)
                                        .build())
                                .content(List.of(
                                        FormField.builder()
                                                .id("name")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.html)
                                                .label("Name")
                                                .build(),
                                        FormField.builder()
                                                .id("phoneNumber")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.html)
                                                .label("Phone Number")
                                                .build(),
                                        FormField.builder()
                                                .id("email")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.html)
                                                .label("Email")
                                                .build(),
                                        FormField.builder()
                                                .id("billingAddress")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.html)
                                                .label("Billing Address")
                                                .build(),
                                        FormField.builder()
                                                .id("shippingAddress")
                                                .dataType(FieldDataType.string)
                                                .stereotype(FieldStereotype.html)
                                                .label("Shipping Address")
                                                .build()

                                ))
                                .style("max-width: 30rem;")
                                .build(),
                        Listing.builder()
                                .columns(List.of(
                                        GridColumn.builder()
                                                .id("data")
                                                .dataType(FieldDataType.string)
                                                .build(),
                                        GridColumn.builder()
                                                .id("status")
                                                .dataType(FieldDataType.status)
                                                .build(),
                                        GridColumn.builder()
                                                .id("menu")
                                                .dataType(FieldDataType.menu)
                                                .build()
                                ))
                                .build(),
                        new OrdersCrud(orderRepository, customerId)
                ))
                .style("width: 100%;")
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        customerId = httpRequest.lastPathItem();
        var customer = customerRepository.findById(customerId).get();
        name = customer.name();
        phoneNumber = customer.phoneNumber();
        email = customer.email();
        billingAddress = customer.billingAddress().toString();
        shippingAddress = customer.shippingAddress().toString();
    }


}
