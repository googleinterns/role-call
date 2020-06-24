import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsBase } from './settings_base.component';


describe('SettingsBase', () => {
  let component: SettingsBase;
  let fixture: ComponentFixture<SettingsBase>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsBase]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });
});
