package com.google.rolecall.restcontrollers;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.rolecall.Constants;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.services.ProfilePictureServices;

@Endpoint(Constants.Mappings.PROFILE_PICTURE_MANAGEMENT)
public class ProfilePictureManagement extends AsyncRestEndpoint  {
  
  private final ProfilePictureServices profilePictureServices;

  



  @Autowired
  private ProfilePictureManagement(ProfilePictureServices profilePictureServices) {
    this.profilePictureServices = profilePictureServices;
  }
}
