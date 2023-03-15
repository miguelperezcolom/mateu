package io.mateu.remote.domain;

import io.mateu.remote.domain.queries.GetUIQuery;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UIRegistry {

    private List<Class> uiClasses = new ArrayList<>();

    public void registerUiClass(Class uiClass) {
        if (!uiClasses.contains(uiClass)) {
            uiClasses.add(uiClass);
            buildUI(uiClass);
        }
    }

    public void buildUI(Class uiClass) {
        new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            GetUIQuery.builder().uiId(uiClass.getName()).build().run();
        }).start();
    }

    public List<Class> getUiClasses() {
        return uiClasses;
    }
}
