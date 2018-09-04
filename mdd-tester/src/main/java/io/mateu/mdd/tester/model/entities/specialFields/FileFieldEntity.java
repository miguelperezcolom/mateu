package io.mateu.mdd.tester.model.entities.specialFields;

import io.mateu.mdd.core.model.common.Resource;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

@Entity
@Getter@Setter
public class FileFieldEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @ManyToOne
    private Resource file;

}
