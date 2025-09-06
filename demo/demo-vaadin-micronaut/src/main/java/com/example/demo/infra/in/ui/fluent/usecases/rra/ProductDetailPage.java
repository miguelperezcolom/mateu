package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Amount;
import com.example.demo.domain.Contact;
import com.example.demo.domain.Product;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.CrudlType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Route("/fluent-app/use-cases/rra/inventory/.*")
@Singleton
public class ProductDetailPage implements ComponentTreeSupplier, HasPostHydrationMethod {

    String productId;
    Product product;


    private final ProductRepository productRepository;

    @Inject
    public ProductDetailPage(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
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
                                                        Crudl.builder()
                                                                .crudlType(CrudlType.card)
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

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        productId = httpRequest.lastPathItem();
        product = productRepository.findById(productId).get();

    }
}
