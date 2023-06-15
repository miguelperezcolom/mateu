package com.example.demoremote.domains.agnostic.pojos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter@AllArgsConstructor@NoArgsConstructor
public class Address {

    String street;
    String city;
    String postalCode;
    String country;

}
