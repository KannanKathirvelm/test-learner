import { Action, createReducer, createSelector, on } from '@ngrx/store';
import { setCompetencyLearningContents, setDomainLearningContents, setMilestoneDetails, setTopicLearningContents } from '../actions/gps-milestone.action';

const stateValue = (state) => state;

export const getDomainsLearningContentsByDomainId = (domainId) => createSelector(stateValue, (stateItem) => {
    return stateItem.domainLearningContents ? stateItem.domainLearningContents[domainId] : null;
});

export const getTopicsLearningContentsByClassId = (classId) => createSelector(stateValue, (stateItem) => {
    return stateItem.topicLearningContents ? stateItem.topicLearningContents[classId] : null;
});

export const getCompetenciesLearningContentsByClassId = (classId) => createSelector(stateValue, (stateItem) => {
    return stateItem.competencyLearningContents ? stateItem.competencyLearningContents[classId] : null;
});

export const getMilestoneDetailsByCourseId = (courseId) => createSelector(stateValue, (stateItem) => {
    return stateItem.milestoneDetails ? stateItem.milestoneDetails[courseId] : null;
});

function setStateData(state, key, data) {
    return {
        ...state,
        [key]: data
    };
}

const domainLearningContentsReducer = createReducer({},
    on(setDomainLearningContents, (state, { key, data }) => setStateData(state, key, data)));

const topicLearningContentsReducer = createReducer({},
    on(setTopicLearningContents, (state, { key, data }) => setStateData(state, key, data)));

const competencyLearningContentsReducer = createReducer({},
    on(setCompetencyLearningContents, (state, { key, data }) => setStateData(state, key, data)));

const milestoneDetailsReducer = createReducer({},
    on(setMilestoneDetails, (state, { key, data }) => setStateData(state, key, data)));

export function domainLearningContentsStateReducer(state, action: Action) {
    return domainLearningContentsReducer(state, action);
}

export function topicLearningContentsStateReducer(state, action: Action) {
    return topicLearningContentsReducer(state, action);
}

export function competencyLearningContentsStateReducer(state, action: Action) {
    return competencyLearningContentsReducer(state, action);
}

export function milestoneDetailsStateReducer(state, action: Action) {
    return milestoneDetailsReducer(state, action);
}
