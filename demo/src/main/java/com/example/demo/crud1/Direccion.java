package com.example.demo.crud1;

import io.mateu.mdd.shared.annotations.Ignored;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.persistence.Id;
import java.util.UUID;

@Data@EqualsAndHashCode(of = "id")
public class Direccion {

    @Ignored@Id
    private String id = UUID.randomUUID().toString();

    private String calle;

    private String ciudad;

    @Override
    public String toString() {
        return id.substring(0, 7);
    }

}
