package io.mateu;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

import org.junit.jupiter.api.Test;

class MateuVirtualThreadsCheckTest {

  @Test
  void warnsOnJdk21To23WithVirtualThreads() {
    assertThat(MateuVirtualThreadsCheck.warning(21, null), containsString("JDK 21"));
    assertThat(
        MateuVirtualThreadsCheck.warning(21, null),
        containsString("micronaut.executors.blocking.virtual=false"));
    assertThat(MateuVirtualThreadsCheck.warning(23, "true"), notNullValue());
  }

  @Test
  void staysQuietWhenThereIsNothingToFix() {
    assertThat(MateuVirtualThreadsCheck.warning(24, null), nullValue());
    assertThat(MateuVirtualThreadsCheck.warning(26, "true"), nullValue());
    assertThat(MateuVirtualThreadsCheck.warning(17, null), nullValue());
    assertThat(MateuVirtualThreadsCheck.warning(21, "false"), nullValue());
  }
}
