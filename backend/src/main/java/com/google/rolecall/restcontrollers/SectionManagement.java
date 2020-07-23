package com.google.rolecall.restcontrollers;

import com.google.rolecall.Constants;
import com.google.rolecall.jsonobjects.ResponseSchema;
import com.google.rolecall.jsonobjects.SectionInfo;
import com.google.rolecall.models.Section;
import com.google.rolecall.restcontrollers.Annotations.Delete;
import com.google.rolecall.restcontrollers.Annotations.Endpoint;
import com.google.rolecall.restcontrollers.Annotations.Get;
import com.google.rolecall.restcontrollers.Annotations.Patch;
import com.google.rolecall.restcontrollers.Annotations.Post;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.EntityNotFoundException;
import com.google.rolecall.restcontrollers.exceptionhandling.RequestExceptions.InvalidParameterException;
import com.google.rolecall.services.SectionServices;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Endpoint(Constants.Mappings.SECTION_MANAGEMENT)
public class SectionManagement {

  private final SectionServices sectionService;

  /**
   * Gets all {@link Section} objects stored in the database without {@link Position} objects.
   * 
   * @return List of {@link SectionInfo} objects excluding children {@link Position}.
   */
  @Get
  public CompletableFuture<ResponseSchema<List<SectionInfo>>> getAllUsers() {
    List<Section> allSections = sectionService.getAllSections();

    List<SectionInfo> sections = allSections.stream().map(s ->
        SectionInfo.newBuilder()
            .setId(s.getId())
            .setName(s.getName())
            .setNotes(s.getNotes())
            .setLength(s.getLength().isEmpty() ? null : s.getLength().get())
            .build()
        ).collect(Collectors.toList());

    ResponseSchema<List<SectionInfo>> response = new ResponseSchema<>(sections);
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Gets an {@link Section} object by its {@code USER_ID}.
   *
   * @param id the unique ID associate with a section.
   * @return {@link SectionInfo} object with the target ID.
   * @throws EntityNotFoundException if Section is not found in the database by Id.
   */
  @Get(Constants.RequestParameters.SECTION_ID)
  public CompletableFuture<ResponseSchema<SectionInfo>> getSingleSection(
      @RequestParam(value=Constants.RequestParameters.SECTION_ID, required=true) int id) {
    Section section;

    try {
      section = sectionService.getSection(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<SectionInfo> response = new ResponseSchema<>(section.toSectionInfo());
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Creates a new {@link Section} object and Children {@link Position} objects
   * and stores it in the database.
   * 
   * @param newSection {@Link SectionInfo} object stores client inputed values for 
   *    the new {@link Section} and children {@link Position}.
   * @return {@Link SectionInfo} object of {@link Section} created and saved in the database.
   * @throws InvalidParameterException if {@Link SectionInfo} object does not contain sufficient
   *     or valid new user information. See {@link SectionServices.createSection} for specifics.
   */
  @Post
  public CompletableFuture<ResponseSchema<SectionInfo>> createNewSection(
      @RequestBody SectionInfo newSection) {
    Section section;

    try {
      section = sectionService.createSection(newSection);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<SectionInfo> response = new ResponseSchema<>(section.toSectionInfo());
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Edits an existing {@link Section} object and manages Children {@link Position} objects.
   * Saves the final valid state to the database.
   * 
   * @param newSection {@Link SectionInfo} object stores client inputed values for 
   *    the new {@link Section} and children {@link Position}.
   * @return {@Link SectionInfo} object of {@link Section} saved in the database.
   * @throws InvalidParameterException if {@Link SectionInfo} object does not contain sufficient
   *     or valid new user information. See {@link SectionServices.editSection} for specifics.
   */
  @Patch
  public CompletableFuture<ResponseSchema<SectionInfo>> editSection(
      @RequestBody SectionInfo newSection) {
    Section section;

    try {
      section = sectionService.editSection(newSection);
    } catch(InvalidParameterException e) {
      return CompletableFuture.failedFuture(e);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }

    ResponseSchema<SectionInfo> response = new ResponseSchema<>(section.toSectionInfo());
    return CompletableFuture.completedFuture(response);
  }

  /**
   * Deletes an existing {@link Section} object and all Children from the database.
   * 
   * @param id Unique Id associated with the {@link Section} object to be deleted.
   * @return Nothing on successful deletion.
   * @throws EntityNotFoundException when the id does not match an existing {@link Section} object.
   *     in the database.
   */
  @Delete(Constants.RequestParameters.SECTION_ID)
  public CompletableFuture<Void> deleteSection(
      @RequestParam(value=Constants.RequestParameters.SECTION_ID, required=true) int id) {
    try {
      sectionService.deleteSection(id);
    } catch(EntityNotFoundException e) {
      return CompletableFuture.failedFuture(e);
    }
    
    return CompletableFuture.completedFuture(null);
  }

  public SectionManagement(SectionServices sectionService) {
    this.sectionService = sectionService;
  }
}
