package io.mateu.mdd.tester.model.entities.relations;

import com.google.common.base.Strings;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.interfaces.AbstractJPQLListView;
import io.mateu.mdd.core.interfaces.EntityProvider;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.HashMap;
import java.util.Map;

@Entity
@Getter@Setter
@UseIdToSelect
public class UseIdToSelectDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String name;



    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof UseIdToSelectDemoEntity && id == ((UseIdToSelectDemoEntity)obj).id);
    }


    @Override
    public String toString() {
        return getName();
    }
}
