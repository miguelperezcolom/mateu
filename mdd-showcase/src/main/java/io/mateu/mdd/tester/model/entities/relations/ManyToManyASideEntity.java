package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.UseCheckboxes;
import lombok.MateuMDDEntity;

import javax.persistence.*;

import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@MateuMDDEntity@Table(name = "mma")
public class ManyToManyASideEntity {

    @NotEmpty
    @Id
    private String name;

    @ManyToMany(mappedBy = "manytomanysetmanytomanysetwchecks")
    @UseCheckboxes
    private Set<ManyToManyBSideEntity> manytomanysetmanytomanysetwchecks = new HashSet<>();

    @ManyToMany(mappedBy = "manytomanysetmanytomanyset")
    private Set<ManyToManyBSideEntity> manytomanysetmanytomanyset = new HashSet<>();

    @ManyToMany(mappedBy = "manytomanylistmanytomanylist")
    private List<ManyToManyBSideEntity> manytomanylistmanytomanylist = new ArrayList<>();

    @ManyToMany(mappedBy = "onetomanylistmanytomanylist")
    private List<ManyToManyBSideEntity> manytomanylistonetomanylist = new ArrayList<>();

    @ManyToMany(mappedBy = "manytomanysetmanytomanylist")
    private List<ManyToManyBSideEntity> manytomanylistmanytomanyset = new ArrayList<>();

    public ManyToManyASideEntity(String n) {
        name = n;
    }
}
