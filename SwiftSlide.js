/*
* SwiftSlide Beta-v0.5 - Internal Use - Copyright © 2015 YHSPY.COM
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
* THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

!(function(name, context, definition){

	context[name] = definition();

}('SwiftSlide', this, function () {

	// Strict mode will cause the following exception:
	// [Exception: TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them]
	// 'use strict';
	
	var SwiftSlide = function (settings, optionsBundle) {

		// Self pointer
		var self = this,
		    eventQueue = [];

		// Internal static functions
		SwiftSlide.isNumeric = function(obj) {
			var realStringObj = obj && obj.toString();
			return !Array.isArray(obj) && (realStringObj - parseFloat(realStringObj) + 1) >= 0;
		};
		
		SwiftSlide.isFunction = function(obj) {
			return (typeof(obj) === "function" ? true : false);
		};

		SwiftSlide.isArray = function(obj) {
			return Array.isArray(obj);
		};

		SwiftSlide.isSet = function(obj) {
			return !(typeof(obj) === "undefined"); 
		};

		SwiftSlide.pocessTween = function(obj) {
			switch(obj){
				case "Cubic.easeOut":
					return SwiftSlide.TweenAlgorithm.Cubic.easeOut;
				break;
				case "Cubic.easeIn":
					return SwiftSlide.TweenAlgorithm.Cubic.easeIn;
				break;
				case "Quart.easeOut":
					return SwiftSlide.TweenAlgorithm.Quart.easeOut;
				break;
				case "Quart.easeIn":
					return SwiftSlide.TweenAlgorithm.Quart.easeIn;
				break;
				default:
					return SwiftSlide.TweenAlgorithm.Cubic.easeOut;
				break;
			}
		};

		SwiftSlide.changeTitle = function(title) {
			var titleElement = document.querySelector("title");
			if(titleElement == null)
			{
				console.error("[SwiftSlide Line 51] Can not find title element!");
				return false;
			}

			titleElement.innerText = title;
		};

		// Prototype methods

		SwiftSlide.prototype.shiftOrder = function(order) {
			if(typeof(this.optionsBundleData) == "undefined") {
				return false;
			}
			var optionsBundleData = this.optionsBundleData;
			for(var i = 0; i < this.queueLength; i ++){
				if(optionsBundleData[i].order == order) {
					return optionsBundleData[i];
				}
			}	
		};

		SwiftSlide.prototype.addEventToQueue = function(event) {
			this.eventQueue.push(event);
		};

		SwiftSlide.prototype.dispatchEvent = function() {
			var currentEvent = this.eventQueue.shift();

			// ... TODO
		};

		// Set default configure options ({},[{},{}])
		var historyStackCallback = false,
		    slideFrameTime = 12,
		    slideDivWidth = window.innerWidth,
		    slideDeviation = 0;

		// Check settings
		if(!SwiftSlide.isArray(optionsBundle)) {
			console.error("[SwiftSlide Line 32] Please make sure you have passed correct optionsBundle!");
			return false;
		}	

		// Constructor variables init
		this.optionsBundleData = optionsBundle;
		this.queueLength = optionsBundle.length;
		// Default set to 1
		this.currentOrder = 1;

		if(SwiftSlide.isFunction(settings.historyStackCallback))
			this.historyStackCallback = settings.historyStackCallback;

		if(SwiftSlide.isNumeric(settings.slideFrameTime))
			this.slideFrameTime = settings.slideFrameTime;

		if(SwiftSlide.isNumeric(settings.initOrder))
			this.currentOrder = settings.initOrder;

		if(SwiftSlide.isNumeric(settings.slideDivWidth))
			this.slideDivWidth = settings.slideDivWidth;

		if(SwiftSlide.isNumeric(settings.slideDeviation))
			this.slideDeviation = settings.slideDeviation;

		if(SwiftSlide.isSet(settings.slideTween))
			this.slideTween = settings.slideTween;
		else
			this.slideTween = "Cubic.easeOut";

		if(this.currentOrder > this.queueLength) {
			console.warn("[SwiftSlide Line 76] Please make sure you have set enough layer to slide!");
			this.currentOrder = this.currentOrder % this.queueLength;
			if(this.currentOrder == 0) this.currentOrder = this.queueLength;
		}

		// Get current order pos
		this.currentObject = this.shiftOrder(this.currentOrder);
		
		
		SwiftSlide.pushState = function(order, url) {
			window.history.pushState(order, "", url);
		};

		if(this.historyStackCallback) {
			window.addEventListener("popstate", function() {
			    var currentState = history.state;
			    self.slideCore(currentState);
			    self.historyStackCallback.call(this, currentState);								
			});
		}

		SwiftSlide.getAnimationFrameMethod = function() {
			var lastTime = 0;
			var prefixes = 'webkit moz ms o'.split(' '); 

			var requestAnimationFrame = window.requestAnimationFrame;
			var cancelAnimationFrame = window.cancelAnimationFrame;

			var prefix;
			for(var i = 0; i < prefixes.length; i++) {
			    if ( requestAnimationFrame && cancelAnimationFrame ) {
			      break;
			    }
			    prefix = prefixes[i];
			    requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
			    cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] || window[ prefix + 'CancelRequestAnimationFrame' ];
			}

			if (!requestAnimationFrame || !cancelAnimationFrame) {
			    requestAnimationFrame = function(callback, element) {
			        var currTime = new Date().getTime();
			        var timeToCall = Math.max(0, 16 - (currTime - lastTime)); 
			        var id = window.setTimeout(function() {
			          callback(currTime + timeToCall);
			        }, timeToCall);
			        lastTime = currTime + timeToCall;
			        return id;
			    };
			    
			    cancelAnimationFrame = function(id) {
			        window.clearTimeout(id);
			    };
			}

			// 只能基于window对象
			window.requestAnimationFrame = requestAnimationFrame; 
			window.cancelAnimationFrame = cancelAnimationFrame;
		};

		SwiftSlide.TweenAlgorithm = {
		    Linear: function(t, b, c, d) { return c*t/d + b; },
		    Quad: {
		        easeIn: function(t, b, c, d) {
		            return c * (t /= d) * t + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return -c *(t /= d)*(t-2) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
		            return -c / 2 * ((--t) * (t-2) - 1) + b;
		        }
		    },
		    Cubic: {
		        easeIn: function(t, b, c, d) {
		            return c * (t /= d) * t * t + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return c * ((t = t/d - 1) * t * t + 1) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            if ((t /= d / 2) < 1) return c / 2 * t * t*t + b;
		            return c / 2*((t -= 2) * t * t + 2) + b;
		        }
		    },
		    Quart: {
		        easeIn: function(t, b, c, d) {
		            return c * (t /= d) * t * t*t + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return -c * ((t = t/d - 1) * t * t*t - 1) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
		            return -c / 2 * ((t -= 2) * t * t*t - 2) + b;
		        }
		    },
		    Quint: {
		        easeIn: function(t, b, c, d) {
		            return c * (t /= d) * t * t * t * t + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return c * ((t = t/d - 1) * t * t * t * t + 1) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
		            return c / 2*((t -= 2) * t * t * t * t + 2) + b;
		        }
		    },
		    Sine: {
		        easeIn: function(t, b, c, d) {
		            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return c * Math.sin(t/d * (Math.PI/2)) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            return -c / 2 * (Math.cos(Math.PI * t/d) - 1) + b;
		        }
		    },
		    Expo: {
		        easeIn: function(t, b, c, d) {
		            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return (t==d) ? b + c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            if (t==0) return b;
		            if (t==d) return b+c;
		            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
		            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
		        }
		    },
		    Circ: {
		        easeIn: function(t, b, c, d) {
		            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
		        },
		        easeOut: function(t, b, c, d) {
		            return c * Math.sqrt(1 - (t = t/d - 1) * t) + b;
		        },
		        easeInOut: function(t, b, c, d) {
		            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
		            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
		        }
		    },
		    Elastic: {
		        easeIn: function(t, b, c, d, a, p) {
		            var s;
		            if (t==0) return b;
		            if ((t /= d) == 1) return b + c;
		            if (typeof p == "undefined") p = d * .3;
		            if (!a || a < Math.abs(c)) {
		                s = p / 4;
		                a = c;
		            } else {
		                s = p / (2 * Math.PI) * Math.asin(c / a);
		            }
		            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		        },
		        easeOut: function(t, b, c, d, a, p) {
		            var s;
		            if (t==0) return b;
		            if ((t /= d) == 1) return b + c;
		            if (typeof p == "undefined") p = d * .3;
		            if (!a || a < Math.abs(c)) {
		                a = c; 
		                s = p / 4;
		            } else {
		                s = p/(2*Math.PI) * Math.asin(c/a);
		            }
		            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
		        },
		        easeInOut: function(t, b, c, d, a, p) {
		            var s;
		            if (t==0) return b;
		            if ((t /= d / 2) == 2) return b+c;
		            if (typeof p == "undefined") p = d * (.3 * 1.5);
		            if (!a || a < Math.abs(c)) {
		                a = c; 
		                s = p / 4;
		            } else {
		                s = p / (2  *Math.PI) * Math.asin(c / a);
		            }
		            if (t < 1) return -.5 * (a * Math.pow(2, 10* (t -=1 )) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
		        }
		    },
		    Back: {
		        easeIn: function(t, b, c, d, s) {
		            if (typeof s == "undefined") s = 1.70158;
		            return c * (t /= d) * t * ((s + 1) * t - s) + b;
		        },
		        easeOut: function(t, b, c, d, s) {
		            if (typeof s == "undefined") s = 1.70158;
		            return c * ((t = t/d - 1) * t * ((s + 1) * t + s) + 1) + b;
		        },
		        easeInOut: function(t, b, c, d, s) {
		            if (typeof s == "undefined") s = 1.70158; 
		            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		            return c / 2*((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
		        }
		    },
		    Bounce: {
		        easeIn: function(t, b, c, d) {
		            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
		        },
		        easeOut: function(t, b, c, d) {
		            if ((t /= d) < (1 / 2.75)) {
		                return c * (7.5625 * t * t) + b;
		            } else if (t < (2 / 2.75)) {
		                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		            } else if (t < (2.5 / 2.75)) {
		                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		            } else {
		                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		            }
		        },
		        easeInOut: function(t, b, c, d) {
		            if (t < d / 2) {
		                return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
		            } else {
		                return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
		            }
		        }
		    }
		}
		
		// Core method
		SwiftSlide.prototype.slideCore = function(elementOrder) {

			// Prevent order overflow
			elementOrder = elementOrder % this.queueLength;
			if(elementOrder == 0) elementOrder = this.queueLength;

			// Params
			var slideWidth = this.slideDivWidth;
			var slideLeft = this.slideDeviation;

			// Get init shift object and shift order 
			var shiftObject = this.shiftOrder(elementOrder);
			var shiftOrder = elementOrder;

			// Get shift element
			var currentElement = document.querySelector(self.currentObject.element);
			var shiftElement = document.querySelector(shiftObject.element);

			// Change title
			if(SwiftSlide.isSet(shiftObject.title))
				SwiftSlide.changeTitle(shiftObject.title);

			// Change history stack
			if(SwiftSlide.isSet(shiftObject.urlDisplay))
				SwiftSlide.pushState(shiftOrder, shiftObject.urlDisplay);

			// Get requestAnimationFrame() and cancelAnimationFrame() bind to window object
			SwiftSlide.getAnimationFrameMethod();

			// Main method (no compress and merge)
			if(shiftOrder > this.currentOrder) {

				// Move left action
				var _leftStart = 0,
				    _leftDuring = slideFrameTime, 
				    _rightStart = 0, 
				    _rightDuring = slideFrameTime;

				var _leftSlide = function(){
					_leftStart ++;
					var marginLeft = SwiftSlide.pocessTween(this.slideTween)(_leftStart, 0, slideLeft - slideWidth, _leftDuring);
					var opacity = SwiftSlide.pocessTween(this.slideTween)(_leftStart, 1, -1, _leftDuring);

					currentElement.style.marginLeft = marginLeft + "px";
					currentElement.style.opacity = opacity;

				    if(_leftStart < _leftDuring) 
				    	window.requestAnimationFrame(arguments.callee);
				    else{
				    	currentElement.style.display = "none";
				    	shiftElement.style.marginLeft = slideWidth + "px";
				    	shiftElement.style.display = "block";
				    	// Call _rightSlide();
						_rightSlide.apply(this, arguments);
				    }
				};
				
				var _rightSlide = function(){
					_rightStart ++;
					var marginLeft = SwiftSlide.pocessTween(this.slideTween)(_rightStart, slideWidth, -slideWidth, _rightDuring);
					var opacity = SwiftSlide.pocessTween(this.slideTween)(_rightStart, 0, 1, _rightDuring);

					shiftElement.style.marginLeft = marginLeft + "px";
					shiftElement.style.opacity = opacity;

				    if(_rightStart < _rightDuring) 
				    	window.requestAnimationFrame(arguments.callee);
				};
				// Call _leftSlide();
				_leftSlide.apply(this, arguments);
				
			}else if(shiftOrder < this.currentOrder) {

				// Move right action
				var _leftStart = 0,
				    _leftDuring = slideFrameTime, 
				    _rightStart = 0, 
				    _rightDuring = slideFrameTime;

				var _leftSlide = function(){
					_leftStart ++;
					var marginLeft = SwiftSlide.pocessTween(this.slideTween)(_leftStart, 0, (slideLeft / 2) + slideWidth, _leftDuring);
					var opacity = SwiftSlide.pocessTween(this.slideTween)(_leftStart, 1, -1, _leftDuring);

					currentElement.style.marginLeft = marginLeft + "px";
					currentElement.style.opacity = opacity;

				    if(_leftStart < _leftDuring) 
				    	window.requestAnimationFrame(arguments.callee);
				    else{
				    	currentElement.style.display = "none";
				    	shiftElement.style.marginLeft = -slideWidth + "px";
				    	shiftElement.style.display = "block";
						// Call _rightSlide();
						_rightSlide.apply(this, arguments);
				    }
				};

				var _rightSlide = function(){
					_rightStart ++;
					var marginLeft = SwiftSlide.pocessTween(this.slideTween)(_rightStart, -slideWidth, slideWidth, _rightDuring);
					var opacity = SwiftSlide.pocessTween(this.slideTween)(_rightStart, 0, 1, _rightDuring);

					shiftElement.style.marginLeft = marginLeft + "px";
					shiftElement.style.opacity = opacity;

				    if(_rightStart < _rightDuring) 
				    	window.requestAnimationFrame(arguments.callee);
				};

				// Call _leftSlide();
				_leftSlide.apply(this, arguments);
				
			}else{
				return;
			}

			this.currentOrder = shiftOrder;
			this.currentObject = shiftObject;
			
		};
	}

	SwiftSlide.prototype = {

		slideTo: function(elementOrder){		
			// Call core method
			this.slideCore(elementOrder);
		}
	}

	return SwiftSlide;

}));

