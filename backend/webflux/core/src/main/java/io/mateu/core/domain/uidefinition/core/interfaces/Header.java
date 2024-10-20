package io.mateu.core.domain.uidefinition.core.interfaces;

import lombok.Data;

@Data
public class Header {

  private final HeaderType type;

  private final String message;
}
