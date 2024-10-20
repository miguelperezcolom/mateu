package com.example.demo.infra.ui.menus.forms;

import com.example.demo.domain.programmingLanguages.ProgrammingLanguages;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.View;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.*;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasBadges;
import io.mateu.core.domain.uidefinition.shared.interfaces.HasStatus;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Caption("Read only pojo with crud")
@Component
@Scope("prototype")
@ReadOnly
public class MyReadOnlyPojoWithCrud
    implements Container {

  private final MyReadOnlyPojoWithCrudForm form;
  private final MyReadOnlyPojoWithCrudCrud crud;

}
