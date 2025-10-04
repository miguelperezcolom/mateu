package com.example.demo.infra.in.ui.fluent.crudls;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.CrudlData;
import io.mateu.uidl.data.Direction;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.CrudlBackend;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.IconKey;
import io.micronaut.serde.annotation.Serdeable;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

record Filters2(int age) {}
@Serdeable
record Row2(
        String name,
        int age,
        double balance,
        Status status,
        boolean spanish,
        String html,
        String icon,
        String link,
        String image) {}

@Route("/fluent-app/crudls/more-columns")
@Slf4j
public class MoreColumnsCrudl implements ComponentTreeSupplier, CrudlBackend<Filters2, Row2>, TriggersSupplier {

    @JsonIgnore
    List<Row2> allItems = List.of(
            new Row2(
                    "Mateu",
                    17,
                    253671.21,
                    new Status(StatusType.SUCCESS, "Active"),
                    true,
                    "This is <b>html</b>",
                    IconKey.Sword.iconName,
                    "htts://mateu.io",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="
                    ),
            new Row2(
                    "Antonia",
                    29,
                    22383.10,
                    new Status(StatusType.WARNING, "Applying"),
                    false,
                    "This is <b>html</b>",
                    IconKey.Newspaper.iconName,
                    "htts://mateu.io",
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII="
            )
    );

    @Override
    public Crudl component(HttpRequest httpRequest) {
        return Crudl.builder() // vertical layout as default container for children
                .title("Basic crudl")
                .id("crud")
                .filters(List.of(
                        FormField.builder()
                                .id("age")
                                .label("Age")
                                .dataType(FieldDataType.integer)
                                .build()
                ))
                .searchable(true)
                .columns(List.of(
                        GridColumn.builder()
                                .id("name")
                                .label("Name")
                                .sortable(true)
                                .build(),
                        GridColumn.builder()
                                .id("balance")
                                .dataType(FieldDataType.number)
                                .label("Balance")
                                .build(),
                        GridColumn.builder()
                                .id("status")
                                .dataType(FieldDataType.status)
                                .label("Status")
                                .build(),
                        GridColumn.builder()
                                .id("html")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.html)
                                .label("Html")
                                .build(),
                        GridColumn.builder()
                                .id("image")
                                .dataType(FieldDataType.string)
                                .stereotype(FieldStereotype.image)
                                .label("Image")
                                .build()
                ))
                .emptyStateMessage("Please search.")
                .style("width: 100%;")
                .build();
    }

    @Override
    public Class<Filters2> filtersClass() {
        return Filters2.class;
    }

    @Override
    public CrudlData<Row2> search(String searchText, Filters2 filters, Pageable pageable, HttpRequest httpRequest) {
        var filteredItems = allItems.stream()
                .filter(item -> (searchText.isEmpty()
                        || item.name()
                        .toLowerCase()
                        .contains(searchText))
                        &&
                        (filters.age() == 0 || item.age() == filters.age()))
                .sorted((a, b) -> {
                    int compare = 0;
                    for (Sort sort : pageable.sort()) {
                        if ("age".equals(sort.field())) {
                            compare = Integer.compare(a.age(), b.age()) * (Direction.ascending.equals(sort.direction())?-1:1);
                        }
                        if ("name".equals(sort.field())) {
                            compare = a.name().compareTo(b.name()) * (Direction.ascending.equals(sort.direction())?-1:1);
                        }
                        if (compare != 0) {
                            break;
                        }
                    }
                    return compare;
                })
                .toList();
        return new CrudlData<>(new Page<>(
                searchText + "#" + filters.age(),
                pageable.size(),
                pageable.page(),
                filteredItems.size(),
                filteredItems.stream().skip((long) pageable.size() * pageable.page()).limit(pageable.size()).toList()
        ),
                "No items found. Please try again.");
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(new OnLoadTrigger("search"));
    }
}
