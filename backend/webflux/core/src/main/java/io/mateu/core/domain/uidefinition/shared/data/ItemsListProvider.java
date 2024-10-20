package io.mateu.core.domain.uidefinition.shared.data;

import io.mateu.dtos.Value;
import java.util.List;

public interface ItemsListProvider {

  List<Value> find(String search_text, int page, int page_size);

  int count(String search_text);
}
