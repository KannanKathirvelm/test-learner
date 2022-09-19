import { Injectable } from '@angular/core';
import { TAXONOMY_LEVELS } from '@shared/constants/helper-constants';
import { CrossWalkModel, CrossWalkTopicModel, FwCompetencyModel, PrerequisitesModel } from '@shared/models/competency/competency';
import { GradeBoundaryModel, GradeLevels, SubjectModel, TaxonomyGrades, TaxonomyModel, TaxonomySubjectModel } from '@shared/models/taxonomy/taxonomy';
import { HttpService } from '@shared/providers/apis/http';
import { isMicroStandardId } from '@shared/utils/taxonomyUtils';

@Injectable({
  providedIn: 'root'
})

export class TaxonomyProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespaceV1 = 'api/nucleus/v1/taxonomy';
  private namespaceV2 = 'api/nucleus/v2/taxonomy';
  private dataScopeNamespace = 'api/ds/users/v2/tx';

  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(private httpService: HttpService) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchCategories
   * Method to fetch categories
   */
  public fetchCategories(): Promise<Array<TaxonomyModel>> {
    const endpoint = `${this.namespaceV2}/classifications`;
    return this.httpService.get<Array<TaxonomyModel>>(endpoint).then((res) => {
      return this.normalizeCategories(res.data.subject_classifications);
    });
  }

  /**
   * @function fetchSubjects
   * Method to fetch categories
   */
  public fetchSubjects(category): Promise<Array<SubjectModel>> {
    const param = {
      classificationType: category
    };
    const endpoint = `${this.dataScopeNamespace}/subjects`;
    return this.httpService.get<Array<SubjectModel>>(endpoint, param).then((res) => {
      return this.normalizeSubjects(res.data.subjects);
    });
  }


  /**
   * @function normalizeSubjects
   * Normalize the Subjects
   */
  private normalizeSubjects(subjects) {
    const data = subjects.map((subject) => {
      const subjectModel: SubjectModel = {
        code: subject.code,
        description: subject.description,
        frameworkId: subject.frameworkId,
        id: subject.id,
        sequenceId: subject.sequenceId,
        title: subject.title
      };
      return subjectModel;
    });
    return data;
  }


  /**
   * @function fetchGradesBySubject
   * Method to fetch grades
   */
  public fetchGradesBySubject(filters): Promise<Array<TaxonomyGrades>> {
    const endpoint = `${this.dataScopeNamespace}/grades`;
    return this.httpService.get<Array<TaxonomyGrades>>(endpoint, filters).then((res) => {
      return this.normalizeGrades(res.data.grades, res.data.grade_levels);
    });
  }

  /**
   * @function normalizeGrades
   * This method is used to Normalize the grades
   */
   private normalizeGrades(gradeSubject, gradeLevels) {
    return gradeSubject.map((grade) => {
      const gradeModel: TaxonomyGrades = {
        code: grade.code,
        grade: grade.grade,
        description: grade.description,
        id: grade.id,
        sequenceId: grade.sequence,
        showGradeLevel: gradeLevels,
        levels: this.normalizeGradeLevels(grade.levels)
      };
      return gradeModel;
    });
  }

  /**
   * @function normalizeGradeLevels
   * This method is used to Normalize the grades based levels
   */
  private normalizeGradeLevels(gradeLevels) {
    if (!gradeLevels) {
      return [];
    }
    return gradeLevels.map((level) => {
      const gradeLevelModel: GradeLevels = {
        id: level.id,
        description: level.description,
        grade: level.label,
        levelSequence: level.level_sequence
      };
      return gradeLevelModel;
    });
  }

  /**
   * @function fetchDomainGradeBoundaryBySubjectId
   * Method to fetch grade boundaries
   */
  public fetchDomainGradeBoundaryBySubjectId(gradeId): Promise<Array<GradeBoundaryModel>> {
    const endpoint = `${this.dataScopeNamespace}/grade/boundary/${gradeId}`;
    return this.httpService.get<Array<any>>(endpoint, {}).then((res) => {
      return this.normalizeDomains(res.data.domains);
    });
  }

  /**
   * @function normalizeDomains
   * Normalize the domains
   */
  private normalizeDomains(domains) {
    return domains.map((domain) => {
      const domainModel: GradeBoundaryModel = {
        domainCode: domain.domainCode,
        averageComp: domain.averageComp,
        topicAverageComp: domain.topicAverageComp,
        highline: domain.highline || domain.highlineComp,
        highlineTopic: domain.highlineTopic,
        highlineComp: domain.highlineComp,
        topicHighlineComp: domain.topicHighlineComp,
        topicCode: domain.topicCode
      };
      return domainModel;
    });
  }

  /**
   * Normalize the core element taxonomy data into a TaxonomyTagData object
   * @returns {TaxonomyTagData[]}
   */
  public normalizeTaxonomyArray(taxonomyArray, level?) {
    const taxonomyData = [];
    if (taxonomyArray && taxonomyArray.length) {
      taxonomyArray.forEach((taxonomyObject) => {
        const isMicroStandard = isMicroStandardId(
          taxonomyObject.internalCode
        );
        taxonomyData.push({
          id: taxonomyObject.internalCode,
          code: taxonomyObject.code,
          title: taxonomyObject.title,
          parentTitle: taxonomyObject.parentTitle,
          frameworkCode: taxonomyObject.frameworkCode,
          taxonomyLevel: level
            ? level
            : isMicroStandard
              ? TAXONOMY_LEVELS.MICRO
              : TAXONOMY_LEVELS.STANDARD
        });
      });
    }
    return taxonomyData;
  }

  /**
   * @function fetchCodes
   * Method to fetch codes
   */
  public fetchCodes(frameworkId, subjectId, courseId, domainId): Promise<Array<PrerequisitesModel>> {
    const endpoint = `${this.namespaceV1}/frameworks/${frameworkId}/subjects/${subjectId}/courses/${courseId}/domains/${domainId}/codes`;
    return this.httpService.get<Array<PrerequisitesModel>>(endpoint, {}).then((res) => {
      return this.normalizeCodes(res.data.codes);
    });
  }

  /**
   * Normalize the micro competency codes
   */
  private normalizeCodes(payload) {
    return payload.map((code) => {
      const parsedCode: PrerequisitesModel = {
        code: code.code,
        codeType: code.code_type,
        id: code.id,
        isActive: code.isActive,
        isSelectable: code.is_selectable,
        parentTaxonomyCodeId: code.parent_taxonomy_code_id,
        sequenceId: code.sequence_id,
        title: code.title
      };
      return parsedCode;
    });
  }

  /**
   * Normalize the learning maps taxonomy array
   * @returns {TaxonomyTagData[]}
   */
  public normalizeLearningMapsTaxonomyArray(taxonomyObject, level?) {
    const taxonomyData = [];
    if (taxonomyObject) {
      Object.keys(taxonomyObject).forEach((internalCode) => {
        const isMicroStandard = isMicroStandardId(
          taxonomyObject.internalCode
        );
        const taxonomyInfo = taxonomyObject[internalCode];
        taxonomyData.push({
          id: internalCode,
          code: taxonomyInfo.code,
          title: taxonomyInfo.title,
          parentTitle: taxonomyInfo.parentTitle || taxonomyInfo.parent_title,
          description: taxonomyInfo.description ? taxonomyInfo.description : '',
          frameworkCode: taxonomyInfo.frameworkCode ? taxonomyInfo.frameworkCode : taxonomyInfo.framework_code,
          taxonomyLevel: level
            ? level
            : isMicroStandard
              ? TAXONOMY_LEVELS.MICRO
              : TAXONOMY_LEVELS.STANDARD
        });
      });
    }
    return taxonomyData;
  }

  /**
   * @function normalizeGrades
   * Normalize the grades
   */
  private normalizeCategories(categories) {
    return categories.map((category) => {
      const categoryModel: TaxonomyModel = {
        code: category.code,
        isDefault: category.is_default,
        frameworkId: category.frameworkId,
        id: category.id,
        title: category.title
      };
      return categoryModel;
    });
  }

  /**
   * @function fetchCrossWalkFWC
   * This Method is used to fetch crosswalk fwcode
   */
  public fetchCrossWalkFWC(frameworkCode, subjectCode): Promise<Array<CrossWalkModel>> {
    const endpoint = `${this.namespaceV2}/crosswalk/frameworks/${frameworkCode}/subjects/${subjectCode}`;
    return this.httpService.get<Array<CrossWalkModel>>(endpoint).then((res) => {
      return this.normalizeCrossWalkFWC(res.data.competencyMatrix);
    });
  }

  /**
   * @function normalizeCrossWalkFWC
   * Normalize the crosswalk fwc
   */
  private normalizeCrossWalkFWC(crossWalkFWC) {
    return crossWalkFWC.map((crossWalk) => {
      const crossWalkModel: CrossWalkModel = {
        topics: this.normalizeTopics(crossWalk.topics),
        domainCode: crossWalk.domainCode,
        domainName: crossWalk.domainName,
        domainSeq: crossWalk.domainSeq,
        fwDomainName: crossWalk.fwDomainName,
      };
      return crossWalkModel;
    });
  }

  /**
   * @function normalizeTopics
   * Method used to normalize the topics
   */
  private normalizeTopics(topics) {
    return topics.map((topic) => {
      const topicModel: CrossWalkTopicModel = {
        competencies: this.normalizeCompetencies(topic.competencies),
        fwTopicName: topic.fwTopicName,
        topicCode: topic.topicCode,
        topicName: topic.topicName,
        topicSeq: topic.topicSeq
      };
      return topicModel;
    });
  }

  /**
   * @function normalizeCompetencies
   * Normalize the competencies
   */
  private normalizeCompetencies(competencies) {
    return competencies.map((competency) => {
      const competencyModel: FwCompetencyModel = {
        competencyCode: competency.competencyCode,
        competencyDesc: competency.competencyDesc,
        competencyName: competency.competencyName,
        competencySeq: competency.competencySeq,
        competencyStudentDesc: competency.competencyStudentDesc,
        frameworkCompetencyCode: competency.frameworkCompetencyCode,
        frameworkCompetencyDisplayCode: competency.frameworkCompetencyDisplayCode,
        frameworkCompetencyName: competency.frameworkCompetencyName,
        loCode: competency.loCode,
        loName: competency.loName
      };
      return competencyModel;
    });
  }

  /**
   * @function fetchClassificationList
   * This method is used to fetch the classification list
   */
  public fetchClassificationList(): Promise<any> {
    const endpoint = `${this.namespaceV2}/v2/taxonomy/classifications`;
    return this.httpService.get<TaxonomyModel>(endpoint).then((res: any) => {
      const response = res.data;
      const subjectClassifications = response.subject_classifications;
      subjectClassifications.map((item, index) => {
        const subject: TaxonomyModel = {
          id: item.id,
          title: item.title,
          code: item.code
        };
        return subject;
      });
      return subjectClassifications;
    });
  }

  /**
   * @function fetchSubjectById
   * @returns {TaxonomySubjectModel}
   * This method is used to fetch subject by id
   */
  public fetchSubjectById(code: string): Promise<TaxonomySubjectModel> {
    const endpoint = `${this.namespaceV1}/subjects/${code}`;
    return this.httpService.get<TaxonomySubjectModel>(endpoint).then((res) => {
      const response = res.data;
      return this.normalizeTaxonomySubject(response);
    });
  }

  /**
   * @function normalizeTaxonomySubject
   * This method is used to fetch taxonomy subject
   */
  public normalizeTaxonomySubject(item) {
    const subject: TaxonomySubjectModel = {
      code: item.code,
      description: item.description,
      frameworks: item.frameworks,
      id: item.id,
      standardFrameworkId: item.standard_framework_id,
      title: item.title
    };
    return subject;
  }

  /**
   * Normalize the core element taxonomy data into a TaxonomyTagData object
   */
  public normalizeTaxonomy(taxonomyObject) {
    const taxonomyData = [];
    if (taxonomyObject) {
      for (const key in taxonomyObject) {
        if (taxonomyObject.hasOwnProperty(key)) {
          const taxonomy = taxonomyObject[key];
          const isMicroStandard = isMicroStandardId(key);
          taxonomyData.push({
            id: key,
            code: taxonomy.code,
            title: taxonomy.title,
            parentTitle: taxonomy.parent_title ? taxonomy.parent_title : '',
            description: taxonomy.description ? taxonomy.description : '',
            frameworkCode: taxonomy.framework_code || taxonomy.frameworkCode,
            taxonomyLevel: isMicroStandard
              ? TAXONOMY_LEVELS.MICRO
              : TAXONOMY_LEVELS.STANDARD
          });
        }
      }
    }
    return taxonomyData;
  }

  /**
   * Serialize a TaxonomyTagData object
   */
  public serializeTaxonomyForEvents(taxonomyData) {
    let taxonomyResult = null;
    if (taxonomyData && taxonomyData.length > 0) {
      taxonomyResult = {};
      taxonomyData.forEach((taxonomy) => {
        const taxonomyKey = taxonomy.id;
        taxonomyResult[taxonomyKey] = taxonomy.code;
      });
    }
    return taxonomyResult;
  }
}
