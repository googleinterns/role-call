package com.google.rolecall.util;

import com.google.rolecall.Constants;
import com.google.rolecall.models.User;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.TopicName;
import java.util.concurrent.TimeUnit;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.gson.Gson;
import com.google.protobuf.ByteString;

public class CPSNotification {
	String email;
	String phone;
	String message;
	String profile;

	public CPSNotification(User user, String message, String profile) {
		
		this.profile = profile;		
		this.email = user.getEmail();
		this.phone = user.getPhoneNumber();
		this.message = message;
	}

	public void send() {
		Publisher publisher = null;
		try {
			Gson gson = new Gson();
			TopicName topicName = TopicName.of(Constants.Notifications.PROJECT_ID, Constants.Notifications.TOPIC_ID + "_" +this.profile);
			publisher = Publisher.newBuilder(topicName).build();
			PubsubMessage pubsubMessage = PubsubMessage.newBuilder().setData(ByteString.copyFromUtf8(gson.toJson(this))).build();
			publisher.publish(pubsubMessage);					
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			if (publisher != null) {				
				publisher.shutdown();
				try {
					publisher.awaitTermination(1, TimeUnit.MINUTES);
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		}

	}

}
