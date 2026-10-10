package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class YamlMountsTest {

  @Test
  void pathsOfARootAndANestedMount() {
    var root = new YamlMounts.Mount("", "Root");
    var backOffice = new YamlMounts.Mount("back-office", "BO");
    assertThat(root.spaPath()).isEqualTo("/");
    assertThat(root.apiPrefix()).isEqualTo("/mateu");
    assertThat(backOffice.spaPath()).isEqualTo("/back-office");
    assertThat(backOffice.apiPrefix()).isEqualTo("/back-office/mateu");
  }

  @Test
  void theLongestApiPrefixOwnsTheRequest() {
    var root = new YamlMounts.Mount("", "Root");
    var backOffice = new YamlMounts.Mount("back-office", "BO");
    var mounts = List.of(root, backOffice);
    assertThat(YamlMounts.mountForApiPath(mounts, "/back-office/mateu/v3/sync/x"))
        .isSameAs(backOffice);
    assertThat(YamlMounts.mountForApiPath(mounts, "/mateu/v3/sync/x")).isSameAs(root);
    assertThat(YamlMounts.mountForApiPath(mounts, "/api/x")).isNull();
  }
}
