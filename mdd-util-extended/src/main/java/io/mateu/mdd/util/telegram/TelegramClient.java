package io.mateu.mdd.util.telegram;

import org.telegram.telegrambots.ApiContextInitializer;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.meta.exceptions.TelegramApiRequestException;

public class TelegramClient {


    public static void main(String[] args) {

        ApiContextInitializer.init();

        TelegramBotsApi api = new TelegramBotsApi();

        try {
            MateuMDDBot bot;
            api.registerBot(bot = new MateuMDDBot());
            send(bot, "-310690792", "Hola!");
            //send(bot, "989380306", "Hola!");
        } catch (TelegramApiRequestException e) {
            e.printStackTrace();
        } catch (TelegramApiException e) {
            e.printStackTrace();
        }

    }

    private static void send(MateuMDDBot bot, String chatId, String msg) throws TelegramApiException {
        bot.execute(new SendMessage(chatId, msg));
    }

}
