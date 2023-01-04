package com.example.demo;

import com.example.demo.e2e.entities.CityEntity;
import com.example.demo.e2e.entities.PersonEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;

@Service
public class JpaPopulator {

    @Autowired
    private EntityManagerFactory emf;


    @PostConstruct
    public void populate() {

        EntityManager em = emf.createEntityManager();

        em.getTransaction().begin();

        CityEntity pmi;
        em.persist(pmi = new CityEntity("PMI", "Palma"));
        em.persist(new CityEntity("MAD", "Madrid"));

        em.persist(new PersonEntity("1", "Mateu", pmi));
        em.persist(new PersonEntity("2", "Antònia", pmi));

        em.getTransaction().commit();

    }

}
