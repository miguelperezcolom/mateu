package io.mateu.remote.domain.queries.getItemsRows;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetItemsRowsQuery {

  private String itemsProviderId;

  private String searchText;

  private int page;

  private int pageSize;
}
