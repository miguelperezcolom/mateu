package io.mateu.showcase.tester.model.useCases.invoicing;

import io.mateu.mdd.core.annotations.FieldGroup;
import io.mateu.mdd.core.annotations.SameLine;

import javax.persistence.*;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@MateuMDDEntity
public class Customer {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotEmpty
    private String name;

    private String vatId;

    private boolean active;

    private LocalDateTime created;

    @SameLine
    private LocalDate expiry;

    @FieldGroup("element collection")
    @ElementCollection
    /*
    @CollectionTable(name = "cutomer_agentpriority")
    @MapKeyJoinColumn(name = "customer_id")
    @Column(name = "priority")
     */
    private Map<Agent, Integer> agentPriority = new HashMap<>();


    /*
    @FieldGroup("one to many + join table")
    @OneToMany
    @JoinTable(name = "customer_agentbytag")
    private Map<String, Agent> agentByTag = new HashMap<>();


    @FieldGroup("many to many")
    @ManyToMany
    @JoinTable(name = "customer_agentbyalias")
    private Map<String, Agent> agentByAlias = new HashMap<>();
    */

    @Override
    public String toString() {
        return getName();
    }
}
