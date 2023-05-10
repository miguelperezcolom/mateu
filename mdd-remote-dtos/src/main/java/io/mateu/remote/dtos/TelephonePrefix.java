package io.mateu.remote.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class TelephonePrefix {

    private String key;

    private String icon;

    private Object value;

}
