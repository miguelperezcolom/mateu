package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Order;
import com.example.demo.domain.OrderRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Route("/fluent-app/use-cases/rra/home")
@Singleton
public class HomePage implements ComponentTreeSupplier {

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
                .content(List.of(
                        createCard(orderRepository.findAll().get(0)),
                        createCard(orderRepository.findAll().get(1)),
                        createCard(orderRepository.findAll().get(2)),
                        createCard(orderRepository.findAll().get(3)),
                        createCard(orderRepository.findAll().get(4))
                ))
                .build();
    }

    private Component createCard(Order order) {
        return Card.builder()
                .header(new Text(order.customer().name()))
                .media(new Image("https://picsum.photos/150/100.webp?random=" + order.id()))
                .variants(List.of(CardVariant.coverMedia))
                .content(new Text("Draft<br/>$822.12"))
                .header(new Text(order.id()))
                .build();
    }
}
