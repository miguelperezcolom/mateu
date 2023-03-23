package com.example.demoremote.rpcCruds;

import com.vaadin.data.provider.QuerySortOrder;
import com.vaadin.shared.data.sort.SortDirection;

import java.util.Comparator;
import java.util.List;

public class RowComparator implements Comparator<ProgrammingLanguages.Row> {
    private final List<QuerySortOrder> sortOrders;

    public RowComparator(List<QuerySortOrder> sortOrders) {
        this.sortOrders = sortOrders;
    }

    @Override
    public int compare(ProgrammingLanguages.Row o1, ProgrammingLanguages.Row o2) {
        int result = 0;
        if (sortOrders != null) {
            for (QuerySortOrder sortOrder : sortOrders) {
                result = compare(sortOrder.getSorted(), o1, o2);
                if (SortDirection.DESCENDING.equals(sortOrder.getDirection())) result *= -1;
                if (result != 0) break;
            }
        }
        return result;
    }

    private int compare(String sorted, ProgrammingLanguages.Row o1, ProgrammingLanguages.Row o2) {
        if ("name".equals(sorted)) {
            return o1.getName().compareTo(o2.getName());
        }
        if ("target".equals(sorted)) {
            return o1.getTarget().compareTo(o2.getTarget());
        }
        if ("status".equals(sorted)) {
            return o1.getStatus().getMessage().compareTo(o2.getStatus().getMessage());
        }
        return 0;
    }
}
