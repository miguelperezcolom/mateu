package com.example.demo;

import com.example.demo.e2e.entities.CityEntity;
import com.example.demo.e2e.entities.ClassroomEntity;
import com.example.demo.e2e.entities.PersonEntity;
import com.example.demo.e2e.entities.TeamEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.util.ArrayList;
import java.util.HashSet;

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


        em.persist(new TeamEntity("NEW", "Patriots", null));
        em.persist(new TeamEntity("KAN", "Kansas City Chiefs", null));
        em.persist(new TeamEntity("BUF", "Buffalo Bills", null));
        em.persist(new TeamEntity("CIN", "Cincinnati Bengals", null));


        PersonEntity mateu;
        em.persist(mateu = new PersonEntity("1", "Mateu", pmi, room1, new HashSet<>()));
        PersonEntity antonia;
        em.persist(antonia = new PersonEntity("2", "Antònia", pmi, room1, new HashSet<>()));

        room1.getStudents().add(mateu);
        room1.getStudents().add(antonia);

        em.getTransaction().commit();

    }

}
