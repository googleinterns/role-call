package com.google.rolecall.util;

import com.google.rolecall.Constants;
import com.google.rolecall.models.User;
import com.google.pubsub.v1.AcknowledgeRequest;
import com.google.pubsub.v1.ProjectSubscriptionName;
import com.google.pubsub.v1.PubsubMessage;
import com.google.pubsub.v1.PullRequest;
import com.google.pubsub.v1.PullResponse;
import com.google.pubsub.v1.ReceivedMessage;
import com.google.pubsub.v1.TopicName;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import com.google.cloud.pubsub.v1.Publisher;
import com.google.cloud.pubsub.v1.stub.GrpcSubscriberStub;
import com.google.cloud.pubsub.v1.stub.SubscriberStub;
import com.google.cloud.pubsub.v1.stub.SubscriberStubSettings;
import com.google.gson.Gson;
import com.google.protobuf.ByteString;

public class CPSNotification {
	public String email;
	public String phone;
	public String message;
	public String profile;

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
			TopicName topicName = TopicName.of(Constants.Notifications.PROJECT_ID,
					Constants.Notifications.TOPIC_ID + "_" + this.profile);
			publisher = Publisher.newBuilder(topicName).build();
			PubsubMessage pubsubMessage = PubsubMessage.newBuilder().setData(ByteString.copyFromUtf8(gson.toJson(this)))
					.build();
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

	public static List<CPSNotification> readMessages(String subscriptionId) throws Exception {
		List<CPSNotification> notifications = new ArrayList<CPSNotification>();
		SubscriberStub subscriber = null;
		try {

			SubscriberStubSettings subscriberStubSettings = SubscriberStubSettings.newBuilder()
					.setTransportChannelProvider(SubscriberStubSettings.defaultGrpcTransportProviderBuilder()
							.setMaxInboundMessageSize(20 * 1024 * 1024) // 20MB (maximum message size).
							.build())
					.build();
			subscriber = GrpcSubscriberStub.create(subscriberStubSettings);

			String subscriptionName = ProjectSubscriptionName.format(Constants.Notifications.PROJECT_ID,
					subscriptionId);
			PullRequest pullRequest = PullRequest.newBuilder().setMaxMessages(100).setSubscription(subscriptionName)
					.build();

			PullResponse pullResponse = subscriber.pullCallable().call(pullRequest);
			List<String> ackIds = new ArrayList<>();
			for (ReceivedMessage message : pullResponse.getReceivedMessagesList()) {
				Gson gson = new Gson();
				CPSNotification notif = gson.fromJson(message.getMessage().getData().toStringUtf8(),
						CPSNotification.class);
				notifications.add(notif);
				ackIds.add(message.getAckId());
			}
			// Acknowledge received messages.
			if(!ackIds.isEmpty()) {
				AcknowledgeRequest acknowledgeRequest = AcknowledgeRequest.newBuilder().setSubscription(subscriptionName)
				.addAllAckIds(ackIds).build();
				subscriber.acknowledgeCallable().call(acknowledgeRequest);
			}
			
		} catch (Exception e) {
			throw e;
		} finally {
			if (subscriber != null) {
			  // When finished with the publisher, shutdown to free up resources.
			  subscriber.shutdown();
			  subscriber.awaitTermination(1, TimeUnit.MINUTES);
			}

		}
		return notifications;
	}
}
