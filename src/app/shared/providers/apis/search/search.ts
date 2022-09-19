import { Injectable } from '@angular/core';
import {
  ASSESSMENT,
  COLLECTION,
  DEFAULT_IMAGES,
  TAXONOMY_LEVELS
} from '@shared/constants/helper-constants';
import {
  ContentModel
} from '@shared/models/collection/collection';
import { LearningMapsContent, OwnerModel, SearchCompetencyLearingMapModel } from '@shared/models/signature-content/signature-content';
import { HttpService } from '@shared/providers/apis/http';
import { TaxonomyProvider } from '@shared/providers/apis/taxonomy/taxonomy';
import { SessionService } from '@shared/providers/service/session/session.service';
import { getDefaultResourceImage } from '@shared/utils/global';

@Injectable({
  providedIn: 'root'
})

export class SearchProvider {

  // -------------------------------------------------------------------------
  // Properties

  private namespace = 'gooru-search/rest/v1/pedagogy-search';
  private suggestNamespace = 'gooru-search/rest/v3/suggest/resource';
  // -------------------------------------------------------------------------
  // Dependency Injection

  constructor(
    private taxonomyProvider: TaxonomyProvider,
    private session: SessionService,
    private httpService: HttpService,
  ) { }

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchLearningMapsContent
   * This method is used to fetch the map content
   */
  public fetchLearningMapsContent(gutCode, filters): Promise<SearchCompetencyLearingMapModel> {
    const endpoint = `${this.namespace}/learning-maps/standard/${gutCode}`;
    return this.httpService.get<SearchCompetencyLearingMapModel>(endpoint).then((res) => {
      const normalizedCompetencyContent = this.normalizeLearningMapsContent(res.data);
      return normalizedCompetencyContent;
    });
  }

  /**
   * @function fetchRelatedContents
   * This method is used to fetch the related content resources
   */
  public fetchRelatedContents(collectionId) {
    const endpoint = `${this.suggestNamespace}?limit=3`;
    const userId = this.session.userSession.user_id;
    const context = {
      context_type: 'collection-study',
      context_area: 'study-player',
      collection_id: collectionId,
      user_id: userId,
    };
    return this.httpService.post<Array<ContentModel>>(endpoint, { context }).then((res) => {
      return this.normalizeRelatedResources(res.data);
    });
  }

  private normalizeRelatedResources(searchResult) {
    const cdnUrl = this.session.userSession.cdn_urls.content_cdn_url;
    if (searchResult && searchResult.suggestResults) {
      const resources = searchResult.suggestResults.map((suggest, index) => {
        const content: ContentModel = {
          answer: [],
          contentFormat: suggest.contentFormat,
          contentSubformat: suggest.contentSubFormat,
          description: suggest.description,
          id: suggest.gooruOid,
          sequenceId: index,
          taxonomy: suggest.taxonomy,
          title: suggest.title,
          thumbnail: suggest.thumbnail ? cdnUrl + suggest.thumbnail :
            getDefaultResourceImage(suggest.contentSubFormat),
          url: suggest.url,
          creator: suggest.creator,
        };
        return content;
      });
      return resources;
    }
    return [];
  }

  /**
   * Normalizes a question
   */
  public normalizeLearningMapsContent(learningMapsContent) {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const signatureData = learningMapsContent.signatureContents;
    if (signatureData && signatureData.assessments) {
      signatureData.assessments.forEach((item) => {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : DEFAULT_IMAGES.COLLECTION;
        item.isCollection = false;
        item.isAssessment = true;
        item.isExternalAssessment = false;
        item.isExternalCollection = false;
      });
    }
    if (signatureData && signatureData.collections) {
      signatureData.collections.forEach((item) => {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : DEFAULT_IMAGES.COLLECTION;
        item.isCollection = true;
        item.isAssessment = false;
        item.isExternalAssessment = false;
        item.isExternalCollection = false;
      });
    }

    const returnObjects: SearchCompetencyLearingMapModel = {
      title: learningMapsContent.title,
      code: learningMapsContent.code,
      gutCode: learningMapsContent.gutCode,
      contents: learningMapsContent.contents,
      prerequisites: learningMapsContent.prerequisites,
      subject: learningMapsContent.subject,
      course: learningMapsContent.course,
      domain: learningMapsContent.domain,
      signatureContents: signatureData,
      learningMapsContent: this.normalizeSearchLearningMapsContentInfo(
        learningMapsContent.contents
      )
    };
    return returnObjects;
  }

  /**
   * Normalizes owner
   * @param ownerData
   * @returns {Profile}
   */
  public normalizeOwner(ownerData) {
    const basePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = ownerData.profileImage
      ? basePath + ownerData.profileImage
      : null;
    const owner: OwnerModel = {
      id: ownerData.gooruUId || ownerData.id,
      firstName: ownerData.firstName || ownerData.firstname,
      lastName: ownerData.lastName || ownerData.lastname,
      username: ownerData.usernameDisplay,
      avatarUrl: thumbnailUrl
    };
    return owner;
  }


  /**
   * Normalize an assessment
   */
  public normalizeAssessment(assessmentData) {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const userBasePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = assessmentData.thumbnail
      ? basePath + assessmentData.thumbnail
      : DEFAULT_IMAGES.ASSESSMENT;
    const ownerThumbnailUrl = assessmentData.userProfileImage
      ? userBasePath + assessmentData.userProfileImage
      : DEFAULT_IMAGES.ASSESSMENT;
    const creatorThumbnailUrl = assessmentData.creatorProfileImage
      ? userBasePath + assessmentData.creatorProfileImage
      : DEFAULT_IMAGES.ASSESSMENT;
    const taxonomyInfo =
      (assessmentData.taxonomySet &&
        assessmentData.taxonomySet.curriculum &&
        assessmentData.taxonomySet.curriculum.curriculumInfo) ||
      [];

    const course = assessmentData.course || {};
    return {
      id: assessmentData.id,
      title: assessmentData.title,
      format: assessmentData.format || assessmentData.type || null,
      thumbnailUrl,
      standards: this.taxonomyProvider
        .normalizeTaxonomyArray(taxonomyInfo),
      publishStatus: assessmentData.publishStatus,
      description: assessmentData.learningObjective,
      learningObjectives: assessmentData.languageObjective,
      resourceCount: assessmentData.resourceCount
        ? Number(assessmentData.resourceCount)
        : 0,
      questionCount: assessmentData.questionCount
        ? Number(assessmentData.questionCount)
        : 0,
      remixCount: assessmentData.scollectionRemixCount || 0,
      course: course.title,
      courseId: course.id,
      relevance: assessmentData.relevance,
      efficacy: assessmentData.efficacy,
      engagement: assessmentData.engagement,
      isVisibleOnProfile: assessmentData.profileUserVisibility,
      owner: {
        id: assessmentData.gooruUId,
        firstName: assessmentData.userFirstName,
        lastName: assessmentData.userLastName,
        avatarUrl: ownerThumbnailUrl,
        username: assessmentData.usernameDisplay
      },
      creator: {
        id: assessmentData.creatorId,
        firstName: assessmentData.creatorFirstname,
        lastName: assessmentData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: assessmentData.creatornameDisplay
      }
    };
  }

  /**
   * Normalizes a course
   */
  public normalizeCourse(result) {
    const serializer = this;
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : null;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      thumbnailUrl,
      subject: result.subjectBucket,
      creator: result.creator,
      efficacy: result.efficacy,
      engagement: result.engagement,
      relevance: result.relevance,
      standards: result.standards,
      subjectName:
        result.taxonomy && result.taxonomy.subject
          ? result.taxonomy.subject[0]
          : null,
      subjectSequence: result.subjectSequence,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      unitCount: result.unitCount,
      taxonomy: this.taxonomyProvider
        .normalizeTaxonomyArray(taxonomyInfo, TAXONOMY_LEVELS.COURSE),
      owner: result.owner ? serializer.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      version: result.version || null
    };
  }

  /**
   * Normalize a collection
   */
  public normalizeCollection(collectionData) {
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const userBasePath = this.session.userSession.cdn_urls.user_cdn_url;
    const thumbnailUrl = collectionData.thumbnail
      ? basePath + collectionData.thumbnail
      : null;
    const userThumbnailUrl = collectionData.userProfileImage
      ? userBasePath + collectionData.userProfileImage
      : null;
    const creatorThumbnailUrl = collectionData.creatorProfileImage
      ? userBasePath + collectionData.creatorProfileImage
      : null;
    const taxonomyInfo =
      (collectionData.taxonomySet &&
        collectionData.taxonomySet.curriculum &&
        collectionData.taxonomySet.curriculum.curriculumInfo) ||
      [];

    const course = collectionData.course || {};
    return {
      id: collectionData.id,
      title: collectionData.title,
      thumbnailUrl,
      standards: this.taxonomyProvider
        .normalizeTaxonomyArray(taxonomyInfo),
      publishStatus: collectionData.publishStatus,
      learningObjectives: collectionData.languageObjective,
      description: collectionData.languageObjective,
      resourceCount: collectionData.resourceCount || 0,
      questionCount: collectionData.questionCount || 0,
      remixCount: collectionData.scollectionRemixCount || 0,
      course: course.title,
      courseId: course.id,
      relevance: collectionData.relevance,
      efficacy: collectionData.efficacy,
      engagement: collectionData.engagement,
      isVisibleOnProfile: collectionData.profileUserVisibility,
      owner: {
        id: collectionData.gooruUId,
        firstName: collectionData.userFirstName,
        lastName: collectionData.userLastName,
        avatarUrl: userThumbnailUrl,
        username: collectionData.usernameDisplay
      },
      creator: {
        id: collectionData.creatorId,
        firstName: collectionData.creatorFirstname,
        lastName: collectionData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: collectionData.creatornameDisplay
      },
      format: collectionData.format || collectionData.type || null
    };
  }

  /**
   * Normalizes a resource
   * @param {*} result
   * @returns {Resource}
   */
  public normalizeResource(result) {
    const serializer = this;
    const format = result.contentSubFormat;
    const taxonomyInfo =
      (result.taxonomySet &&
        result.taxonomySet.curriculum &&
        result.taxonomySet.curriculum.curriculumInfo) ||
      [];

    return {
      id: result.gooruOid,
      title: result.title,
      description: result.description,
      format,
      url: result.url,
      creator: result.creator
        ? serializer.normalizeOwner(result.creator)
        : null,
      owner: result.user ? serializer.normalizeOwner(result.user) : null,
      standards: this.taxonomyProvider
        .normalizeTaxonomyArray(taxonomyInfo),
      publishStatus: result.publishStatus,
      publisher: result.publisher ? result.publisher[0] : null,
      efficacy: result.efficacy,
      engagement: result.engagement,
      relevance: result.relevance
    };
  }


  /**
   * Normalizes a question
   * @param {*} result
   * @returns {Question}
   */
  public normalizeQuestion(result) {
    const serializer = this;
    const format =
      result.contentFormat || (result.resourceFormat.value || null);
    const type = result.typeName || result.contentSubFormat;
    const taxonomyInfo =
      (result.taxonomySet &&
        result.taxonomySet.curriculum &&
        result.taxonomySet.curriculum.curriculumInfo) ||
      [];

    return {
      id: result.gooruOid,
      title: result.title,
      description: result.description,
      creator: result.creator,
      efficacy: result.efficacy,
      engagement: result.engagement,
      relevance: result.relevance,
      format,
      publisher: null,
      thumbnailUrl: result.thumbnail,
      type,
      owner: result.user ? serializer.normalizeOwner(result.user) : null,
      standards: this.taxonomyProvider
        .normalizeTaxonomyArray(taxonomyInfo)
    };
  }

  /**
   * Normalizes a unit
   * @param {*} result
   * @returns {unit}
   */
  public normalizeUnit(result) {
    const serializer = this;
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES.COLLECTION;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      creator: result.creator,
      taxonomy: result.taxonomy,
      createdDate: result.addDate,
      thumbnailUrl,
      lastModified: result.lastModified,
      lastModifiedBy: result.lastModifiedBy,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      assessmentCount: result.assessmentCount,
      collectionCount: result.collectionCount,
      lessonCount: result.lessonCount,
      standards: taxonomyInfo
        ? this.taxonomyProvider
          .normalizeTaxonomyArray(taxonomyInfo, TAXONOMY_LEVELS.COURSE)
        : {},
      owner: result.owner ? serializer.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      relevance: result.relevance,
      efficacy: result.efficacy,
      engagement: result.engagement,
      type: result.format
    };
  }

  /**
   * Normalizes a lesson
   * @param {*} result
   * @returns {Course}
   */
  public normalizeLesson(result) {
    const serializer = this;
    const basePath = this.session.userSession.cdn_urls.content_cdn_url;
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : DEFAULT_IMAGES.COLLECTION;
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      createdDate: result.addDate,
      thumbnailUrl,
      lastModified: result.lastModified,
      lastModifiedBy: result.lastModifiedBy,
      creator: result.creator,
      taxonomy: result.taxonomy,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      assessmentCount: result.assessmentCount,
      collectionCount: result.collectionCount,
      standards: null,
      owner: result.owner ? serializer.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      relevance: result.relevance,
      efficacy: result.efficacy,
      engagement: result.engagement,
      type: result.format
    };
  }

  /**
   * @function normalizeSearchLearningMapsContentInfo
   * Serialize each content type from the learning map API
   */
  public normalizeSearchLearningMapsContentInfo(contents) {
    const serializedContentData: LearningMapsContent = {
      assessment: null,
      course: null,
      resource: null,
      question: null,
      unit: null,
      lesson: null,
      rubric: null,
      collection: null
    };

    const assessmentData = [];
    const collectionData = [];
    const courseData = [];
    const resourceData = [];
    const questionData = [];
    const unitData = [];
    const lessonData = [];
    const rubricData = [];

    if (contents.assessment) {
      contents.assessment.searchResults.map(assessment => {
        const assessmentInfo = this.normalizeAssessment(assessment);
        assessmentInfo.id = assessment.id;
        assessmentInfo.description = assessment.learningObjective;
        assessmentInfo.creator = assessment.creator ? this.normalizeOwner(assessment.creator) : null;
        assessmentInfo.owner = assessment.user ? this.normalizeOwner(assessment.user) : null;
        assessmentInfo.efficacy = assessment.efficacy;
        assessmentInfo.engagement = assessment.engagement;
        assessmentInfo.relevance = assessment.relevance;
        assessmentInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            assessment.taxonomy,
            ASSESSMENT
          );
        assessmentData.push(assessmentInfo);
      });
    }

    if (contents.collection) {
      contents.collection.searchResults.map(collection => {
        const collectionInfo = this.normalizeCollection(collection);
        collectionInfo.id = collection.id;
        collectionInfo.description = collection.learningObjective;
        collectionInfo.creator = collection.creator ? this.normalizeOwner(collection.creator) : null;
        collectionInfo.owner = collection.user ? this.normalizeOwner(collection.user) : null;
        collectionInfo.efficacy = collection.efficacy;
        collectionInfo.engagement = collection.engagement;
        collectionInfo.relevance = collection.relevance;
        collectionInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            collection.taxonomy,
            COLLECTION
          );
        collectionData.push(collectionInfo);
      });
    }

    if (contents.course) {
      contents.course.searchResults.map(course => {
        const courseInfo = this.normalizeCourse(course);
        courseInfo.id = course.id;
        courseInfo.description = course.description;
        courseInfo.creator = course.creator
          ? this.normalizeOwner(course.creator)
          : null;
        courseInfo.owner = course.owner
          ? this.normalizeOwner(course.owner)
          : null;
        courseInfo.efficacy = course.efficacy;
        courseInfo.engagement = course.engagement;
        courseInfo.relevance = course.relevance;
        courseInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            course.taxonomy,
            TAXONOMY_LEVELS.COURSE
          );
        courseData.push(courseInfo);
      });
    }

    if (contents.resource) {
      contents.resource.searchResults.map(resource => {
        const resourceInfo = this.normalizeResource(resource);
        resourceInfo.id = resource.id;
        resourceInfo.description = resource.description;
        resourceInfo.creator = resource.creator
          ? this.normalizeOwner(resource.creator)
          : null;
        resourceInfo.owner = resource.user
          ? this.normalizeOwner(resource.user)
          : null;
        resourceInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            resource.taxonomy,
            TAXONOMY_LEVELS.RESOURCE
          );
        resourceData.push(resourceInfo);
      });
    }

    if (contents.question) {
      contents.question.searchResults.map(question => {
        const questionInfo = this.normalizeQuestion(question);
        questionInfo.id = question.id;
        questionInfo.description = question.description;
        questionInfo.creator = this.normalizeOwner(question.creator);
        questionInfo.owner = this.normalizeOwner(question.user);
        questionInfo.efficacy = question.efficacy;
        questionInfo.engagement = question.engagement;
        questionInfo.relevance = question.relevance;
        questionInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            question.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        questionData.push(questionInfo);
      });
    }

    if (contents.unit) {
      contents.unit.searchResults.map(unit => {
        const unitInfo = this.normalizeUnit(unit);
        unitInfo.id = unit.id;
        unitInfo.description = unit.learningObjective;
        unitInfo.creator = unit.creator
          ? this.normalizeOwner(unit.creator)
          : null;
        unitInfo.owner = unit.owner
          ? this.normalizeOwner(unit.owner)
          : null;
        unitInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            unitInfo.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        unitData.push(unitInfo);
      });
    }

    if (contents.lesson) {
      contents.lesson.searchResults.map(lesson => {
        const lessonInfo = this.normalizeLesson(lesson);
        lessonInfo.id = lesson.id;
        lessonInfo.description = lesson.learningObjective;
        lessonInfo.creator = lesson.creator
          ? this.normalizeOwner(lesson.creator)
          : null;
        lessonInfo.owner = lesson.owner
          ? this.normalizeOwner(lesson.owner)
          : null;
        lessonInfo.standards = this.taxonomyProvider
          .normalizeLearningMapsTaxonomyArray(
            lessonInfo.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        lessonData.push(lessonInfo);
      });
    }
    serializedContentData.assessment = assessmentData;
    serializedContentData.collection = collectionData;
    serializedContentData.course = courseData;
    serializedContentData.resource = resourceData;
    serializedContentData.question = questionData;
    serializedContentData.unit = unitData;
    serializedContentData.lesson = lessonData;
    serializedContentData.rubric = rubricData;
    return serializedContentData;
  }
}
