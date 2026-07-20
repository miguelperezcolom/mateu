package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A page implementing {@link PeerNavigationSupplier} carries the previous/next peer-object arrows
 * (the Oracle Redwood "next/previous object" header element) on the wire as {@code
 * PageDto.peerNav}; a {@code null} route on a side disables that arrow, and a page that supplies
 * none leaves {@code peerNav} null so the header shows no arrows.
 */
class PeerNavigationSyncTest {

  @SuppressWarnings("unused")
  @UI("/peer-middle")
  @Title("Record 2")
  public static class MiddleRecord implements PeerNavigationSupplier {
    String name = "Two";

    @Override
    public PeerNav peers(HttpRequest httpRequest) {
      return new PeerNav("Record 1", "/records/1", "Record 3", "/records/3");
    }
  }

  @SuppressWarnings("unused")
  @UI("/peer-first")
  @Title("Record 1")
  public static class FirstRecord implements PeerNavigationSupplier {
    String name = "One";

    @Override
    public PeerNav peers(HttpRequest httpRequest) {
      return new PeerNav(null, null, "Record 2", "/records/2");
    }
  }

  @SuppressWarnings("unused")
  @UI("/peer-none")
  @Title("Lonely")
  public static class NoPeers {
    String name = "alone";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(MiddleRecord.class, FirstRecord.class, NoPeers.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static PageDto pageOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    ServerSideComponentDto server = null;
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto s) {
        server = s;
        break;
      }
    }
    assertThat(server).as("server side component for " + route).isNotNull();
    var pages = new ArrayList<PageDto>();
    FieldKindsSyncTest.walk(server, PageDto.class, pages);
    assertThat(pages).as("page metadata for " + route).isNotEmpty();
    return pages.get(0);
  }

  @Test
  void aRecordWithBothNeighboursCarriesBothArrows() {
    var peerNav = pageOf("/peer-middle").peerNav();
    assertThat(peerNav).isNotNull();
    assertThat(peerNav.prevLabel()).isEqualTo("Record 1");
    assertThat(peerNav.prevRoute()).isEqualTo("/records/1");
    assertThat(peerNav.nextLabel()).isEqualTo("Record 3");
    assertThat(peerNav.nextRoute()).isEqualTo("/records/3");
  }

  @Test
  void theFirstRecordDisablesThePreviousArrowWithANullRoute() {
    var peerNav = pageOf("/peer-first").peerNav();
    assertThat(peerNav).isNotNull();
    assertThat(peerNav.prevRoute()).isNull();
    assertThat(peerNav.nextRoute()).isEqualTo("/records/2");
  }

  @Test
  void aPageThatSuppliesNoPeersLeavesPeerNavNull() {
    assertThat(pageOf("/peer-none").peerNav()).isNull();
  }
}
