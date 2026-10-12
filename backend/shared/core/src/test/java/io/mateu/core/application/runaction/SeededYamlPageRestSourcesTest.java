package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RestSourceKind;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Listing;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * A YAML Listing whose rows come from a PROXIED catalogue entry (an API key in a {@code
 * ${secret.X}} header): the browser asks the server to fetch them (__restfetch__, kind rows, the
 * listing's id). The page has to declare that source, or the server never advertises the fetch and
 * the listing silently stays empty (found walking the YAML starter against a keyed API).
 */
class SeededYamlPageRestSourcesTest {

  @Test
  void aListingsProxiedRowsSourceIsDeclaredResolvedAgainstTheCatalogue() {
    var catalog =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "products",
                    RestDataSource.builder()
                        .url("https://api.example.test/products")
                        .headers(Map.of("X-Api-Key", "${secret.API_KEY}"))
                        .proxy(true)
                        .build())));
    var listing =
        Listing.builder().title("Products").rowsSource(RestDataSource.ref("products")).build();
    var page =
        new SeededYamlPage(
            new VerticalLayout(List.of(listing)), Map.of(), List.of(), List.of(), catalog, null);

    var declared = page.declaredRestSources();

    assertThat(declared).hasSize(1);
    assertThat(declared.get(0).kind()).isEqualTo(RestSourceKind.ROWS);
    assertThat(declared.get(0).id()).isEqualTo("crud");
    assertThat(declared.get(0).source().proxy()).isTrue();
    assertThat(declared.get(0).source().url()).isEqualTo("https://api.example.test/products");
  }

  @Test
  void aSelectsProxiedOptionsSourceIsDeclaredByTheFieldsId() {
    var catalog =
        new RestSourceCatalog(
            List.of(
                new RestSourceEntry(
                    "products",
                    RestDataSource.builder()
                        .url("https://api.example.test/p")
                        .proxy(true)
                        .build())));
    var field =
        io.mateu.uidl.data.FormField.builder()
            .id("product")
            .stereotype(io.mateu.uidl.data.FieldStereotype.select)
            .optionsSource(RestDataSource.ref("products"))
            .build();
    var page =
        new SeededYamlPage(
            new VerticalLayout(List.of(field)), Map.of(), List.of(), List.of(), catalog, null);

    var declared = page.declaredRestSources();

    assertThat(declared).hasSize(1);
    assertThat(declared.get(0).kind()).isEqualTo(RestSourceKind.OPTIONS);
    assertThat(declared.get(0).id()).isEqualTo("product");
    assertThat(declared.get(0).source().proxy()).isTrue();
  }
}
