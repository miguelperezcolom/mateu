package io.mateu.core.infra;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.exc.InvalidDefinitionException;
import org.junit.jupiter.api.Test;

record SimpleObjectType(String id, String name, int age) {}

class NotSerializable {
  NotSerializable again;
}

class JsonSerializerTest {

  final String expectedJson =
      """
{
  "id" : "12221",
  "name" : "Mateu",
  "age" : 123
}""";

  @Test
  void returnsJson() {
    var json = JsonSerializer.toJson(new SimpleObjectType("12221", "Mateu", 123));
    assertEquals(expectedJson, json);
  }

  @Test
  void throwsRuntimeException() {
    var notSerializable = new NotSerializable();
    notSerializable.again = notSerializable;
    assertThrows(InvalidDefinitionException.class, () -> JsonSerializer.toJson(notSerializable));
  }
}
