package io.mateu.core.infra;

import static io.mateu.core.infra.JsonSerializer.pojoFromJson;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.exc.InvalidDefinitionException;
import java.util.List;
import org.junit.jupiter.api.Test;

record Person(String name, int age) {}

record SimpleRecord(String id, String name, int age, List<Person> people) {}

class SimplePojo {
  String id;
  String name;
  int age;
  List<Person> people;

  public SimplePojo() {}

  public SimplePojo(String id, String name, int age, List<Person> people) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.people = people;
  }
}

class NotSerializable {
  NotSerializable again;
}

class JsonSerializerTest {

  final String expectedJson =
      """
{
  "id" : "12221",
  "name" : "Main",
  "age" : 123,
  "people" : [ {
    "name" : "Mateu",
    "age" : 17
  } ]
}""";

  @Test
  void returnsJson() {
    var json =
        JsonSerializer.toJson(
            new SimpleRecord("12221", "Main", 123, List.of(new Person("Mateu", 17))));
    assertEquals(expectedJson, json);
  }

  @Test
  void throwsRuntimeException() {
    var notSerializable = new NotSerializable();
    notSerializable.again = notSerializable;
    assertThrows(InvalidDefinitionException.class, () -> JsonSerializer.toJson(notSerializable));
  }

  @Test
  void returnsRecord() throws Exception {
    var pojo = new SimpleRecord("12221", "Main", 123, List.of(new Person("Mateu", 17)));
    var json = JsonSerializer.toJson(pojo);
    var object = pojoFromJson(json, SimpleRecord.class);
    assertNotNull(object);
    assertEquals("12221", object.id());
    assertEquals("Main", object.name());
    assertEquals(123, object.age());
    assertNotNull(object.people());
    assertEquals(1, object.people().size());
    assertEquals("Mateu", object.people().get(0).name());
    assertEquals(17, object.people().get(0).age());
  }

  @Test
  void returnsObject() throws Exception {
    var pojo = new SimplePojo("12221", "Main", 123, List.of(new Person("Mateu", 17)));
    var json = JsonSerializer.toJson(pojo);
    var object = pojoFromJson(json, SimplePojo.class);
    assertNotNull(object);
    assertEquals("12221", object.id);
    assertEquals("Main", object.name);
    assertEquals(123, object.age);
    assertNotNull(object.people);
    assertEquals(1, object.people.size());
    assertEquals("Mateu", object.people.get(0).name());
    assertEquals(17, object.people.get(0).age());
  }
}
