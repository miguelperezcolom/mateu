package com.example.demoremote.domains.nfl.entities;

import io.mateu.core.infra.MateuConfiguratorBean;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.interfaces.JpaCrud;
import io.mateu.mdd.ui.cruds.JpaRpcCrudView;
import io.mateu.util.Helper;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.lang.reflect.InvocationTargetException;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Team {

  @Id private String id;

  private String name;

  @Action
  public Object players() throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException {
    var action = new MDDOpenCRUDAction("Players of " + name, Player.class);
    action.setExtraFilters(new ExtraFilters("x.team.id = :teamId", "teamId", id));
    var jpaRpcCrudView = MateuConfiguratorBean.get().getBean(JpaRpcCrudView.class);
    jpaRpcCrudView.setAction(action);
    return jpaRpcCrudView;
  }

  @Action
  public Object players2() {
    var players = new PlayersJpaCrud();
    players.setId(id);
    return players;
  }

  @Override
  public String toString() {
    return name != null ? "" + name : "No name";
  }

  @Getter@Setter
  public class PlayersJpaCrud implements JpaCrud {

    String id;

    @Override
    public String getExtraWhereFilter() {
      return "x.team.id = '" + id + "'";
    }

    @Override
    public Class getEntityClass() {
      return Player.class;
    }

  }

}

