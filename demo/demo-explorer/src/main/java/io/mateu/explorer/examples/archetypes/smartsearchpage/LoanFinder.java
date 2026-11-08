package io.mateu.explorer.examples.archetypes.smartsearchpage;

import io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * The {@code SmartSearchPage} archetype: a search-first page — an intro line, the smart search bar
 * with TYPED facets (a text, a multi-select from a {@code Set<Enum>}, a date range from a {@link
 * DateRange}) and the results. It starts empty and shows {@link #preSearchContent} until the first
 * search.
 */
public class LoanFinder extends SmartSearchPage<LoanFinder.Filters, LoanFinder.Loan> {

  public enum Classification {
    PAINTING,
    SCULPTURE,
    PRINT,
    PHOTOGRAPH
  }

  public static class Filters {
    public String borrower;
    public Set<Classification> classifications;
    public DateRange returns;
  }

  public record Loan(
      String id,
      String artwork,
      Classification classification,
      String borrower,
      LocalDate returns) {}

  static final List<Loan> LOANS =
      List.of(
          new Loan("L-101", "Water Lilies", Classification.PAINTING, "SMK Copenhagen",
              LocalDate.of(2027, 1, 15)),
          new Loan("L-102", "The Thinker (cast)", Classification.SCULPTURE, "Cleveland Museum",
              LocalDate.of(2026, 12, 2)),
          new Loan("L-103", "The Great Wave", Classification.PRINT, "British Museum",
              LocalDate.of(2027, 3, 30)),
          new Loan("L-104", "Migrant Mother", Classification.PHOTOGRAPH, "MoMA",
              LocalDate.of(2026, 11, 20)),
          new Loan("L-105", "Self-Portrait", Classification.PAINTING, "Van Gogh Museum",
              LocalDate.of(2027, 6, 1)),
          new Loan("L-106", "Melencolia I", Classification.PRINT, "Albertina",
              LocalDate.of(2027, 2, 10)));

  @Override
  protected String pageSubtitle() {
    return "Outgoing loans — search by artwork, borrower, classification or return date";
  }

  @Override
  protected Component preSearchContent(HttpRequest httpRequest) {
    return EmptyState.builder()
        .icon("🔎")
        .title("Search to get started")
        .description("Press Enter on an empty box to list every loan.")
        .build();
  }

  @Override
  public ListingData<Loan> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText() == null ? "" : request.searchText().toLowerCase();
    var f = filters(request);
    return ListingData.from(
        LOANS.stream()
            .filter(l -> (l.artwork() + " " + l.borrower()).toLowerCase().contains(text))
            .filter(l -> f == null || f.borrower == null || f.borrower.isBlank()
                || l.borrower().toLowerCase().contains(f.borrower.toLowerCase()))
            .filter(l -> f == null || f.classifications == null || f.classifications.isEmpty()
                || f.classifications.contains(l.classification()))
            .filter(l -> f == null || f.returns == null || f.returns.isEmpty()
                || f.returns.contains(l.returns()))
            .toList());
  }
}
