package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.uidl.core.interfaces.Listing;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RpcViewWrapper {

  private Listing rpcView;

  private String id;
}
