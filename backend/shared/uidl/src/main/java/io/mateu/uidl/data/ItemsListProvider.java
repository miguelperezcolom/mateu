package io.mateu.uidl.data;

import java.util.List;

public interface ItemsListProvider {

  List<Value> find(String search_text, int page, int page_size);

  int count(String search_text);
}
