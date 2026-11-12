package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.uploads.UploadEndpoint;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.PairDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.FileUpload;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.IncomingFile;
import io.mateu.uidl.data.StoredFile;
import io.mateu.uidl.interfaces.FileStorage;
import io.mateu.uidl.interfaces.HttpRequest;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/**
 * Large uploads through the application's {@link FileStorage}: an editable upload field carries a
 * ticket (and nothing changes without a store), and the ticket is what the upload endpoint accepts
 * a file for — from the same caller only. Contract: design/uploads/file-uploads-contract.md.
 */
class FileUploadSyncTest {

  @SuppressWarnings("unused")
  @UI("/uploads-form")
  public static class UploadsForm {
    @FileUpload(accept = ".pdf", maxBytes = 1024)
    String contract;

    @FileUpload List<String> attachments = new ArrayList<>();

    @FileUpload(storage = FileUpload.INLINE)
    String inlineCsv;

    @FileUpload(storage = "archive")
    String archived;

    @ReadOnly @FileUpload String signedCopy;
  }

  /** Keeps files in memory. */
  static class MemoryStorage implements FileStorage {
    final List<String> stored = new ArrayList<>();

    @Override
    public StoredFile store(IncomingFile file, HttpRequest httpRequest) throws Exception {
      var bytes = file.content().readAllBytes();
      stored.add(file.name() + ":" + bytes.length);
      return StoredFile.builder()
          .id("f" + stored.size())
          .name(file.name())
          .contentType(file.contentType())
          .size(-1)
          .build();
    }
  }

  private static Map<String, Map<String, String>> attributesByField(TestMateu mateu) {
    var increment =
        mateu.run(RunActionRqDto.builder().route("/uploads-form").actionId("").build(), Map.of());
    return WireWalk.all(increment, FormFieldDto.class).stream()
        .collect(
            Collectors.toMap(
                FormFieldDto::fieldId,
                field ->
                    field.attributes() == null
                        ? Map.of()
                        : field.attributes().stream()
                            .collect(
                                Collectors.toMap(
                                    PairDto::key, pair -> String.valueOf(pair.value()))),
                (a, b) -> a));
  }

  @Test
  void withoutAStoreTheFieldKeepsItsDataUri() {
    try (var mateu = TestMateu.withUis(UploadsForm.class)) {
      var fields = attributesByField(mateu);
      assertThat(fields.get("contract"))
          .containsEntry("accept", ".pdf")
          .containsEntry("maxBytes", "1024")
          .doesNotContainKey("uploadTicket");
      assertThat(fields.get("attachments")).containsEntry("multiple", "true");
    }
  }

  @Test
  void anEditableFieldGetsATicketAndTheEndpointStoresTheFile() throws Exception {
    var storage = new MemoryStorage();
    try (var mateu = TestMateu.withUisAndBeans(List.of(storage), UploadsForm.class)) {
      var fields = attributesByField(mateu);
      var contract = fields.get("contract");
      assertThat(contract)
          .containsEntry("uploadUrl", "/mateu/v3/upload")
          .containsKey("uploadTicket")
          .doesNotContainKey("uploadDirect");
      assertThat(fields.get("attachments")).containsKey("uploadTicket");
      // inline, a store that does not exist, and a read-only field: no ticket
      assertThat(fields.get("inlineCsv")).doesNotContainKey("uploadTicket");
      assertThat(fields.get("archived")).doesNotContainKey("uploadTicket");
      assertThat(fields.getOrDefault("signedCopy", Map.of())).doesNotContainKey("uploadTicket");

      var endpoint = new UploadEndpoint();
      var anonymous = new FakeHttpRequest(RunActionRqDto.builder().build());
      var ticket = contract.get("uploadTicket");

      var answer =
          endpoint.upload(
              ticket,
              "my%20contract.pdf",
              "application/pdf",
              4,
              new ByteArrayInputStream(new byte[] {1, 2, 3, 4}),
              anonymous);
      assertThat(answer.status()).isEqualTo(200);
      var json = new ObjectMapper().readTree(answer.body());
      var value = StoredFile.parse(json.get("value").asText());
      assertThat(value.id()).isEqualTo("f1");
      assertThat(value.name()).isEqualTo("my contract.pdf");
      // the store did not say: the size is what it read
      assertThat(value.size()).isEqualTo(4);
      assertThat(storage.stored).containsExactly("my contract.pdf:4");

      // too large, declared or streamed
      assertThat(
              endpoint
                  .upload(
                      ticket,
                      "a.pdf",
                      "application/pdf",
                      2048,
                      new ByteArrayInputStream(new byte[0]),
                      anonymous)
                  .status())
          .isEqualTo(413);
      var streamed =
          endpoint.upload(
              ticket,
              "a.pdf",
              "application/pdf",
              -1,
              new ByteArrayInputStream(new byte[2048]),
              anonymous);
      assertThat(streamed.status()).isEqualTo(413);
      assertThat(streamed.body()).contains("This file is too large (max 1 KB).");

      // not accepted
      assertThat(
              endpoint
                  .upload(
                      ticket,
                      "a.exe",
                      "application/x-msdownload",
                      1,
                      new ByteArrayInputStream(new byte[1]),
                      anonymous)
                  .status())
          .isEqualTo(415);

      // no ticket, a forged one, another caller
      assertThat(endpoint.upload(null, "a.pdf", null, 1, stream(), anonymous).status())
          .isEqualTo(403);
      assertThat(endpoint.upload(ticket + "x", "a.pdf", null, 1, stream(), anonymous).status())
          .isEqualTo(403);
      var someoneElse =
          new FakeHttpRequest(RunActionRqDto.builder().build())
              .withPrincipal(TestIdentities.principalWithRoles("admin"));
      assertThat(endpoint.upload(ticket, "a.pdf", null, 1, stream(), someoneElse).status())
          .isEqualTo(403);
      assertThat(storage.stored).hasSize(1);

      // the store issues no targets: the client is told to stream instead
      assertThat(endpoint.target(ticket, "{\"name\":\"a.pdf\",\"size\":10}", anonymous).status())
          .isEqualTo(404);
      assertThat(endpoint.target(ticket, "{\"name\":\"a.pdf\",\"size\":4096}", anonymous).status())
          .isEqualTo(413);
    }
  }

  @Test
  void aStoreFailureGoesThroughTheErrorBoundary() {
    FileStorage broken =
        (file, rq) -> {
          throw new IllegalStateException("disk full at /secret/path");
        };
    try (var mateu = TestMateu.withUisAndBeans(List.of(broken), UploadsForm.class)) {
      var ticket = attributesByField(mateu).get("contract").get("uploadTicket");
      var answer =
          new UploadEndpoint()
              .upload(
                  ticket,
                  "a.pdf",
                  "application/pdf",
                  1,
                  stream(),
                  new FakeHttpRequest(RunActionRqDto.builder().build()));
      assertThat(answer.status()).isEqualTo(500);
      assertThat(answer.body()).contains("Something went wrong").doesNotContain("/secret/path");
    }
  }

  private static ByteArrayInputStream stream() {
    return new ByteArrayInputStream(new byte[] {1});
  }
}
