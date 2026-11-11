package io.mateu.core.infra.uploads;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.IncomingFile;
import io.mateu.uidl.data.StoredFile;
import io.mateu.uidl.data.UploadRequest;
import io.mateu.uidl.data.UploadTarget;
import io.mateu.uidl.interfaces.FileStorage;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class UploadEndpointTest {

  private static final HttpRequest ANONYMOUS =
      new FakeHttpRequest(RunActionRqDto.builder().build());

  @Test
  void sizesPrintLikeTheContractSays() {
    assertThat(UploadEndpoint.Sizes.format(512)).isEqualTo("512 bytes");
    assertThat(UploadEndpoint.Sizes.format(1024)).isEqualTo("1 KB");
    assertThat(UploadEndpoint.Sizes.format(1536)).isEqualTo("1.5 KB");
    assertThat(UploadEndpoint.Sizes.format(20L * 1024 * 1024)).isEqualTo("20 MB");
    assertThat(UploadEndpoint.Sizes.format(3L * 1024 * 1024 * 1024)).isEqualTo("3 GB");
  }

  @Test
  void acceptMatchesExtensionsWildcardsAndTypes() {
    assertThat(UploadEndpoint.Accept.allows("", "x.exe", "a/b")).isTrue();
    assertThat(UploadEndpoint.Accept.allows(".pdf", "X.PDF", "application/octet-stream")).isTrue();
    assertThat(UploadEndpoint.Accept.allows("image/*", "x", "image/png")).isTrue();
    assertThat(UploadEndpoint.Accept.allows("application/pdf", "x", "application/pdf; q=1"))
        .isTrue();
    assertThat(UploadEndpoint.Accept.allows(".pdf, image/*", "x.doc", "application/msword"))
        .isFalse();
  }

  @Test
  void aFileNameNeverCarriesAPath() {
    assertThat(UploadEndpoint.fileName("../../etc/passwd")).isEqualTo("passwd");
    assertThat(UploadEndpoint.fileName("C:\\Users\\me\\a.pdf")).isEqualTo("a.pdf");
    assertThat(UploadEndpoint.fileName("..")).isEqualTo("file");
    assertThat(UploadEndpoint.fileName(null)).isEqualTo("file");
  }

  @Test
  void aTicketExpires() {
    var ticket = UploadTickets.issue("", "f", 0, "", false, ANONYMOUS);
    assertThat(UploadTickets.verify(ticket, ANONYMOUS)).isNotNull();
    var original = UploadTickets.clock;
    try {
      UploadTickets.clock =
          Clock.fixed(
              Instant.now().plus(Duration.ofSeconds(UploadTickets.TTL_SECONDS + 60)),
              ZoneOffset.UTC);
      assertThat(UploadTickets.verify(ticket, ANONYMOUS)).isNull();
    } finally {
      UploadTickets.clock = original;
    }
  }

  @Test
  void aStoreIssuingTargetsAnswersThem() throws Exception {
    FileStorage direct =
        new FileStorage() {
          @Override
          public StoredFile store(IncomingFile file, HttpRequest httpRequest) {
            throw new UnsupportedOperationException();
          }

          @Override
          public boolean directUploads() {
            return true;
          }

          @Override
          public UploadTarget uploadTarget(UploadRequest upload, HttpRequest httpRequest) {
            return UploadTarget.builder()
                .url("https://bucket.example/put/1")
                .headers(Map.of("x-amz-acl", "private"))
                .file(StoredFile.builder().id("1").name(upload.name()).size(upload.size()).build())
                .build();
          }
        };
    var endpoint = new UploadEndpoint(() -> List.of(direct));
    var ticket = UploadTickets.issue("", "f", 0, "", false, ANONYMOUS);
    var answer = endpoint.target(ticket, "{\"name\":\"a b.pdf\",\"size\":7}", ANONYMOUS);
    assertThat(answer.status()).isEqualTo(200);
    var json = new ObjectMapper().readTree(answer.body());
    assertThat(json.get("url").asText()).isEqualTo("https://bucket.example/put/1");
    assertThat(json.get("method").asText()).isEqualTo("PUT");
    assertThat(json.get("headers").get("x-amz-acl").asText()).isEqualTo("private");
    assertThat(json.get("value").asText()).isEqualTo("mateu-file:1?name=a%20b.pdf&size=7");
    assertThat(endpoint.target(ticket, "{not json", ANONYMOUS).status()).isEqualTo(400);
    // the store vanished
    assertThat(new UploadEndpoint(List::of).target(ticket, "{}", ANONYMOUS).status())
        .isEqualTo(404);
  }
}
