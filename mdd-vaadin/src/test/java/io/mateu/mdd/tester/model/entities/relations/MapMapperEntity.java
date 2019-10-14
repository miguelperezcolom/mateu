package io.mateu.mdd.tester.model.entities.relations;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class MapMapperEntity {

    @Id@GeneratedValue
    private long id;

    private String name;



    @OneToMany(mappedBy = "mapper")
    private Map<MapKeyEntity, MapValueEntity> map = new HashMap<>();



    private Map<Integer, String> map1 = new HashMap<>();

    private Map<String, String> map2 = new HashMap<>();

    private Map<MapKeysEnum, String> map3 = new HashMap<>();





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
        return this == obj || (obj != null && obj instanceof  MapMapperEntity && id == ((MapMapperEntity)obj).id);
    }

}
