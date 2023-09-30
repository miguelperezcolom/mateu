package io.mateu.remote.domain.queries.getItemsCount;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetItemsCountQuery {

  private String itemsProviderId;

  private String searchText;
}
