import { createAction, props } from '@ngrx/store';
import { CompetencyAlternativeLearningContentsModel, DomainAlternativeLearningContentsModel, TopicAlternativeLearningContentsModel } from '@shared/models/milestone/milestone';
export const setDomainLearningContents = createAction('[DomainLearningContents] SetDomainLearningContents', props<{ key: string; data: Array<DomainAlternativeLearningContentsModel> }>());
export const setTopicLearningContents = createAction('[TopicLearningContents] SetTopicLearningContents', props<{ key: string; data: Array<TopicAlternativeLearningContentsModel> }>());
export const setCompetencyLearningContents = createAction('[CompetencyLearningContents] SetCompetencyLearningContents', props<{ key: string; data: Array<CompetencyAlternativeLearningContentsModel> }>());
export const setMilestoneDetails = createAction('[MilestoneDetails] SetMilestoneDetails', props<{ key: string; data: Array<any> }>());
