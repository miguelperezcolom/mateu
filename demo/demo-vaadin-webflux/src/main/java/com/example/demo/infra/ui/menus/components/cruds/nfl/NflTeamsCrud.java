package com.example.demo.infra.ui.menus.components.cruds.nfl;

import com.example.demo.domain.nfl.entities.Team;
import io.mateu.uidl.app.MDDOpenCRUDAction;
import io.mateu.jpa.domain.ui.cruds.JpaRpcCrudView;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;

@Service
@Slf4j
public class NflTeamsCrud extends JpaRpcCrudView {

    public NflTeamsCrud() throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, InstantiationException {
        super(new MDDOpenCRUDAction("NFL Teams", Team.class));
    }

    @Override
    public Object getDetail(Object id) {
        return id; // targetId is the entity
    }
}
