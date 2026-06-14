package io.mateu.mdd.demoadminpanel.infra.in.ui;


import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.SelectedItem;
import io.mateu.uidl.interfaces.Selector;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

record Filters() {}
record Row(String id, String name, String address) {}

@Trigger(type = TriggerType.OnLoad, actionId = "search")
@Style("min-width: 40rem;")
public class HotelSelector extends Listing<Filters, Row> implements Selector<String>, LookupLabelSupplier {

    String _fieldId;

    static final List<Row> rows = List.of(
            new Row("1", "Hotel 1", "Calle 1"),
            new Row("2", "Hotel 2", "Calle 2"),
            new Row("3", "Hotel 3", "Calle 3"),
            new Row("4", "Hotel 4", "Calle 4"),
            new Row("5", "Hotel 5", "Calle 5"),
            new Row("6", "Hotel 6", "Calle 6")
    );

    @Override
    public ListingData<Row> search(String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(rows.stream().filter(r -> r.name().contains(searchText)).toList());
    }

    @Override
    public SelectedItem<String> selected(HttpRequest httpRequest) {
        Row row = httpRequest.getClickedRow(rowClass());
        return new SelectedItem<>(row.id(), row.name());
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
        return rows.stream().filter(r -> r.id().equals(id)).findFirst().orElseThrow().name();
    }

}
