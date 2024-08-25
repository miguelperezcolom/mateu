package io.mateu.core.domain.model.util;

import io.mateu.core.domain.model.util.asciiart.AsciiPainter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class BannerPainter {

  private final AsciiPainter asciiPainter;

  public BannerPainter(AsciiPainter asciiPainter) {
    this.asciiPainter = asciiPainter;
  }

  // @PostConstruct
  public void paintBanner() {
    asciiPainter.paint("Hello");
    asciiPainter.paint("MATEU");
  }
}
