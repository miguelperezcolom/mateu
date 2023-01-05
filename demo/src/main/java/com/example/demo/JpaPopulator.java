package com.example.demo;

import com.example.demo.e2e.entities.CityEntity;
import com.example.demo.e2e.entities.ClassroomEntity;
import com.example.demo.e2e.entities.PersonEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.ArrayList;

@Service
public class JpaPopulator {

    @Autowired
    private EntityManagerFactory emf;


    @PostConstruct
    public void populate() {

        EntityManager em = emf.createEntityManager();

        em.getTransaction().begin();

        ClassroomEntity room1;
        em.persist(room1 = new ClassroomEntity("3A", "3 A", new ArrayList<>()));


        CityEntity pmi;
        em.persist(pmi = new CityEntity("PMI", "Palma"));
        em.persist(new CityEntity("MAD", "Madrid"));

        PersonEntity mateu;
        em.persist(mateu = new PersonEntity("1", "Mateu", pmi, room1));
        PersonEntity antonia;
        em.persist(antonia = new PersonEntity("2", "Antònia", pmi, room1));

        room1.getStudents().add(mateu);
        room1.getStudents().add(antonia);

        em.getTransaction().commit();

    }

}
