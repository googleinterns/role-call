package com.google.rolecall.services;

import java.io.IOException;
import java.util.List;

import com.google.rolecall.Constants;
import com.google.rolecall.util.CPSNotification;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sendgrid.*;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;

@Service("noticiationServices")
public class NotificationServices {
  @Autowired
  private org.springframework.core.env.Environment environment;
  String topicId;

  public void process() throws Exception {
    List<CPSNotification> notifications = this.getNotifications();
    for (CPSNotification notif : notifications) {
      if (!notif.email.equals("")) {
        this.sendEmail(notif.email, notif.message);
      }
      if (!notif.phone.equals("")) {
        this.sendSMS(notif.phone, notif.message);
      }
    }
  }

  private void sendSMS(String phoneNo, String content) {
    String accountSid = this.environment.getProperty("twilio.account.sid");
    String authToken = this.environment.getProperty("twilio.auth.token");
    Twilio.init(accountSid, authToken);
    Message.creator(new com.twilio.type.PhoneNumber(phoneNo),
        new com.twilio.type.PhoneNumber(this.environment.getProperty("twilio.from.number")), content).create();
  }

  private void sendEmail(String email, String messsage) throws IOException {
    Email from = new Email("yangzhengcn@gmail.com"); // for test accout. Jon will provide actual billable account before
                                                     // releasing
    String subject = messsage;
    Email to = new Email(email);
    Content content = new Content("text/plain", messsage);
    Mail mail = new Mail(from, subject, to, content);
    SendGrid sg = new SendGrid(this.environment.getProperty("sendgrid.api.key"));
    Request request = new Request();
    try {
      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());
      sg.api(request);
    } catch (IOException ex) {
      throw ex;
    }
  }

  private List<CPSNotification> getNotifications() throws Exception {
    String subId = Constants.Notifications.SUBSCRIPTION_ID + "_" + this.environment.getActiveProfiles()[0];
    List<CPSNotification> notifs = CPSNotification.readMessages(subId);
    return notifs;
  }

  public NotificationServices() {
  }
}
