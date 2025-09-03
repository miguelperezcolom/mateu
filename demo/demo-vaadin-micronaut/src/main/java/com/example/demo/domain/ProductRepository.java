package com.example.demo.domain;

import jakarta.inject.Singleton;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Singleton
public class ProductRepository {

    List<Product> products = new ArrayList<>();

    public List<Product> findAll() {
        return products;
    }

    public Optional<Product> findById(String id) {
        return products.stream().filter(order -> order.id().equals(id)).findFirst();
    }

    public Product save(Product product) {
        products.add(product);
        return product;
    }

}
