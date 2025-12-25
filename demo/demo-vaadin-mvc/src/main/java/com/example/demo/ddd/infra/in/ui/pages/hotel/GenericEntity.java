package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.Entity;

public interface GenericEntity extends Entity<String> {

    String name();

}
