package io.mateu.core.domain.model.util;

import io.mateu.core.domain.model.util.asciiart.Painter;
import io.mateu.core.domain.model.util.beanutils.MiURLConverter;
import jakarta.annotation.PostConstruct;
import java.net.URL;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.ConvertUtils;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SharedHelper {

  private final Painter painter;

  public SharedHelper(Painter painter) {
    this.painter = painter;
  }

  @PostConstruct
  public void loadProperties() {
    painter.paint("Hello");
    painter.paint("MATEU");

    log.info("Registering converters beanutils...");
    ConvertUtils.register(new MiURLConverter(), URL.class);
  }
}
