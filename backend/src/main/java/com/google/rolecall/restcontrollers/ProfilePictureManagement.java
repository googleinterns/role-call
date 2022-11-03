package com.google.rolecall.restcontrollers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.concurrent.CompletableFuture;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
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

  @Get(path = "/{filename}")
  public CompletableFuture<ResponseEntity<InputStreamResource>> getProfilePicture(
      @PathVariable String filename) {
    String extension = FilenameUtils.getExtension(filename);
    if (extension == null) {
      return CompletableFuture.failedFuture(
          new InvalidParameterException("Filename cannot be empty."));
    }
    try {
      InputStream stream = profilePictureServices
          .getProfilePicture(filename).getInputStream();
      MediaType mediaType = FileType.valueOf(
          extension.toUpperCase()).responseType;
      return CompletableFuture.completedFuture(ResponseEntity.ok().contentType(mediaType)
          .body(new InputStreamResource(stream)));
    } catch(FileNotFoundException e) {
      return CompletableFuture.completedFuture(ResponseEntity.notFound().build());
    } catch(Exception e) {
      return CompletableFuture.failedFuture(e);
    }
  }

  @Get(path = "/url/{filename}")
  public CompletableFuture<ResponseEntity<String>> getProfilePictureUrl(
      @PathVariable String filename) {
    String extension = FilenameUtils.getExtension(filename);
    if (extension == null) {
      return CompletableFuture.failedFuture(
          new InvalidParameterException("Filename cannot be empty."));
    }
    try {      
      return CompletableFuture.completedFuture(ResponseEntity.ok().contentType(MediaType.TEXT_PLAIN)
          .body(profilePictureServices.getProfilePictureUrl(filename)));
    } catch(FileNotFoundException e) {
      return CompletableFuture.completedFuture(ResponseEntity.notFound().build());
    } catch(Exception e) {
      return CompletableFuture.failedFuture(e);
    }
  }

  @Post
  public CompletableFuture<ResponseSchema<UserAssetInfo>> uploadFile(Principal principal,
      @RequestParam(Constants.RequestParameters.FILE) MultipartFile file,
      @RequestParam(Constants.RequestParameters.USER_ID) int ownerId
  ) {
    if (file == null) {
      return CompletableFuture.failedFuture(
          new InvalidParameterException("File is required."));
    }
    User currentUser = getUser(principal);
    if (ownerId != currentUser.getId() && !getUser(principal).isAdmin()) {
      return  CompletableFuture.failedFuture(insufficientPrivileges(Constants.Roles.ADMIN));
    }
    UserAsset newAsset;
    try {
      newAsset = profilePictureServices.createProfilePicture(
        ownerId, file);
    } catch(IOException e) {
      return CompletableFuture.failedFuture(e);
    } catch(Exception e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<UserAssetInfo> response =
        new ResponseSchema<UserAssetInfo>(newAsset.toUserAssetInfo());
    return CompletableFuture.completedFuture(response);
  }

  @Autowired
  public ProfilePictureManagement(ProfilePictureServices profilePictureServices) {
    this.profilePictureServices = profilePictureServices;
  }
}
