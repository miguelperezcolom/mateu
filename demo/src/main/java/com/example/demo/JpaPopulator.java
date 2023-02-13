package com.example.demo;

import com.example.demo.e2e.entities.*;
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

        CountryEntity es;
        em.persist(es = new CountryEntity("ES", "Spain"));
        CountryEntity de;
        em.persist(de = new CountryEntity("DE", "Germany"));


        CityEntity pmi;
        em.persist(pmi = new CityEntity("PMI", "Palma", es));
        em.persist(new CityEntity("MAD", "Madrid", es));
        em.persist(new CityEntity("BER", "Berlin", de));


        em.persist(new TeamEntity("NEW", "New England Patriots", "No idea", 2, null));
        em.persist(new TeamEntity("KAN", "Kansas City Chiefs", "No idea", 6, null));
        em.persist(new TeamEntity("BUF", "Buffalo Bills", "No idea", 0, null));
        em.persist(new TeamEntity("CIN", "Cincinnati Bengals", "No idea", 0, null));


        PersonEntity mateu;
        em.persist(mateu = new PersonEntity("1", "Mateu", null, pmi, room1, new HashSet<>()));
        PersonEntity antonia;
        em.persist(antonia = new PersonEntity("2", "Antònia", null, pmi, room1, new HashSet<>()));
        DriverLicenseEntity lic;
        em.persist(lic = new DriverLicenseEntity("18226091J", "C1", antonia));
        antonia.setDriverLicense(lic);

        room1.getStudents().add(mateu);
        room1.getStudents().add(antonia);

        em.getTransaction().commit();

    }

}
