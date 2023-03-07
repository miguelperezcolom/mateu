package com.example.demoremote.nfl;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Caption;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Caption("Players")
@Getter@Setter
public class PlayersCrud implements RpcCrudView<PlayersCrud, PlayersCrud.Row, PlayersCrud.Row> {

    private String name;

    @Override
    public List<Row> rpc(PlayersCrud filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return List.of();
    }

    @Override
    public int gatherCount(PlayersCrud filters) throws Throwable {
        return 0;
    }

    @Getter@Setter@AllArgsConstructor@NoArgsConstructor
    public class Row {

        private String name;

        private String position;

    }

}
