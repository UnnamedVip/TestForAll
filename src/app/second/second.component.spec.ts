import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondComponent } from './second.component';

describe('SecondComponent', () => {
  let component: SecondComponent;
  let fixture: ComponentFixture<SecondComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

 /*  it('should create', () => {
    expect(component).toBeTruthy();
  }); */

  it('#getSum should return real value from the real service', () => {
     expect(component.getSum(5,3)).toBe(5);
     //expect(component.getSum(4,3)).toBeTruthy();
  });
});
