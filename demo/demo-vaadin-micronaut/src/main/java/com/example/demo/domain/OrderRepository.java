package com.example.demo.domain;

import jakarta.inject.Singleton;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Singleton
public class OrderRepository {

    List<Order> orders = new ArrayList<>();

    public List<Order> findAll() {
        return orders;
    }

    public Optional<Order> findById(String id) {
        return orders.stream().filter(order -> order.id().equals(id)).findFirst();
    }

    public Order save(Order order) {
        remove(order);
        orders.add(order);
        return order;
    }

    public void remove(Order order) {
        var found = orders.stream().filter(item -> item.id().equals(order.id())).findFirst();
        if (found.isPresent()) {
            orders.remove(found.get());
        }
    }
}
