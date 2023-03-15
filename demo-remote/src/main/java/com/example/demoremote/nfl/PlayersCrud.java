package com.example.demoremote.nfl;

import com.google.common.base.Strings;
import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Ignored;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Caption("Players")
@Getter@Setter
public class PlayersCrud implements RpcCrudView<PlayersCrud, PlayersCrud.Row, PlayersCrud.Row> {

    @Ignored
    private final List<Row> allPlayers = List.of(
            new Row("Aaron Rodgers", "qb"),
            new Row("Tom Brady", "qb"),
            new Row("Travis Kelce", "te")
            );

    private String name;

    @Override
    public List<Row> rpc(PlayersCrud filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return allPlayers.stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public int gatherCount(PlayersCrud filters) throws Throwable {
        return (int) allPlayers.stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase())).count();
    }

    @Getter@Setter@AllArgsConstructor@NoArgsConstructor
    public class Row {

        private String name;

        private String position;

    }

}
