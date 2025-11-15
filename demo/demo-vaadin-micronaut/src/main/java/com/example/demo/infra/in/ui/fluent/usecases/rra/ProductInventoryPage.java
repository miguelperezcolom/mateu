package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Product;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.ListingType;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

record ProductInventoryFilters() {

}

@Serdeable
record ProductInventoryRow(
        String id,
        Object card) {

}

@Route("/use-cases/rra/inventory")
@Singleton
public class ProductInventoryPage implements ComponentTreeSupplier, ListingBackend<ProductInventoryFilters, ProductInventoryRow>, TriggersSupplier, ActionHandler {

    private final ProductRepository productRepository;

    @Inject
    public ProductInventoryPage(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }



    @Override
    public Component component(HttpRequest httpRequest) {
        return Page.builder()
                .title("Product Inventory")
                .content(List.of(
                        Listing.builder()
                                .listingType(ListingType.card)
                                .searchable(true)
                                .infiniteScrolling(true)
                                .onRowSelectionChangedActionId("go-to-selected-product")
                        .build())
                )
                .build();
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }

    @Override
    public Class<ProductInventoryFilters> filtersClass() {
        return ProductInventoryFilters.class;
    }

    @Override
    public ListingData<ProductInventoryRow> search(String searchText, ProductInventoryFilters ordersFilters, Pageable pageable, HttpRequest httpRequest) {
        var found = productRepository.findAll().stream().filter(order -> matches(order, searchText, ordersFilters)).toList();
        return new ListingData<>(new io.mateu.uidl.data.Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                found.size(),
                found.stream()
                        .skip((long) pageable.page() * pageable.size())
                        .limit(pageable.size())
                        .map(product -> new ProductInventoryRow(
                                product.id(),
                                mapComponentToDto(null, createCard(product), "", "", null)
                        ))
                        .toList()
        ),
                "No products.");
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("go-to-selected-product".equals(actionId)) {
            return true;
        }
        return ListingBackend.super.supportsAction(actionId);
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("go-to-selected-product".equals(actionId)) {
            return UICommand.navigateTo("/use-cases/rra/inventory/" + httpRequest.getSelectedRows(ProductInventoryRow.class).get(0).id());
        }
        return ListingBackend.super.handleAction(actionId, httpRequest);
    }

    public static Card createCard(Product product) {
        return Card.builder()
                .title(new Text(product.name()))
                .media(new Image(product.image(), "max-height: 100px", ""))
                .content(new Div("" + product.listPrice().value() + " " + product.listPrice().currencyCode()))
                .variants(List.of(CardVariant.horizontal))
                .subtitle(new Text(product.brand()))
                .style("width: fit-content;")
                .cssClasses("image-on-right")
                .build();
    }

    private boolean matches(Product product, String searchText, ProductInventoryFilters ordersFilters) {
        if (searchText == null || searchText.isEmpty()) {
            return true;
        }
        boolean match = true;
        for (String token : searchText.split(" ")) {
            token = token.toLowerCase();
            match &= (product.name().toLowerCase().contains(token)
                    || product.brand().toLowerCase().contains(token)
            );
        }
        return match;
    }
}
