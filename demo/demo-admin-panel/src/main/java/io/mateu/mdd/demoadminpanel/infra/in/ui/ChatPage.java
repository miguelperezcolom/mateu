package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chat;

@UI("/chat")
public class ChatPage {

    Chat chat = new Chat("http://localhost:8095/api/agent/stream");

}
