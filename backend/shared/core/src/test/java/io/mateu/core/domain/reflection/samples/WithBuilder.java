package io.mateu.core.domain.reflection.samples;

import lombok.Builder;

@Builder
public class WithBuilder {

  String name;

  private WithBuilder(String name) {
    this.name = name;
  }
}
