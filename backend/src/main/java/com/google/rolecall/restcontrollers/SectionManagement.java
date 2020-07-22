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
