//Do not change
/** @module AppGlobal */
var AppGlobal  = (function () {
	"use strict";
	//private
	var AppGlobal = {
		//public
		blnAllowLoop: true,
		blnMobile: (UATOOLS.IsMobile()||UATOOLS.IsTablet()),
		width:0,
		height:0,
		depth:0,
		MIN:0,
		MAX:0,
		averageWH:0,
		blnDeviceReady:false,
		blnDOMLoaded:false
	};
	return AppGlobal;
}());
/** @module AppLoop */
var AppLoop  = (function () {
	"use strict";
	var g = AppGlobal;
	var AppLoop = {
		numMainFrame: 0,
		numLoopFrame: 0,
		initialize: function(){
			console.log("loop initialized");
		},
		mainLoop: function() {
			if(g.blnAllowLoop == true){
				AppLoop.numMainFrame++;
				requestAnimFrame(AppLoop.mainLoop);
			}
		},
		loop: function(callback){
			callback();
			if(g.blnAllowLoop == true){
				AppLoop.numLoopFrame++;
				requestAnimFrame(function(){AppLoop.loop(callback)});
			}
		}
	};
	return AppLoop;
}());
/** @module AppElements */
var AppElements  = (function () {
	"use strict";
	//private code
	var AppElements = {
		//public code
		initialize: function(){
			this.canvasA = document.getElementById('canvasBack');
			console.log("elements initialized");
		}
	};
	return AppElements;
}());
//Loading/initializing program
/** @module AppLoad */
var AppLoad  = (function () {
	"use strict";
	//private code
	var g = AppGlobal;
	var toForceInit;
	var numForceInitDuration = 2500;//milliseconds
	function onDeviceReady(){
		console.log("device ready");
		g.blnDeviceReady = true;
		clearTimeout(toForceInit);
		if(g.blnDOMLoaded){
			AppLoad.loadMain();
		}
	}
	function onWindowLoaded(){
		g.blnDOMLoaded = true;
		console.log("window loaded");
		if(g.blnMobile){
			console.log("waiting for device ready");
			if(g.blnDeviceReady){
				AppLoad.loadMain();
			} else {
				toForceInit = setTimeout(function(){
					AppLoad.loadMain();
				}, numForceInitDuration);
			}
		} else {
			console.log("load main");
			AppLoad.loadMain();
		}
	}
	var AppLoad = {
		//public code
		initialize: function(){
			document.addEventListener("deviceready", onDeviceReady, false);
			window.addEventListener('load', onWindowLoaded, false);
			console.log("Loading...");
		},
		loadMain: function(){
			clearTimeout(toForceInit);
			console.log("Loaded");
			AppElements.initialize();
			AppRender.initialize();
			AppMain.initialize();//this fills Global with screen dimension info such as width,height,MIN...
			AppMouse.initialize();
			AppLoop.initialize();
			console.log("Intialization complete.");
		}
	};
	return AppLoad;
}());
/** @module AppMain */
var AppMain  = (function () {
	"use strict";
	var g = AppGlobal;
	var el = AppElements;
	//private code
	function onWindowResized(){
		g.width = window.innerWidth;
		g.height = window.innerHeight;
		g.averageWH = (g.width+g.height)/2;
		g.MIN = Math.min(g.width, g.height);
		g.MAX = Math.max(g.width, g.height);
		g.depth = g.MIN;
		el.canvasA.width = g.MAX;
		el.canvasA.height = g.MAX;
	};
	var AppMain = {
		//public code
		initialize: function(data){
			window.addEventListener('resize', onWindowResized, false);
			onWindowResized();//Uses updated dimensions on resize, updates into the AppGlobal module
			AppModel.verticies = AppModel.translateVerts(AppModel.verticies, -0.5, -0.5, -0.5);
			AppLoop.loop(function(){
				var i = 0;
				var len = 1;
				var mouse = AppMouse.getMouse();
				for(i=0;i<len;i++){
					AppModel.draw3D(AppModel.getVertXY(AppModel.camera, AppModel.verticies), AppModel.edges);
				}
				if(mouse.isDown){
					AppModel.verticies = AppModel.rotate3D(AppModel.verticies, -(mouse.move.x/g.width-0.5)/12, 'z');
					//AppModel.verticies = AppModel.translateVerts(AppModel.verticies, 0, 0, -(mouse.move.y/g.height-0.5)/18);
					AppModel.camera.z += -(mouse.move.y/g.height-0.5)/10;
					AppModel.camera.x += (mouse.move.x/g.width-0.5)/10;
				} else {
					AppModel.verticies = AppModel.rotate3D(AppModel.verticies, -(mouse.move.x/g.width-0.5)/12, 'y');
					AppModel.verticies = AppModel.rotate3D(AppModel.verticies, -(mouse.move.y/g.height-0.5)/12, 'x');
				}
			});
		}
	};
	return AppMain;
}());
//Mouse listeners/functions
/** @module AppMouse */
var AppMouse  = (function () {
	"use strict";
	var g = AppGlobal;
	var mouse = {
		isDown: false,
		isMoving: false,
		down: {x:null,y:null},
		up: {x:null,y:null},
		move: {x:null,y:null},
	};
	function onDown(e){
		if(g.blnMobile){
			mouse.down = {x:e.touches[0].pageX,y:e.touches[0].pageY};
		} else {
			mouse.down = {x:e.pageX,y:e.pageY};
		}
		mouse.isDown = true;
	};
	function onUp(e){
		if(g.blnMobile){
			mouse.up = {x:e.touches[0].pageX,y:e.touches[0].pageY};
		} else {
			mouse.up = {x:e.pageX,y:e.pageY};
		}
		mouse.isDown = false;
	};
	function onMove(e){
		if(g.blnMobile){
			mouse.move = {x:e.touches[0].pageX,y:e.touches[0].pageY};
		} else {
			mouse.move = {x:e.pageX,y:e.pageY};
		}
	};
	var AppMouse = {
		//public code
		initialize: function(){
			if(g.blnMobile){
				window.addEventListener('touchstart', function(e){onDown(e)}, false);
				window.addEventListener('touchmove',function(e){onMove(e)}, false);
				window.addEventListener('touchend', function(){onUp(e)},false);
			} else {
				window.addEventListener('mousedown', function(e){onDown(e)}, false);
				window.addEventListener('mousemove', function(e){onMove(e)}, false);
				window.addEventListener('mouseup', function(e){onUp(e)}, false);
			}
			console.log("mouse initialized");
		},
		getMouse: function(){
			return mouse;
		}
	};
	return AppMouse;
}());
/** @module AppRender */
var AppRender  = (function () {
	"use strict";
	var g = AppGlobal;
	var AppRender = {
		ctxA:null,
		initialize: function(){
			var el = AppElements;
			this.ctxA = el.canvasA.getContext('2d');
			console.log("render initialized");
		},
		circle: function(ctx, objCircle) {
			ctx.arc(objCircle.x, objCircle.y, objCircle.radius, 0,  Math.PI * 2);
		}
	};
	return AppRender;
}());
/** @module AppModel */
var AppModel  = (function () {
	"use strict";
	var g = AppGlobal;
	var el = AppElements;
	var r = AppRender;
	var AppModel = {
		//camera pitch, yaw, roll not implemented, camera.x,y,z most useful for translation
		camera: {horizon:{x:0.5,y:0.5,z:1},x:0.5,y:0.5,z:0.5,pitch:0,yaw:0,roll:0,w:1,h:1,d:1},
		verticies: [[0,0,0],[0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1]],
		edges: [[0,1],[1,3],[3,2],[2,0],
				[4,5],[5,7],[7,6],[6,4],
				[0,4],[1,5],
				[2,6],[3,7]
			   ],
		translateVerts: function(verts, x, y, z){
			var i = 0;
			var len = verts.length;
			var outVert = [];
			//for all verticies
			for(i=0;i<len;i++){
				outVert.push([verts[i][0]+x, verts[i][1]+y,verts[i][2]+z]);
			}
			return outVert;
		},
		rotate3D: function(verts, theta, axis){
			var sinTheta = Math.sin(theta);
			var cosTheta = Math.cos(theta);
			var i = 0;
			var outVert = [];
			var a, b;
			var axisA = 0;//default z axis
			var axisB = 1;
			//0 = x, 1 = y, 2 = z.
			switch(axis){
				case 'z':
					axisA = 0;
					axisB = 1;
					break;
				case 'x':
					axisA = 2;
					axisB = 1;
					break;
				case 'y':
					axisA = 2;
					axisB = 0;
					break;
				default:
					//No axis defined, defaults to Z axis.
					break;
			}
			for (i = 0; i < verts.length; i++) {
				outVert.push(verts[i]);
				a = outVert[i][axisA];
				b = outVert[i][axisB];
				outVert[i][axisA] = a * cosTheta - b * sinTheta;
				outVert[i][axisB] = b * cosTheta + a * sinTheta;
			}
			return outVert;
		},
		getVertXY: function(camData, vertData, options){
			var i = 0;
			var len = vertData.length;
			var ctx = r.ctxA;
			var xv, yv, zv;
			var x = g.width/2-g.MIN/2;
			var y = g.height/2-g.MIN/2;
			var width = g.MIN;
			var height = g.MIN;
			var depth = g.MIN;
			var xyAngle;
			var xyDraw;
			var cam = {x:x+camData.horizon.x*width, y:y+camData.horizon.y*height};
			var vert;
			var distCamVert;
			var numFrame = AppLoop.numLoopFrame;
			if(typeof options != 'undefined'){
				numFrame = options.frame;
			}
			var outVerts = [];
			//for each vert
			for(i=0;i<len;i++){
				xv = camData.x+vertData[i][0];
				yv = camData.y+vertData[i][1];
				zv = camData.z+vertData[i][2];
				vert = {x:x+xv*width, y:y+yv*height, z:zv};
				//get angle from vert to camera
				xyAngle = AppCalc.getAngle(vert, cam);
				distCamVert = AppCalc.getDistance(vert, cam);
				xyDraw = AppCalc.getVectorEnd({x:vert.x, y:vert.y, angle:xyAngle, dist:distCamVert*(1-(1/(vert.z*camData.horizon.z+1)))});
				xyDraw.z = -vert.z+1;
				outVerts.push(xyDraw);
			}
			return outVerts;
		},
		draw3D: function(posData, edgeData){
			var i = 0;
			var len = posData.length;
			var tEdges = edgeData;
			var ctx = r.ctxA;
			var x = g.width/2-g.MIN/2;
			var y = g.height/2-g.MIN/2;
			var width = g.MIN;
			var height = g.MIN;
			var edgePos;
			ctx.save();
			ctx.fillStyle = 'rgba(0,0,0,0.25)';//fade-effect
			ctx.fillRect(0,0,g.width,g.height);
			ctx.strokeStyle = 'rgba(255,255,255,0.5)';
			//for each vert
			ctx.beginPath();
			for(i=0;i<len;i++){
				ctx.moveTo(posData[i].x+Math.max((posData[i].z+2)*2,1), posData[i].y);
				//ctx.fillStyle = 'rgba(255,255,255,0.5)';
				//ctx.fillText(i, posData[i].x+5, posData[i].y+3);
				AppRender.circle(ctx, {x:posData[i].x, y:posData[i].y, radius:Math.max((posData[i].z+2)*2, 1)});
			}
			ctx.stroke();
			ctx.closePath();
			len = edgeData.length;
			//for each edge
			ctx.beginPath();
			for(i=0;i<len;i++){
				edgePos = posData[edgeData[i][0]];
				ctx.moveTo(edgePos.x, edgePos.y);
				edgePos = posData[edgeData[i][1]];
				ctx.lineTo(edgePos.x, edgePos.y);
			}
			console.log(this.camera.z);
			ctx.lineWidth = Math.min(Math.abs((4/(this.camera.z+0.5))+0.5), 6);
			ctx.shadowBlur = 30;
			ctx.shadowColor = 'rgb(255,255,255)';
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.globalCompositeOperation = 'xor';
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		}
	};
	return AppModel;
}());
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     || 
		  function( callback ){
			window.setTimeout(callback, 1000 / 30);//fallback to setTimeout(with callback) 30 times per second if requestA... not supported
		  };
})();
AppLoad.initialize();