package io.mateu.remote.application.compat.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class LegacyTable {

  List action_buttons;
  List<AdditionalFilter> additional_filters;
  List additional_needed_data;
  ExpandableConfig expandable_config;
  List<ColumnHeader> column_headers;
  String list_type;
  String lokalise_prefix;
  String loader_text;
  Message no_results_message;
  List<Integer> page_size_options;
  String row_t_selector;
  SearchBarOptions searchbar_options;
  String type;
}
