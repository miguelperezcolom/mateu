package io.mateu.mdd.tester.model.entities.subclassed;

import io.mateu.mdd.core.model.authentication.User;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;

@Entity
@Getter@Setter
public class SuperUser extends User {

    private String nickName;



}
