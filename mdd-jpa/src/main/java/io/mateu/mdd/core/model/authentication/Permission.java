package io.mateu.mdd.core.model.authentication;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * holder for permissions. ids 1-1000 are reserved. You can add your own permissions starting with id 1001
 *
 * 1: super admin
 *
 * Created by miguel on 13/9/16.
 */
@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
public class Permission {

    @Id
    private long id;

    private String name;


}
