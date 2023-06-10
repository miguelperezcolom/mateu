package com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.poller;

import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.Updater;
import com.example.demoremote.ui.demoApp.menus.useCases.processDefinition.main.insprod.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicReference;

/**
 * the mission of the poller is to retrieve the products from insprod using their api
 * and create the entities in our model
 */
@Service
public class Poller {

    @Autowired
    InsProdClient insProdClient;

    @Autowired
    ProductRepository productRepository;

    @Autowired
    JourneyRepository journeyRepository;

    @Autowired
    InputRepository inputRepository;

    @Autowired
    Updater updater;

    public void pollAll() {

        try {
            insProdClient.getProducts().stream()
                    .forEach(p -> {
                        Product product = productRepository.save(Product.builder()
                                .key(p.getKey())
                                .name(p.getProduct_label())
                                .description(p.getProduct_description())
                                .status(p.getStatus())
                                .build());

                        AtomicReference<Journey> journey = new AtomicReference<>();
                        p.getJourneys().forEach(j -> {

                            journey.set(journeyRepository.save(Journey.builder()
                                    .key(p.getKey() + "#" + j.getType())
                                    .product(product)
                                    .build()));

                            j.getInputs().forEach(i -> {
                                inputRepository.save(Input.builder()
                                        .key(p.getKey() + "#" + j.getType() + "#" + i.getKey())
                                        .journey(journey.get())
                                                .label(i.getLabel())
                                                .type(i.getType())
                                                .validations(i.getValidations())
                                        .build());
                            });

                        });
                    });
        } catch (Exception e) {
            e.printStackTrace();
        }

        updater.updateAll();

    }



}
