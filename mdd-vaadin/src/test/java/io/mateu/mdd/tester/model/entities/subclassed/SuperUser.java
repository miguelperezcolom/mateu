package io.mateu.mdd.tester.model.entities.subclassed;

import io.mateu.mdd.core.model.authentication.User;
import lombok.MateuMDDEntity;

@MateuMDDEntity
public class SuperUser extends User {

    private String nickName;



}
