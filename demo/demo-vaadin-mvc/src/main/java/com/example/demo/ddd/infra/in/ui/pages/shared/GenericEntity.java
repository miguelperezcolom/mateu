package com.example.demo.ddd.infra.in.ui.pages.shared;

import com.example.demo.ddd.infra.out.persistence.Entity;

public interface GenericEntity extends Entity<String> {

    String name();

}
