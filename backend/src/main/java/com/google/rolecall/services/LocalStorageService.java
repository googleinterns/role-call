package com.google.rolecall.services;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

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

@Profile({ "dev" })
@Service("LocalStorageService")
public class LocalStorageService implements StorageService {
  private final Path root;

  @Override
  public void init() throws IOException {
    if (!Files.exists(root)) {
      try {
        Files.createDirectories(root);
      } catch (IOException e) {
        throw new IOException("Could not initialize storage.");
      }
    }
    for (AssetType type : AssetType.values()) {
      Path subDir = Path.of(root.toString(), type.location);
      if (!Files.exists(subDir)) {
        Files.createDirectories(subDir);
        }
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
  public String loadAsUrl(AssetType type, String filename) throws NotImplementedException {
    throw new NotImplementedException();
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
  public LocalStorageService(Environment env) {
    root = Path.of(env.getProperty("rolecall.asset.resource.directory")).toAbsolutePath();
  }
}
