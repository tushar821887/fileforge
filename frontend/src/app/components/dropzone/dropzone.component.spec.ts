import { TestBed } from '@angular/core/testing';
import { DropzoneComponent } from './dropzone.component.js';

describe('DropzoneComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropzoneComponent],
    }).compileComponents();
  });

  it('should initialize with empty selected files', () => {
    const fixture = TestBed.createComponent(DropzoneComponent);
    const component = fixture.componentInstance;
    expect(component.selectedFiles().length).toBe(0);
  });

  it('should format bytes to human readable string', () => {
    const fixture = TestBed.createComponent(DropzoneComponent);
    const component = fixture.componentInstance;
    expect(component.formatSize(1024)).toBe('1 KB');
    expect(component.formatSize(1048576)).toBe('1 MB');
  });

  it('should extract correct extension', () => {
    const fixture = TestBed.createComponent(DropzoneComponent);
    const component = fixture.componentInstance;
    expect(component.getExtension('picture.jpg')).toBe('jpg');
    expect(component.getExtension('document.pdf')).toBe('pdf');
  });
});
