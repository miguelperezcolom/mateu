package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.MainAction;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.ConsumesHash;
import io.mateu.uidl.interfaces.UpdatesHash;
import org.springframework.context.annotation.Scope;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@Scope("prototype")
public class HashConsumer implements ConsumesHash, UpdatesHash {

    @ReadOnly
    String currentHash = "";

    String desiredHash = "";

    @MainAction
    HashConsumer nohash() {
        currentHash = "";
        return this;
    }

    @MainAction
    HashConsumer sethash() {
        return this;
    }

    @Override
    public Object consume(String hash, ServerHttpRequest serverHttpRequest) {
        currentHash = hash;
        return this;
    }

    @Override
    public String getHash() {
        return desiredHash;
    }
}
