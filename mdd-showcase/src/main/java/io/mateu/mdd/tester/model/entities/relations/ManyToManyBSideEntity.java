package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.UseCheckboxes;
import lombok.MateuMDDEntity;

import javax.persistence.*;

import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity@Table(name = "mmb")
public class ManyToManyBSideEntity {

    @Id
    @NotEmpty
    private String name;


    @ManyToMany
    @UseCheckboxes
    @JoinTable(name = "xx5", joinColumns = {@JoinColumn(name = "b")}, inverseJoinColumns = {@JoinColumn(name = "a")})
    private Set<ManyToManyASideEntity> manytomanysetmanytomanysetwchecks = new HashSet<>();

    @ManyToMany
    @UseCheckboxes
    @JoinTable(name = "xx1", joinColumns = {@JoinColumn(name = "b")}, inverseJoinColumns = {@JoinColumn(name = "a")})
    private Set<ManyToManyASideEntity> manytomanysetmanytomanyset = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "xx2", joinColumns = {@JoinColumn(name = "b")}, inverseJoinColumns = {@JoinColumn(name = "a")})
    private List<ManyToManyASideEntity> manytomanylistmanytomanylist = new ArrayList<>();

    @OneToMany
    @JoinTable(name = "xx3", joinColumns = {@JoinColumn(name = "b")}, inverseJoinColumns = {@JoinColumn(name = "a")})
    private List<ManyToManyASideEntity> onetomanylistmanytomanylist = new ArrayList<>();

    @ManyToMany
    @UseCheckboxes
    @JoinTable(name = "xx4", joinColumns = {@JoinColumn(name = "b")}, inverseJoinColumns = {@JoinColumn(name = "a")})
    private Set<ManyToManyASideEntity> manytomanysetmanytomanylist = new HashSet<>();


    public ManyToManyBSideEntity(String n) {
        name = n;
    }
}
