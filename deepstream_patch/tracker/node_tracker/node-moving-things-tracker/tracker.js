var ItemTracked = require('./ItemTracked').ItemTracked;
var kdTree = require('./lib/kdTree-min.js').kdTree;
var isEqual = require('lodash.isequal')
var iouAreas = require('./utils').iouAreas

var DEBUG_MODE = false;

// DEFAULT_UNMATCHEDFRAMES_TOLERANCE 
// This the number of frame we wait when an object isn't matched before considering it gone
var DEFAULT_UNMATCHEDFRAMES_TOLERANCE = 0;
// IOU_LIMIT, exclude things from beeing matched if their IOU is lower than this
// 1 means total overlap whereas 0 means no overlap
var IOU_LIMIT = 0.05

// A dictionary of itemTracked currently tracked
// key: uuid
// value: ItemTracked object
var mapOfItemsTracked = new Map();

// A dictionnary keeping memory of all tracked object (even after they disappear)
// Useful to ouput the file of all items tracked
var mapOfAllItemsTracked = new Map();

// By default, we do not keep all the history in memory
var keepAllHistoryInMemory = false;

// Implementation detail, we store the distance in a KDTREE, we want to be able to exclude values from 
// the kdtree search by assigning them KDTREESEARCH_LIMIT + 1
var KDTREESEARCH_LIMIT = 10000;


// Distance function
const computeDistance = function(item1, item2) {
  // IOU distance, between 0 and 1
  // The smaller the less overlap
  var iou = iouAreas(item1, item2);

  // Invert this as the KDTREESEARCH is looking for the smaller value
  var distance = 1 - iou;

  // If the overlap is iou < 0.95, exclude value
  if(distance > (1 - IOU_LIMIT)) {
    distance = KDTREESEARCH_LIMIT + 1;
  }

  return distance;
}

exports.computeDistance = computeDistance;

exports.updateTrackedItemsWithNewFrame = function(detectionsOfThisFrame, frameNb) {

  mapOfItemsTracked = new Map();
  // Just add every detected item as item Tracked
  detectionsOfThisFrame.forEach(function(itemDetected) {
    var newItemTracked = new ItemTracked(itemDetected, frameNb, DEFAULT_UNMATCHEDFRAMES_TOLERANCE)
    // Add it to the map
    mapOfItemsTracked.set(newItemTracked.id, newItemTracked)
  });
}

exports.reset = function() {
  mapOfItemsTracked = new Map();
  mapOfAllItemsTracked = new Map();
}

exports.enableKeepInMemory = function() {
  keepAllHistoryInMemory = true;
}

exports.disableKeepInMemory = function() {
  keepAllHistoryInMemory = false;
}

exports.getJSONOfTrackedItems = function() {
  return Array.from(mapOfItemsTracked.values()).map(function(itemTracked) {
    return itemTracked.toJSON();
  });
};

exports.getJSONDebugOfTrackedItems = function() {
  return Array.from(mapOfItemsTracked.values()).map(function(itemTracked) {
    return itemTracked.toJSONDebug();
  });
};

// Work only if keepInMemory is enabled
exports.getAllTrackedItems = function() {
  return mapOfAllItemsTracked;
};

// Work only if keepInMemory is enabled
exports.getJSONOfAllTrackedItems = function() {
  return Array.from(mapOfAllItemsTracked.values()).map(function(itemTracked) {
    return itemTracked.toJSONGenericInfo();
  });
};
