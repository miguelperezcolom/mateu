package io.mateu.core.domain.uidefinitionlanguage.core.interfaces;

import com.fasterxml.jackson.databind.util.StdConverter;

public class IconConverter extends StdConverter<Icon, String> {
  @Override
  public String convert(Icon icon) {
    return icon.iconName;
  }
}
