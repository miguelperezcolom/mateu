package io.mateu.remote.application.compat.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Cell {

    String displayKey;
    CellOptions options;
    String tSelector;
    String type;

}
