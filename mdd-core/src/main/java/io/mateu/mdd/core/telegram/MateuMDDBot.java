package io.mateu.mdd.core.telegram;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.core.util.Helper;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.objects.Update;

public class MateuMDDBot extends TelegramLongPollingBot {
    @Override
    public void onUpdateReceived(Update update) {

        String msg = update.getMessage().getText();

        System.out.println(update.getMessage());
    }

    @Override
    public String getBotUsername() {
        return MDD.getApp().getName() + " bot";
    }

    @Override
    public String getBotToken() {
        try {
            return Helper.find(AppConfig.class, 1l).getTelegramBotToken();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return null;
    }
}
