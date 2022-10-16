package com.google.rolecall.services;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.concurrent.TimeUnit;

import org.apache.commons.lang3.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.rolecall.models.UserAsset.AssetType;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.util.StorageService;



import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.Storage.SignUrlOption;


@Profile({ "dev" })
@Service("LocalStorageService")
public class LocalStorageService implements StorageService {
  private final Path root;

  private Storage storage;
  private String bucketName = "ry_pic_bucket";
  @Override
  public void init() throws IOException {
    if (!Files.exists(root)) {
      try {
        Files.createDirectories(root);
        // System.out.println("Created new root directory: " + root.toString());
      } catch (IOException e) {
        throw new IOException("Could not initialize storage.");
      }
    }
    // else {
    //   System.out.println("Root directory exists: " + root.toRealPath().toString());
    // }
    for (AssetType type : AssetType.values()) {
      Path subDir = Path.of(root.toString(), type.location);
      if (!Files.exists(subDir)) {
        Files.createDirectories(subDir);
          // System.out.println(type.toString() + " directory created: " + subDir.toString());
        }
        // else {
        //   System.out.println(type.toString() + " directory exists: " + subDir.toString());
        // }
    }    
  }

  @Override
  public void store(MultipartFile file, AssetType type, String filename) throws IOException, InvalidParameterException {
    if (file.isEmpty()) {
      throw new InvalidParameterException("File cannot be empty.");
    }
    Path filePath = Path.of(root.toString(), type.location, filename);
    if (!filePath.toAbsolutePath().getParent().equals(Path.of(root.toString(), type.location))) {
      throw new InvalidParameterException("File must be in parent directory");
    }
    InputStream inputStream = file.getInputStream();
    try {
      Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
    } finally {
      inputStream.close();
    }
  }

  @Override
  public Resource loadAsResource(AssetType type, String filename)
      throws InvalidParameterException, FileNotFoundException {
    Path filePath = Path.of(root.toString(), type.location, filename);
    if (!filePath.toAbsolutePath().getParent().equals(Path.of(root.toString(), type.location))) {
      throw new InvalidParameterException("File must be in parent directory.");
    }
    Resource resource = new FileSystemResource(filePath);
    if (!resource.exists()) {
      throw new FileNotFoundException("No file found for " + filename + ".");
    }
    return resource;
  }

  @Override
  public String loadAsUrl(AssetType type, String filename)
      throws InvalidParameterException, FileNotFoundException {           
        Blob blob = storage.get(
          BlobId.of(bucketName, String.format("%s/%s", type.location, filename)));
        if (blob == null || !blob.exists()) {
          throw new FileNotFoundException("No file found for " + filename + ".");
        }
        return storage.signUrl(blob.toBuilder().setContentType("text/plain").build(), 1, TimeUnit.DAYS, SignUrlOption.withV4Signature()).toString();
  }


  @Override
  public void delete(AssetType type, String filename)
      throws InvalidParameterException, FileNotFoundException, IOException {
    Path filePath = Path.of(root.toString(), type.location, filename);
    if (!filePath.toAbsolutePath().getParent().equals(Path.of(root.toString(), type.location))) {
      throw new InvalidParameterException("File must be in parent directory.");
    }
    if (!Files.exists(filePath)) {
      throw new FileNotFoundException("No file found for " + filename + ".");
    }
    Files.delete(filePath);
  }

  @Autowired
  public LocalStorageService(Environment env, Storage storage) {
    this.storage = storage;
    root = Path.of(env.getProperty("rolecall.asset.resource.directory")).toAbsolutePath();
  }
}
