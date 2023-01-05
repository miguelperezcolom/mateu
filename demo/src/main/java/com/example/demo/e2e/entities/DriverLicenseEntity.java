package com.example.demo.e2e.entities;

import lombok.*;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToOne;

@Entity
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@AllArgsConstructor
@NoArgsConstructor
public class DriverLicenseEntity {

    @Id
    private String id;

    private String type;

    @OneToOne(mappedBy = "driverLicense")
    private PersonEntity owner;

    @Override
    public String toString() {
        return id + " - " + type;
    }

}
