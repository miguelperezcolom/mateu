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
import com.example.demo.domain.ProductStatus;
import com.example.demo.domain.SupplierProduct;
import com.example.demo.domain.Training;
import com.example.demo.domain.TrainingRepository;
import com.example.demo.domain.TrainingStatus;
import com.example.demo.domain.TrainingStep;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import net.datafaker.Faker;

import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static io.mateu.core.infra.InputStreamReader.readFromClasspath;
import static io.mateu.core.infra.JsonSerializer.pojoFromJson;

@Singleton
@Slf4j
public class RRAGenerator {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final TrainingRepository trainingRepository;

    private static final int MAX_CUSTOMERS = 100;
    private static final int MAX_PRODUCTS = 100;
    private static final int MAX_ORDERS = 100;
    private static final int MAX_LINES_PER_ORDER = 10;

    Faker faker = new Faker();

    @Inject
    public RRAGenerator(
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            OrderRepository orderRepository, TrainingRepository trainingRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.trainingRepository = trainingRepository;
    }

    @SneakyThrows
    public void generate() {

        var random = new Random();
        var df = new DecimalFormat("000");
        var prodiddf = new DecimalFormat("P0000000000");
        var custiddf = new DecimalFormat("C0000000000");
        var ordiddf = new DecimalFormat("O0000000000");
        var traiddf = new DecimalFormat("T0000000000");

        var json = readFromClasspath(PhotoDownloader.class, "/rra/cars.json");
        Cars cars = pojoFromJson(json, Cars.class);

        var productId = new AtomicInteger(1);
        cars.photos().photosList().stream().filter(photo -> photo.isFuturistic() == 0).forEach(photo -> {
            var vehicle = faker.vehicle();
            var brand = faker.brand().car();
            productRepository.save(Product.builder()
                    .id(prodiddf.format(productId.getAndIncrement()))
                    .brand(photo.makeName())
                    .description(String.join(" ", faker.lorem().words(10)))
                    .category(vehicle.carType())
                    .dimensions("23 x 25.5 x 213")
                    .listPrice(new Amount(39213.22, "EUR"))
                    .weight(1732)
                    .manufacturer(photo.makeName())
                    .supplierContact(Contact.builder()
                            .contact("John Smith (VP)")
                            .email("js@cxxx.com")
                            .name("John Smith")
                            .phoneNumber("+1 3737 838 292")
                            .url("https://sss.wwwww.com")
                            .supplierNumber("83081340")
                            .build())
                    .supplierProduct(SupplierProduct.builder()
                            .averageLeadTime(1)
                            .msrp(new Amount(100.10, "EUR"))
                            .country("US")
                            .currentInventory(2)
                            .minimumOrderQuantity(3)
                            .supplierNumber("23434234234")
                            .status(ProductStatus.InStock)
                            .supplierPrice(new Amount(150.43, "EUR"))
                            .build())
                    .name(photo.modelName())
                    .image("/images/cars/" + photo.fileName())
                    .build());
        });

        for (int i = 1; i <= MAX_PRODUCTS; i++) {
            var vehicle = faker.vehicle();
            var imageId = i % 35 + 1;
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
                lines.add(new OrderLine(
                        UUID.randomUUID().toString(),
                        productRepository.findAll().get(Math.abs(random.nextInt()) % productRepository.findAll().size()),
                        3));
            }
            orderRepository.save(Order.builder()
                    .id(ordiddf.format(i))
                            .status(getOrderStatus(i))
                            .lines(lines)
                            .customer(customerRepository.findAll().get(Math.abs(random.nextInt()) % customerRepository.findAll().size()))
                            .comments(String.join(" ", faker.lorem().words(10)))
                            .date(LocalDate.now().plusDays(random.nextInt() % 30))
                            .lastUpdated(LocalDateTime.now().plusHours(random.nextInt() % 30))
                            .totalAmount(new Amount(100.21, "EUR"))
                    .build());
        }

        int trainingId = 1;
        trainingRepository.save(new Training(
           traiddf.format(trainingId++),
                "New Products from Vision Corporation",
                "/images/trainings/001.jpeg",
                LocalDate.now().plusDays(10),
                TrainingStatus.Pending,
                0,
                4,
                List.of(
                        new TrainingStep(UUID.randomUUID().toString(), "Product Recall Announced", String.join(" ", faker.lorem().words(40)), false, null),
                        new TrainingStep(UUID.randomUUID().toString(), "Which Of Our Products Are Affected?", String.join(" ", faker.lorem().words(40)), false, null),
                        new TrainingStep(UUID.randomUUID().toString(), "Does This Affect Any Of Our Existing Stock?", String.join(" ", faker.lorem().words(40)), false, null),
                        new TrainingStep(UUID.randomUUID().toString(), "Guidance To Customers", String.join(" ", faker.lorem().words(40)), false, null)
                )
        ));
        trainingRepository.save(new Training(
                traiddf.format(trainingId++),
                "New This Week",
                "/images/trainings/002.jpeg",
                LocalDate.now().plusDays(10),
                TrainingStatus.Pending,
                4,
                4,
                List.of(
                        new TrainingStep(UUID.randomUUID().toString(), "Product Recall Announced", String.join(" ", faker.lorem().words(40)), true, LocalDateTime.now()),
                        new TrainingStep(UUID.randomUUID().toString(), "Which Of Our Products Are Affected?", String.join(" ", faker.lorem().words(40)), true, LocalDateTime.now()),
                        new TrainingStep(UUID.randomUUID().toString(), "Does This Affect Any Of Our Existing Stock?", String.join(" ", faker.lorem().words(40)), true, LocalDateTime.now()),
                        new TrainingStep(UUID.randomUUID().toString(), "Guidance To Customers", String.join(" ", faker.lorem().words(40)), true, LocalDateTime.now())
                )
        ));
        trainingRepository.save(new Training(
                traiddf.format(trainingId++),
                "Product Recall Announcement",
                "/images/trainings/003.jpeg",
                LocalDate.now().plusDays(10),
                TrainingStatus.Pending,
                2,
                4,
                List.of(
                        new TrainingStep(UUID.randomUUID().toString(), "Product Recall Announced", String.join(" ", faker.lorem().words(40)), true, LocalDateTime.now()),
                        new TrainingStep(UUID.randomUUID().toString(), "Which Of Our Products Are Affected?", String.join(" ", faker.lorem().words(40)), true, LocalDateTime.now()),
                        new TrainingStep(UUID.randomUUID().toString(), "Does This Affect Any Of Our Existing Stock?", String.join(" ", faker.lorem().words(40)), false, null),
                        new TrainingStep(UUID.randomUUID().toString(), "Guidance To Customers", String.join(" ", faker.lorem().words(40)), false, null)
                )
        ));


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
