package com.example.demo.infra.in.data;

import com.example.demo.domain.Address;
import com.example.demo.domain.Amount;
import com.example.demo.domain.Contact;
import com.example.demo.domain.Customer;
import com.example.demo.domain.CustomerRepository;
import com.example.demo.domain.Order;
import com.example.demo.domain.OrderLine;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.Product;
import com.example.demo.domain.ProductRepository;
import com.example.demo.domain.SupplierProduct;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;

import java.text.DecimalFormat;
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

    private static final int MAX_CUSTOMERS = 100;
    private static final int MAX_PRODUCTS = 100;
    private static final int MAX_ORDERS = 100;
    private static final int MAX_LINES_PER_ORDER = 10;

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
        var df = new DecimalFormat("000");
        var prodiddf = new DecimalFormat("P0000000000");
        var custiddf = new DecimalFormat("C0000000000");
        var ordiddf = new DecimalFormat("O0000000000");

        for (int i = 1; i <= MAX_PRODUCTS; i++) {
            var vehicle = faker.vehicle();
            var imageId = i % 35 + 1;
            productRepository.save(Product.builder()
                            .id(prodiddf.format(i ))
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
                            .image("/images/products/" + df.format(imageId) + (imageId < 21?".jpg":".png"))
                    .build());
        }

        for (int i = 1; i <= MAX_CUSTOMERS; i++) {
            var person = faker.funnyName();
            var address1 = faker.address();
            var address2 = faker.address();
            customerRepository.save(Customer.builder()
                            .id(custiddf.format(i))
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

        for (int i = 1; i <= MAX_ORDERS; i++) {
            var lines = new ArrayList<OrderLine>();
            int maxLines = (Math.abs(random.nextInt()) % MAX_LINES_PER_ORDER) + 1;
            for (int j = 0; j < maxLines; j++) {
                lines.add(new OrderLine(productRepository.findAll().get(Math.abs(random.nextInt()) % productRepository.findAll().size()), 3));
            }
            orderRepository.save(Order.builder()
                    .id(ordiddf.format(i))
                            .status(getOrderStatus(i))
                            .lines(lines)
                            .customer(customerRepository.findAll().get(Math.abs(random.nextInt()) % customerRepository.findAll().size()))
                            .comments(faker.text().text())
                            .date(LocalDate.now().plusDays(random.nextInt() % 30))
                            .lastUpdated(LocalDateTime.now().plusHours(random.nextInt() % 30))
                            .totalAmount(new Amount(100.21, "EUR"))
                    .build());
        }

        log.info("RRA data generated.");

    }

    private OrderStatus getOrderStatus(int i) {
        return switch (i % 30) {
            case 1 -> OrderStatus.Draft;
            case 5,6,7 -> OrderStatus.Completed;
            case 10, 11, 12, 13, 14, 15 -> OrderStatus.ReadyToDeliver;
            default -> OrderStatus.Delivered;
        };
    }

}
