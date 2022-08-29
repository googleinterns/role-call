package com.google.rolecall.services;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.google.rolecall.models.UserAsset.AssetType;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.util.StorageService;

@Profile({"dev"})
public class LocalStorageService implements StorageService {
  private final Path root;

  @Override
  public void init() throws IOException {
    if (!Files.exists(root)) {
      try {
        Files.createDirectories(root);
      }
      catch (IOException e) {
        throw new IOException("Could not initialize storage.");
      }
    }
  }

  @Override
  public void store(MultipartFile file, AssetType type, String filename) throws IOException, InvalidParameterException {
    if (file.isEmpty()) {
      throw new InvalidParameterException("File cannot be empty.");
    }
    Path filePath = Path.of(root.toString(), type.location, filename);
    if (!filePath.toAbsolutePath().equals(Path.of(root.toString(), type.location))) {
      throw new InvalidParameterException("File must be in parent directory");
    }
    try (InputStream inputStream = file.getInputStream()) {
      Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
    } catch(IOException e) {
      throw new IOException("Unable to copy file.");
    }
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

  @Autowired
  public LocalStorageService(Environment env) {
    root = Path.of(env.getProperty("rolecall.asset.resource.directory")).toAbsolutePath();
  }
}
