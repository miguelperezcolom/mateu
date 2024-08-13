package io.mateu.core.domain.uidefinition.core.interfaces;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ResponseWrapper {

  Object response;

  List<Message> messages = new ArrayList<>();
}
