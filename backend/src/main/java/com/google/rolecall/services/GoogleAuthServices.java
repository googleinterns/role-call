package com.google.rolecall.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.gax.rpc.ApiException;
import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Profile("prod")
@Service("googleAuthServices")
public class GoogleAuthServices {

  private final Environment env;
  private GoogleIdTokenVerifier verifier;
  private Logger logger = Logger.getLogger(GoogleAuthServices.class.getName());

  public boolean isValidAccessToken(String email, String encodedToken)
      throws GeneralSecurityException, IOException {

    GoogleIdToken idToken = null;
    try {
      idToken = verifier.verify(encodedToken);
    } catch(GeneralSecurityException e) {
      throw new RuntimeException("Unable to verify with Google.");
    } catch(IOException e) {
      logger.log(Level.SEVERE, e.getMessage());
      throw new IOException(
          "Unable to verify with Google. Please try again.");
    }

    if(idToken != null) {
      Payload payload = idToken.getPayload();
      if(email.equals(payload.getEmail())) {
        return true;
      }
    }
    return false;
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
        .setAudience(Collections.singletonList(getClientId()))
        .build();
  }
}
