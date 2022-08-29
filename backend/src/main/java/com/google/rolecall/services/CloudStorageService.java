package com.google.rolecall.services;

import java.io.FileNotFoundException;
import java.io.IOException;

import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.rolecall.models.UserAsset.AssetType;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.util.StorageService;

@Profile({"prod", "qa"})
@Service("CloudStorageService")
public class CloudStorageService implements StorageService {

  @Override
  public void init() throws IOException {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void store(MultipartFile file, AssetType type, String filename) throws IOException, InvalidParameterException {
    // TODO Auto-generated method stub
    
  }

  @Override
  public Resource loadAsResource(AssetType type, String filename) throws FileNotFoundException {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void delete(AssetType type, String filename) throws FileNotFoundException, IOException {
    // TODO Auto-generated method stub
    
  }
  
}
