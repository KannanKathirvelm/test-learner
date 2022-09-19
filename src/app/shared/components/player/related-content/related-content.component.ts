import {
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { RESOURCE_TYPES } from '@shared/components/player/resources/resources.import';
import { ContentModel } from '@shared/models/collection/collection';
import { CollectionPlayerService } from '@shared/providers/service/player/collection-player.service';
import { collapseAnimation } from 'angular-animations';

@Component({
  selector: 'related-content',
  templateUrl: './related-content.component.html',
  styleUrls: ['./related-content.component.scss'],
  animations: [collapseAnimation({ duration: 500, delay: 0 })]
})
export class RelatedContentComponent implements OnInit, OnChanges {

  // -------------------------------------------------------------------------
  // Properties
  @ViewChild('related_content_view', { read: ViewContainerRef, static: true })
  private contentViewRef: ViewContainerRef;
  @Input() public relatedContents: Array<ContentModel>;
  @Output() public openRelatedContent = new EventEmitter();
  @Output() public trackRelatedContentPlayEvent: EventEmitter<ContentModel> = new EventEmitter();
  private componentRefList: Array<ComponentRef<any>>;
  public isActive: boolean;

  constructor(private collectionPlayerService: CollectionPlayerService,
              private elementRef: ElementRef,
              private componentFactoryResolver: ComponentFactoryResolver) {
    this.componentRefList = [];
    this.isActive = true;
  }


  // -------------------------------------------------------------------------
  // Events

  public ngOnInit() {
    this.renderCollectionContent();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.relatedContents && !changes.relatedContents.firstChange) {
      this.renderCollectionContent();
    }
  }

  /**
   * @function renderCollectionContent
   * This method is used to render the collection contents
   */
  public renderCollectionContent() {
    const contents = this.relatedContents;
    contents.forEach((content, index) => {
      const componentType = RESOURCE_TYPES[content.contentSubformat];
      const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
      const componentRef = this.contentViewRef.createComponent(factory);
      this.onResourceContent(componentRef, content, index);
      this.componentRefList.push(componentRef);
    });
  }

  /**
   * @function onResourceContent
   * This method is used to initiate the resource content Properties
   */
  public onResourceContent(componentRef, content, index) {
    const instance = componentRef.instance as {
      content: ContentModel,
      componentSequence: number,
      readonlyMode: boolean,
      isRelatedContent: boolean,
      onStart: EventEmitter<string>,
    };
    instance.readonlyMode = true;
    instance.isRelatedContent = true;
    instance.componentSequence = (index + 1);
    instance.content = content;
    instance.onStart.subscribe((event) => {
      this.onTrackRelatedContentPlayEvent(instance.content);
      this.onStartResourcePlay(instance.content);
      this.setActiveResource(instance);
    });
  }

  /**
   * @function onTrackRelatedContentPlayEvent
   * This method is used to track the resource content play event
   */
  public onTrackRelatedContentPlayEvent(resource) {
    this.trackRelatedContentPlayEvent.emit(resource);
  }

  /**
   * @function setActiveResource
   * This method is used to set the active resource state
   */
  private setActiveResource(instance) {
    const inlineVideoComponents = this.componentRefList.filter((component) => {
      return component.instance.isInlineVideo;
    });
    inlineVideoComponents.map((component) => {
      return component.instance.isActive = component.instance.content.id === instance.content.id;
    });
  }

  /**
   * @function onOpenRelatedContent
   * This method is triggers when user clicks on to open related content
   */
  public onOpenRelatedContent() {
    const offsetTop = this.elementRef.nativeElement.offsetTop;
    if (this.isActive) {
      this.openRelatedContent.emit(offsetTop);
    }
    this.isActive = !this.isActive;
  }


  /**
   * @function onStartResourcePlay
   * This method is used to start resource play event
   */
  public onStartResourcePlay(content) {
    this.collectionPlayerService.playRelatedResourceContent(content);
  }
}
