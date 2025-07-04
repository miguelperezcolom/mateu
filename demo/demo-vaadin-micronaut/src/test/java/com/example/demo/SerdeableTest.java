package com.example.demo;

import com.example.demo.infra.in.ui.fluent.forms.Counter1;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.micronaut.serde.ObjectMapper;
import io.micronaut.serde.annotation.Serdeable;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


@Serdeable
class Person {

    private final String name;

    private final int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }
}


@MicronautTest
public class SerdeableTest {

    @Inject
    ObjectMapper objectMapper;

    @Test
    void testPerson() throws IOException {
        var person = new Person("Mateu", 17);
        String result = objectMapper.writeValueAsString(person);

        person = objectMapper.readValue(result, Person.class);
        assertNotNull(person);
        assertEquals("Mateu", person.getName());
        assertEquals(17, person.getAge());
    }


    @Test
    void testCounter() throws IOException {
        var counter = new Counter1();
        counter.setCount(1);
        String result = objectMapper.writeValueAsString(counter);

        counter = objectMapper.readValue(result, Counter1.class);
        assertNotNull(counter);
        assertEquals(1, counter.getCount());
    }

}
