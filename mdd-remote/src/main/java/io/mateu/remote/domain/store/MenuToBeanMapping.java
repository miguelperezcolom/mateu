package io.mateu.remote.domain.store;


import lombok.*;

import javax.persistence.Id;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class MenuToBeanMapping implements Serializable {

    @Id
    private String actionId;

    private Object bean;

}
