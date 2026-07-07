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
public class HotelSelector extends Listing<Filters, Row> implements Selector<String>, LookupLabelSupplier, io.mateu.uidl.interfaces.LookupOptionsSupplier {

    // 30 hotels so the app-context picker shows its SEARCHABLE variant (> 7 options)
    static final List<Row> rows = java.util.stream.IntStream.rangeClosed(1, 30)
            .mapToObj(i -> new Row("" + i, "Hotel " + i, "Calle " + i))
            .toList();

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

    @Override
    public ListingData<io.mateu.uidl.data.Option> search(String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(rows.stream()
                .filter(r -> searchText == null || searchText.isBlank() || r.name().toLowerCase().contains(searchText.toLowerCase()))
                .map(r -> new io.mateu.uidl.data.Option(r.id(), r.name()))
                .toArray(io.mateu.uidl.data.Option[]::new));
    }

}
