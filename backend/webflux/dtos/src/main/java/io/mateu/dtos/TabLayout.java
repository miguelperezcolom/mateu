package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
public record TabLayout(List<Tab> tabs) implements ComponentMetadata {

  public TabLayout {
    tabs = Collections.unmodifiableList(tabs);
  }

  @Override
  public List<Tab> tabs() {
    return Collections.unmodifiableList(tabs);
  }
}
