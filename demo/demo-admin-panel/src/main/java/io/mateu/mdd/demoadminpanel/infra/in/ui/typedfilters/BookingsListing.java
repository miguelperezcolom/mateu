package io.mateu.mdd.demoadminpanel.infra.in.ui.typedfilters;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;

/**
 * TYPED filters on a declarative listing: the Filters class declares {@link DateRange}, {@link
 * NumberRange} and {@code Set<Channel>} fields — the smart search bar renders range and
 * multi-select widgets for them and {@code search(...)} receives the typed instances assembled.
 */
@UI("/typed-filters")
@Title("Bookings (typed filters)")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class BookingsListing extends Listing<BookingsFilters, BookingRow> {

    private static final List<BookingRow> BOOKINGS = List.of(
            new BookingRow("B-001", "Smith", Channel.WEB, LocalDate.of(2026, 7, 2), 320.0),
            new BookingRow("B-002", "Jones", Channel.PHONE, LocalDate.of(2026, 7, 5), 149.5),
            new BookingRow("B-003", "García", Channel.AGENCY, LocalDate.of(2026, 7, 9), 890.0),
            new BookingRow("B-004", "Brown", Channel.WEB, LocalDate.of(2026, 7, 12), 260.0),
            new BookingRow("B-005", "Müller", Channel.AGENCY, LocalDate.of(2026, 7, 15), 545.0),
            new BookingRow("B-006", "Rossi", Channel.PHONE, LocalDate.of(2026, 7, 20), 75.0));

    @Override
    public ListingData<BookingRow> search(
            String searchText, BookingsFilters filters, Pageable pageable, HttpRequest httpRequest) {
        var rows = BOOKINGS.stream()
                .filter(row -> searchText == null || searchText.isBlank()
                        || (row.guest() + " " + row.locator()).toLowerCase()
                            .contains(searchText.toLowerCase()))
                .filter(row -> filters.getCreated() == null || filters.getCreated().contains(row.created()))
                .filter(row -> filters.getTotal() == null || filters.getTotal().contains(row.total()))
                .filter(row -> filters.getChannels() == null || filters.getChannels().isEmpty()
                        || filters.getChannels().contains(row.channel()))
                .toList();
        return ListingData.from(rows);
    }
}
