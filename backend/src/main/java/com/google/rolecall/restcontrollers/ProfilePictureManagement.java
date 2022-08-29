package com.google.rolecall.restcontrollers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.concurrent.CompletableFuture;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.UserAssetInfo;
import com.google.rolecall.models.User;
import com.google.rolecall.models.UserAsset;
import com.google.rolecall.models.UserAsset.FileType;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.ProfilePictureServices;

@Endpoint(Constants.Mappings.PROFILE_PICTURE_MANAGEMENT)
public class ProfilePictureManagement extends AsyncRestEndpoint  {

  private final ProfilePictureServices profilePictureServices;

  @Get("/{filename:}")
  public ResponseEntity<InputStreamResource> getProfilePicture(
      @PathVariable String filename) {
    String extension = FilenameUtils.getExtension(filename);
    if (extension == null) {
      return ResponseEntity.notFound().build();
    }
    try {
      InputStream stream = profilePictureServices
          .getProfilePicture(filename).getInputStream();
      MediaType mediaType = FileType.valueOf(
          extension.toUpperCase()).responseType;
      return ResponseEntity.ok().contentType(mediaType)
          .body(new InputStreamResource(stream));
    } catch(FileNotFoundException e) {
      return ResponseEntity.notFound().build();
    } catch(IOException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    } catch (InvalidParameterException e) {
      return ResponseEntity.badRequest().build();
    }
  }

  @Post(Constants.RequestParameters.FILE)
  public CompletableFuture<ResponseSchema<UserAssetInfo>> uploadFile(Principal principal,
      @RequestParam(Constants.RequestParameters.FILE) MultipartFile file) {
    User currentUser = getUser(principal);
    UserAsset newAsset;
    try {
      newAsset = profilePictureServices.createProfilePicture(
          currentUser.getId(), file);
    } catch(IOException e) {
      return CompletableFuture.failedFuture(new InternalError());
    } catch(Exception e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<UserAssetInfo> response =
        new ResponseSchema<UserAssetInfo>(newAsset.toUserAssetInfo());
    return CompletableFuture.completedFuture(response);
  }



  @Autowired
  private ProfilePictureManagement(ProfilePictureServices profilePictureServices) {
    this.profilePictureServices = profilePictureServices;
  }
}
