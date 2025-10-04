package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Singleton
public class OrderProductList implements ComponentTreeSupplier, ActionHandler {

    private List<String> productIds;
    private String productId;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Inject
    public OrderProductList(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }


    public OrderProductList load(List<String> productIds, String productId) {
        this.productIds = productIds;
        this.productId = productId;
        return this;
    }

    @Override
    public Component component(HttpRequest httpRequest) {

        var product = productRepository.findById(productId).get();

        return Form.builder()
                .title(product.name())
                .content(List.of(
                        FormField.builder()
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.html)
                                .initialValue("<img width='200' src='" + product.image() + "'></img>")
                                .label("Image")
                                .build(),
                        FormField.builder()
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.html)
                                .label("Brand")
                                .initialValue(product.brand())
                                .build(),
                        FormField.builder()
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.html)
                                .initialValue(product.listPrice().toString())
                                .label("Price")
                                .build()
                ))
                .toolbar(List.of(
                        Button.builder()
                                .iconOnLeft(IconKey.ChevronLeft.iconName)
                                .actionId("prev")
                                .disabled(productIds.indexOf(productId) == 0)
                                .build(),
                        Button.builder()
                                .iconOnRight(IconKey.ChevronRight.iconName)
                                .actionId("next")
                                .disabled(productIds.indexOf(productId) == productIds.size() - 1)
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("prev".equals(actionId)) {
            productId = productIds.get(productIds.indexOf(productId) - 1);
            return this;
        }
        if ("next".equals(actionId)) {
            productId = productIds.get(productIds.indexOf(productId) + 1);
            return this;
        }
        return null;
    }

}
