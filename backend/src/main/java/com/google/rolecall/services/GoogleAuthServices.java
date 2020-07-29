package com.google.rolecall.services;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.concurrent.CompletableFuture;

import com.fasterxml.jackson.core.JsonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.gax.rpc.ApiException;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;

import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service("googleAuth")
public class GoogleAuthServices {

  private final Environment env;
  
  private GoogleIdTokenVerifier verifier;

  @Async
  public CompletableFuture<Boolean> isValidAccessToken(String email, String token) {
    GoogleIdToken idToken = null;
    try {
      idToken = verifier.verify(token);
    } catch(GeneralSecurityException e) {
      CompletableFuture.failedFuture(new Exception("Unable to verify with Google."));
    } catch(IOException e) {
      CompletableFuture.failedFuture(new IOException(
          "Unable to verify with Google. Please try again."));
    }

    if(idToken != null) {
      Payload payload = idToken.getPayload();
      if(email.equals(payload.getEmail())) {
        return CompletableFuture.completedFuture(true);
      }
    }
    return CompletableFuture.completedFuture(false);
  }

  private String getClientId() {
    String id;
    String projectId = env.getProperty("spring.cloud.gcp.projectId");
    String secretName = env.getProperty("cloud.secret.clientid");

    try {
      id = getSecretResponse(projectId, secretName).getPayload().getData().toStringUtf8();
    } catch (IOException e) {
      throw new RuntimeException("Unable to access secret manager. "
          + "Applications calling this method should be run on App Engine.");
    } catch (ApiException e) {
      throw new RuntimeException("Unable to get cloud db password. Call for password failed. "
          + "Check spring.cloud.gcp.projectId and cloud.secret.name for correctness.");
    } catch (Exception e) {
      throw new RuntimeException("Failed to get cloud db password for UNKNOWN reason: \n" 
          + e.getMessage());
    }

    return id;
  }

  AccessSecretVersionResponse getSecretResponse(String projectId, String secretName) 
      throws Exception {
    SecretManagerServiceClient  client = SecretManagerServiceClient.create();
    SecretVersionName name = SecretVersionName.of(projectId, secretName, "latest");

    return client.accessSecretVersion(name);
  }

  public GoogleAuthServices(Environment env) {
    this.env = env;
    verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport() , new JacksonFactory())
    // Specify the CLIENT_ID of the app that accesses the backend:
    .setAudience(Collections.singletonList(getClientId()))
    // Or, if multiple clients access the backend:
    //.setAudience(Arrays.asList(CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3))
    .build();
  }
}
