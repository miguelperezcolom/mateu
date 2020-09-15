package io.mateu.mdd.shared;

public interface IAppConfig {
    String getBusinessName();

    String getLogoUrl() throws Exception;

    String getDeeplAuthKey();

    int getAdminEmailSmtpPort();

    String getAdminEmailSmtpHost();

    String getAdminEmailUser();

    String getAdminEmailPassword();

    String getAdminEmailFrom();

    boolean isAdminEmailSSLOnConnect();

    boolean isAdminEmailStartTLS();

    String getAdminEmailCC();

    String getTelegramBotToken();

    String getName();

    String getBaseUrl();

    String getXslfoForList();
}
