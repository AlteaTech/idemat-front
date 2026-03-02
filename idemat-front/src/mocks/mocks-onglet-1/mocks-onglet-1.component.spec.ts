import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MocksOnglet1Component} from './mocks-onglet-1.component';

describe('MocksOnglet1Component', () => {
  let component: MocksOnglet1Component;
  let fixture: ComponentFixture<MocksOnglet1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MocksOnglet1Component]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MocksOnglet1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
