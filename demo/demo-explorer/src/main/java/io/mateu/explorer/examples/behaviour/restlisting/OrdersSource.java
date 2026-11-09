package io.mateu.explorer.examples.behaviour.restlisting;

import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.interfaces.RestSourceCatalogSupplier;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * The endpoint as a NAMED source of the catalogue — the code twin of a {@code sources.yaml} entry.
 * The listing names it by {@code ref}; the entry says where it is and how to read it: the URL
 * template (search, filters, sort and page interpolated from the listing's state), where the rows
 * are ({@code itemsPath}) and where the total is ({@code totalPath}, which is what gives the pager
 * its page count).
 */
@Component
public class OrdersSource implements RestSourceCatalogSupplier {

  static final String URL =
      "/explorer-api/orders?page=${state.page ?? 0}&size=${state.size ?? 10}"
          + "&sort=${state.sort?.[0]?.fieldId ?? ''}${state.sort?.[0]?.direction === 'descending' ? ',desc' : ''}"
          + "&search=${encodeURIComponent(state.searchText ?? '')}"
          + "&city=${encodeURIComponent(state.city ?? '')}";

  @Override
  public List<RestSourceEntry> restSources() {
    return List.of(
        RestSourceEntry.builder()
            .name("explorer-orders")
            .description("The Explorer's 50 orders, paged and sorted by the server")
            .source(RestDataSource.builder().url(URL).itemsPath("content").build())
            .totalPath("totalElements")
            .build());
  }
}
