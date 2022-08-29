package com.google.rolecall.util;

import java.io.FileNotFoundException;
import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.google.rolecall.models.UserAsset.AssetType;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;

public interface StorageService {
  void init() throws IOException;

	void store(MultipartFile file, AssetType type, String filename) throws IOException, InvalidParameterException;

	Resource loadAsResource(AssetType type, String filename) throws FileNotFoundException;

	void delete(AssetType type, String filename) throws FileNotFoundException, IOException;
}
