import { createAction, props } from '@ngrx/store';
import { SubjectCompetencyMatrixModel } from '@shared/models/competency/competency';
export const setSubjectCompetencyMatrix = createAction('[SubjectCompetencyMatrix] SetSubjectCompetencyMatrix', props<{ data: Array<SubjectCompetencyMatrixModel> }>());
