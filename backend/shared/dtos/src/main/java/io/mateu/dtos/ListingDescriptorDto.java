package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * What a menu entry's screen is, when it is a listing: how to narrow it from its URL. Lets a client
 * that only holds the menu — the chat assistant above all — open a listing already filtered ({@code
 * /bookings?status=Cancelled}) or showing a concrete set of rows ({@code /bookings?ids=A,B})
 * without loading the screen first.
 *
 * @param idField the row field that identifies a row (the one {@code idsParam} matches)
 * @param idsParam the framework's reserved id-set query param ({@code ids}), on every listing
 * @param searchParam the free-text search's query param ({@code searchText}); null when the listing
 *     has no search box
 * @param filters the declared filters, each settable by its query param
 */
@Builder
public record ListingDescriptorDto(
    String idField, String idsParam, String searchParam, List<ListingFilterDto> filters) {

  public ListingDescriptorDto {
    filters = Collections.unmodifiableList(filters != null ? filters : List.of());
  }
}
