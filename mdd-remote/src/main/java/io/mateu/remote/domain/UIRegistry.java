package io.mateu.remote.domain;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.MateuConfiguratorBean;
import io.mateu.remote.domain.modelToDtoMappers.UIMapper;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UIRegistry {

    private List<Class> _classes = new ArrayList<>();

    @Autowired
    MateuConfiguratorBean mateuConfiguratorBean;

    @Autowired
    JourneyStoreService journeyStoreService;

    @Autowired
    UIMapper uiMapper;

    public void add(Class uiClass) {
        if (!_classes.contains(uiClass)) {
            _classes.add(uiClass);
            try {
                // we do this to fill the menu store
                ReflectionHelper.setBeanProvider(mateuConfiguratorBean);
                uiMapper.map(ReflectionHelper.newInstance(uiClass));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    public List<Class> getUiClasses() {
        return _classes;
    }
}
