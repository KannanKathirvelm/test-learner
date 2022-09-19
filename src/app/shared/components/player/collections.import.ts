import { AssessmentExternalComponent } from '@shared/components/player/assessment-external/assessment-external.component';
import { CollectionExternalComponent } from '@shared/components/player/collection-external/collection-external.component';


export const COLLECTIONS = [
  CollectionExternalComponent,
  AssessmentExternalComponent
];


export const COLLECTION_TYPES = {
  'assessment-external': AssessmentExternalComponent,
  'collection-external': CollectionExternalComponent
};
