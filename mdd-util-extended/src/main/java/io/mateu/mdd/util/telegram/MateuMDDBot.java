package io.mateu.mdd.util.telegram;

import io.mateu.mdd.shared.IAppConfig;
import io.mateu.mdd.util.Helper;
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
        try {
            return Helper.getImpl(IAppConfig.class).getBusinessName() + " bot";
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "unkown app";
    }

    @Override
    public String getBotToken() {
        try {
            return Helper.getImpl(IAppConfig.class).getTelegramBotToken();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return "unkown token";
    }
}
