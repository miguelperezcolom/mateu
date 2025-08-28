package com.example.demo.infra.in.data;

import com.example.demo.domain.Address;
import com.example.demo.domain.Amount;
import com.example.demo.domain.Contact;
import com.example.demo.domain.Customer;
import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.Order;
import com.example.demo.domain.OrderLine;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.Product;
import com.example.demo.domain.ProductRepository;
import com.example.demo.domain.SupplierProduct;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Random;

@Singleton
@Slf4j
public class RRAGenerator {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    Faker faker = new Faker();

    @Inject
    public RRAGenerator(
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
    }

    public void generate() {

        var random = new Random();

        for (int i = 0; i < 10; i++) {
            var vehicle = faker.vehicle();
            productRepository.save(Product.builder()
                            .id(faker.idNumber().ssnValid())
                            .brand(faker.brand().car())
                            .description(faker.text().text())
                            .category(vehicle.carType())
                            .dimensions(vehicle.transmission())
                            .listPrice(new Amount(213.22, "EUR"))
                            .weight(3220)
                            .manufacturer(faker.vehicle().manufacturer())
                            .supplierContact(Contact.builder().build())
                            .supplierProduct(SupplierProduct.builder().build())
                            .name(vehicle.makeAndModel())
                            .image(faker.image().base64SVG())
                    .build());
        }

        for (int i = 0; i < 10; i++) {
            var person = faker.superhero();
            var address1 = faker.address();
            var address2 = faker.address();
            customerRepository.save(Customer.builder()
                            .id(faker.idNumber().peselNumber())
                            .email(faker.internet().emailAddress())
                            .billingAddress(Address.builder()
                                    .address(address1.streetAddress())
                                    .postalCode(address1.zipCode())
                                    .city(address1.cityName())
                                    .country(address1.country())
                                    .state(address1.state())
                                    .build())
                            .shippingAddress(Address.builder()
                                    .address(address2.streetAddress())
                                    .postalCode(address2.zipCode())
                                    .city(address2.cityName())
                                    .country(address2.country())
                                    .state(address2.state())
                                    .build())
                            .name(person.name())
                            .phoneNumber(faker.phoneNumber().phoneNumberInternational())
                    .build());
        }

        for (int i = 0; i < 10; i++) {
            var lines = new ArrayList<OrderLine>();
            for (int j = 0; j < 5; j++) {
                lines.add(new OrderLine(productRepository.findAll().get(Math.abs(random.nextInt()) % productRepository.findAll().size()), 3));
            }
            orderRepository.save(Order.builder()
                    .id(faker.idNumber().peselNumber())
                            .lines(lines)
                            .customer(customerRepository.findAll().get(Math.abs(random.nextInt()) % customerRepository.findAll().size()))
                            .comments(faker.text().text())
                            .date(LocalDate.now().plusDays(random.nextInt() % 30))
                            .lastUpdated(LocalDateTime.now().plusHours(random.nextInt() % 30))
                            .totalAmount(new Amount(100.21, "EUR"))
                    .build());
        }

        log.info(faker.name().fullName());
        log.info(faker.address().fullAddress());
        log.info(faker.phoneNumber().phoneNumber());
        log.info(faker.dcComics().name());
        log.info(faker.starWars().vehicles());
        log.info(faker.image().base64SVG());

        customerRepository.findAll().forEach(customer -> log.info(customer.name()));
        productRepository.findAll().forEach(product -> log.info(product.name()));

    }

}
