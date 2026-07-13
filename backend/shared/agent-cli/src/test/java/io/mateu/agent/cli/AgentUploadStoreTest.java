package io.mateu.agent.cli;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class AgentUploadStoreTest {

  private AgentUploadStore store(Path base) {
    return new AgentUploadStore(base.toString(), 1); // 1 MB cap
  }

  @Test
  void saves_files_into_a_per_session_directory(@TempDir Path base) throws IOException {
    var store = store(base);
    assertFalse(store.hasFiles("s1"));

    var saved =
        store.save(
            "s1",
            List.of(
                new MockMultipartFile("files", "notes.txt", "text/plain", "hello".getBytes()),
                new MockMultipartFile("files", "data.csv", "text/csv", "a,b".getBytes())));

    assertEquals(List.of("notes.txt", "data.csv"), saved.stream().map(s -> s.name()).toList());
    assertTrue(store.hasFiles("s1"));
    var dir = store.sessionDir("s1");
    assertEquals("hello", Files.readString(dir.resolve("notes.txt")));
    assertEquals("a,b", Files.readString(dir.resolve("data.csv")));
  }

  @Test
  void different_sessions_get_isolated_directories(@TempDir Path base) throws IOException {
    var store = store(base);
    store.save("s1", List.of(new MockMultipartFile("files", "a.txt", null, "x".getBytes())));
    assertTrue(store.hasFiles("s1"));
    assertFalse(store.hasFiles("s2"));
  }

  @Test
  void strips_path_components_from_filenames(@TempDir Path base) throws IOException {
    var store = store(base);
    var saved =
        store.save(
            "s1",
            List.of(new MockMultipartFile("files", "../../etc/passwd", null, "x".getBytes())));
    // no directory escape: the stored name is sanitized and lives directly in the session dir
    var name = saved.get(0).name();
    assertFalse(name.contains("/"));
    assertFalse(name.contains(".."));
    assertTrue(Files.exists(store.sessionDir("s1").resolve(name)));
  }

  @Test
  void rejects_files_over_the_size_cap(@TempDir Path base) {
    var store = store(base);
    var big = new MockMultipartFile("files", "big.bin", null, new byte[2 * 1024 * 1024]);
    assertThrows(IllegalArgumentException.class, () -> store.save("s1", List.of(big)));
  }

  @Test
  void blank_session_id_falls_back_to_a_default_bucket(@TempDir Path base) throws IOException {
    var store = store(base);
    store.save("", List.of(new MockMultipartFile("files", "a.txt", null, "x".getBytes())));
    assertTrue(store.hasFiles(""));
    assertEquals(store.sessionDir(""), store.sessionDir("   "));
  }
}
