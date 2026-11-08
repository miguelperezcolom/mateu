package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.zip.GZIPInputStream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class AssetCompressionTest {

  @AfterEach
  void clear() {
    AssetCompression.clear();
    System.clearProperty(AssetCompression.ENABLED_PROPERTY);
  }

  @Test
  void acceptsGzipOnlyWhenTheClientSaysSo() {
    assertThat(AssetCompression.acceptsGzip("gzip, deflate, br, zstd")).isTrue();
    assertThat(AssetCompression.acceptsGzip("br;q=1.0, gzip;q=0.8")).isTrue();
    assertThat(AssetCompression.acceptsGzip("*")).isTrue();
    assertThat(AssetCompression.acceptsGzip("x-gzip")).isTrue();
    assertThat(AssetCompression.acceptsGzip(null)).isFalse();
    assertThat(AssetCompression.acceptsGzip("")).isFalse();
    assertThat(AssetCompression.acceptsGzip("identity")).isFalse();
    assertThat(AssetCompression.acceptsGzip("br")).isFalse();
    assertThat(AssetCompression.acceptsGzip("gzip;q=0")).isFalse();
    assertThat(AssetCompression.acceptsGzip("gzip; q=0.0, br")).isFalse();
    assertThat(AssetCompression.acceptsGzip("*, gzip;q=0")).isFalse();
    assertThat(AssetCompression.acceptsGzip("*;q=0")).isFalse();
  }

  @Test
  void compressesTextFormatsOnly() {
    assertThat(AssetCompression.compressible("/assets/mateu-vaadin.js")).isTrue();
    assertThat(AssetCompression.compressible("/assets/index.css")).isTrue();
    assertThat(AssetCompression.compressible("/_redwood/app.js?v=12")).isTrue();
    assertThat(AssetCompression.compressible("/assets/mateu-icon.svg")).isTrue();
    assertThat(AssetCompression.compressible("/assets/logo.png")).isFalse();
    assertThat(AssetCompression.compressible("/assets/font.woff2")).isFalse();
    assertThat(AssetCompression.compressible("/assets.js/noextension")).isFalse();
    assertThat(AssetCompression.compressible(null)).isFalse();
  }

  @Test
  void aSmallAssetOrADisabledSettingIsServedAsItIs() {
    assertThat(AssetCompression.shouldGzip(true, "/assets/a.js", 5000, "gzip")).isTrue();
    assertThat(AssetCompression.shouldGzip(true, "/assets/a.js", 100, "gzip")).isFalse();
    assertThat(AssetCompression.shouldGzip(false, "/assets/a.js", 5000, "gzip")).isFalse();
    assertThat(AssetCompression.shouldGzip(true, "/assets/a.png", 5000, "gzip")).isFalse();
    assertThat(AssetCompression.enabled()).isTrue();
    System.setProperty(AssetCompression.ENABLED_PROPERTY, "false");
    assertThat(AssetCompression.enabled()).isFalse();
  }

  @Test
  void compressesOncePerAssetVersionAndInflatesToTheSameBytes() throws Exception {
    byte[] raw = "console.log('mateu');\n".repeat(400).getBytes(StandardCharsets.UTF_8);
    var reads = new AtomicInteger();
    AssetCompression.Bytes source =
        () -> {
          reads.incrementAndGet();
          return raw;
        };
    byte[] first = AssetCompression.gzipped("jar:a!/static/assets/a.js", raw.length, 1L, source);
    byte[] second = AssetCompression.gzipped("jar:a!/static/assets/a.js", raw.length, 1L, source);
    assertThat(second).isSameAs(first);
    assertThat(reads).hasValue(1);
    assertThat(first.length).isLessThan(raw.length / 10);
    try (var in = new GZIPInputStream(new ByteArrayInputStream(first))) {
      assertThat(in.readAllBytes()).isEqualTo(raw);
    }
    // a redeployed asset (another modification time) is compressed again
    AssetCompression.gzipped("jar:a!/static/assets/a.js", raw.length, 2L, source);
    assertThat(reads).hasValue(2);
  }

  @Test
  void theGzipVariantHasItsOwnValidator() {
    assertThat(AssetCompression.gzipEtag("W/\"10-20\"")).isEqualTo("W/\"10-20-gzip\"");
    assertThat(AssetCompression.gzipEtag(null)).isNull();
  }
}
