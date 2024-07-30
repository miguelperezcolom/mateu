package io.mateu.core.domain.model.util;

import io.mateu.core.domain.model.util.asciiart.Painter;
import io.mateu.core.domain.model.util.beanutils.MiURLConverter;
import java.net.URL;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.ConvertUtils;

@Slf4j
public class SharedHelper {

  public static boolean propertiesLoaded = false;

  public static void loadProperties() {
    if (!propertiesLoaded) {

      Painter.paint("Hello");
      Painter.paint("MATEU");

      log.info("Registrando converters beanutils...");
      ConvertUtils.register(new MiURLConverter(), URL.class);

      propertiesLoaded = true;

    } else {
      log.info("Properties already loaded");
    }
  }
}
