package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class StaticAssetCachingTest {

  @Test
  void weakEtagChangesWithSizeOrTime() {
    String etag = StaticAssetCaching.weakEtag(777270, 1791040948086L);
    assertThat(etag).startsWith("W/\"").endsWith("\"");
    assertThat(StaticAssetCaching.weakEtag(777271, 1791040948086L)).isNotEqualTo(etag);
    assertThat(StaticAssetCaching.weakEtag(777270, 1791040948087L)).isNotEqualTo(etag);
    assertThat(StaticAssetCaching.weakEtag(777270, 1791040948086L)).isEqualTo(etag);
  }

  @Test
  void noEtagWithoutSizeOrTime() {
    assertThat(StaticAssetCaching.weakEtag(-1, 1)).isNull();
    assertThat(StaticAssetCaching.weakEtag(10, 0)).isNull();
  }

  @Test
  void redwoodVersionedPathsAreTheImmutableOnes() {
    assertThat(StaticAssetCaching.IMMUTABLE_PATTERNS).containsExactly("/version_*/**");
    assertThat(StaticAssetCaching.REVALIDATE_FOLDERS).contains("assets");
  }
}
