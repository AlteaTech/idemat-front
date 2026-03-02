import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MocksComponent} from './mocks.component';

describe('SeuilsComponent', () => {
  let component: MocksComponent;
  let fixture: ComponentFixture<MocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MocksComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
