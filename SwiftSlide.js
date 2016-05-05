/**
 * @fileOverview SwiftSlide
 * @author       yhorg@hotmail.com
 * @version      0.1.0
 * @license
 * SwiftSlide Copyright (c) 2016 YHSPY (https://www.yhspy.com/)
 *
 * https://github.com/Becavalier/SwiftSlide
 *
 * License:: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

!(function(name, context, definition){

	context[name] = definition();

}('SwiftSlide', this, function () {

	// Strict mode will cause following exception:
	// [Exception: TypeError: 'caller', 'callee', and 'arguments' properties may not be accessed on strict mode functions or the arguments objects for calls to them]
	
	// 'use strict';
	
	var SwiftSlide = function () {

		// Self pointer
		var self = this;
		
		// Init global attributes
		this.transactionBundle = arguments,
		this.transactionQueue = [];

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

		SwiftSlide.hasPrototype = function(obj, name) {
			return obj.hasOwnProperty(name) || (name in obj);
		};

		SwiftSlide.processTween = function(obj) {
			var tweenMethod = eval("SwiftSlide.TweenAlgorithm." + obj);

			if(typeof(tweenMethod) == "undefined"){

				console.warn("[SwiftSlide] The tween animation method you passed is wrong, using default instead!");
				return SwiftSlide.TweenAlgorithm.Cubic.easeOut;

			}else{
				return tweenMethod;
			}
		};

		SwiftSlide.setTitle = function(title) {
			var titleElement = document.querySelector("title");
			if(titleElement == null)
			{
				console.error("[SwiftSlide] Can not find <title> element!");
				return false;
			}

			titleElement.innerText = title;
		};

		SwiftSlide.pushState = function(statBundle, url) {
			try{
				window.history.pushState(statBundle, "", url);
			}catch(e){
				console.warn("[SwiftSlide] " + e);
			}
		};

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

			// Only based on window
			window.requestAnimationFrame = requestAnimationFrame; 
			window.cancelAnimationFrame = cancelAnimationFrame;
		};

		// Tween algorithm
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

		SwiftSlide.shiftOrder = function(transactionData, order) {
			if(typeof(transactionData) == "undefined") {
				return false;
			}

			for(var i = 0; i < transactionData.length; i ++) {
				if(transactionData[i].order == order) {
					return transactionData[i];
				}
			}	
		};

		SwiftSlide.prototype.addTransactionToQueue = function() {
			for(var i = 0; i < this.transactionBundle.length; i ++) {
				this.transactionQueue.push(this.transactionBundle[i]);
			}
		};

		SwiftSlide.prototype.dispatchTransaction = function(transactionID) {
			var transactionQueueLength = this.transactionQueue.length;
			for(var i = 0; i < transactionQueueLength; i ++) {
				if(this.transactionQueue[i].slideTransactionID == transactionID)
					return  this.transactionQueue[i];
				else
					continue;
			}
		};

		SwiftSlide.prototype.validateBundle = function() {

			// Validate bundles and set global default configure options
			var slideHistoryStackCallback = false,
				slideInitOrder = 1,
			    slideFrameTime = 12,
			    slideTween = "Cubic.easeOut",
			    slideDivWidth = window.innerWidth,
			    slideDeviation = 0;

			var popstateFlag = true;
			    
			var transactionBundleLength = this.transactionBundle.length;

			for(var i = 0; i < transactionBundleLength; i ++) {
				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideTransactionID")) {
					console.error("[SwiftSlide] Please make sure you have passed correct transactionID!");
					return false;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideBundle")) {
					console.error("[SwiftSlide] Please make sure you have passed slideBundle!");
					return false;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideInitOrder") || 
				   !SwiftSlide.isNumeric(this.transactionBundle[i].slideInitOrder)) {
					this.transactionBundle[i].slideInitOrder = slideInitOrder;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideTween")) {
					this.transactionBundle[i].slideTween = slideTween;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideDivWidth") || 
				   !SwiftSlide.isNumeric(this.transactionBundle[i].slideDivWidth)) {
					this.transactionBundle[i].slideDivWidth = slideDivWidth;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideDeviation") || 
				   !SwiftSlide.isNumeric(this.transactionBundle[i].slideDeviation)) {
					this.transactionBundle[i].slideDeviation = slideDeviation;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideHistoryStackCallback") || 
				   !SwiftSlide.isFunction(this.transactionBundle[i].slideHistoryStackCallback)) {
					this.transactionBundle[i].slideHistoryStackCallback = slideHistoryStackCallback;
				}

				if(!SwiftSlide.hasPrototype(this.transactionBundle[i], "slideFrameTime") || 
				   !SwiftSlide.isNumeric(this.transactionBundle[i].slideFrameTime)){
					this.transactionBundle[i].slideFrameTime = slideFrameTime;
				}

				// Add to history stack (!!need to fix of conflict!!)
				if(this.transactionBundle[i].slideHistoryStackCallback && popstateFlag) {
					window.addEventListener("popstate", function() {
					    var stateBundleJSON = history.state;
					    var stateBundle = JSON.parse(stateBundleJSON);
					    var transaction = self.dispatchTransaction(stateBundle.slideTransactionID);
					  	// Call slide method
					    self.slideCore(stateBundle.slideTransactionID, stateBundle.shiftOrder);
					    transaction.slideHistoryStackCallback.call(self, stateBundle.shiftOrder);	
					    // Set flag
					    popstateFlag = false;							
					});
				}		
			}
		};
		
		// Validate bundles
		this.validateBundle();

		// Add transactions to queue
		this.addTransactionToQueue();

		// Core sliding method
		SwiftSlide.prototype.slideCore = function(slideTransactionID, elementOrder) {

			// Dispatch transaction
			var transaction = this.dispatchTransaction(slideTransactionID);

			// Constructor variables init
			var thisBundleLength = transaction.slideBundle.length;
			var currentSlideOrder = transaction.slideInitOrder;

			if(currentSlideOrder > thisBundleLength) {
				console.warn("[SwiftSlide] Please make sure you have set enough layer to slide!");
				currentSlideOrder = (currentSlideOrder % thisBundleLength == 0 ? thisBundleLength : currentSlideOrder % thisBundleLength);
			}

			// Get current order position
			var currentObject = SwiftSlide.shiftOrder(transaction.slideBundle, currentSlideOrder);

			// Params
			var slideWidth = transaction.slideDivWidth,
			    slideLeft = transaction.slideDeviation,
			    slideFrameTime = transaction.slideFrameTime,
			    slideTween = transaction.slideTween;

			// Get init shift object and shift order 
			var shiftOrder = (elementOrder % thisBundleLength == 0 ? thisBundleLength : elementOrder % thisBundleLength);
			var shiftObject = SwiftSlide.shiftOrder(transaction.slideBundle, shiftOrder);

			// In case of slide to the same element
			if(shiftOrder == currentSlideOrder) {
				console.info("[SwiftSlide] Slide to the same element.");
				return;
			}

			// Get shift element
			var currentElement = document.querySelector(currentObject.element);
			var shiftElement = document.querySelector(shiftObject.element);

			// Change title
			if(SwiftSlide.isSet(shiftObject.title))
				SwiftSlide.setTitle(shiftObject.title);

			// Change history stack
			if(SwiftSlide.isSet(shiftObject.urlDisplay))
			{
				var historyStat = {"slideTransactionID": slideTransactionID, "shiftOrder": shiftOrder};
				var historyStatBundle = JSON.stringify(historyStat);
				SwiftSlide.pushState(historyStatBundle, shiftObject.urlDisplay);
			}
				
			// Get requestAnimationFrame() and cancelAnimationFrame() bind to window object
			SwiftSlide.getAnimationFrameMethod();

			// Main method (no compress and merge)
			var _leftStart = 0,
			    _leftDuring = slideFrameTime, 
			    _rightStart = 0, 
			    _rightDuring = slideFrameTime,
			    _tweenMethod = SwiftSlide.processTween(slideTween);

			var _leftSlide = function(){
				_leftStart ++;

				var marginLeft;

				if(shiftOrder > currentSlideOrder) 
					marginLeft = _tweenMethod(_leftStart, 0, slideLeft - slideWidth, _leftDuring);
				else if(shiftOrder < currentSlideOrder) 
					marginLeft = _tweenMethod(_leftStart, 0, (slideLeft / 2) + slideWidth, _leftDuring);

				var opacity = _tweenMethod(_leftStart, 1, -1, _leftDuring);

				currentElement.style.marginLeft = marginLeft + "px";
				currentElement.style.opacity = opacity;

			    if(_leftStart < _leftDuring) 
			    	window.requestAnimationFrame(arguments.callee);
			    else{
			    	currentElement.style.display = "none";

			    	if(shiftOrder > currentSlideOrder) 
			    		shiftElement.style.marginLeft = slideWidth + "px";
			    	else
			    		shiftElement.style.marginLeft = -slideWidth + "px";

			    	shiftElement.style.display = "block";
			    	// Call _rightSlide();
					_rightSlide.apply(this, arguments);
			    }
			};
			
			var _rightSlide = function(){
				_rightStart ++;

				var marginLeft;
				if(shiftOrder > currentSlideOrder) 
					marginLeft = _tweenMethod(_rightStart, slideWidth, -slideWidth, _rightDuring);
				else if(shiftOrder < currentSlideOrder) 
					marginLeft = _tweenMethod(_rightStart, -slideWidth, slideWidth, _rightDuring);

				var opacity = _tweenMethod(_rightStart, 0, 1, _rightDuring);

				shiftElement.style.marginLeft = marginLeft + "px";
				shiftElement.style.opacity = opacity;

			    if(_rightStart < _rightDuring) 
			    	window.requestAnimationFrame(arguments.callee);
			};

			// Call _leftSlide();
			_leftSlide.apply(this, arguments);
			
			// Save status
			transaction.slideInitOrder = shiftOrder;
			
		};
	}

	SwiftSlide.prototype = {

		slideTo: function(transactionID, elementOrder){		
			// Call core method
			this.slideCore(transactionID, elementOrder);
		}
	}

	return SwiftSlide;

}));

