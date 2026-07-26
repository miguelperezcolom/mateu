package io.mateu.mdd.demovb.infra.in.ui.island;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Entidad de la isla: la nota del huésped que se edita dentro del host sin recargarlo. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuestNote {

  @NotEmpty String paxName;

  String note;
}
