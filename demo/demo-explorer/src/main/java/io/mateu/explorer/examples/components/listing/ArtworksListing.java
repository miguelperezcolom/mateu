package io.mateu.explorer.examples.components.listing;

import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The same listing as a fluent {@link Listing} component. (For a listing whose rows a Java method
 * supplies — {@code search(SearchRequest, HttpRequest)} — implement the {@code Listing<Row>}
 * interface instead: see behaviour › Capability listings.)
 */
public class ArtworksListing implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Listing.builder()
        .title("Artworks")
        .style("width: 100%;")
        .searchable(true)
        .pageSize(5)
        .filter(FormField.builder().id("status").label("Status").build())
        .rowsSource(RestDataSource.builder().url("/explorer-api/artworks").build())
        .column(GridColumn.builder().id("title").label("Title").identifier(true).sortable(true).build())
        .column(GridColumn.builder().id("artist").label("Artist").sortable(true).build())
        .column(GridColumn.builder().id("year").label("Year").sortable(true).build())
        .column(GridColumn.builder().id("status").label("Status").dataType(FieldDataType.status).build())
        .build();
  }
}
