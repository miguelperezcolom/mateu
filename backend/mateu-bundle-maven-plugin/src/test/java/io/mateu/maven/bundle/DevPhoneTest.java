package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import org.junit.Test;

/** What the dev goal prints so the same UI opens on a phone or a simulator. */
public class DevPhoneTest {

  @Test
  public void onLoopbackItPointsAtTheSimulatorsAndSaysHowToReachAPhone() {
    var lines = DevPhone.banner("localhost", 3000, "", null, true, Optional.of("192.168.1.5"));
    assertThat(lines).hasSize(1);
    assertThat(lines.get(0))
        .contains("iOS simulator: http://localhost:3000/")
        .contains("Android emulator: http://10.0.2.2:3000/")
        .contains("-Dmateu.dev.host=0.0.0.0");
  }

  @Test
  public void onTheLanItPrintsTheAddressTheAddLinkAndItsQrCode() {
    var lines = DevPhone.banner("0.0.0.0", 3001, "/app", null, true, Optional.of("192.168.1.5"));
    assertThat(lines.get(0)).endsWith("http://192.168.1.5:3001/app/");
    assertThat(lines.get(1))
        .contains("https://mateu.io/add?u=http%3A%2F%2F192.168.1.5%3A3001%2Fapp")
        .contains("development build");
    // the QR: half-block rows, dark on white whatever the terminal's colours
    assertThat(lines.get(2)).contains("▀").contains("\u001b[");
  }

  @Test
  public void withAnExpoUrlTheQrOpensTheRendererInExpoGo() {
    var lines =
        DevPhone.banner(
            "0.0.0.0", 3000, "", "exp://192.168.1.5:8081/", false, Optional.of("192.168.1.5"));
    assertThat(lines).hasSize(2); // no QR asked
    assertThat(lines.get(1))
        .contains("Expo Go")
        .endsWith("exp://192.168.1.5:8081/--/add?u=http%3A%2F%2F192.168.1.5%3A3000");
  }

  @Test
  public void aNamedHostIsUsedAsItIsAndNoLanAddressIsSaidPlainly() {
    assertThat(DevPhone.banner("192.168.7.7", 3000, "", null, false, Optional.empty()).get(0))
        .endsWith("http://192.168.7.7:3000/");
    assertThat(DevPhone.banner("0.0.0.0", 3000, "", null, false, Optional.empty()).get(0))
        .contains("no LAN address");
  }

  @Test
  public void hostsAreClassified() {
    assertThat(DevPhone.isWildcard("0.0.0.0")).isTrue();
    assertThat(DevPhone.isWildcard("::")).isTrue();
    assertThat(DevPhone.isWildcard("localhost")).isFalse();
    assertThat(DevPhone.isLoopback("localhost")).isTrue();
    assertThat(DevPhone.isLoopback("127.0.0.1")).isTrue();
    assertThat(DevPhone.isLoopback("192.168.1.5")).isFalse();
    // whatever this machine has, it is never a loopback or a link-local address
    DevPhone.lanAddress()
        .ifPresent(ip -> assertThat(ip).doesNotStartWith("127.").doesNotStartWith("169.254."));
  }
}
