/*This file stores calculation functions used in the App program*/
/** @module AppCalc */
var AppCalc  = (function () {
	"use strict";
	//private code
	//no private items yet, but to make the code more maintainable, modules will need to contain more private items.
	var AppCalc = {
		//public code
		//get the x,y coords at the end of a vector (provide start x,y,angle, and distance in pixels and radians)
		getVectorEnd: function(objVector){
			return {
				x: objVector.x+Math.sin(objVector.angle)*objVector.dist,
				y: objVector.y+Math.cos(objVector.angle)*objVector.dist
			};
		},
		//get distance between two points
		getDistance: function(pointA, pointB){
			if(typeof pointA == 'undefined' || typeof pointB == 'undefined'){
				console.warn("Cannot find distance, undefined point.");
				return undefined;
			} else {
				return Math.sqrt(((pointA.x-pointB.x)*(pointA.x-pointB.x))+((pointA.y-pointB.y)*(pointA.y-pointB.y)));
			}
		},
		//get angle in radians between two points
		getAngle: function(pointA, pointB){
			  return Math.atan2(pointB.x - pointA.x, pointB.y - pointA.y);
		}
	}
	return AppCalc;
}());