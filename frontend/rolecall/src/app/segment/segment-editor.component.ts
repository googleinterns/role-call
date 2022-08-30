import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { COLORS } from 'src/constants';
import * as APITypes from 'src/api-types';

import { Segment, SegmentApi, SegmentType, Position,
} from '../api/segment-api.service';
import { ResponseStatusHandlerService,
} from '../services/response-status-handler.service';
import { SuperBalletDisplayService,
} from '../services/super-ballet-display.service';
import { SegmentDisplayListService,
} from '../services/segment-display-list.service';

export type WorkingSegment = Segment & {
  addingPositions: DraggablePosition[];
  originalName: string;
};

type ValueName =
    'New Position' |
    'Existing Position' |
    'New Ballet' |
    'Existing Ballet';

type DraggablePosition = {
  index: number;
  pos: Position;
  valueName: ValueName;
  type: 'adding' | 'added' | 'editing';
  nameDisplay: string;
  sizeDisplay: string;
  shouldBeDeleted: boolean;
};


@Component({
  selector: 'app-segment-editor',
  templateUrl: './segment-editor.component.html',
  styleUrls: ['./segment-editor.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SegmentEditor implements OnInit {
  dragAndDropData: DraggablePosition[] = [];
  currentSelectedSegment: WorkingSegment;

  // All segments in the system ready to be edited.
  workingSegments: WorkingSegment[];

  urlPointingUUID: string;

  sizeValueName = '# Dancers';

  prevWorkingState: WorkingSegment;
  workingSegment: WorkingSegment;
  canDelete = false;
  canSave = false;

  creatingSegment = false;
  segmentsLoaded = false;

  offWhite: string = COLORS.offWhite;

  lastSelectedSegmentName: string;
  currentTypeOffset = 0;

  segmentTypes = ['SEGMENT', 'BALLET', 'SUPER'];
  selectedSegmentType: SegmentType;
  segmentPrettyTypes = ['Segment', 'Ballet', 'Super Ballet'];
  segmentPrettyNames: string[];

  constructor(
      private route: ActivatedRoute,
      private segmentApi: SegmentApi,
      private location: Location,
      private respHandler: ResponseStatusHandlerService,
      private superBalletDisplay: SuperBalletDisplayService,
      public leftList: SegmentDisplayListService,
  ) {
    this.segmentPrettyNames = ['', ...this.segmentPrettyTypes];
  }

  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  ngOnInit(): void {
    const uuid = this.route.snapshot.params.uuid;
    if (uuid) {
      this.urlPointingUUID = uuid;
    }
    this.segmentApi.segmentEmitter.subscribe(
        segment => {
          this.onSegmentLoad(segment);
        });
    this.segmentApi.getAllSegments();
  }

  onSegmentLoad = (segments: Segment[]): void => {
    if (segments.length === 0) {
      this.workingSegments = [];
      this.segmentsLoaded = true;
      return;
    }
    if (this.workingSegments) {
      const prevSegmentUUIDS = new Set(this.workingSegments.map(
          segment => segment.uuid));
      const newSegments: Segment[] = [];
      for (const segment of segments) {
        if (!prevSegmentUUIDS.has(segment.uuid)) {
          newSegments.push(segment);
        }
      }
      if (newSegments.length > 0) {
        for (const newSegment of newSegments) {
          if (newSegment.name === this.lastSelectedSegmentName) {
            this.urlPointingUUID = newSegment.uuid;
          }
        }
      }
    };

    const workSegments = segments.map(segment => {
      if (segment.type === 'SUPER' &&
          !this.superBalletDisplay.isInDisplayList(segment.uuid)) {
        this.superBalletDisplay.setOpenState(segment.uuid, false);
      }
      return {
        ...segment,
        addingPositions: [],
        originalName: String(segment.name),
        isOpen: false,
      };
    });
    this.workingSegments = workSegments;

    if (!this.urlPointingUUID) {
      this.setCurrentSegment(workSegments[0]);
    } else {
      const foundSegment = workSegments.find(
          workSegment => workSegment.uuid === this.urlPointingUUID);
      if (!foundSegment) {
        this.setCurrentSegment(workSegments[0]);
      } else {
        this.setCurrentSegment(foundSegment);
      }
    }
    this.segmentsLoaded = true;
    this.buildLeftList();
  };

  haveContent = (): boolean =>
    this.currentSelectedSegment && (
      this.currentSelectedSegment.type === 'BALLET' ||
      this.currentSelectedSegment.type === 'SUPER');


  setCurrentSegmentFromIndex = (segmentIndex: number): void => {
    const selectedWorking = this.workingSegments.find(segment =>
      segment.uuid === this.leftList.topLevelSegments[segmentIndex].uuid);
    if (selectedWorking) {
      this.setCurrentSegment(selectedWorking);
    }
  };

  setCurrentSegment = (segment: WorkingSegment): void => {
    if (segment && this.currentSelectedSegment &&
      segment.uuid !== this.currentSelectedSegment.uuid) {
      if (this.canSave) {
        this.currentSelectedSegment.name =
            this.currentSelectedSegment.originalName;
      }
      this.canSave = false;
      this.canDelete = true;
      this.creatingSegment = false;
      this.currentSelectedSegment.addingPositions = [];
    }
    if ((this.workingSegment && segment
        && segment.uuid !== this.workingSegment.uuid)) {
      this.workingSegments = this.workingSegments.filter(
          renderSegment => renderSegment.uuid !== this.workingSegment.uuid);
      if (this.prevWorkingState !== undefined) {
        this.currentSelectedSegment = this.prevWorkingState;
        this.workingSegments.push(this.currentSelectedSegment);
      }
      this.prevWorkingState = undefined;
      this.workingSegment = undefined;
    }
    this.currentSelectedSegment = segment;
    this.urlPointingUUID = segment ? segment.uuid : '';
    this.currentTypeOffset =
        segment ? this.getCurrentTypeCode(segment.type) : 0;
    if (this.location.path().startsWith('/segment')) {
        // || this.location.path().startsWith('/piece/')) {
      if (segment) {
        this.location.replaceState('/segment/' + this.urlPointingUUID);
      }
    }
    this.updateDragAndDropData();
    this.selectedSegmentType = this.currentSelectedSegment
        ? this.currentSelectedSegment.type : 'SEGMENT';
  };

  canAddSegment = (): boolean =>
    true;


  addSegment = (ix: number): void => {
    if (this.creatingSegment) {
      return;
    }
    const segmentTpCd = ix + 1;
    let name = 'TEST';
    let type: SegmentType = 'BALLET';
    let originalName = 'TEST';
    this.currentTypeOffset = segmentTpCd;
    switch (segmentTpCd) {
      case 1:
        name = 'New Break';
        type = 'SEGMENT';
        originalName = 'New Break';
        break;
      case 2:
        name = 'New Ballet';
        type = 'BALLET';
        originalName = 'New Ballet';
        break;
      case 3:
        name = 'New Super Ballet';
        type = 'SUPER';
        originalName = 'New Super Ballet';
        break;
    }
    this.creatingSegment = true;
    this.prevWorkingState = undefined;
    const newSegment: WorkingSegment = {
      uuid: 'segment:' + Date.now(),
      // A Super Ballet should initially show its children
      isOpen: type === 'SUPER',
      name,
      siblingId: null,
      positions: [],
      type,
      originalName,
      addingPositions: [],
      deletePositions: [],
    };
    if (newSegment.type === 'SUPER') {
      this.superBalletDisplay.setOpenState(newSegment.uuid, newSegment.isOpen);
    }
    this.selectedSegmentType = type;
    this.currentSelectedSegment = newSegment;
    this.workingSegments.push(newSegment);
    this.workingSegment = newSegment;
    this.canSave = true;
    this.canDelete = false;
    this.dragAndDropData = [];
    this.setCurrentSegment(this.workingSegment);
    this.buildLeftList();
  };

  canSaveSegment = (): boolean =>
    this.canSave;


  onSaveSegment = (): void => {
    if (this.currentSelectedSegment && (!this.currentSelectedSegment.name ||
        this.currentSelectedSegment.name === '')) {
      this.respHandler.showError({
        url: 'Error occurred while saving ballet',
        status: 400,
        statusText: 'No ballet name!',
        errorMessage: 'You must enter a ballet name!'
      });
      return;
    }
    this.lastSelectedSegmentName = this.currentSelectedSegment.name;
    this.updateDragAndDropData(true);
    this.segmentApi.setSegment(this.currentSelectedSegment)
        .then(async result => {
      if (result.successful) {
        this.currentSelectedSegment.addingPositions = [];
        this.canSave = false;
        this.canDelete = true;
        this.creatingSegment = false;
        const prevUUID = this.currentSelectedSegment.uuid;
        const superBallet = prevUUID.startsWith('segment:')
            ? this.currentSelectedSegment : null;
        const matchName = superBallet ? superBallet.name : '';
        const matchLength = superBallet ? superBallet.positions.length : -1;
        this.prevWorkingState = undefined;
        this.workingSegment = undefined;
        await this.segmentApi.getAllSegments();
        let foundSame: WorkingSegment = null;
        for (let i = this.workingSegments.length; 0 < i--;) {
          const segment = this.workingSegments[i];
          if (matchName.length > 0) {
            if (segment.name === matchName &&
                segment.positions.length === matchLength) {
              foundSame = segment;
              break;
            }
          } else {
            if (segment.uuid === prevUUID) {
              foundSame = segment;
              break;
            }
          }
        }
        if (foundSame && this.location.path().startsWith('/segment')) {
          if (prevUUID !== foundSame.uuid) {
            const isOpen = this.superBalletDisplay.isOpen(prevUUID);
            this.superBalletDisplay.removeFromDisplayList(prevUUID);
            this.superBalletDisplay.setOpenState(foundSame.uuid, isOpen);
            this.buildLeftList();
          }
          this.setCurrentSegment(foundSame);
        }
      }
    });
  };

  canDeleteSegment = (): boolean =>
    this.canDelete;


  deleteSegment = async (): Promise<void> => {
    let successIndicator: APITypes.SuccessIndicator = {successful: false};
    if (!this.creatingSegment) {
      this.superBalletDisplay.removeFromDisplayList(
          this.currentSelectedSegment.uuid);
      successIndicator =
          await this.segmentApi.deleteSegment(this.currentSelectedSegment);
    }
    if (successIndicator.successful === true) {
      this.workingSegments = this.workingSegments.filter(
          segment => segment.uuid !== this.currentSelectedSegment.uuid);
      this.buildLeftList();
      if (this.workingSegments.length > 0) {
        this.setCurrentSegment(this.workingSegments[0]);
      } else {
        this.setCurrentSegment(undefined);
      }
    }
    this.prevWorkingState = undefined;
    this.canSave = false;
    this.canDelete = false;
    this.creatingSegment = false;
  };

  addPosition = (): void => {
    if (!this.workingSegment) {
      this.prevWorkingState = this.currentSelectedSegment;
      this.workingSegment = this.currentSelectedSegment;
      this.setCurrentSegment(this.workingSegment);
    }
    const createPosition = this.currentSelectedSegment.type === 'BALLET';
    this.creatingSegment = true;
    this.canSave = true;
    const nextIndex = (this.currentSelectedSegment.positions.length +
                       this.currentSelectedSegment.addingPositions.length);
    const name = createPosition ? 'New Position' : 'New Ballet';
    this.dragAndDropData.push({
      index: nextIndex,
      pos: {
        name,
        uuid: 'position:' + Date.now(),
        notes: '',
        order: nextIndex,
        siblingId: null,
        size: 1,
      },
      valueName: createPosition ? 'New Position' : 'New Ballet',
      type: 'adding',
      nameDisplay: this.calcNameDisplay({createPosition, name}),
      sizeDisplay: this.calcSizeDisplay({createPosition, dancerCount: 1}),
      shouldBeDeleted: false,
    });
    this.updateDragAndDropData();
  };

  deleteAddingPosition = (index: number): void => {
    this.dragAndDropData = this.dragAndDropData.filter(
      position => position.index !== index);
    this.canSave = true;
    this.updateDragAndDropData();
  };

  deletePosition = (index: number): void => {
    if (!this.workingSegment) {
      this.prevWorkingState = this.currentSelectedSegment;
      this.workingSegment = this.currentSelectedSegment;
      this.setCurrentSegment(this.workingSegment);
    }
    const foundPos = this.dragAndDropData.find(
        position => position.index === index);
    if (foundPos) {
      this.currentSelectedSegment.deletePositions.push(foundPos.pos);
    }
    this.dragAndDropData = this.dragAndDropData.filter(
        position => position.index !== index);
    this.canSave = true;
    this.updateDragAndDropData();
  };

  editPosition = (index: number): void => {
    if (!this.workingSegment) {
      this.prevWorkingState = this.currentSelectedSegment;
      this.workingSegment = this.currentSelectedSegment;
      this.setCurrentSegment(this.workingSegment);
    }
    const foundPos = this.dragAndDropData.find(
        position => position.index === index);
    if (foundPos) {
      foundPos.type = 'editing';
    }
    this.canSave = true;
  };

  onTitleInput = (event: Event): void => {
    this.canSave = true;
    this.currentSelectedSegment.name =
      ( event.target as HTMLInputElement ).value;
  };

  onSelectSegmentType = (event: MatSelectChange): void => {
    this.selectedSegmentType = event.value;
    this.currentSelectedSegment.type = event.value;
    this.canSave = true;
  };

  onInputChange = ({change: [valueName, value], data}: {
    change: [string, any];
    data?: any;
  }): void => {
    if (!this.workingSegment) {
      this.prevWorkingState = this.currentSelectedSegment;
      this.workingSegment = this.currentSelectedSegment;
      this.setCurrentSegment(this.workingSegment);
    }
    if (this.workingSegment) {
      this.setWorkingPropertyByKey({key: valueName, name: value, data});
    }
  };

  setWorkingPropertyByKey = ({key, name, data}: {
    key: string;
    name: string;
    data?: any;
  }): void => {
    if (key === 'New Position' || key === 'New Ballet') {
      const found = this.currentSelectedSegment.addingPositions.find(
          draggablePosition => draggablePosition.index === data.index);
      if (found) {
        found.pos.name = name;
      }
    } else if (key === 'Existing Position' || key === 'Existing Ballet') {
      const found = this.currentSelectedSegment.positions.find(
          position => position.order === data.index);
      if (found) {
        found.name = name;
      }
    } else if (key === '# Dancers') {
      const found = this.currentSelectedSegment.positions.find(
          position => position.order === data.index);
      if (found) {
        found.size = Number(name);
      }
      if (!found) {
        const foundNew = this.currentSelectedSegment.addingPositions.find(
            draggablePosition => draggablePosition.index === data.index);
        if (foundNew) {
          foundNew.pos.size = Number(name);
        }
      }
    } else if (key === 'New Ballet Name') {
      this.currentSelectedSegment.name = name;
    }
  };

  updateDragAndDropData = (writeThru?: boolean): void => {
    if (!this.currentSelectedSegment) {
      return;
    }
    const createPosition = this.currentSelectedSegment.type === 'BALLET';
    if (!this.canSave) {
      // after deleteSegment()
      this.dragAndDropData = this.currentSelectedSegment.positions
          .map((position, positionIndex) => ({
              index: positionIndex,
              pos: position,
              valueName: createPosition ? 'Existing Position' :
                  'Existing Ballet',
              type: 'added',
              nameDisplay: this.calcNameDisplay(
                  {createPosition, name: position.name}),
              sizeDisplay: this.calcSizeDisplay(
                  {createPosition, dancerCount: position.size}),
              shouldBeDeleted: false, // Verify 'after deleteSegment()'
            }
          ));
      return;
    }
    const newDDData = [];
    this.currentSelectedSegment.positions = [];
    this.currentSelectedSegment.addingPositions = [];
    for (let i = 0; i < this.dragAndDropData.length; i++) {
      const data = this.dragAndDropData[i];
      if (data.type === 'added' || data.type === 'editing') {
        const struct: DraggablePosition = {
          type: 'added',
          nameDisplay: this.calcNameDisplay(
              {createPosition, name: data.pos.name}),
          sizeDisplay: this.calcSizeDisplay(
              {createPosition, dancerCount: data.pos.size}),
          valueName: createPosition ? 'Existing Position' : 'Existing Ballet',
          index: i,
          pos: {...data.pos, order: i},
          shouldBeDeleted: false,
        };
        newDDData.push(struct);
        this.currentSelectedSegment.positions.push(struct.pos);
      } else {
        const struct: DraggablePosition = {
          type: 'adding',
          nameDisplay: this.calcNameDisplay(
              {createPosition, name: data.pos.name}),
          sizeDisplay: this.calcSizeDisplay(
              {createPosition, dancerCount: data.pos.size}),
          valueName: createPosition ? 'New Position' : 'New Ballet',
          index: i,
          pos: {...data.pos, order: i},
          shouldBeDeleted: false,
        };
        newDDData.push(struct);
        this.currentSelectedSegment.addingPositions.push(struct);
      }
    }
    this.dragAndDropData = newDDData;
    if (writeThru && writeThru) {
      this.currentSelectedSegment.positions = this.dragAndDropData.sort(
          (a, b) => a.index - b.index).map(val => val.pos);
      this.currentSelectedSegment.addingPositions = [];
    }
  };

  drop = (event: CdkDragDrop<any>): void => {
    const largerInd = event.previousIndex > event.currentIndex
        ? event.previousIndex : event.currentIndex;
    const smallerInd = event.previousIndex <= event.currentIndex
        ? event.previousIndex : event.currentIndex;
    this.dragAndDropData[event.previousIndex].index = event.currentIndex;
    this.dragAndDropData[event.previousIndex].pos.order = event.currentIndex;
    const isToLargerInd = largerInd === event.currentIndex;
    if (isToLargerInd) {
      for (let i = smallerInd + 1; i <= largerInd; i++) {
        this.dragAndDropData[i].index--;
        this.dragAndDropData[i].pos.order--;
      }
    } else {
      for (let i = smallerInd; i <= largerInd - 1; i++) {
        this.dragAndDropData[i].index++;
        this.dragAndDropData[i].pos.order++;
      }
    }
    transferArrayItem(this.dragAndDropData, this.dragAndDropData,
        event.previousIndex, event.currentIndex);
    this.canSave = true;
  };

  getCurrentTypeCode = (type: SegmentType): number => {
    let code = 0;
    if (type === 'BALLET') {
      code = 2;
    } else if (type === 'SUPER') {
      code = 3;
    } else if (type === 'SEGMENT') {
      code = 1;
    }
    return code;
  };

  toggleOpen = (index: number): void => {
    const superBallet = this.leftList.topLevelSegments[index];
    if (superBallet.type === 'SUPER') {
      superBallet.isOpen = !superBallet.isOpen;
      this.superBalletDisplay.setOpenState(
          superBallet.uuid, superBallet.isOpen);
    }
    this.buildLeftList();
  };

  // Private methods

  private starTest = (segment: Segment): boolean =>
    segment.type === 'SEGMENT' ? false : segment.positions.length === 0;


  private buildLeftList = (): void => {
    this.leftList.buildDisplayList(this.workingSegments, this.starTest);
  };

  private calcNameDisplay = ({createPosition, name}: {
    createPosition: boolean;
    name: string;
  }): string =>
    // TODO: Remove this once the customer confirms it is not needed.
    // You can prefix a ballet by adding text here
    (createPosition ? '' : '') + name;


  private calcSizeDisplay = ({createPosition, dancerCount}: {
    createPosition: boolean;
    dancerCount: number;
  }): string =>
    (createPosition ? `# Dancers = ${dancerCount}` : '');

}
