package io.mateu.test;

import io.mateu.mdd.core.annotations.Repository;
import io.mateu.mdd.core.interfaces.IRepository;
import io.mateu.test.model.Entidad;
import io.mateu.test.model.Estado;

import java.util.List;

@Repository
public interface MyRepository extends IRepository<Entidad, Long> {

    List<Entidad> getByName(String name);

    void xxx(int a, float b);

    // put your custom logic here as instance methods

    default Entidad findByName(String name) {
        return find("name", name);
    }

    default List<Entidad> findAlive(){
        return list("status", Estado.Vivo);
    }

    default void deleteStefs(){
        delete("name", "Stef");
    }

}
