package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Status;
import io.mateu.uidl.data.*;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.List;
import java.util.Map;

enum Product2Status {
    Available, OutOfStock
}

@Slf4j
record Product2(
        @Section(value = "Product information", columns = 4)
        @NotEmpty @EditableOnlyWhenCreating String id,
               @NotEmpty
               String name,
               @Stereotype(FieldStereotype.textarea)
               @HiddenInList
               String description,
               boolean certified,
               @NotNull
               @Status(
                       defaultStatus = StatusType.NONE,
                       mappings = {
                               @StatusMapping(from = "Available", to = StatusType.SUCCESS),
                               @StatusMapping(from = "OutOfStock", to = StatusType.DANGER)
                       }
               )
               Product2Status status,
        @Section("Components")
        @Label("")
        @Colspan(2)
        List<ProductComponent> components) implements Identifiable, LookupOptionsSupplier {

    Product2 {
        components = components != null? components: new ArrayList<>();
    }

    @Toolbar
    public void doNothing() {
        log.info("do nothing on " + name);
        components.add(new ProductComponent("xx", 1, null, false, "yyy"));
    }

    @Override
    public String toString() {
        return name != null?"Product " + name:"New product";
    }

    @Override
    public ListingData<io.mateu.uidl.data.Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(new io.mateu.uidl.data.Option("zzz"));
    }
}

class Product2Repository implements CrudRepository<Product2> {

    private static final Map<String, Product2> db = new HashMap<>(Map.of("1", new Product2("1", "Producto 1", "xxx", true, Product2Status.Available, List.of(
            new ProductComponent("x", 1, null, false, "yyy"),
            new ProductComponent("y", 2, null, true, "xxx")
    ))));

    @Override
    public Optional<Product2> findById(String id) {
        return db.containsKey(id) ? Optional.of(db.get(id)) : Optional.empty();
    }

    @Override
    public String save(Product2 entity) {
        db.put(entity.id(), entity);
        return entity.id();
    }

    @Override
    public List<Product2> findAll() {
        return db.values().stream().toList();
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        selectedIds.forEach(db::remove);
    }
}


@UI("/productszzz")
@SplitCrud
@Slf4j
public class Products2 extends AutoCrud<Product2> {

    @Override
    public CrudRepository<Product2> repository() {
        return new Product2Repository();
    }

    void setAsBlue(Product2 row) {
      log.info("set as blue {}", row);
    }

    void setAsGreen(Product2 row) {
        log.info("set as green {}", row);
    }

    @ListToolbarButton
    void doSomethingOnRows(List<Product2> selection) {
        log.info("do something on {}", selection);
    }

}
