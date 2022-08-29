package com.google.rolecall.services;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Optional;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.google.rolecall.models.UserAsset;
import com.google.rolecall.models.UserAsset.AssetType;
import com.google.rolecall.models.UserAsset.FileType;
import com.google.rolecall.repos.UserAssetRepository;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.util.StorageService;

@Service("profilePictureServices")
@Transactional(rollbackFor = Exception.class)
public class ProfilePictureServices {

  private final UserAssetRepository assetRepo;
  private final UserServices userServices;
  private final StorageService storage;

  public InputStreamResource getProfilePicture(String fileName)
      throws FileNotFoundException, IOException, InvalidParameterException {
    return new InputStreamResource(storage.loadAsResource(
        AssetType.PROFILEPICTURE, fileName).getInputStream());
  }

  public UserAsset createProfilePicture(Integer ownerId, MultipartFile image)
      throws EntityNotFoundException, InvalidParameterException, IOException {
    String fileExtension = FilenameUtils.getExtension(image.getOriginalFilename());
    FileType fileType;
    try {
      fileType = FileType.valueOf(fileExtension);
    } catch (Exception e) {
      throw new InvalidParameterException(String.format(
          "Profile picture cannot have type: %s.", fileExtension));
    }

    UserAsset asset = new UserAsset(AssetType.PROFILEPICTURE, fileType);
    userServices.addNewProfilePictureToUser(ownerId, asset);

    storage.store(image, AssetType.PROFILEPICTURE, asset.getFileName());

    userServices.setProfilePicture(ownerId, asset);
    
    return asset;
  }

  public void deleteProfilePicture(Integer id) throws EntityNotFoundException,
      InvalidParameterException, IOException {
    if (id == null) {
      throw new InvalidParameterException("Missing id");
    }
    Optional<UserAsset> queryResult = assetRepo.findById(id);
    if (!queryResult.isPresent()) {
        throw new EntityNotFoundException(String.format("assetid %d does not exist", id));
    }
    UserAsset asset = queryResult.get();
    try {
      storage.delete(AssetType.PROFILEPICTURE, asset.getFileName());
    } catch (Exception e) {
      throw new IOException("File could not be found or deleted.");
    }
    userServices.removeProfilePictureFromUser(asset.getOwner().getId(), asset);
  }

  @Autowired
  public ProfilePictureServices(UserAssetRepository assetRepo,
      StorageService storage, UserServices userServices) {
    this.assetRepo = assetRepo;
    this.storage = storage;
    this.userServices = userServices;
  }
}