package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.Container;
import lombok.Data;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Data
@Title("Read only pojo with crud")
@Component
@Scope("prototype")
@ReadOnly
public class MyReadOnlyPojoWithCrud
    implements Container {

  private final MyReadOnlyPojoWithCrudForm form;
  private final MyReadOnlyPojoWithCrudCrud crud;

}
