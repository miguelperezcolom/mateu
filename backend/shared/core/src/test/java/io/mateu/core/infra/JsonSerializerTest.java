package io.mateu.core.infra;


import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

record SimpleObjectType(String id, String name, int age) {

}


class JsonSerializerTest {

    final String expectedJson = """
{"id":"12221","name":"Mateu","age":123}""";

    @Test
    void returnsJson() {
        var json = JsonSerializer.toJson(new SimpleObjectType("12221", "Mateu", 123));
        assertEquals(expectedJson, json);
    }

}