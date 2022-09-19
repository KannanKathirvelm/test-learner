/**
 * Determines whether an ID looks like an ID for a learning target (micro-standard) or not
 * @param {String} id
 * @return {Boolean}
 */
export function isMicroStandardId(id) {
  return /.*\d{2}-\d{2}/.test(id) || /.*\.\d{2}\.\d{2}\./.test(id);
}
/**
 * parse and form a json object
 * @param {Array} competencyMatrixs
 * @return {Array}
 */
export function flattenGutToFwDomain(competencyMatrixs) {
  return competencyMatrixs.map(competencyMatrix => {
    return {
      [competencyMatrix.domainCode]: competencyMatrix
    };
  });
}

/**
 * Gets the taxonomy tags
 * @param {TaxonomyTagData[]} taxonomy
 * @param editable
 * @returns {Array}
 */
export function getTaxonomyTags(taxonomy) {
  return taxonomy.map((tagData) => {
    return {
      isActive: false,
      isReadonly: true,
      isRemovable: false,
      canAdd: false,
      data: tagData
    };
  });
}

/**
 * Parse and read domain id for given string
 * @param  {String} id
 * @return {String}
 */
export function getDomainId(id) {
  const ids = id.split('-');
  return `${ids[0]}-${ids[1]}-${ids[2]}`;
}

/**
 * Parse and read domain code for given string
 * @param  {String} id
 * @return {String}
 */
export function getDomainCode(id) {
  const ids = id.split('-');
  return ids[2];
}

/**
 * Parse and read subject id for given string
 * @param  {String} id
 * @return {String}
 */
export function getSubjectId(id) {
  return id.substring(0, id.indexOf('.'));
}

/**
 * Parse and read subject code for given string
 * @param  {String} id
 * @return {String}
 */
export function getSubjectCode(id) {
  return id.substring(id.indexOf('.') + 1, id.indexOf('-'));
}

/**
 * Parse and read subject id for given string
 * @param  {String} id
 * @return {String}
 */
export function getTaxonomySubjectId(id) {
  return id.substring(0, id.indexOf('-'));
}

/**
 * Parse and read course id for given string
 * @param  {String} id
 * @return {String}
 */
export function getCourseId(id) {
  const ids = id.split('-');
  return `${ids[0]}-${ids[1]}`;
}

/**
 * parse and form a json object
 * @param {Array} competencyMatrixs
 * @return {Array}
 */
export function flattenGutToFwCompetency(competencyMatrixs) {
  const fwCompetencies = [];
  competencyMatrixs.map(competencyMatrix => {
    const topics = competencyMatrix.topics;
    topics.forEach(topic => {
      const competencies = topic.competencies;
      competencies.forEach(competency => {
        fwCompetencies.push({
          [competency.competencyCode]: competency
        });
      });
    });
  });
  return fwCompetencies;
}

/**
 * Gets a category object from a subjectId
 * @param {String} subjectId - The subject id with the format 'CCSS.K12.Math', 'K12.Math'
 * @return {Object} - An object with the category information
 */
export function getCategoryCodeFromSubjectId(subjectId) {
  const categoryCode = subjectId.split('.');
  return categoryCode.length === 3 ? categoryCode[1] : categoryCode[0];
}

// This Method is used to get subject code from subject bucket
export function getSubjectCodeFromSubjectBucket(subjectBucket) {
  const subjectCodes = subjectBucket.split('.');
  return subjectCodes.length === 3 ? `${subjectCodes[1]}.${subjectCodes[2]}` : subjectBucket;
}
