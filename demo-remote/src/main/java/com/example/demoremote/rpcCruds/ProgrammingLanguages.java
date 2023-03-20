package com.example.demoremote.rpcCruds;

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
import java.util.stream.Collectors;

@Caption("Some programming languages")
@Getter@Setter
public class ProgrammingLanguages implements RpcCrudView<ProgrammingLanguages, ProgrammingLanguages.Row, ProgrammingLanguages.Row> {

    @Ignored
    private final List<Row> allPlayers = List.of(
            new Row("Java", "Backend"),
            new Row("Javascript", "Frontend"),
            new Row("C#", "Backend"),
            new Row("C", "Backend"),
            new Row("C++", "Backend")
            );

    private String name;

    @Override
    public List<Row> rpc(ProgrammingLanguages filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return allPlayers.stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase()))
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public int gatherCount(ProgrammingLanguages filters) throws Throwable {
        return (int) allPlayers.stream()
                .filter(p -> Strings.isNullOrEmpty(filters.getName())
                        || p.getName().toLowerCase().contains(filters.getName().toLowerCase())).count();
    }

    @Getter@Setter@AllArgsConstructor@NoArgsConstructor
    public static class Row {

        private String name;

        private String target;

    }

}
