package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.UUID;

@Singleton
@Route(value="/use-cases/rra/orders/create", parentRoute="/use-cases/rra")
public class CreateOrderPage extends EditOrderPage {

    @Inject
    public CreateOrderPage(CustomerRepository customerRepository, OrderRepository orderRepository, ProductRepository productRepository, OrderProductList orderProductList) {
        super(customerRepository, orderRepository, productRepository, orderProductList);
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
