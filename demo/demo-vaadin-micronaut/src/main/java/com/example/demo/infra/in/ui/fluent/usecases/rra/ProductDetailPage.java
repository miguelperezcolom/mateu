package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Order;
import com.example.demo.domain.OrderRepository;
import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.Product;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

import static com.example.demo.infra.in.ui.fluent.usecases.rra.HomePage.color;


@Route("/fluent-app/use-cases/rra/inventory/.*")
@Singleton
public class ProductDetailPage implements ComponentTreeSupplier, HasPostHydrationMethod {

    String productId;
    Product product;


    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Inject
    public ProductDetailPage(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }


    @Override
    public Component component(HttpRequest httpRequest) {

        var nextOrders = orderRepository.findAll().stream().filter(order -> order.lines().stream()
                .anyMatch(line -> line.product().id().equals(productId)))
                .filter(order -> !OrderStatus.Delivered.equals(order.status()))
                .toList();


        return Form.builder()
                .title("Product " + productId)
                .noHeader(true)
                .content(List.of(HorizontalLayout.builder()
                                .content(List.of(

                        FormSection.builder()
                                .style("min-width: 10rem; padding-left: 2rem; padding-right: 2rem;")
                                .content(List.of(FormLayout.builder()
                                                .maxColumns(1)
                                                .content(
                                                        List.of(
                                                                Image.builder()
                                                                        .src(product.image())
                                                                        .build(),
                                                                Text.builder()
                                                                        .container(TextContainer.h1)
                                                                        .text(product.name())
                                                                        .style("margin: 0;")
                                                                        .build(),
                                                                Text.builder()
                                                                        .container(TextContainer.h5)
                                                                        .text(product.id())
                                                                        .style("margin: 0;margin-bottom: 1rem;")
                                                                        .build(),
                                                                FormField.builder()
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.html)
                                                                        .label("Description")
                                                                        .initialValue(product.description())
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
                                                                        .label("Category")
                                                                        .initialValue(product.category())
                                                                        .build(),
                                                                FormField.builder()
                                                                        .dataType(FieldDataType.string)
                                                                        .stereotype(FieldStereotype.html)
                                                                        .label("List Price")
                                                                        .initialValue(product.listPrice().toString())
                                                                        .build()
                                                        )
                                                )
                                        .build()))
                                .build(),
                        FormSection.builder()
                                .style("min-width: 10rem; padding-left: 2rem; padding-right: 2rem;")
                                .title("")
                                .content(List.of(FormLayout.builder()
                                        .maxColumns(1)
                                        .content(
                                                List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Weight")
                                                                .initialValue("" + product.weight() + " kg")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Dimensions")
                                                                .initialValue(product.dimensions())
                                                                .build()
                                                )
                                        )
                                        .build()))
                                .build(),
                        FormSection.builder()
                                .title("Supplier contact")
                                .style("min-width: 10rem; padding-left: 2rem; padding-right: 2rem;")
                                .content(List.of(FormLayout.builder()
                                        .maxColumns(1)
                                        .content(
                                                List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Name")
                                                                .initialValue(product.supplierContact().name())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Supplier Number")
                                                                .initialValue(product.supplierContact().supplierNumber())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Contact")
                                                                .initialValue(product.supplierContact().contact())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Email")
                                                                .initialValue(product.supplierContact().email())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Phone Number")
                                                                .initialValue(product.supplierContact().phoneNumber())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("URL")
                                                                .initialValue(product.supplierContact().url())
                                                                .build()
                                                )
                                        )
                                        .build()))
                                .build(),
                        FormSection.builder()
                                .title("Supplier product")
                                .style("min-width: 10rem; padding-left: 2rem; padding-right: 2rem;")
                                .content(List.of(FormLayout.builder()
                                        .maxColumns(1)
                                        .content(
                                                List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Current Inventory")
                                                                .initialValue(product.supplierProduct().currentInventory() + " Items in stock")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("MSRP")
                                                                .initialValue(product.supplierProduct().msrp().toString())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Supplier Price")
                                                                .initialValue(product.supplierProduct().supplierPrice().toString())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Supplier Number")
                                                                .initialValue(product.supplierProduct().supplierNumber())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Average Lead Time")
                                                                .initialValue(product.supplierProduct().averageLeadTime() + " days")
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Stock Status")
                                                                .initialValue(product.supplierProduct().status().name())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Country")
                                                                .initialValue(product.supplierProduct().country())
                                                                .build(),
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Minimum Order Quantity")
                                                                .initialValue(product.supplierProduct().minimumOrderQuantity())
                                                                .build()
                                                )
                                        )
                                        .build()))
                                .build(),
                        FormSection.builder()
                                .style("min-width: 10rem; padding-left: 2rem; padding-right: 2rem;")
                                .toolbar(List.of(Button.builder()
                                                .label("View All Orders")
                                        .build()))
                                .content(List.of(FormLayout.builder()
                                        .maxColumns(1)
                                        .content(
                                                List.of(
                                                        FormField.builder()
                                                                .dataType(FieldDataType.string)
                                                                .stereotype(FieldStereotype.html)
                                                                .label("Upcoming Orders")
                                                                .initialValue("10000")
                                                                .build(),
                                                        VerticalLayout.builder()
                                                                .content(nextOrders.stream().limit(3).map(order -> createCard(order)).toList())
                                                                .spacing(true)
                                                                .build(),
                                                        Anchor.builder()
                                                                .url("../orders")
                                                                .text("View All Orders")
                                                                .build()
                                                )
                                        )
                                        .build()))
                                .build()
                                ))
                        .build()
                ))
                .build();
    }

    private Component createCard(Order order) {
        return Card.builder()
                .title(new Text(order.customer().name()))
                .content(VerticalLayout.builder()
                        .content(List.of(
                                Badge.builder()
                                        .color(color(order.status()))
                                        .text(order.status().name())
                                        .build(),
                                new Div("" + order.totalAmount().value() + " " + order.totalAmount().currencyCode())
                        ))
                        .spacing(true)
                        .build())
                .variants(List.of(CardVariant.horizontal))
                .subtitle(new Text(order.id()))
                .style("width: fit-content;")
                .cssClasses("image-on-right")
                .build();

    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        productId = httpRequest.lastPathItem();
        product = productRepository.findById(productId).get();

    }
}
