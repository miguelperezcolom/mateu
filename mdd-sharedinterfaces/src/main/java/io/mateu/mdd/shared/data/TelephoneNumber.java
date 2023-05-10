package io.mateu.mdd.shared.data;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class TelephoneNumber {

    String prefix;

    String number;

}
