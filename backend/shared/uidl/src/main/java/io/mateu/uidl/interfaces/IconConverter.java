package io.mateu.uidl.interfaces;

import com.fasterxml.jackson.databind.util.StdConverter;

public class IconConverter extends StdConverter<IconKey, String> {
  @Override
  public String convert(IconKey icon) {
    return icon.iconName;
  }
}
