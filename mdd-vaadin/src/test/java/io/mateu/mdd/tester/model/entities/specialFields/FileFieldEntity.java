package io.mateu.mdd.tester.model.entities.specialFields;

import io.mateu.mdd.core.model.common.Resource;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@MateuMDDEntity
public class FileFieldEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @ManyToOne
    private Resource file;

}
