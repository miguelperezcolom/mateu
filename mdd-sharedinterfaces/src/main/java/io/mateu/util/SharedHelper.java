package io.mateu.util;

import io.mateu.util.asciiart.Painter;
import io.mateu.util.beanutils.MiURLConverter;
import io.mateu.util.exceptions.MoreThanOneImplementationFound;
import io.mateu.util.exceptions.NoImplementationFound;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
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

  /**
   * look for implementation using the service loader (checks only 1 implementation exists)
   *
   * @param anInterface the interface to look for
   * @param <T> the actual type
   * @return implementation
   * @throws Exception in case of not found or there
   */
  public static <T> T getImpl(Class<T> anInterface) throws Exception {
    List<T> impls = getImpls(anInterface);
    if (impls.size() == 0) throw new NoImplementationFound(anInterface);
    if (impls.size() > 1) throw new MoreThanOneImplementationFound(anInterface, impls);
    return impls.get(0);
  }

  /**
   * look for implementations using the service loader
   *
   * @param anInterface the interface to look for
   * @param <T> the actual type
   * @return list of implementations
   */
  public static <T> List<T> getImpls(Class<T> anInterface) {
    return ServiceLoader.load(anInterface).stream().map(p -> p.get()).collect(Collectors.toList());
  }
}
