package com.example.demo.e2e.documents;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document
@Getter@Setter
public class DocumentForm {

    private String name;

    private Object json = Map.of("a", 3, "b", false);

}
