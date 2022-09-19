import { Injectable } from '@angular/core';
import { SORTING_TYPES } from '@app/shared/constants/helper-constants';
import {
  ClassCompetencySummaryModel,
  CompetencyCompletionStatusModel,
  CompetencyMatrixModel,
  DomainModel,
  DomainTopicCompetencyMatrixModel,
  MatrixCoordinatesModel,
  MatrixCoordinatesTopicsModel,
  SubjectCompetencyMatrixCountModel,
  SubjectCompetencyMatrixModel,
  TopicMatrixModel,
  TopicsCompetencyModel
} from '@shared/models/competency/competency';
import { HttpService } from '@shared/providers/apis/http';
import { SessionService } from '@shared/providers/service/session/session.service';
import { calculatePercentage, sortByNumber } from '@shared/utils/global';
@Injectable({
  providedIn: 'root'
})

export class CompetencyProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'api/ds';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private sessionService: SessionService, private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function getDomainLevelSummary
   * Method to fetch domain level summary of a class
   */
  public getDomainLevelSummary(subject, year, month): Promise<Array<CompetencyMatrixModel>> {
    const user = this.sessionService.userSession.user_id;
    const defaultParams = {
      user,
      subject,
      month,
      year
    };
    const endpoint = `${this.namespace}/users/v2/tx/competency/matrix/domain`;
    return this.httpService.get<Array<CompetencyMatrixModel>>(endpoint, defaultParams).then((res) => {
      return this.normalizeCompetencyMatrix(res.data.userCompetencyMatrix);
    });
  }

  /**
   * @function fetchDomainTopicCompetencyMatrix
   * Method to fetch the domain topic competency matrix
   */
  public fetchDomainTopicCompetencyMatrix(subject, year, month): Promise<Array<DomainTopicCompetencyMatrixModel>> {
    const user = this.sessionService.userSession.user_id;
    const defaultParams = {
      user,
      subject,
      month,
      year
    };
    const endpoint = `${this.namespace}/users/v2/tx/competency/matrix/domain/topics`;
    return this.httpService.get<Array<DomainTopicCompetencyMatrixModel>>(endpoint, defaultParams).then((res) => {
      return this.normalizeDomainTopicMatrix(res.data);
    });
  }

  /**
   * @function fetchSubjectDomainTopicMetadata
   * Method to fetch the subject domain topic metadata
   */
  public fetchSubjectDomainTopicMetadata(params): Promise<Array<MatrixCoordinatesModel>> {
    const endpoint = `${this.namespace}/users/v2/tx/subject/domain/topics`;
    return this.httpService.get<Array<MatrixCoordinatesModel>>(endpoint, params).then((res) => {
      return this.normalizeSubjectDomainTopicMetadata(res.data);
    });
  }

  /**
   * @function normalizeSubjectDomainTopicMetadata
   * Method to normalize the subject domain metadata
   */
  public normalizeSubjectDomainTopicMetadata(payload) {
    let serializedMetadata: Array<MatrixCoordinatesModel> = [];
    if (payload && payload.domainTopics) {
      serializedMetadata = payload.domainTopics.map((domain) => {
        const normalizedDomain = {
          domainCode: domain.domainCode,
          domainName: domain.domainName,
          domainSeq: domain.domainSeq,
          topics: this.normalizeDomainTopicMetadata(domain),
        };
        return normalizedDomain;
      });
    }
    return serializedMetadata.sort((a, b) => a.domainSeq - b.domainSeq);
  }

  /**
   * @function normalizeDomainTopicMetadata
   * Method to normalize the domain topic metadata
   */
  private normalizeDomainTopicMetadata(domain): MatrixCoordinatesTopicsModel[] {
    let serializedTopicsMetadata!: MatrixCoordinatesTopicsModel[];
    if (domain.topics && domain.topics.length) {
      serializedTopicsMetadata = domain.topics.map((topic) => {
        const normalizedTopicMetadata: MatrixCoordinatesTopicsModel = {
          topicCode: topic.topicCode,
          topicDesc: topic.topicDesc,
          topicName: topic.topicName,
          topicSeq: topic.topicSeq,
          domainCode: domain.domainCode,
          domainSeq: domain.domainSeq,
        };
        return normalizedTopicMetadata;
      });
    }
    return serializedTopicsMetadata;
  }

  /**
   * @function normalizeDomainTopicMatrix
   * Method to normalize the domain topic matrix
   */
  public normalizeDomainTopicMatrix(payload) {
    const serializedMatrix: DomainTopicCompetencyMatrixModel[] = [];
    if (payload && payload.userCompetencyMatrix) {
      const userCompetencyMatrix = payload.userCompetencyMatrix;
      userCompetencyMatrix.map((competencyMatrix) => {
        let domainMatrix = {
          domainCode: competencyMatrix.domainCode,
          topics: this.normalizeDomainTopics(competencyMatrix.topics),
        };
        domainMatrix = Object.assign(domainMatrix, this.groupCompetenciesByTopic(domainMatrix.topics));
        serializedMatrix.push(domainMatrix);
      });
    }
    return serializedMatrix;
  }

  /**
   * @function groupCompetenciesByTopic
   * Method to group the competency by topic
   */
  private groupCompetenciesByTopic(topics) {
    let masteredCompetencies = 0;
    let inprogressCompetencies = 0;
    let notstartedCompetencies = 0;
    let inferredCompetencies = 0;
    let completedCompetencies = 0;
    topics.map((topic) => {
      masteredCompetencies += topic.masteredCompetencies;
      completedCompetencies += topic.completedCompetencies;
      inprogressCompetencies += topic.inprogressCompetencies;
      inferredCompetencies += topic.inferredCompetencies;
      notstartedCompetencies += topic.notstartedCompetencies;
    });
    return {
      masteredCompetencies,
      inprogressCompetencies,
      notstartedCompetencies,
      inferredCompetencies,
      completedCompetencies,
      totalCompetencies: (completedCompetencies + inprogressCompetencies + notstartedCompetencies + inferredCompetencies),
    };
  }

  /**
   * @function normalizeDomainTopics
   * Method to normalize the domain topics
   */
  private normalizeDomainTopics(topics) {
    if (topics && topics.length) {
      const normalizedTopics = topics.map((topic) => {
        let normalizedTopic: TopicMatrixModel = {
          topicCode: topic.topicCode,
          topicSeq: topic.topicSeq,
          competencies: this.normalizeDomainTopic(topic),
        };
        normalizedTopic = Object.assign(normalizedTopic, this.groupCompetenciesByStatus(topic.competencies));
        return normalizedTopic;
      });
      return normalizedTopics.sort((topic1, topic2) => topic1.topicSeq - topic2.topicSeq);
    }
    return [];
  }

  /**
   * @function groupCompetenciesByStatus
   * Method to group the competencies by status
   */
  private groupCompetenciesByStatus(competencies) {
    const competenciesCount = {
      masteredCompetencies: 0,
      inprogressCompetencies: 0,
      inferredCompetencies: 0,
      notstartedCompetencies: 0,
      completedCompetencies: 0
    };
    competencies.map((competency) => {
      if (competency.status === 0) {
        competenciesCount.notstartedCompetencies++;
      } else if (competency.status === 1) {
        competenciesCount.inprogressCompetencies++;
      } else if (competency.status === 2 || competency.status === 3) {
        competenciesCount.inferredCompetencies++;
      } else {
        competenciesCount.completedCompetencies++;
      }
      competenciesCount.masteredCompetencies = (competenciesCount.inferredCompetencies + competenciesCount.completedCompetencies);
    });
    return competenciesCount;
  }

  /**
   * @function normalizeDomainTopic
   * Method to normalize the domain topic
   */
  private normalizeDomainTopic(topic) {
    const competencies = sortByNumber(topic.competencies, 'competencySeq', SORTING_TYPES.ascending);
    if (competencies && competencies.length) {
      return competencies.map((competency) => {
        const normaliedCompetency: TopicsCompetencyModel = {
          competencyCode: competency.competencyCode,
          competencyName: competency.competencyName,
          competencySeq: competency.competencySeq,
          competencyDesc: competency.competencyDesc,
          competencyStudentDesc: competency.competencyStudentDesc,
          status: competency.status,
          source: competency.source,
          isSkylineCompetency: false
        };
        return normaliedCompetency;
      });
    }
    return topic;
  }

  /**
   * @function normalizeCompetencyMatrix
   * Normalize the domain competencies
   */
  private normalizeCompetencyMatrix(competencies) {
    return competencies.map((compentency) => {
      const compentencyModel: CompetencyMatrixModel = {
        domainCode: compentency.domainCode,
        competencies: compentency.competencies,
        domainName: compentency.domainName,
        domainSeq: compentency.domainSeq
      };
      return compentencyModel;
    });
  }

  /**
   * @function getCompetencyMatrixCoordinates
   * Method to fetch the competency matrix coordinates
   */
  public getCompetencyMatrixCoordinates(subject): Promise<Array<DomainModel>> {
    const endpoint = `${this.namespace}/users/v2/tx/competency/matrix/coordinates`;
    return this.httpService.get<Array<DomainModel>>(endpoint, subject).then((res) => {
      return this.normalizeCompetencyMatrixCoordinates(res.data.domains);
    });
  }

  /**
   * @function fetchSubjectCompetencyMatrix
   * Method to fetch the competency matrix subject subject
   */
  public fetchSubjectCompetencyMatrix(params): Promise<Array<SubjectCompetencyMatrixModel>> {
    const endpoint = `${this.namespace}/users/v2/tx/subjects/competency/matrix`;
    return this.httpService.get<Array<SubjectCompetencyMatrixModel>>(endpoint, params).then((res) => {
      return this.normalizeSubjectCompetencyMatrix(res.data);
    });
  }

  /**
   * @function normalizeSubjectCompetencyMatrix
   * Normalize the subject competency matrix
   */
  public normalizeSubjectCompetencyMatrix(subjectCompetencyMatrixList): Array<SubjectCompetencyMatrixModel> {
    const serializer = this;
    const userSubjectCompetencyMatrix = subjectCompetencyMatrixList.userSubjectCompetencyMatrix;
    return userSubjectCompetencyMatrix.map((subjectCompetencyMatrix, sequence) => {
      const serializedFacetCompetencyMatrix: SubjectCompetencyMatrixModel = {
        classificationCode: subjectCompetencyMatrix.classificationCode,
        classificationName: subjectCompetencyMatrix.classificationName,
        classificationSeq: subjectCompetencyMatrix.classificationSeq,
        competencyStats: serializer.normalizeSubjectCompetencyMatrixCount(subjectCompetencyMatrix.competencyStats),
        subjectCode: subjectCompetencyMatrix.subjectCode,
        subjectName: subjectCompetencyMatrix.subjectName,
        subjectSeq: subjectCompetencyMatrix.subjectSeq,
        sequence
      };
      return serializedFacetCompetencyMatrix;
    });
  }

  /**
   * @function normalizeSubjectCompetencyMatrixCount
   * Normalize the subject competency matrix count
   */
  private normalizeSubjectCompetencyMatrixCount(subjectCompetencyStats): Array<SubjectCompetencyMatrixCountModel> {
    return subjectCompetencyStats.map((subjectCompetencyStat) => {
      const subjectMatrixCount = {
        competencyCount: subjectCompetencyStat.competencyCount,
        competencyStatus: subjectCompetencyStat.competencyStatus,
      };
      return subjectMatrixCount;
    });
  }

  /**
   * @function normalizeCompetencyMatrixCoordinates
   * Normalize the competency coordinates
   */
  private normalizeCompetencyMatrixCoordinates(domains) {
    return domains.map((domain) => {
      const domainModel: DomainModel = {
        domainName: domain.domainName,
        domainSeq: domain.domainSeq,
        domainCode: domain.domainCode,
      };
      return domainModel;
    });
  }

  /**
   * @function fetchCompetencyCompletionStats
   * This method is used to fetc competency stats
   */
  public fetchCompetencyCompletionStats(classIds) {
    const endpoint = `${this.namespace}/users/v4/stats/competency`;
    const user = this.sessionService.userSession.user_id;
    const request = { classIds, user };
    return this.httpService.post<Array<ClassCompetencySummaryModel>>(endpoint, request).then((res) => {
      return this.normalizeClassCompetencySummary(res.data);
    });
  }

  /**
   * @function fetchCompletionStatus
   * This method is used to fetch lesson competency completion status
   */
  public fetchCompletionStatus(params) {
    const endpoint = `${this.namespace}/users/v2/user/competency/status`;
    const userId = this.sessionService.userSession.user_id;
    Object.assign(params, { userId });
    return this.httpService.post<Array<CompetencyCompletionStatusModel>>(endpoint, params).then((res) => {
      return this.normalizeCompetencyStatus(res.data.competencyStatus);
    });
  }

  /**
   * @function normalizeCompetencyStatus
   * This method is used to normalize competency status
   */
  private normalizeCompetencyStatus(payload): Array<CompetencyCompletionStatusModel> {
    return payload.map((item) => {
      const competencyStatus: CompetencyCompletionStatusModel = {
        competencyCode: item.competencyCode,
        competencyDesc: item.competencyDesc,
        competencyName: item.competencyName,
        competencySeq: item.competencySeq,
        competencyStudentDesc: item.competencyStudentDesc,
        domainCode: item.domainCode,
        domainSeq: item.domainSeq,
        source: item.source,
        status: item.status,
        topicCode: item.topicCode,
        topicSeq: item.topicSeq
      };
      return competencyStatus;
    });
  }

  /**
   * @function normalizeClassCompetencySummary
   * Normalize class Competency
   */
  private normalizeClassCompetencySummary(payload): Array<ClassCompetencySummaryModel> {
    return payload.competencyStats.map((item) => {
      const masteredCompetencies = item.masteredCompetencies || 0;
      const completedCompetencies = item.completedCompetencies || 0;
      const totalCompletion = masteredCompetencies + completedCompetencies;
      const classCompetencySummary: ClassCompetencySummaryModel = {
        classId: item.classId,
        completedCompetencies,
        masteredCompetencies,
        totalCompetencies: item.totalCompetencies,
        totalCompletion,
        completionPercentage: calculatePercentage(totalCompletion,
          item.totalCompetencies),
      };
      return classCompetencySummary;
    });
  }
}
