import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CastDragAndDrop } from './cast-drag-and-drop.component';


describe('CastDragAndDropComponent', () => {
  let component: CastDragAndDrop;
  let fixture: ComponentFixture<CastDragAndDrop>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CastDragAndDrop]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CastDragAndDrop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
