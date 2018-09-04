package io.mateu.mdd.tester.model.entities.relations;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
public class MapValueEntity {

    @Id@GeneratedValue
    private long id;

    private String name;

    @ManyToOne
    private MapMapperEntity mapper;



    






    @Override
    public String toString() {
        return getName();
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof MapValueEntity && id == ((MapValueEntity)obj).id);
    }

}
