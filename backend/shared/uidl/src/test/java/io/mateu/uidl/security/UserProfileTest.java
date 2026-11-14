package io.mateu.uidl.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class UserProfileTest {

  @Test
  void blankOptionalsBecomeNull() {
    var profile = new UserProfile("Ana", " ", "");
    assertThat(profile.email()).isNull();
    assertThat(profile.picture()).isNull();
    assertThat(UserProfile.named("Ana")).isEqualTo(profile);
  }

  @Test
  void aProfileNeedsANameToShow() {
    assertThatThrownBy(() -> UserProfile.named(" ")).isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new UserProfile(null, null, null))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
