package com.example.demo.domain;

import jakarta.inject.Singleton;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Singleton
public class CustomerRepository {

    List<Customer> customers = new ArrayList<>();

    public List<Customer> findAll() {
        return customers;
    }

    public Optional<Customer> findById(String id) {
        return customers.stream().filter(order -> order.id().equals(id)).findFirst();
    }

    public Customer save(Customer customer) {
        customers.add(customer);
        return customer;
    }

}
