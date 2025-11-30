package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Pair;
import io.mateu.uidl.interfaces.RouteResolver;
import jakarta.inject.Inject;

import java.util.List;
import java.util.regex.Pattern;

public class OrderDetailRouter implements RouteResolver {

    private final Pattern pattern = Pattern.compile("/use-cases/rra/orders/.*");
    private final OrderRepository orderRepository;

    @Inject
    public OrderDetailRouter(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }


    @Override
    public Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest) {
        if (pattern.matcher(route).matches()) {
            var orderId = httpRequest.lastPathItem();
            if (!"create".equals(orderId)) {
                var order = orderRepository.findById(orderId).get();
                if (OrderStatus.Draft.equals(order.status())) {
                    return EditOrderPage.class;
                }
                return OrderDetailPage.class;
            }
        }
        return Void.class;
    }

    @Override
    public List<Pair<Pattern, Pattern>> supportedRoutesPatterns() {
        return List.of(new Pair(pattern, Pattern.compile("/use-cases/rra")));
    }
}
