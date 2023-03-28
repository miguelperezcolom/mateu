package io.mateu.remote.domain.mappers;

import io.mateu.mdd.shared.interfaces.RpcView;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data@AllArgsConstructor@NoArgsConstructor
public class RpcViewWrapper {

    private RpcView rpcView;

    private String id;

}
