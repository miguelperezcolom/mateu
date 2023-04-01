package com.example.demoremote.domains.swapi.entities;

import io.mateu.mdd.shared.annotations.FieldGroup;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SWFilm {

    @Id
    String id = UUID.randomUUID().toString();

    String title;
    String episode_id;
    @Column(length = 6000)
    String opening_crawl;
    String director;
    String producer;
    LocalDate release_date;
    String url;

    @Override
    public String toString() {
        return title != null?"" + title:"No name";
    }

}
