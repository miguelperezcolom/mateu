package io.mateu.remote.domain.modelToDtoMappers;

import io.mateu.mdd.shared.interfaces.Listing;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data@AllArgsConstructor@NoArgsConstructor
public class RpcViewWrapper {

    private Listing rpcView;

    private String id;

}