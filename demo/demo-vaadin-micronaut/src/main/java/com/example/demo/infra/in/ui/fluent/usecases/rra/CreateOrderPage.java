package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.UUID;

@Singleton
@Route("/fluent-app/use-cases/rra/orders/create")
public class CreateOrderPage extends EditOrderPage {

    @Inject
    public CreateOrderPage(CustomerRepository customerRepository, OrderRepository orderRepository, ProductRepository productRepository) {
        super(customerRepository, orderRepository, productRepository);
    }

    @Override
    String getOrderId() {
        return UUID.randomUUID().toString();
    }

    @Override
    String getTitle() {
        return "Create Order";
    }
}
