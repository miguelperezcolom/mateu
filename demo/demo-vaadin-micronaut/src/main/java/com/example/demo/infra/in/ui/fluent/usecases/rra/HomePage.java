package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Order;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import io.mateu.dtos.CardDto;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BadgeColor;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardRow;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.CrudlType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.List;
import java.util.Map;

import static com.example.demo.infra.in.ui.fluent.usecases.rra.OrdersPage.map;
import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

@Route("/fluent-app/use-cases/rra/home")
@Singleton
public class HomePage implements ComponentTreeSupplier, CrudlBackend<NoFilters, CardRow>, HasTriggers {

    private final OrderRepository orderRepository;

    @Inject
    public HomePage(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Welcome to the Redwood Reference App")
                .subtitle("Create and submit orders and review information about inventory.")
                .cssClasses("redwood")
                .style("width: 100%; display: flex;")
                .content(List.of(Crudl.builder()
                        .crudlType(CrudlType.card)
                        .searchable(false)
                        .style("width: 100%;")
                                .infiniteScrolling(true)
                        .build()))
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

    private static BadgeColor color(OrderStatus status) {
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
    public CrudlData<CardRow> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        var filteredItems = orderRepository.findAll().stream()
                .filter(order -> OrderStatus.Draft.equals(order.status())).toList();
        return new CrudlData<>(new Page<>(
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

}
