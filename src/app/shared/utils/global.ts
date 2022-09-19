import {
  ASSESSMENT,
  ASSESSMENT_EXTERNAL,
  COLLECTION,
  COLLECTION_EXTERNAL,
  DEFAULT_IMAGES,
  DEFAULT_IMAGES_XS,
  FILE_EXTENSION,
  RESOURCES_DEFAULT_IMAGES,
  SORTING_TYPES
} from '@shared/constants/helper-constants';
import * as moment from 'moment';

// function to remove duplicate object from array
export function removeDuplicateValues(inputArrayValues, id) {
  return inputArrayValues.filter(
    (currentElement, index, array) =>
      array.findIndex((element) => element[id] === currentElement[id]) ===
      index
  );
}

// This Method is used to get route from url
export function getRouteFromUrl(url) {
  const routes = url.split('/');
  const routePath = routes[routes.length - 1];
  const pathParams = routePath.split('?');
  if (pathParams.length) {
    return pathParams[0];
  }
  return routePath;
}

// This Method is used to scroll to the selected item in popup
export function scrollToItemInPopup() {
  setTimeout(() => {
    document.getElementsByClassName('alert-radio-group')[0]
      .querySelector('[aria-checked="true"]')
      .scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, 200);
}

// function to filter the list
export function filterList(list, filterText, filterField, alternativeField?) {
  const filteredList = list ? list.filter(item => item[`${filterField}`].search(new RegExp(filterText, 'i')) > -1) : [];
  if (alternativeField && !filteredList.length) {
    return list ? list.filter(item => item[`${alternativeField}`].search(new RegExp(filterText, 'i')) > -1) : [];
  }
  return filteredList;
}

// function to set https protocal for url
export function addHttpsProtocol(url: string, cdnUrl?: string) {
  if (url) {
    const pattern = url.match(/http/g);
    if (!pattern) {
      const cdn = new RegExp(cdnUrl, 'g');
      const cdnMatch = url.match(cdn);
      if (cdnMatch) {
        url = `https:${url}`;
      } else {
        url = cdnUrl + url;
      }
    }
  }
  return url;
}

// function to check the http url
export function checkHttpUrl(url: string, ) {
  const pattern = url.match(/http/g);
  return pattern;
}

// function to check the router url
export function checkRouterUrl(url: string, routerName: string) {
  const router = new RegExp(routerName, 'g');
  const routerMatch = url.match(router);
  return routerMatch;
}

// function to get default image based on format
export function getDefaultImage(format: string) {
  let defaultImg;
  if (format === ASSESSMENT || format === ASSESSMENT_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES.ASSESSMENT;
  } else if (format === COLLECTION || format === COLLECTION_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES.COLLECTION;
  } else {
    defaultImg = DEFAULT_IMAGES.OFFLINE_ACTIVITY;
  }
  return defaultImg;
}

// function to get default image based on format
export function getDefaultImageXS(format: string) {
  let defaultImg;
  if (format === ASSESSMENT || format === ASSESSMENT_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES_XS.ASSESSMENT;
  } else if (format === COLLECTION || format === COLLECTION_EXTERNAL) {
    defaultImg = DEFAULT_IMAGES_XS.COLLECTION;
  } else {
    defaultImg = DEFAULT_IMAGES.OFFLINE_ACTIVITY;
  }
  return defaultImg;
}

// function to concat framework with subject
export function concatFwSub(fw = '', sub = '') {
  return `${fw}.${sub}`;
}

// function to get default image based on resource format
export function getDefaultResourceImage(format: string) {
  return RESOURCES_DEFAULT_IMAGES[format];
}

// function to check url is pdf
export function checkUrlisPDF(url) {
  return url.match(/\.(pdf)/g);
}

// function to check url is image
export function checkUrlIsImage(url) {
  return (url.match(/\.(jpeg|jpg|gif|png|svg)$/) != null);
}

// function to convert date object to formated date string
export function formatDate(date) {
  const day = date.day.toString();
  const month = (date.month + 1).toString();
  const formatedDate = `${date.year}-${formatDigit(month)}-${formatDigit(
    day
  )}`;
  return formatedDate;
}

// function to convert month date object to formated date string
export function formatMonthDate(date) {
  const month = date.month.toString();
  const formatedDate = `${date.year}-${formatDigit(month)}-01`;
  return formatedDate;
}

// function to used to group by given key value
export function groupBy(arrayList, property) {
  return arrayList.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, []);
}

// function to used to format single digit value
export function formatDigit(value) {
  value = value.toString();
  return value.length > 1 ? value : `0${value}`;
}

// function to used to get all dates in a given month and year
export function getAllDatesInMonth(year, month) {
  const startDateOfMonth = moment([year, month - 1]);
  const result = [];
  let daysInMonth = startDateOfMonth.daysInMonth();
  while (daysInMonth) {
    const currentDate = moment([year, month - 1]).date(daysInMonth);
    result.push(currentDate);
    daysInMonth--;
  }
  return result;
}

// Generates UUID
export function generateUUID() {
  let d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    (c) => {
      // tslint:disable-next-line
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

// function to calculate max score
export function calculateAverageScore(score, maxScore) {
  return (score / maxScore) * 100;
}

// function to clone the array and object
export function cloneObject(obj) {
  return Array.isArray(obj)
    ? obj.map((item) => cloneObject(item))
    : obj && typeof obj === 'object'
      ? Object.getOwnPropertyNames(obj).reduce((o, prop) => {
        o[prop] = cloneObject(obj[prop]);
        return o;
      }, {})
      : obj;
}

// Method to round milliseconds
export function roundMilliseconds(mins = 0, sec = 0) {
  return (mins * 60 + sec) * 1000;
}

// function to calculate getLimit
export function getLimit(containerHeight, listHeight) {
  const calculatedLimit =
    Math.round(Number(containerHeight) / Number(listHeight)) + 2;
  return calculatedLimit < 25 ? calculatedLimit : 25; // maximum api return value 25
}

/**
 * @function getFileCategoryByExtension
 * @param {String} extension
 * Method to get file type by extension value
 */
export function getFileCategoryByExtension(extension: string = '') {
  let fileCategory = 'others';
  if (FILE_EXTENSION.IMAGE_EXTENSIONS.includes(extension)) {
    fileCategory = 'image';
  } else if (FILE_EXTENSION.DOCUMENT_EXTENSIONS.includes(extension)) {
    fileCategory = 'document';
  } else if (FILE_EXTENSION.PRESENTATION_EXTENSIONS.includes(extension)) {
    fileCategory = 'presentation';
  } else if (extension === 'pdf') {
    fileCategory = 'pdf';
  }
  return fileCategory;
}

/**
 * @function getTimeInMillisec
 * @param {Number} hour
 * @param {Number} minute
 * @return {Number}
 * Method to convert given hour and minute into milliseconds
 */
export function getTimeInMillisec(hour = 0, minute = 0) {
  return (hour * 60 * 60 + minute * 60) * 1000;
}

/**
 * @function secondIntoMillisec
 * @param {Number} second
 * @return {Number}
 * Method to convert second into milliseconds
 */
export function secondIntoMillisec(seconds) {
  return seconds * 1000;
}

/**
 * Format a certain number of milliseconds to a string of the form
 * '<hours>h <min>m or <min>m <sec>s'. If the value is falsey, a string
 * with the value '--' is returned
 * @param timeInMillis - time value in milliseconds
 * @returns {String}
 */
export function formatTime(timeInMillis) {
  let result = '';
  let secs;
  if (timeInMillis) {
    secs = timeInMillis / 1000;
    const hours = secs / 3600;
    secs = secs % 3600;
    const mins = secs / 60;
    secs = secs % 60;

    if (hours >= 1) {
      result = `${Math.floor(hours)}h `;
      if (mins >= 1) {
        result += `${Math.floor(mins)}m`;
      }
    } else {
      if (mins >= 1) {
        result = `${Math.floor(mins)}m `;
      }
      if (secs >= 1) {
        result += `${Math.floor(secs)}s`;
      }
    }
  } else {
    result = '';
  }
  return result;
}

/**
 * @function getLastSegmentFromUrl
 * Method used to get last segment from given url
 */
export function getLastSegmentFromUrl(url) {
  return url.match(/([^\/]*)\/*$/)[1];
}

/**
 * @function calculatePercentage
 * Method used to calculate the percentage
 */
export function calculatePercentage(value = 0, totalValue = 0) {
  return value && totalValue ? Math.round((value / totalValue) * 100) : 0;
}

/**
 * @function compareVersions
 * This Method is used to compare versions
 */
export function compareVersions(v1, comp, v2) {
  const comparator = comp === '=' ? '==' : comp;
  if (
    ['==', '===', '<', '<=', '>', '>=', '!=', '!=='].indexOf(comparator) ===
    -1
  ) {
    throw new Error('Invalid comparator. ' + comparator);
  }
  const v1parts = v1.split('.'),
    v2parts = v2.split('.');
  const maxLen = Math.max(v1parts.length, v2parts.length);
  let part1, part2;
  let cmp = 0;
  for (let i = 0; i < maxLen && !cmp; i++) {
    part1 = parseInt(v1parts[i], 10) || 0;
    part2 = parseInt(v2parts[i], 10) || 0;
    if (part1 < part2) {
      cmp = 1;
    }
    if (part1 > part2) {
      cmp = -1;
    }
  }
  return eval('0' + comparator + cmp);
}

/**
 * @function getQueryParamsByString
 * This Method is used to get queryParams from string
 */
export function getQueryParamsByString(params) {
  const queryParams = {};
  let urlString = '';
  const urlParams = new URLSearchParams(params);
  for (const [key, value] of urlParams as any) {
    const url = key.split('?');
    if (url[1]) {
      queryParams[`${url[1]}`] = value;
      urlString = url[0];
    } else {
      queryParams[`${key}`] = value;
    }
  }
  return {
    urlString,
    queryParams
  };
}

/**
 * @function getPredefinedRouteFromUrl
 * This Method is used to get predefined route from url
 */
export function getPredefinedRouteFromUrl(url) {
  return url.split('/')[3];
}

/**
 * @function formUrlQueryParameters
 * This Method is used to form url query params
 */
export function formUrlQueryParameters(data) {
  const urlParameters = Object.entries(data).map(e => e.join('=')).join('&');
  return urlParameters;
}

/**
 * @function getInBetweenValue
 * This Method is used to get in between values
 */
export function getInBetweenValue(character, charFrom, charTo) {
  return character.match(charFrom + '(.*)' + charTo)[1].trim();
}

/**
 * @function chunkArray
 * This Method is used to chunk array
 */
export function chunkArray(inputArray, perChunk) {
  const result = inputArray.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / perChunk);
    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []; // start a new chunk
    }
    resultArray[chunkIndex].push(item);
    return resultArray;
  }, []);
  return result;
}

/**
 * @function findDistance
 * This Method is used to distance between two points
 */
export function findDistance(x1, y1, x2, y2) {
  const distance = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
  return distance;
}

/**
 * @function sortByNumber
 * This Method is used to sort by number
 */
export function sortByNumber(array, sortingKey, sortingType) {
  return array.sort((a, b) =>
    SORTING_TYPES.ascending === sortingType
      ? Number(a[sortingKey]) - Number(b[sortingKey])
      : Number(b[sortingKey]) - Number(a[sortingKey])
  );
}

/**
 * @function getObjectCopy
 * @param {Object} originalObject
 * Method to perform object copy
 */
export function getObjectCopy(originalObject) {
  const clonedObject = {};
  const objectKeys = Object.keys(originalObject);
  objectKeys.map(key => {
    Object.assign(clonedObject, {
      [key]: originalObject[key]
    });
  });
  return clonedObject;
}

/**
 * @function currentWeekDates
 * Method used to get current week dates
 */
export function currentWeekDates() {
  const currentDate = moment();
  const weekStart = currentDate.clone().startOf('week');
  const days = [];
  for (let i = 0; i <= 6; i++) {
    days.push(moment(weekStart).add(i, 'days').format('YYYY-MM-DD'));
  }
  return days;
}

/**
 * @function previousWeekDates
 * Method used to get previous week dates
 */
export function previousWeekDates() {
  const currentDate = moment();
  const previousWeekStart = currentDate.subtract(1, 'weeks').startOf('week');
  const days = [];
  for (let i = 0; i <= 6; i++) {
    days.push(moment(previousWeekStart).add(i, 'days').format('YYYY-MM-DD'));
  }
  return days;
}

/**
 * @function validateUrl
 * Method used to validate url
 */
export function validateUrl(url) {
  const res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return res !== null;
}

/**
 * @function validateObject
 * Method used to validate the object
 */
export function validateObject(object) {
  return Object.keys(object || {}).length > 0 ? true : false;
}
