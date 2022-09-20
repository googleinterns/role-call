package com.google.rolecall.services;

import java.io.FileNotFoundException;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.BucketInfo;
import com.google.cloud.storage.Storage;
import com.google.rolecall.models.UserAsset.AssetType;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.util.StorageService;

@Profile({ "prod", "qa" })
@Service("CloudStorageService")
public class CloudStorageService implements StorageService {
  private Storage storage;
  private String bucketName;

  @Override
  public void init() throws IOException {
    if (storage.get(bucketName, Storage.BucketGetOption.fields()) == null) {
      storage.create(BucketInfo.of(bucketName));
      System.out.println("Bucket created: " + bucketName);
    } else {
      System.out.println("Bucket exisits: " + bucketName);
    }
  }

  @Override
  public void store(MultipartFile file, AssetType type, String filename) throws IOException, InvalidParameterException {
    if (file.isEmpty()) {
      throw new InvalidParameterException("File cannot be empty.");
    }
    try {
      storage.create(BlobInfo.newBuilder(bucketName,
          String.format("%s/%s", type.location, filename)).build(),
          file.getBytes());
    } catch (Exception e) {
      throw new IOException("Unable to store file in the bucket.", e);
    }
  }

  @Override
  public Resource loadAsResource(AssetType type, String filename) throws FileNotFoundException {
    Blob blob = storage.get(
        BlobId.of(bucketName, String.format("%s/%s", type.location, filename)));
    if (blob == null || !blob.exists()) {
      throw new FileNotFoundException("No file found for " + filename + ".");
    }
    return new ByteArrayResource(blob.getContent());
  }

  @Override
  public void delete(AssetType type, String filename) throws FileNotFoundException, IOException {
    Blob blob = storage.get(
        BlobId.of(bucketName, String.format("%s/%s", type.location, filename)));
    if (blob == null || !blob.exists()) {
      throw new FileNotFoundException("No file found for " + filename + ".");
    }
    storage.delete(blob.getBlobId());
  }

  @Autowired
  public CloudStorageService(Storage storage, Environment env) {
    this.storage = storage;
    this.bucketName = env.getProperty("rolecall.asset.resource.bucket");
  }
}
