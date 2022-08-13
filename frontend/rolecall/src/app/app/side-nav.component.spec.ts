// import {ComponentFixture, TestBed} from '@angular/core/testing';
// import {MatIconModule} from '@angular/material/icon';
// import {BrowserModule} from '@angular/platform-browser';
// import {Router} from '@angular/router';
// import {RouterTestingModule} from '@angular/router/testing';

// import {AppRoutingModule} from './app-routing.module';
// import {SideNav} from './side-nav.component';
// import {NoopAnimationsModule} from '@angular/platform-browser/animations';

// describe('SideNav', () => {
//   let component: SideNav;
//   let fixture: ComponentFixture<SideNav>;
//   let router: Router;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//         declarations: [SideNav],
//         imports: [
//           RouterTestingModule,
//           BrowserModule,
//           AppRoutingModule,
//           MatIconModule,
//           NoopAnimationsModule,
//         ]
//       })
//       .compileComponents();

//     router = TestBed.inject(Router);
//     fixture = TestBed.createComponent(SideNav);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//     router.initialNavigation();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should change open state', () => {
//     expect(component.isNavOpen).toBeFalse();

//     component.openNav();

//     expect(component.isNavOpen).toBeTrue();

//     component.closeNav();

//     expect(component.isNavOpen).toBeFalse();
//   });

//   // it('should navigate to panel pages', fakeAsync(() => {
//   // TODO: Click on each item and check that it navigates to the right place.
//   // }));
// });
