package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Order;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BadgeColor;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardRow;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.ListingType;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

@Route("/use-cases/rra/home")
@Singleton
public class HomePage implements ComponentTreeSupplier, ListingBackend<NoFilters, CardRow>, TriggersSupplier {

    private final OrderRepository orderRepository;

    @Inject
    public HomePage(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Page.builder()
                .title("Welcome to the Redwood Reference App")
                .subtitle("Create and submit orders and review information about inventory.")
                .content(List.of(Listing.builder()
                        .listingType(ListingType.card)
                        .searchable(false)
                        .style("width: 100%; height: 100%;")
                        .infiniteScrolling(true)
                        .onRowSelectionChangedActionId("go-to-selected-order")
                        .build())
                )
                .build();
    }

    private List<Component> createCards() {
        return orderRepository.findAll().stream().filter(order -> OrderStatus.Draft.equals(order.status())).map(HomePage::createCard).toList();
    }

    public static Component createCard(Order order) {
        return Card.builder()
                .title(new Text(order.customer().name()))
                //.media(new Image("https://picsum.photos/150/100.webp?random=" + order.id()))
                .media(new Image(order.lines().get(0).product().image(), "max-height: 100px", ""))
                .headerSuffix(Badge.builder()
                        .color(color(order.status()))
                        .text(order.status().name())
                        .build())
                //.variants(List.of(CardVariant.coverMedia))
                .content(new Div("" + order.totalAmount().value() + " " + order.totalAmount().currencyCode()))
                .variants(List.of(CardVariant.horizontal))
                .subtitle(new Text(order.id()))
                .style("width: fit-content;")
                .cssClasses("image-on-right")
                .build();
    }

    public static BadgeColor color(OrderStatus status) {
        return switch (status) {
            case Draft -> BadgeColor.normal;
            case Completed -> BadgeColor.contrast;
            case ReadyToDeliver -> BadgeColor.error;
            case Delivered -> BadgeColor.success;
        };
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }

    @Override
    public Class<NoFilters> filtersClass() {
        return NoFilters.class;
    }

    @Override
    public ListingData<CardRow> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        var filteredItems = orderRepository.findAll().stream()
                .filter(order -> OrderStatus.Draft.equals(order.status())).toList();
        return new ListingData<>(new io.mateu.uidl.data.Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                filteredItems.size(),
                        filteredItems.stream()
                        .skip((long) pageable.page() * pageable.size())
                        .limit(pageable.size())
                        .map(order -> new CardRow(
                                order.id(),
                                mapComponentToDto(null, createCard(order), "", "", null)
                        ))
                        .toList()
        ),
                "No orders.");
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("go-to-selected-order".equals(actionId)) {
            return UICommand.navigateTo("/use-cases/rra/orders/" + httpRequest.getSelectedRows(CardRow.class).get(0).id());
        }
        return ListingBackend.super.handleAction(actionId, httpRequest);
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("go-to-selected-order".equals(actionId)) {
            return true;
        }
        return ListingBackend.super.supportsAction(actionId);
    }
}
