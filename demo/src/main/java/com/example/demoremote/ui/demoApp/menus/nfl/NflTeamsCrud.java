package com.example.demoremote.ui.demoApp.menus.nfl;

import com.example.demoremote.domains.nfl.entities.Team;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.ui.cruds.JpaRpcCrudView;
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
    public Object getDetail(Object id) throws Throwable {
        return id; // id is the entity
    }
}
