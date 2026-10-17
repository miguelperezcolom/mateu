package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.testutil.SpecsDir;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * What an adapter serves for a class-less deployment: one SPA shell + sync endpoint per {@code
 * type: UI} mount, titled from the mount's app shell.
 */
class YamlMountsServedTest {

  @TempDir Path dir;

  private Path twoMounts() {
    return SpecsDir.write(
        dir,
        Map.of(
            "shop.ui.yaml",
            "type: UI\nbasePath: /\nroutes: shop-routes.yaml\n",
            "shop-routes.yaml",
            "type: Routes\nroutes:\n  - route: \"\"\n    layout: shop-shell.yaml\n",
            "shop-shell.yaml",
            "type: AppShell\ntitle: Costs in $ — the shop\nmenu: []\n",
            "bo/back-office.ui.yaml",
            "type: UI\nbasePath: /back-office/\nroutes:\n  - bo/routes.yaml\n",
            "bo/routes.yaml",
            "type: Routes\nroutes:\n  - route: back-office/orders\n    layout: bo/orders.yaml\n",
            "bo/orders.yaml",
            "layout: {type: Text, text: Orders}\n"));
  }

  @Test
  void eachMountIsServedAtItsBasePathTitledByItsShell() {
    var mounts =
        SpecsDir.over(
            twoMounts(),
            cl -> {
              assertThat(YamlMounts.present(cl)).isTrue();
              return YamlMounts.mounts(new RouteRegistry(), new YamlAppLoader());
            });
    assertThat(mounts)
        .extracting(YamlMounts.Mount::basePath, YamlMounts.Mount::title)
        .containsExactlyInAnyOrder(
            org.assertj.core.groups.Tuple.tuple("", "Costs in $ — the shop"),
            // no shell bound to its root: the default title
            org.assertj.core.groups.Tuple.tuple("back-office", "Mateu"));
  }

  @Test
  void aMountsMobileManifestComesFromItsShell() {
    var json =
        SpecsDir.over(
            twoMounts(),
            cl -> YamlMounts.manifestJson(new RouteRegistry(), new YamlAppLoader(), null));
    assertThat(json).contains("Costs in $ — the shop");
  }

  @Test
  void aClasspathWithoutAUiDescriptorHasNothingToServe() {
    var root = SpecsDir.write(dir, Map.of("page.yaml", "layout: {type: Text, text: x}\n"));
    assertThat(SpecsDir.over(root, YamlMounts::present)).isFalse();
  }
}
