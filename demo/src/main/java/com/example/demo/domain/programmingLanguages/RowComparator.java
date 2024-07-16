package com.example.demo.domain.programmingLanguages;

import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.mdd.shared.interfaces.SortType;

import java.util.Comparator;
import java.util.List;

public class RowComparator implements Comparator<LanguageRow> {
  private final List<SortCriteria> sortOrders;

  public RowComparator(List<SortCriteria> sortOrders) {
    this.sortOrders = sortOrders;
  }

  @Override
  public int compare(LanguageRow o1, LanguageRow o2) {
    int result = 0;
    if (sortOrders != null) {
      for (SortCriteria sortOrder : sortOrders) {
        result = compare(sortOrder.getColumn(), o1, o2);
        if (SortType.Descending.equals(sortOrder.getOrder())) result *= -1;
        if (result != 0) break;
      }
    }
    return result;
  }

  private int compare(String sorted, LanguageRow o1, LanguageRow o2) {
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
