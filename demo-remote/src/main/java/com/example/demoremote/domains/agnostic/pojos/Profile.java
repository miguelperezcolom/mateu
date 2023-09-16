package com.example.demoremote.domains.agnostic.pojos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Profile {

  @NotBlank private String name;

  private int age;

  @NotNull private Movie favouriteMovie;
}
