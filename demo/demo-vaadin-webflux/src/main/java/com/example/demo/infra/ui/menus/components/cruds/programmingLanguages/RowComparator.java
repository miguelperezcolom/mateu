package com.example.demo.infra.ui.menus.components.cruds.programmingLanguages;

import org.springframework.data.domain.Sort;

import java.util.Comparator;

public class RowComparator implements Comparator<LanguageRow> {
  private final Sort sortOrders;

  public RowComparator(Sort sortOrders) {
    this.sortOrders = sortOrders;
  }

  @Override
  public int compare(LanguageRow o1, LanguageRow o2) {
    int result = 0;
    if (sortOrders != null) {
      for (Sort.Order sortOrder : sortOrders) {
        result = compare(sortOrder.getProperty(), o1, o2);
        if (sortOrder.isDescending()) result *= -1;
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
      return o1.getStatus().message().compareTo(o2.getStatus().message());
    }
    return 0;
  }
}
