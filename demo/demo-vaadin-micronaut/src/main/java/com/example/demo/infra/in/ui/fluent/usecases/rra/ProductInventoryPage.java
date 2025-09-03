package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.OrderStatus;
import com.example.demo.domain.Product;
import com.example.demo.domain.ProductRepository;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BadgeColor;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.CardVariant;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Div;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.CrudlType;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToDto;

record ProductInventoryFilters() {

}

@Serdeable
record ProductInventoryRow(
        String id,
        Object card) {

}

@Route("/fluent-app/use-cases/rra/inventory")
@Singleton
public class ProductInventoryPage implements ComponentTreeSupplier, CrudlBackend<ProductInventoryFilters, ProductInventoryRow>, HasTriggers, HandlesActions {

    private final ProductRepository productRepository;

    @Inject
    public ProductInventoryPage(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }



    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Product Inventory")
                .toolbar(List.of(new Button("Create", "create")))
                .content(List.of(
                        Crudl.builder()
                                .crudlType(CrudlType.card)
                                .searchable(true)
                        .style("width: 100%;")
                                .infiniteScrolling(true)
                                .onRowSelectionChangedActionId("go-to-selected-product")
                        .build()))
                .style("width: 100%;")
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
    public CrudlData<ProductInventoryRow> search(String searchText, ProductInventoryFilters ordersFilters, Pageable pageable, HttpRequest httpRequest) {
        return new CrudlData<>(new Page<>(
                searchText,
                pageable.size(),
                pageable.page(),
                productRepository.findAll().size(),
                productRepository.findAll().stream()
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
        if ("create".equals(actionId)) {
            return true;
        }
        if ("go-to-selected-product".equals(actionId)) {
            return true;
        }
        return CrudlBackend.super.supportsAction(actionId);
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("go-to-selected-product".equals(actionId)) {
            return UICommand.navigateTo("/fluent-app/use-cases/rra/inventory/" + httpRequest.getSelectedRows(ProductInventoryRow.class).get(0).id());
        }
        return CrudlBackend.super.handleAction(actionId, httpRequest);
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
}
