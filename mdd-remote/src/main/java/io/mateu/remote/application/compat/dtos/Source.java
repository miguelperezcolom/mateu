package io.mateu.remote.application.compat.dtos;

import io.mateu.remote.dtos.Value;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Source {

    String name;
    List<Value> values;

}
