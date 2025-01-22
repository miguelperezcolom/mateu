package io.mateu.uidl.interfaces;

import com.fasterxml.jackson.databind.util.StdConverter;

public class IconConverter extends StdConverter<Icon, String> {
  @Override
  public String convert(Icon icon) {
    return icon.iconName;
  }
}
