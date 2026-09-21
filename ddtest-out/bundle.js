(function() {
	//#region \0rolldown/runtime.js
	var __defProp = Object.defineProperty;
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	//#endregion
	//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
	/**
	* @vue/shared v3.5.39
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	// @__NO_SIDE_EFFECTS__
	function makeMap(str) {
		const map = /* @__PURE__ */ Object.create(null);
		for (const key of str.split(",")) map[key] = 1;
		return (val) => val in map;
	}
	var EMPTY_OBJ = !!(process.env.NODE_ENV !== "production") ? Object.freeze({}) : {};
	var EMPTY_ARR = !!(process.env.NODE_ENV !== "production") ? Object.freeze([]) : [];
	var NOOP = () => {};
	var NO = () => false;
	var isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && (key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
	var isModelListener = (key) => key.startsWith("onUpdate:");
	var extend = Object.assign;
	var remove = (arr, el) => {
		const i = arr.indexOf(el);
		if (i > -1) arr.splice(i, 1);
	};
	var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
	var hasOwn$1 = (val, key) => hasOwnProperty$2.call(val, key);
	var isArray$1 = Array.isArray;
	var isMap = (val) => toTypeString$1(val) === "[object Map]";
	var isSet = (val) => toTypeString$1(val) === "[object Set]";
	var isDate$1 = (val) => toTypeString$1(val) === "[object Date]";
	var isRegExp$1 = (val) => toTypeString$1(val) === "[object RegExp]";
	var isFunction$1 = (val) => typeof val === "function";
	var isString$1 = (val) => typeof val === "string";
	var isSymbol = (val) => typeof val === "symbol";
	var isObject$2 = (val) => val !== null && typeof val === "object";
	var isPromise$1 = (val) => {
		return (isObject$2(val) || isFunction$1(val)) && isFunction$1(val.then) && isFunction$1(val.catch);
	};
	var objectToString$1 = Object.prototype.toString;
	var toTypeString$1 = (value) => objectToString$1.call(value);
	var toRawType = (value) => {
		return toTypeString$1(value).slice(8, -1);
	};
	var isPlainObject$2 = (val) => toTypeString$1(val) === "[object Object]";
	var isIntegerKey = (key) => isString$1(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
	var isReservedProp = /* @__PURE__ */ makeMap(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted");
	var isBuiltInDirective = /* @__PURE__ */ makeMap("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
	var cacheStringFunction$1 = (fn) => {
		const cache = /* @__PURE__ */ Object.create(null);
		return ((str) => {
			return cache[str] || (cache[str] = fn(str));
		});
	};
	var camelizeRE$1 = /-\w/g;
	var camelize$1 = cacheStringFunction$1((str) => {
		return str.replace(camelizeRE$1, (c) => c.slice(1).toUpperCase());
	});
	var hyphenateRE$1 = /\B([A-Z])/g;
	var hyphenate$1 = cacheStringFunction$1((str) => str.replace(hyphenateRE$1, "-$1").toLowerCase());
	var capitalize$1 = cacheStringFunction$1((str) => {
		return str.charAt(0).toUpperCase() + str.slice(1);
	});
	var toHandlerKey = cacheStringFunction$1((str) => {
		return str ? `on${capitalize$1(str)}` : ``;
	});
	var hasChanged = (value, oldValue) => !Object.is(value, oldValue);
	var invokeArrayFns = (fns, ...arg) => {
		for (let i = 0; i < fns.length; i++) fns[i](...arg);
	};
	var def = (obj, key, value, writable = false) => {
		Object.defineProperty(obj, key, {
			configurable: true,
			enumerable: false,
			writable,
			value
		});
	};
	var looseToNumber = (val) => {
		const n = parseFloat(val);
		return isNaN(n) ? val : n;
	};
	var toNumber = (val) => {
		const n = isString$1(val) ? Number(val) : NaN;
		return isNaN(n) ? val : n;
	};
	var _globalThis$1;
	var getGlobalThis$1 = () => {
		return _globalThis$1 || (_globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
	};
	var isGloballyAllowed = /* @__PURE__ */ makeMap("Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,console,Error,Symbol");
	function normalizeStyle(value) {
		if (isArray$1(value)) {
			const res = {};
			for (let i = 0; i < value.length; i++) {
				const item = value[i];
				const normalized = isString$1(item) ? parseStringStyle(item) : normalizeStyle(item);
				if (normalized) for (const key in normalized) res[key] = normalized[key];
			}
			return res;
		} else if (isString$1(value) || isObject$2(value)) return value;
	}
	var listDelimiterRE = /;(?![^(]*\))/g;
	var propertyDelimiterRE = /:([^]+)/;
	var styleCommentRE = /\/\*[^]*?\*\//g;
	function parseStringStyle(cssText) {
		const ret = {};
		cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
			if (item) {
				const tmp = item.split(propertyDelimiterRE);
				tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
			}
		});
		return ret;
	}
	function stringifyStyle(styles) {
		if (!styles) return "";
		if (isString$1(styles)) return styles;
		let ret = "";
		for (const key in styles) {
			const value = styles[key];
			if (isString$1(value) || typeof value === "number") {
				const normalizedKey = key.startsWith(`--`) ? key : hyphenate$1(key);
				ret += `${normalizedKey}:${value};`;
			}
		}
		return ret;
	}
	function normalizeClass(value) {
		let res = "";
		if (isString$1(value)) res = value;
		else if (isArray$1(value)) for (let i = 0; i < value.length; i++) {
			const normalized = normalizeClass(value[i]);
			if (normalized) res += normalized + " ";
		}
		else if (isObject$2(value)) {
			for (const name in value) if (value[name]) res += name + " ";
		}
		return res.trim();
	}
	function normalizeProps(props) {
		if (!props) return null;
		let { class: klass, style } = props;
		if (klass && !isString$1(klass)) props.class = normalizeClass(klass);
		if (style) props.style = normalizeStyle(style);
		return props;
	}
	var HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
	var SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
	var MATH_TAGS = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics";
	var isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
	var isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
	var isMathMLTag = /* @__PURE__ */ makeMap(MATH_TAGS);
	var specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
	var isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
	var isBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,inert,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
	function includeBooleanAttr(value) {
		return !!value || value === "";
	}
	var isKnownHtmlAttr = /* @__PURE__ */ makeMap(`accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,inert,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap`);
	var isKnownSvgAttr = /* @__PURE__ */ makeMap(`xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xmlns:xlink,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan`);
	function isRenderableAttrValue(value) {
		if (value == null) return false;
		const type = typeof value;
		return type === "string" || type === "number" || type === "boolean";
	}
	var cssVarNameEscapeSymbolsRE = /[ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g;
	function getEscapedCssVarName(key, doubleEscape) {
		return key.replace(cssVarNameEscapeSymbolsRE, (s) => doubleEscape ? s === "\"" ? "\\\\\\\"" : `\\\\${s}` : `\\${s}`);
	}
	function looseCompareArrays(a, b) {
		if (a.length !== b.length) return false;
		let equal = true;
		for (let i = 0; equal && i < a.length; i++) equal = looseEqual(a[i], b[i]);
		return equal;
	}
	function looseEqual(a, b) {
		if (a === b) return true;
		let aValidType = isDate$1(a);
		let bValidType = isDate$1(b);
		if (aValidType || bValidType) return aValidType && bValidType ? a.getTime() === b.getTime() : false;
		aValidType = isSymbol(a);
		bValidType = isSymbol(b);
		if (aValidType || bValidType) return a === b;
		aValidType = isArray$1(a);
		bValidType = isArray$1(b);
		if (aValidType || bValidType) return aValidType && bValidType ? looseCompareArrays(a, b) : false;
		aValidType = isObject$2(a);
		bValidType = isObject$2(b);
		if (aValidType || bValidType) {
			if (!aValidType || !bValidType) return false;
			if (Object.keys(a).length !== Object.keys(b).length) return false;
			for (const key in a) {
				const aHasKey = a.hasOwnProperty(key);
				const bHasKey = b.hasOwnProperty(key);
				if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) return false;
			}
		}
		return String(a) === String(b);
	}
	function looseIndexOf(arr, val) {
		return arr.findIndex((item) => looseEqual(item, val));
	}
	var isRef$1 = (val) => {
		return !!(val && val["__v_isRef"] === true);
	};
	var toDisplayString$1 = (val) => {
		return isString$1(val) ? val : val == null ? "" : isArray$1(val) || isObject$2(val) && (val.toString === objectToString$1 || !isFunction$1(val.toString)) ? isRef$1(val) ? toDisplayString$1(val.value) : JSON.stringify(val, replacer, 2) : String(val);
	};
	var replacer = (_key, val) => {
		if (isRef$1(val)) return replacer(_key, val.value);
		else if (isMap(val)) return { [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2], i) => {
			entries[stringifySymbol(key, i) + " =>"] = val2;
			return entries;
		}, {}) };
		else if (isSet(val)) return { [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v)) };
		else if (isSymbol(val)) return stringifySymbol(val);
		else if (isObject$2(val) && !isArray$1(val) && !isPlainObject$2(val)) return String(val);
		return val;
	};
	var stringifySymbol = (v, i = "") => {
		var _a;
		return isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v;
	};
	function normalizeCssVarValue(value) {
		if (value == null) return "initial";
		if (typeof value === "string") return value === "" ? " " : value;
		if (typeof value !== "number" || !Number.isFinite(value)) {
			if (!!(process.env.NODE_ENV !== "production")) console.warn("[Vue warn] Invalid value used for CSS binding. Expected a string or a finite number but received:", value);
		}
		return String(value);
	}
	//#endregion
	//#region node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
	/**
	* @vue/reactivity v3.5.39
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	function warn$3(msg, ...args) {
		console.warn(`[Vue warn] ${msg}`, ...args);
	}
	var activeEffectScope;
	var EffectScope = class {
		constructor(detached = false) {
			this.detached = detached;
			/**
			* @internal
			*/
			this._active = true;
			/**
			* @internal track `on` calls, allow `on` call multiple times
			*/
			this._on = 0;
			/**
			* @internal
			*/
			this.effects = [];
			/**
			* @internal
			*/
			this.cleanups = [];
			this._isPaused = false;
			this._warnOnRun = true;
			this.__v_skip = true;
			if (!detached && activeEffectScope) if (activeEffectScope.active) {
				this.parent = activeEffectScope;
				this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
			} else {
				this._active = false;
				this._warnOnRun = false;
			}
		}
		get active() {
			return this._active;
		}
		pause() {
			if (this._active) {
				this._isPaused = true;
				let i, l;
				if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].pause();
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].pause();
			}
		}
		/**
		* Resumes the effect scope, including all child scopes and effects.
		*/
		resume() {
			if (this._active) {
				if (this._isPaused) {
					this._isPaused = false;
					let i, l;
					if (this.scopes) for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].resume();
					for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].resume();
				}
			}
		}
		run(fn) {
			if (this._active) {
				const currentEffectScope = activeEffectScope;
				try {
					activeEffectScope = this;
					return fn();
				} finally {
					activeEffectScope = currentEffectScope;
				}
			} else if (!!(process.env.NODE_ENV !== "production") && this._warnOnRun) warn$3(`cannot run an inactive effect scope.`);
		}
		/**
		* This should only be called on non-detached scopes
		* @internal
		*/
		on() {
			if (++this._on === 1) {
				this.prevScope = activeEffectScope;
				activeEffectScope = this;
			}
		}
		/**
		* This should only be called on non-detached scopes
		* @internal
		*/
		off() {
			if (this._on > 0 && --this._on === 0) {
				if (activeEffectScope === this) activeEffectScope = this.prevScope;
				else {
					let current = activeEffectScope;
					while (current) {
						if (current.prevScope === this) {
							current.prevScope = this.prevScope;
							break;
						}
						current = current.prevScope;
					}
				}
				this.prevScope = void 0;
			}
		}
		stop(fromParent) {
			if (this._active) {
				this._active = false;
				let i, l;
				for (i = 0, l = this.effects.length; i < l; i++) this.effects[i].stop();
				this.effects.length = 0;
				for (i = 0, l = this.cleanups.length; i < l; i++) this.cleanups[i]();
				this.cleanups.length = 0;
				if (this.scopes) {
					for (i = 0, l = this.scopes.length; i < l; i++) this.scopes[i].stop(true);
					this.scopes.length = 0;
				}
				if (!this.detached && this.parent && !fromParent) {
					const last = this.parent.scopes.pop();
					if (last && last !== this) {
						this.parent.scopes[this.index] = last;
						last.index = this.index;
					}
				}
				this.parent = void 0;
			}
		}
	};
	function effectScope(detached) {
		return new EffectScope(detached);
	}
	function getCurrentScope() {
		return activeEffectScope;
	}
	function onScopeDispose(fn, failSilently = false) {
		if (activeEffectScope) activeEffectScope.cleanups.push(fn);
		else if (!!(process.env.NODE_ENV !== "production") && !failSilently) warn$3(`onScopeDispose() is called when there is no active effect scope to be associated with.`);
	}
	var activeSub;
	var pausedQueueEffects = /* @__PURE__ */ new WeakSet();
	var ReactiveEffect = class {
		constructor(fn) {
			this.fn = fn;
			/**
			* @internal
			*/
			this.deps = void 0;
			/**
			* @internal
			*/
			this.depsTail = void 0;
			/**
			* @internal
			*/
			this.flags = 5;
			/**
			* @internal
			*/
			this.next = void 0;
			/**
			* @internal
			*/
			this.cleanup = void 0;
			this.scheduler = void 0;
			if (activeEffectScope) if (activeEffectScope.active) activeEffectScope.effects.push(this);
			else this.flags &= -2;
		}
		pause() {
			this.flags |= 64;
		}
		resume() {
			if (this.flags & 64) {
				this.flags &= -65;
				if (pausedQueueEffects.has(this)) {
					pausedQueueEffects.delete(this);
					this.trigger();
				}
			}
		}
		/**
		* @internal
		*/
		notify() {
			if (this.flags & 2 && !(this.flags & 32)) return;
			if (!(this.flags & 8)) batch(this);
		}
		run() {
			if (!(this.flags & 1)) return this.fn();
			this.flags |= 2;
			cleanupEffect(this);
			prepareDeps(this);
			const prevEffect = activeSub;
			const prevShouldTrack = shouldTrack;
			activeSub = this;
			shouldTrack = true;
			try {
				return this.fn();
			} finally {
				if (!!(process.env.NODE_ENV !== "production") && activeSub !== this) warn$3("Active effect was not restored correctly - this is likely a Vue internal bug.");
				cleanupDeps(this);
				activeSub = prevEffect;
				shouldTrack = prevShouldTrack;
				this.flags &= -3;
			}
		}
		stop() {
			if (this.flags & 1) {
				for (let link = this.deps; link; link = link.nextDep) removeSub(link);
				this.deps = this.depsTail = void 0;
				cleanupEffect(this);
				this.onStop && this.onStop();
				this.flags &= -2;
			}
		}
		trigger() {
			if (this.flags & 64) pausedQueueEffects.add(this);
			else if (this.scheduler) this.scheduler();
			else this.runIfDirty();
		}
		/**
		* @internal
		*/
		runIfDirty() {
			if (isDirty(this)) this.run();
		}
		get dirty() {
			return isDirty(this);
		}
	};
	var batchDepth = 0;
	var batchedSub;
	var batchedComputed;
	function batch(sub, isComputed = false) {
		sub.flags |= 8;
		if (isComputed) {
			sub.next = batchedComputed;
			batchedComputed = sub;
			return;
		}
		sub.next = batchedSub;
		batchedSub = sub;
	}
	function startBatch() {
		batchDepth++;
	}
	function endBatch() {
		if (--batchDepth > 0) return;
		if (batchedComputed) {
			let e = batchedComputed;
			batchedComputed = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				e = next;
			}
		}
		let error;
		while (batchedSub) {
			let e = batchedSub;
			batchedSub = void 0;
			while (e) {
				const next = e.next;
				e.next = void 0;
				e.flags &= -9;
				if (e.flags & 1) try {
					e.trigger();
				} catch (err) {
					if (!error) error = err;
				}
				e = next;
			}
		}
		if (error) throw error;
	}
	function prepareDeps(sub) {
		for (let link = sub.deps; link; link = link.nextDep) {
			link.version = -1;
			link.prevActiveLink = link.dep.activeLink;
			link.dep.activeLink = link;
		}
	}
	function cleanupDeps(sub) {
		let head;
		let tail = sub.depsTail;
		let link = tail;
		while (link) {
			const prev = link.prevDep;
			if (link.version === -1) {
				if (link === tail) tail = prev;
				removeSub(link);
				removeDep(link);
			} else head = link;
			link.dep.activeLink = link.prevActiveLink;
			link.prevActiveLink = void 0;
			link = prev;
		}
		sub.deps = head;
		sub.depsTail = tail;
	}
	function isDirty(sub) {
		for (let link = sub.deps; link; link = link.nextDep) if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) return true;
		if (sub._dirty) return true;
		return false;
	}
	function refreshComputed(computed) {
		if (computed.flags & 4 && !(computed.flags & 16)) return;
		computed.flags &= -17;
		if (computed.globalVersion === globalVersion) return;
		computed.globalVersion = globalVersion;
		if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) return;
		computed.flags |= 2;
		const dep = computed.dep;
		const prevSub = activeSub;
		const prevShouldTrack = shouldTrack;
		activeSub = computed;
		shouldTrack = true;
		try {
			prepareDeps(computed);
			const value = computed.fn(computed._value);
			if (dep.version === 0 || hasChanged(value, computed._value)) {
				computed.flags |= 128;
				computed._value = value;
				dep.version++;
			}
		} catch (err) {
			dep.version++;
			throw err;
		} finally {
			activeSub = prevSub;
			shouldTrack = prevShouldTrack;
			cleanupDeps(computed);
			computed.flags &= -3;
		}
	}
	function removeSub(link, soft = false) {
		const { dep, prevSub, nextSub } = link;
		if (prevSub) {
			prevSub.nextSub = nextSub;
			link.prevSub = void 0;
		}
		if (nextSub) {
			nextSub.prevSub = prevSub;
			link.nextSub = void 0;
		}
		if (!!(process.env.NODE_ENV !== "production") && dep.subsHead === link) dep.subsHead = nextSub;
		if (dep.subs === link) {
			dep.subs = prevSub;
			if (!prevSub && dep.computed) {
				dep.computed.flags &= -5;
				for (let l = dep.computed.deps; l; l = l.nextDep) removeSub(l, true);
			}
		}
		if (!soft && !--dep.sc && dep.map) dep.map.delete(dep.key);
	}
	function removeDep(link) {
		const { prevDep, nextDep } = link;
		if (prevDep) {
			prevDep.nextDep = nextDep;
			link.prevDep = void 0;
		}
		if (nextDep) {
			nextDep.prevDep = prevDep;
			link.nextDep = void 0;
		}
	}
	function effect(fn, options) {
		if (fn.effect instanceof ReactiveEffect) fn = fn.effect.fn;
		const e = new ReactiveEffect(fn);
		if (options) extend(e, options);
		try {
			e.run();
		} catch (err) {
			e.stop();
			throw err;
		}
		const runner = e.run.bind(e);
		runner.effect = e;
		return runner;
	}
	function stop(runner) {
		runner.effect.stop();
	}
	var shouldTrack = true;
	var trackStack = [];
	function pauseTracking() {
		trackStack.push(shouldTrack);
		shouldTrack = false;
	}
	function resetTracking() {
		const last = trackStack.pop();
		shouldTrack = last === void 0 ? true : last;
	}
	function cleanupEffect(e) {
		const { cleanup } = e;
		e.cleanup = void 0;
		if (cleanup) {
			const prevSub = activeSub;
			activeSub = void 0;
			try {
				cleanup();
			} finally {
				activeSub = prevSub;
			}
		}
	}
	var globalVersion = 0;
	var Link = class {
		constructor(sub, dep) {
			this.sub = sub;
			this.dep = dep;
			this.version = dep.version;
			this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
		}
	};
	var Dep = class {
		constructor(computed) {
			this.computed = computed;
			this.version = 0;
			/**
			* Link between this dep and the current active effect
			*/
			this.activeLink = void 0;
			/**
			* Doubly linked list representing the subscribing effects (tail)
			*/
			this.subs = void 0;
			/**
			* For object property deps cleanup
			*/
			this.map = void 0;
			this.key = void 0;
			/**
			* Subscriber counter
			*/
			this.sc = 0;
			/**
			* @internal
			*/
			this.__v_skip = true;
			if (!!(process.env.NODE_ENV !== "production")) this.subsHead = void 0;
		}
		track(debugInfo) {
			if (!activeSub || !shouldTrack || activeSub === this.computed) return;
			let link = this.activeLink;
			if (link === void 0 || link.sub !== activeSub) {
				link = this.activeLink = new Link(activeSub, this);
				if (!activeSub.deps) activeSub.deps = activeSub.depsTail = link;
				else {
					link.prevDep = activeSub.depsTail;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
				}
				addSub(link);
			} else if (link.version === -1) {
				link.version = this.version;
				if (link.nextDep) {
					const next = link.nextDep;
					next.prevDep = link.prevDep;
					if (link.prevDep) link.prevDep.nextDep = next;
					link.prevDep = activeSub.depsTail;
					link.nextDep = void 0;
					activeSub.depsTail.nextDep = link;
					activeSub.depsTail = link;
					if (activeSub.deps === link) activeSub.deps = next;
				}
			}
			if (!!(process.env.NODE_ENV !== "production") && activeSub.onTrack) activeSub.onTrack(extend({ effect: activeSub }, debugInfo));
			return link;
		}
		trigger(debugInfo) {
			this.version++;
			globalVersion++;
			this.notify(debugInfo);
		}
		notify(debugInfo) {
			startBatch();
			try {
				if (!!(process.env.NODE_ENV !== "production")) {
					for (let head = this.subsHead; head; head = head.nextSub) if (head.sub.onTrigger && !(head.sub.flags & 8)) head.sub.onTrigger(extend({ effect: head.sub }, debugInfo));
				}
				for (let link = this.subs; link; link = link.prevSub) if (link.sub.notify()) link.sub.dep.notify();
			} finally {
				endBatch();
			}
		}
	};
	function addSub(link) {
		link.dep.sc++;
		if (link.sub.flags & 4) {
			const computed = link.dep.computed;
			if (computed && !link.dep.subs) {
				computed.flags |= 20;
				for (let l = computed.deps; l; l = l.nextDep) addSub(l);
			}
			const currentTail = link.dep.subs;
			if (currentTail !== link) {
				link.prevSub = currentTail;
				if (currentTail) currentTail.nextSub = link;
			}
			if (!!(process.env.NODE_ENV !== "production") && link.dep.subsHead === void 0) link.dep.subsHead = link;
			link.dep.subs = link;
		}
	}
	var targetMap = /* @__PURE__ */ new WeakMap();
	var ITERATE_KEY = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "Object iterate" : "");
	var MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "Map keys iterate" : "");
	var ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "Array iterate" : "");
	function track(target, type, key) {
		if (shouldTrack && activeSub) {
			let depsMap = targetMap.get(target);
			if (!depsMap) targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
			let dep = depsMap.get(key);
			if (!dep) {
				depsMap.set(key, dep = new Dep());
				dep.map = depsMap;
				dep.key = key;
			}
			if (!!(process.env.NODE_ENV !== "production")) dep.track({
				target,
				type,
				key
			});
			else dep.track();
		}
	}
	function trigger(target, type, key, newValue, oldValue, oldTarget) {
		const depsMap = targetMap.get(target);
		if (!depsMap) {
			globalVersion++;
			return;
		}
		const run = (dep) => {
			if (dep) if (!!(process.env.NODE_ENV !== "production")) dep.trigger({
				target,
				type,
				key,
				newValue,
				oldValue,
				oldTarget
			});
			else dep.trigger();
		};
		startBatch();
		if (type === "clear") depsMap.forEach(run);
		else {
			const targetIsArray = isArray$1(target);
			const isArrayIndex = targetIsArray && isIntegerKey(key);
			if (targetIsArray && key === "length") {
				const newLength = Number(newValue);
				depsMap.forEach((dep, key2) => {
					if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) run(dep);
				});
			} else {
				if (key !== void 0 || depsMap.has(void 0)) run(depsMap.get(key));
				if (isArrayIndex) run(depsMap.get(ARRAY_ITERATE_KEY));
				switch (type) {
					case "add":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						} else if (isArrayIndex) run(depsMap.get("length"));
						break;
					case "delete":
						if (!targetIsArray) {
							run(depsMap.get(ITERATE_KEY));
							if (isMap(target)) run(depsMap.get(MAP_KEY_ITERATE_KEY));
						}
						break;
					case "set":
						if (isMap(target)) run(depsMap.get(ITERATE_KEY));
						break;
				}
			}
		}
		endBatch();
	}
	function getDepFromReactive(object, key) {
		const depMap = targetMap.get(object);
		return depMap && depMap.get(key);
	}
	function reactiveReadArray(array) {
		const raw = /* @__PURE__ */ toRaw(array);
		if (raw === array) return raw;
		track(raw, "iterate", ARRAY_ITERATE_KEY);
		return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive);
	}
	function shallowReadArray(arr) {
		track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
		return arr;
	}
	function toWrapped(target, item) {
		if (/* @__PURE__ */ isReadonly(target)) return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
		return toReactive(item);
	}
	var arrayInstrumentations = {
		__proto__: null,
		[Symbol.iterator]() {
			return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
		},
		concat(...args) {
			return reactiveReadArray(this).concat(...args.map((x) => isArray$1(x) ? reactiveReadArray(x) : x));
		},
		entries() {
			return iterator(this, "entries", (value) => {
				value[1] = toWrapped(this, value[1]);
				return value;
			});
		},
		every(fn, thisArg) {
			return apply$1(this, "every", fn, thisArg, void 0, arguments);
		},
		filter(fn, thisArg) {
			return apply$1(this, "filter", fn, thisArg, (v) => v.map((item) => toWrapped(this, item)), arguments);
		},
		find(fn, thisArg) {
			return apply$1(this, "find", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findIndex(fn, thisArg) {
			return apply$1(this, "findIndex", fn, thisArg, void 0, arguments);
		},
		findLast(fn, thisArg) {
			return apply$1(this, "findLast", fn, thisArg, (item) => toWrapped(this, item), arguments);
		},
		findLastIndex(fn, thisArg) {
			return apply$1(this, "findLastIndex", fn, thisArg, void 0, arguments);
		},
		forEach(fn, thisArg) {
			return apply$1(this, "forEach", fn, thisArg, void 0, arguments);
		},
		includes(...args) {
			return searchProxy(this, "includes", args);
		},
		indexOf(...args) {
			return searchProxy(this, "indexOf", args);
		},
		join(separator) {
			return reactiveReadArray(this).join(separator);
		},
		lastIndexOf(...args) {
			return searchProxy(this, "lastIndexOf", args);
		},
		map(fn, thisArg) {
			return apply$1(this, "map", fn, thisArg, void 0, arguments);
		},
		pop() {
			return noTracking(this, "pop");
		},
		push(...args) {
			return noTracking(this, "push", args);
		},
		reduce(fn, ...args) {
			return reduce(this, "reduce", fn, args);
		},
		reduceRight(fn, ...args) {
			return reduce(this, "reduceRight", fn, args);
		},
		shift() {
			return noTracking(this, "shift");
		},
		some(fn, thisArg) {
			return apply$1(this, "some", fn, thisArg, void 0, arguments);
		},
		splice(...args) {
			return noTracking(this, "splice", args);
		},
		toReversed() {
			return reactiveReadArray(this).toReversed();
		},
		toSorted(comparer) {
			return reactiveReadArray(this).toSorted(comparer);
		},
		toSpliced(...args) {
			return reactiveReadArray(this).toSpliced(...args);
		},
		unshift(...args) {
			return noTracking(this, "unshift", args);
		},
		values() {
			return iterator(this, "values", (item) => toWrapped(this, item));
		}
	};
	function iterator(self, method, wrapValue) {
		const arr = shallowReadArray(self);
		const iter = arr[method]();
		if (arr !== self && !/* @__PURE__ */ isShallow(self)) {
			iter._next = iter.next;
			iter.next = () => {
				const result = iter._next();
				if (!result.done) result.value = wrapValue(result.value);
				return result;
			};
		}
		return iter;
	}
	var arrayProto = Array.prototype;
	function apply$1(self, method, fn, thisArg, wrappedRetFn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
		const methodFn = arr[method];
		if (methodFn !== arrayProto[method]) {
			const result2 = methodFn.apply(self, args);
			return needsWrap ? toReactive(result2) : result2;
		}
		let wrappedFn = fn;
		if (arr !== self) {
			if (needsWrap) wrappedFn = function(item, index) {
				return fn.call(this, toWrapped(self, item), index, self);
			};
			else if (fn.length > 2) wrappedFn = function(item, index) {
				return fn.call(this, item, index, self);
			};
		}
		const result = methodFn.call(arr, wrappedFn, thisArg);
		return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
	}
	function reduce(self, method, fn, args) {
		const arr = shallowReadArray(self);
		const needsWrap = arr !== self && !/* @__PURE__ */ isShallow(self);
		let wrappedFn = fn;
		let wrapInitialAccumulator = false;
		if (arr !== self) {
			if (needsWrap) {
				wrapInitialAccumulator = args.length === 0;
				wrappedFn = function(acc, item, index) {
					if (wrapInitialAccumulator) {
						wrapInitialAccumulator = false;
						acc = toWrapped(self, acc);
					}
					return fn.call(this, acc, toWrapped(self, item), index, self);
				};
			} else if (fn.length > 3) wrappedFn = function(acc, item, index) {
				return fn.call(this, acc, item, index, self);
			};
		}
		const result = arr[method](wrappedFn, ...args);
		return wrapInitialAccumulator ? toWrapped(self, result) : result;
	}
	function searchProxy(self, method, args) {
		const arr = /* @__PURE__ */ toRaw(self);
		track(arr, "iterate", ARRAY_ITERATE_KEY);
		const res = arr[method](...args);
		if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
			args[0] = /* @__PURE__ */ toRaw(args[0]);
			return arr[method](...args);
		}
		return res;
	}
	function noTracking(self, method, args = []) {
		pauseTracking();
		startBatch();
		const res = (/* @__PURE__ */ toRaw(self))[method].apply(self, args);
		endBatch();
		resetTracking();
		return res;
	}
	var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
	var builtInSymbols = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol));
	function hasOwnProperty$1(key) {
		if (!isSymbol(key)) key = String(key);
		const obj = /* @__PURE__ */ toRaw(this);
		track(obj, "has", key);
		return obj.hasOwnProperty(key);
	}
	var BaseReactiveHandler = class {
		constructor(_isReadonly = false, _isShallow = false) {
			this._isReadonly = _isReadonly;
			this._isShallow = _isShallow;
		}
		get(target, key, receiver) {
			if (key === "__v_skip") return target["__v_skip"];
			const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_isShallow") return isShallow2;
			else if (key === "__v_raw") {
				if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) return target;
				return;
			}
			const targetIsArray = isArray$1(target);
			if (!isReadonly2) {
				let fn;
				if (targetIsArray && (fn = arrayInstrumentations[key])) return fn;
				if (key === "hasOwnProperty") return hasOwnProperty$1;
			}
			const res = Reflect.get(target, key, /* @__PURE__ */ isRef(target) ? target : receiver);
			if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) return res;
			if (!isReadonly2) track(target, "get", key);
			if (isShallow2) return res;
			if (/* @__PURE__ */ isRef(res)) {
				const value = targetIsArray && isIntegerKey(key) ? res : res.value;
				return isReadonly2 && isObject$2(value) ? /* @__PURE__ */ readonly(value) : value;
			}
			if (isObject$2(res)) return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
			return res;
		}
	};
	var MutableReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(false, isShallow2);
		}
		set(target, key, value, receiver) {
			let oldValue = target[key];
			const isArrayWithIntegerKey = isArray$1(target) && isIntegerKey(key);
			if (!this._isShallow) {
				const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
				if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
					oldValue = /* @__PURE__ */ toRaw(oldValue);
					value = /* @__PURE__ */ toRaw(value);
				}
				if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) if (isOldValueReadonly) {
					if (!!(process.env.NODE_ENV !== "production")) warn$3(`Set operation on key "${String(key)}" failed: target is readonly.`, target[key]);
					return true;
				} else {
					oldValue.value = value;
					return true;
				}
			}
			const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn$1(target, key);
			const result = Reflect.set(target, key, value, /* @__PURE__ */ isRef(target) ? target : receiver);
			if (target === /* @__PURE__ */ toRaw(receiver) && result) {
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
			}
			return result;
		}
		deleteProperty(target, key) {
			const hadKey = hasOwn$1(target, key);
			const oldValue = target[key];
			const result = Reflect.deleteProperty(target, key);
			if (result && hadKey) trigger(target, "delete", key, void 0, oldValue);
			return result;
		}
		has(target, key) {
			const result = Reflect.has(target, key);
			if (!isSymbol(key) || !builtInSymbols.has(key)) track(target, "has", key);
			return result;
		}
		ownKeys(target) {
			track(target, "iterate", isArray$1(target) ? "length" : ITERATE_KEY);
			return Reflect.ownKeys(target);
		}
	};
	var ReadonlyReactiveHandler = class extends BaseReactiveHandler {
		constructor(isShallow2 = false) {
			super(true, isShallow2);
		}
		set(target, key) {
			if (!!(process.env.NODE_ENV !== "production")) warn$3(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
			return true;
		}
		deleteProperty(target, key) {
			if (!!(process.env.NODE_ENV !== "production")) warn$3(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
			return true;
		}
	};
	var mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
	var readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
	var shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
	var shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
	var toShallow = (value) => value;
	var getProto = (v) => Reflect.getPrototypeOf(v);
	function createIterableMethod(method, isReadonly2, isShallow2) {
		return function(...args) {
			const target = this["__v_raw"];
			const rawTarget = /* @__PURE__ */ toRaw(target);
			const targetIsMap = isMap(rawTarget);
			const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
			const isKeyOnly = method === "keys" && targetIsMap;
			const innerIterator = target[method](...args);
			const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
			!isReadonly2 && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
			return extend(Object.create(innerIterator), { next() {
				const { value, done } = innerIterator.next();
				return done ? {
					value,
					done
				} : {
					value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
					done
				};
			} });
		};
	}
	function createReadonlyMethod(type) {
		return function(...args) {
			if (!!(process.env.NODE_ENV !== "production")) {
				const key = args[0] ? `on key "${args[0]}" ` : ``;
				warn$3(`${capitalize$1(type)} operation ${key}failed: target is readonly.`, /* @__PURE__ */ toRaw(this));
			}
			return type === "delete" ? false : type === "clear" ? void 0 : this;
		};
	}
	function createInstrumentations(readonly, shallow) {
		const instrumentations = {
			get(key) {
				const target = this["__v_raw"];
				const rawTarget = /* @__PURE__ */ toRaw(target);
				const rawKey = /* @__PURE__ */ toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "get", key);
					track(rawTarget, "get", rawKey);
				}
				const { has } = getProto(rawTarget);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				if (has.call(rawTarget, key)) return wrap(target.get(key));
				else if (has.call(rawTarget, rawKey)) return wrap(target.get(rawKey));
				else if (target !== rawTarget) target.get(key);
			},
			get size() {
				const target = this["__v_raw"];
				!readonly && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
				return target.size;
			},
			has(key) {
				const target = this["__v_raw"];
				const rawTarget = /* @__PURE__ */ toRaw(target);
				const rawKey = /* @__PURE__ */ toRaw(key);
				if (!readonly) {
					if (hasChanged(key, rawKey)) track(rawTarget, "has", key);
					track(rawTarget, "has", rawKey);
				}
				return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
			},
			forEach(callback, thisArg) {
				const observed = this;
				const target = observed["__v_raw"];
				const rawTarget = /* @__PURE__ */ toRaw(target);
				const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
				!readonly && track(rawTarget, "iterate", ITERATE_KEY);
				return target.forEach((value, key) => {
					return callback.call(thisArg, wrap(value), wrap(key), observed);
				});
			}
		};
		extend(instrumentations, readonly ? {
			add: createReadonlyMethod("add"),
			set: createReadonlyMethod("set"),
			delete: createReadonlyMethod("delete"),
			clear: createReadonlyMethod("clear")
		} : {
			add(value) {
				const target = /* @__PURE__ */ toRaw(this);
				const proto = getProto(target);
				const rawValue = /* @__PURE__ */ toRaw(value);
				const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
				if (!(proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue))) {
					target.add(valueToAdd);
					trigger(target, "add", valueToAdd, valueToAdd);
				}
				return this;
			},
			set(key, value) {
				if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) value = /* @__PURE__ */ toRaw(value);
				const target = /* @__PURE__ */ toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = /* @__PURE__ */ toRaw(key);
					hadKey = has.call(target, key);
				} else if (!!(process.env.NODE_ENV !== "production")) checkIdentityKeys(target, has, key);
				const oldValue = get.call(target, key);
				target.set(key, value);
				if (!hadKey) trigger(target, "add", key, value);
				else if (hasChanged(value, oldValue)) trigger(target, "set", key, value, oldValue);
				return this;
			},
			delete(key) {
				const target = /* @__PURE__ */ toRaw(this);
				const { has, get } = getProto(target);
				let hadKey = has.call(target, key);
				if (!hadKey) {
					key = /* @__PURE__ */ toRaw(key);
					hadKey = has.call(target, key);
				} else if (!!(process.env.NODE_ENV !== "production")) checkIdentityKeys(target, has, key);
				const oldValue = get ? get.call(target, key) : void 0;
				const result = target.delete(key);
				if (hadKey) trigger(target, "delete", key, void 0, oldValue);
				return result;
			},
			clear() {
				const target = /* @__PURE__ */ toRaw(this);
				const hadItems = target.size !== 0;
				const oldTarget = !!(process.env.NODE_ENV !== "production") ? isMap(target) ? new Map(target) : new Set(target) : void 0;
				const result = target.clear();
				if (hadItems) trigger(target, "clear", void 0, void 0, oldTarget);
				return result;
			}
		});
		[
			"keys",
			"values",
			"entries",
			Symbol.iterator
		].forEach((method) => {
			instrumentations[method] = createIterableMethod(method, readonly, shallow);
		});
		return instrumentations;
	}
	function createInstrumentationGetter(isReadonly2, shallow) {
		const instrumentations = createInstrumentations(isReadonly2, shallow);
		return (target, key, receiver) => {
			if (key === "__v_isReactive") return !isReadonly2;
			else if (key === "__v_isReadonly") return isReadonly2;
			else if (key === "__v_raw") return target;
			return Reflect.get(hasOwn$1(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
		};
	}
	var mutableCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, false) };
	var shallowCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(false, true) };
	var readonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, false) };
	var shallowReadonlyCollectionHandlers = { get: /* @__PURE__ */ createInstrumentationGetter(true, true) };
	function checkIdentityKeys(target, has, key) {
		const rawKey = /* @__PURE__ */ toRaw(key);
		if (rawKey !== key && has.call(target, rawKey)) {
			const type = toRawType(target);
			warn$3(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
		}
	}
	var reactiveMap = /* @__PURE__ */ new WeakMap();
	var shallowReactiveMap = /* @__PURE__ */ new WeakMap();
	var readonlyMap = /* @__PURE__ */ new WeakMap();
	var shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
	function targetTypeMap(rawType) {
		switch (rawType) {
			case "Object":
			case "Array": return 1;
			case "Map":
			case "Set":
			case "WeakMap":
			case "WeakSet": return 2;
			default: return 0;
		}
	}
	// @__NO_SIDE_EFFECTS__
	function reactive(target) {
		if (/* @__PURE__ */ isReadonly(target)) return target;
		return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
	}
	// @__NO_SIDE_EFFECTS__
	function shallowReactive(target) {
		return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
	}
	// @__NO_SIDE_EFFECTS__
	function readonly(target) {
		return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
	}
	// @__NO_SIDE_EFFECTS__
	function shallowReadonly(target) {
		return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
	}
	function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
		if (!isObject$2(target)) {
			if (!!(process.env.NODE_ENV !== "production")) warn$3(`value cannot be made ${isReadonly2 ? "readonly" : "reactive"}: ${String(target)}`);
			return target;
		}
		if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) return target;
		if (target["__v_skip"] || !Object.isExtensible(target)) return target;
		const existingProxy = proxyMap.get(target);
		if (existingProxy) return existingProxy;
		const targetType = targetTypeMap(toRawType(target));
		if (targetType === 0) return target;
		const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
		proxyMap.set(target, proxy);
		return proxy;
	}
	// @__NO_SIDE_EFFECTS__
	function isReactive(value) {
		if (/* @__PURE__ */ isReadonly(value)) return /* @__PURE__ */ isReactive(value["__v_raw"]);
		return !!(value && value["__v_isReactive"]);
	}
	// @__NO_SIDE_EFFECTS__
	function isReadonly(value) {
		return !!(value && value["__v_isReadonly"]);
	}
	// @__NO_SIDE_EFFECTS__
	function isShallow(value) {
		return !!(value && value["__v_isShallow"]);
	}
	// @__NO_SIDE_EFFECTS__
	function isProxy(value) {
		return value ? !!value["__v_raw"] : false;
	}
	// @__NO_SIDE_EFFECTS__
	function toRaw(observed) {
		const raw = observed && observed["__v_raw"];
		return raw ? /* @__PURE__ */ toRaw(raw) : observed;
	}
	function markRaw(value) {
		if (!hasOwn$1(value, "__v_skip") && Object.isExtensible(value)) def(value, "__v_skip", true);
		return value;
	}
	var toReactive = (value) => isObject$2(value) ? /* @__PURE__ */ reactive(value) : value;
	var toReadonly = (value) => isObject$2(value) ? /* @__PURE__ */ readonly(value) : value;
	// @__NO_SIDE_EFFECTS__
	function isRef(r) {
		return r ? r["__v_isRef"] === true : false;
	}
	// @__NO_SIDE_EFFECTS__
	function ref(value) {
		return createRef(value, false);
	}
	// @__NO_SIDE_EFFECTS__
	function shallowRef(value) {
		return createRef(value, true);
	}
	function createRef(rawValue, shallow) {
		if (/* @__PURE__ */ isRef(rawValue)) return rawValue;
		return new RefImpl(rawValue, shallow);
	}
	var RefImpl = class {
		constructor(value, isShallow2) {
			this.dep = new Dep();
			this["__v_isRef"] = true;
			this["__v_isShallow"] = false;
			this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
			this._value = isShallow2 ? value : toReactive(value);
			this["__v_isShallow"] = isShallow2;
		}
		get value() {
			if (!!(process.env.NODE_ENV !== "production")) this.dep.track({
				target: this,
				type: "get",
				key: "value"
			});
			else this.dep.track();
			return this._value;
		}
		set value(newValue) {
			const oldValue = this._rawValue;
			const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
			newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
			if (hasChanged(newValue, oldValue)) {
				this._rawValue = newValue;
				this._value = useDirectValue ? newValue : toReactive(newValue);
				if (!!(process.env.NODE_ENV !== "production")) this.dep.trigger({
					target: this,
					type: "set",
					key: "value",
					newValue,
					oldValue
				});
				else this.dep.trigger();
			}
		}
	};
	function triggerRef(ref2) {
		if (ref2.dep) if (!!(process.env.NODE_ENV !== "production")) ref2.dep.trigger({
			target: ref2,
			type: "set",
			key: "value",
			newValue: ref2._value
		});
		else ref2.dep.trigger();
	}
	function unref(ref2) {
		return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
	}
	function toValue$1(source) {
		return isFunction$1(source) ? source() : unref(source);
	}
	var shallowUnwrapHandlers = {
		get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
		set: (target, key, value, receiver) => {
			const oldValue = target[key];
			if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
				oldValue.value = value;
				return true;
			} else return Reflect.set(target, key, value, receiver);
		}
	};
	function proxyRefs(objectWithRefs) {
		return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
	}
	var CustomRefImpl = class {
		constructor(factory) {
			this["__v_isRef"] = true;
			this._value = void 0;
			const dep = this.dep = new Dep();
			const { get, set } = factory(dep.track.bind(dep), dep.trigger.bind(dep));
			this._get = get;
			this._set = set;
		}
		get value() {
			return this._value = this._get();
		}
		set value(newVal) {
			this._set(newVal);
		}
	};
	function customRef(factory) {
		return new CustomRefImpl(factory);
	}
	// @__NO_SIDE_EFFECTS__
	function toRefs(object) {
		if (!!(process.env.NODE_ENV !== "production") && !/* @__PURE__ */ isProxy(object)) warn$3(`toRefs() expects a reactive object but received a plain one.`);
		const ret = isArray$1(object) ? new Array(object.length) : {};
		for (const key in object) ret[key] = propertyToRef(object, key);
		return ret;
	}
	var ObjectRefImpl = class {
		constructor(_object, key, _defaultValue) {
			this._object = _object;
			this._defaultValue = _defaultValue;
			this["__v_isRef"] = true;
			this._value = void 0;
			this._key = isSymbol(key) ? key : String(key);
			this._raw = /* @__PURE__ */ toRaw(_object);
			let shallow = true;
			let obj = _object;
			if (!isArray$1(_object) || isSymbol(this._key) || !isIntegerKey(this._key)) do
				shallow = !/* @__PURE__ */ isProxy(obj) || /* @__PURE__ */ isShallow(obj);
			while (shallow && (obj = obj["__v_raw"]));
			this._shallow = shallow;
		}
		get value() {
			let val = this._object[this._key];
			if (this._shallow) val = unref(val);
			return this._value = val === void 0 ? this._defaultValue : val;
		}
		set value(newVal) {
			if (this._shallow && /* @__PURE__ */ isRef(this._raw[this._key])) {
				const nestedRef = this._object[this._key];
				if (/* @__PURE__ */ isRef(nestedRef)) {
					nestedRef.value = newVal;
					return;
				}
			}
			this._object[this._key] = newVal;
		}
		get dep() {
			return getDepFromReactive(this._raw, this._key);
		}
	};
	var GetterRefImpl = class {
		constructor(_getter) {
			this._getter = _getter;
			this["__v_isRef"] = true;
			this["__v_isReadonly"] = true;
			this._value = void 0;
		}
		get value() {
			return this._value = this._getter();
		}
	};
	// @__NO_SIDE_EFFECTS__
	function toRef(source, key, defaultValue) {
		if (/* @__PURE__ */ isRef(source)) return source;
		else if (isFunction$1(source)) return new GetterRefImpl(source);
		else if (isObject$2(source) && arguments.length > 1) return propertyToRef(source, key, defaultValue);
		else return /* @__PURE__ */ ref(source);
	}
	function propertyToRef(source, key, defaultValue) {
		return new ObjectRefImpl(source, key, defaultValue);
	}
	var ComputedRefImpl = class {
		constructor(fn, setter, isSSR) {
			this.fn = fn;
			this.setter = setter;
			/**
			* @internal
			*/
			this._value = void 0;
			/**
			* @internal
			*/
			this.dep = new Dep(this);
			/**
			* @internal
			*/
			this.__v_isRef = true;
			/**
			* @internal
			*/
			this.deps = void 0;
			/**
			* @internal
			*/
			this.depsTail = void 0;
			/**
			* @internal
			*/
			this.flags = 16;
			/**
			* @internal
			*/
			this.globalVersion = globalVersion - 1;
			/**
			* @internal
			*/
			this.next = void 0;
			this.effect = this;
			this["__v_isReadonly"] = !setter;
			this.isSSR = isSSR;
		}
		/**
		* @internal
		*/
		notify() {
			this.flags |= 16;
			if (!(this.flags & 8) && activeSub !== this) {
				batch(this, true);
				return true;
			} else if (!!(process.env.NODE_ENV !== "production"));
		}
		get value() {
			const link = !!(process.env.NODE_ENV !== "production") ? this.dep.track({
				target: this,
				type: "get",
				key: "value"
			}) : this.dep.track();
			refreshComputed(this);
			if (link) link.version = this.dep.version;
			return this._value;
		}
		set value(newValue) {
			if (this.setter) this.setter(newValue);
			else if (!!(process.env.NODE_ENV !== "production")) warn$3("Write operation failed: computed value is readonly");
		}
	};
	// @__NO_SIDE_EFFECTS__
	function computed$1(getterOrOptions, debugOptions, isSSR = false) {
		let getter;
		let setter;
		if (isFunction$1(getterOrOptions)) getter = getterOrOptions;
		else {
			getter = getterOrOptions.get;
			setter = getterOrOptions.set;
		}
		const cRef = new ComputedRefImpl(getter, setter, isSSR);
		if (!!(process.env.NODE_ENV !== "production") && debugOptions && !isSSR) {
			cRef.onTrack = debugOptions.onTrack;
			cRef.onTrigger = debugOptions.onTrigger;
		}
		return cRef;
	}
	var TrackOpTypes = {
		"GET": "get",
		"HAS": "has",
		"ITERATE": "iterate"
	};
	var TriggerOpTypes = {
		"SET": "set",
		"ADD": "add",
		"DELETE": "delete",
		"CLEAR": "clear"
	};
	var INITIAL_WATCHER_VALUE = {};
	var cleanupMap = /* @__PURE__ */ new WeakMap();
	var activeWatcher = void 0;
	function getCurrentWatcher() {
		return activeWatcher;
	}
	function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
		if (owner) {
			let cleanups = cleanupMap.get(owner);
			if (!cleanups) cleanupMap.set(owner, cleanups = []);
			cleanups.push(cleanupFn);
		} else if (!!(process.env.NODE_ENV !== "production") && !failSilently) warn$3(`onWatcherCleanup() was called when there was no active watcher to associate with.`);
	}
	function watch$1(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, once, scheduler, augmentJob, call } = options;
		const warnInvalidSource = (s) => {
			(options.onWarn || warn$3)(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.`);
		};
		const reactiveGetter = (source2) => {
			if (deep) return source2;
			if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0) return traverse(source2, 1);
			return traverse(source2);
		};
		let effect;
		let getter;
		let cleanup;
		let boundCleanup;
		let forceTrigger = false;
		let isMultiSource = false;
		if (/* @__PURE__ */ isRef(source)) {
			getter = () => source.value;
			forceTrigger = /* @__PURE__ */ isShallow(source);
		} else if (/* @__PURE__ */ isReactive(source)) {
			getter = () => reactiveGetter(source);
			forceTrigger = true;
		} else if (isArray$1(source)) {
			isMultiSource = true;
			forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
			getter = () => source.map((s) => {
				if (/* @__PURE__ */ isRef(s)) return s.value;
				else if (/* @__PURE__ */ isReactive(s)) return reactiveGetter(s);
				else if (isFunction$1(s)) return call ? call(s, 2) : s();
				else process.env.NODE_ENV !== "production" && warnInvalidSource(s);
			});
		} else if (isFunction$1(source)) if (cb) getter = call ? () => call(source, 2) : source;
		else getter = () => {
			if (cleanup) {
				pauseTracking();
				try {
					cleanup();
				} finally {
					resetTracking();
				}
			}
			const currentEffect = activeWatcher;
			activeWatcher = effect;
			try {
				return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
			} finally {
				activeWatcher = currentEffect;
			}
		};
		else {
			getter = NOOP;
			process.env.NODE_ENV !== "production" && warnInvalidSource(source);
		}
		if (cb && deep) {
			const baseGetter = getter;
			const depth = deep === true ? Infinity : deep;
			getter = () => traverse(baseGetter(), depth);
		}
		const scope = getCurrentScope();
		const watchHandle = () => {
			effect.stop();
			if (scope && scope.active) remove(scope.effects, effect);
		};
		if (once && cb) {
			const _cb = cb;
			cb = (...args) => {
				const res = _cb(...args);
				watchHandle();
				return res;
			};
		}
		let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
		const job = (immediateFirstRun) => {
			if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) return;
			if (cb) {
				const newValue = effect.run();
				if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
					if (cleanup) cleanup();
					const currentWatcher = activeWatcher;
					activeWatcher = effect;
					try {
						const args = [
							newValue,
							oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
							boundCleanup
						];
						oldValue = newValue;
						call ? call(cb, 3, args) : cb(...args);
					} finally {
						activeWatcher = currentWatcher;
					}
				}
			} else effect.run();
		};
		if (augmentJob) augmentJob(job);
		effect = new ReactiveEffect(getter);
		effect.scheduler = scheduler ? () => scheduler(job, false) : job;
		boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
		cleanup = effect.onStop = () => {
			const cleanups = cleanupMap.get(effect);
			if (cleanups) {
				if (call) call(cleanups, 4);
				else for (const cleanup2 of cleanups) cleanup2();
				cleanupMap.delete(effect);
			}
		};
		if (!!(process.env.NODE_ENV !== "production")) {
			effect.onTrack = options.onTrack;
			effect.onTrigger = options.onTrigger;
		}
		if (cb) if (immediate) job(true);
		else oldValue = effect.run();
		else if (scheduler) scheduler(job.bind(null, true), true);
		else effect.run();
		watchHandle.pause = effect.pause.bind(effect);
		watchHandle.resume = effect.resume.bind(effect);
		watchHandle.stop = watchHandle;
		return watchHandle;
	}
	function traverse(value, depth = Infinity, seen) {
		if (depth <= 0 || !isObject$2(value) || value["__v_skip"]) return value;
		seen = seen || /* @__PURE__ */ new Map();
		if ((seen.get(value) || 0) >= depth) return value;
		seen.set(value, depth);
		depth--;
		if (/* @__PURE__ */ isRef(value)) traverse(value.value, depth, seen);
		else if (isArray$1(value)) for (let i = 0; i < value.length; i++) traverse(value[i], depth, seen);
		else if (isSet(value) || isMap(value)) value.forEach((v) => {
			traverse(v, depth, seen);
		});
		else if (isPlainObject$2(value)) {
			for (const key in value) traverse(value[key], depth, seen);
			for (const key of Object.getOwnPropertySymbols(value)) if (Object.prototype.propertyIsEnumerable.call(value, key)) traverse(value[key], depth, seen);
		}
		return value;
	}
	//#endregion
	//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
	/**
	* @vue/runtime-core v3.5.39
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	var stack = [];
	function pushWarningContext(vnode) {
		stack.push(vnode);
	}
	function popWarningContext() {
		stack.pop();
	}
	var isWarning = false;
	function warn$1(msg, ...args) {
		if (isWarning) return;
		isWarning = true;
		pauseTracking();
		const instance = stack.length ? stack[stack.length - 1].component : null;
		const appWarnHandler = instance && instance.appContext.config.warnHandler;
		const trace = getComponentTrace();
		if (appWarnHandler) callWithErrorHandling(appWarnHandler, instance, 11, [
			msg + args.map((a) => {
				var _a, _b;
				return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
			}).join(""),
			instance && instance.proxy,
			trace.map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`).join("\n"),
			trace
		]);
		else {
			const warnArgs = [`[Vue warn]: ${msg}`, ...args];
			if (trace.length && true) warnArgs.push(`
`, ...formatTrace(trace));
			console.warn(...warnArgs);
		}
		resetTracking();
		isWarning = false;
	}
	function getComponentTrace() {
		let currentVNode = stack[stack.length - 1];
		if (!currentVNode) return [];
		const normalizedStack = [];
		while (currentVNode) {
			const last = normalizedStack[0];
			if (last && last.vnode === currentVNode) last.recurseCount++;
			else normalizedStack.push({
				vnode: currentVNode,
				recurseCount: 0
			});
			const parentInstance = currentVNode.component && currentVNode.component.parent;
			currentVNode = parentInstance && parentInstance.vnode;
		}
		return normalizedStack;
	}
	function formatTrace(trace) {
		const logs = [];
		trace.forEach((entry, i) => {
			logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
		});
		return logs;
	}
	function formatTraceEntry({ vnode, recurseCount }) {
		const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
		const isRoot = vnode.component ? vnode.component.parent == null : false;
		const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
		const close = `>` + postfix;
		return vnode.props ? [
			open,
			...formatProps(vnode.props),
			close
		] : [open + close];
	}
	function formatProps(props) {
		const res = [];
		const keys = Object.keys(props);
		keys.slice(0, 3).forEach((key) => {
			res.push(...formatProp(key, props[key]));
		});
		if (keys.length > 3) res.push(` ...`);
		return res;
	}
	function formatProp(key, value, raw) {
		if (isString$1(value)) {
			value = JSON.stringify(value);
			return raw ? value : [`${key}=${value}`];
		} else if (typeof value === "number" || typeof value === "boolean" || value == null) return raw ? value : [`${key}=${value}`];
		else if (/* @__PURE__ */ isRef(value)) {
			value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
			return raw ? value : [
				`${key}=Ref<`,
				value,
				`>`
			];
		} else if (isFunction$1(value)) return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
		else {
			value = /* @__PURE__ */ toRaw(value);
			return raw ? value : [`${key}=`, value];
		}
	}
	function assertNumber(val, type) {
		if (!!!(process.env.NODE_ENV !== "production")) return;
		if (val === void 0) return;
		else if (typeof val !== "number") warn$1(`${type} is not a valid number - got ${JSON.stringify(val)}.`);
		else if (isNaN(val)) warn$1(`${type} is NaN - the duration expression might be incorrect.`);
	}
	var ErrorCodes = {
		"SETUP_FUNCTION": 0,
		"0": "SETUP_FUNCTION",
		"RENDER_FUNCTION": 1,
		"1": "RENDER_FUNCTION",
		"NATIVE_EVENT_HANDLER": 5,
		"5": "NATIVE_EVENT_HANDLER",
		"COMPONENT_EVENT_HANDLER": 6,
		"6": "COMPONENT_EVENT_HANDLER",
		"VNODE_HOOK": 7,
		"7": "VNODE_HOOK",
		"DIRECTIVE_HOOK": 8,
		"8": "DIRECTIVE_HOOK",
		"TRANSITION_HOOK": 9,
		"9": "TRANSITION_HOOK",
		"APP_ERROR_HANDLER": 10,
		"10": "APP_ERROR_HANDLER",
		"APP_WARN_HANDLER": 11,
		"11": "APP_WARN_HANDLER",
		"FUNCTION_REF": 12,
		"12": "FUNCTION_REF",
		"ASYNC_COMPONENT_LOADER": 13,
		"13": "ASYNC_COMPONENT_LOADER",
		"SCHEDULER": 14,
		"14": "SCHEDULER",
		"COMPONENT_UPDATE": 15,
		"15": "COMPONENT_UPDATE",
		"APP_UNMOUNT_CLEANUP": 16,
		"16": "APP_UNMOUNT_CLEANUP"
	};
	var ErrorTypeStrings$1 = {
		["sp"]: "serverPrefetch hook",
		["bc"]: "beforeCreate hook",
		["c"]: "created hook",
		["bm"]: "beforeMount hook",
		["m"]: "mounted hook",
		["bu"]: "beforeUpdate hook",
		["u"]: "updated",
		["bum"]: "beforeUnmount hook",
		["um"]: "unmounted hook",
		["a"]: "activated hook",
		["da"]: "deactivated hook",
		["ec"]: "errorCaptured hook",
		["rtc"]: "renderTracked hook",
		["rtg"]: "renderTriggered hook",
		[0]: "setup function",
		[1]: "render function",
		[2]: "watcher getter",
		[3]: "watcher callback",
		[4]: "watcher cleanup function",
		[5]: "native event handler",
		[6]: "component event handler",
		[7]: "vnode hook",
		[8]: "directive hook",
		[9]: "transition hook",
		[10]: "app errorHandler",
		[11]: "app warnHandler",
		[12]: "ref function",
		[13]: "async component loader",
		[14]: "scheduler flush",
		[15]: "component update",
		[16]: "app unmount cleanup function"
	};
	function callWithErrorHandling(fn, instance, type, args) {
		try {
			return args ? fn(...args) : fn();
		} catch (err) {
			handleError(err, instance, type);
		}
	}
	function callWithAsyncErrorHandling(fn, instance, type, args) {
		if (isFunction$1(fn)) {
			const res = callWithErrorHandling(fn, instance, type, args);
			if (res && isPromise$1(res)) res.catch((err) => {
				handleError(err, instance, type);
			});
			return res;
		}
		if (isArray$1(fn)) {
			const values = [];
			for (let i = 0; i < fn.length; i++) values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
			return values;
		} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Invalid value type passed to callWithAsyncErrorHandling(): ${typeof fn}`);
	}
	function handleError(err, instance, type, throwInDev = true) {
		const contextVNode = instance ? instance.vnode : null;
		const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
		if (instance) {
			let cur = instance.parent;
			const exposedInstance = instance.proxy;
			const errorInfo = !!(process.env.NODE_ENV !== "production") ? ErrorTypeStrings$1[type] : `https://vuejs.org/error-reference/#runtime-${type}`;
			while (cur) {
				const errorCapturedHooks = cur.ec;
				if (errorCapturedHooks) {
					for (let i = 0; i < errorCapturedHooks.length; i++) if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) return;
				}
				cur = cur.parent;
			}
			if (errorHandler) {
				pauseTracking();
				callWithErrorHandling(errorHandler, null, 10, [
					err,
					exposedInstance,
					errorInfo
				]);
				resetTracking();
				return;
			}
		}
		logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
	}
	function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
		if (!!(process.env.NODE_ENV !== "production")) {
			const info = ErrorTypeStrings$1[type];
			if (contextVNode) pushWarningContext(contextVNode);
			warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
			if (contextVNode) popWarningContext();
			if (throwInDev) throw err;
			else console.error(err);
		} else if (throwInProd) throw err;
		else console.error(err);
	}
	var queue = [];
	var flushIndex = -1;
	var pendingPostFlushCbs = [];
	var activePostFlushCbs = null;
	var postFlushIndex = 0;
	var resolvedPromise = /* @__PURE__ */ Promise.resolve();
	var currentFlushPromise = null;
	var RECURSION_LIMIT = 100;
	function nextTick(fn) {
		const p = currentFlushPromise || resolvedPromise;
		return fn ? p.then(this ? fn.bind(this) : fn) : p;
	}
	function findInsertionIndex(id) {
		let start = flushIndex + 1;
		let end = queue.length;
		while (start < end) {
			const middle = start + end >>> 1;
			const middleJob = queue[middle];
			const middleJobId = getId(middleJob);
			if (middleJobId < id || middleJobId === id && middleJob.flags & 2) start = middle + 1;
			else end = middle;
		}
		return start;
	}
	function queueJob(job) {
		if (!(job.flags & 1)) {
			const jobId = getId(job);
			const lastJob = queue[queue.length - 1];
			if (!lastJob || !(job.flags & 2) && jobId >= getId(lastJob)) queue.push(job);
			else queue.splice(findInsertionIndex(jobId), 0, job);
			job.flags |= 1;
			queueFlush();
		}
	}
	function queueFlush() {
		if (!currentFlushPromise) currentFlushPromise = resolvedPromise.then(flushJobs);
	}
	function queuePostFlushCb(cb) {
		if (!isArray$1(cb)) {
			if (activePostFlushCbs && cb.id === -1) activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
			else if (!(cb.flags & 1)) {
				pendingPostFlushCbs.push(cb);
				cb.flags |= 1;
			}
		} else pendingPostFlushCbs.push(...cb);
		queueFlush();
	}
	function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
		if (!!(process.env.NODE_ENV !== "production")) seen = seen || /* @__PURE__ */ new Map();
		for (; i < queue.length; i++) {
			const cb = queue[i];
			if (cb && cb.flags & 2) {
				if (instance && cb.id !== instance.uid) continue;
				if (!!(process.env.NODE_ENV !== "production") && checkRecursiveUpdates(seen, cb)) continue;
				queue.splice(i, 1);
				i--;
				if (cb.flags & 4) cb.flags &= -2;
				cb();
				if (!(cb.flags & 4)) cb.flags &= -2;
			}
		}
	}
	function flushPostFlushCbs(seen) {
		if (pendingPostFlushCbs.length) {
			const deduped = [...new Set(pendingPostFlushCbs)].sort((a, b) => getId(a) - getId(b));
			pendingPostFlushCbs.length = 0;
			if (activePostFlushCbs) {
				activePostFlushCbs.push(...deduped);
				return;
			}
			activePostFlushCbs = deduped;
			if (!!(process.env.NODE_ENV !== "production")) seen = seen || /* @__PURE__ */ new Map();
			for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
				const cb = activePostFlushCbs[postFlushIndex];
				if (!!(process.env.NODE_ENV !== "production") && checkRecursiveUpdates(seen, cb)) continue;
				if (cb.flags & 4) cb.flags &= -2;
				if (!(cb.flags & 8)) cb();
				cb.flags &= -2;
			}
			activePostFlushCbs = null;
			postFlushIndex = 0;
		}
	}
	var getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
	function flushJobs(seen) {
		if (!!(process.env.NODE_ENV !== "production")) seen = seen || /* @__PURE__ */ new Map();
		const check = !!(process.env.NODE_ENV !== "production") ? (job) => checkRecursiveUpdates(seen, job) : NOOP;
		try {
			for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
				const job = queue[flushIndex];
				if (job && !(job.flags & 8)) {
					if (!!(process.env.NODE_ENV !== "production") && check(job)) continue;
					if (job.flags & 4) job.flags &= -2;
					callWithErrorHandling(job, job.i, job.i ? 15 : 14);
					if (!(job.flags & 4)) job.flags &= -2;
				}
			}
		} finally {
			for (; flushIndex < queue.length; flushIndex++) {
				const job = queue[flushIndex];
				if (job) job.flags &= -2;
			}
			flushIndex = -1;
			queue.length = 0;
			flushPostFlushCbs(seen);
			currentFlushPromise = null;
			if (queue.length || pendingPostFlushCbs.length) flushJobs(seen);
		}
	}
	function checkRecursiveUpdates(seen, fn) {
		const count = seen.get(fn) || 0;
		if (count > RECURSION_LIMIT) {
			const instance = fn.i;
			const componentName = instance && getComponentName(instance.type);
			handleError(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`, null, 10);
			return true;
		}
		seen.set(fn, count + 1);
		return false;
	}
	var isHmrUpdating = false;
	var setHmrUpdating = (v) => {
		try {
			return isHmrUpdating;
		} finally {
			isHmrUpdating = v;
		}
	};
	var hmrDirtyComponents = /* @__PURE__ */ new Map();
	if (!!(process.env.NODE_ENV !== "production")) getGlobalThis$1().__VUE_HMR_RUNTIME__ = {
		createRecord: tryWrap(createRecord),
		rerender: tryWrap(rerender),
		reload: tryWrap(reload)
	};
	var map = /* @__PURE__ */ new Map();
	function registerHMR(instance) {
		const id = instance.type.__hmrId;
		let record = map.get(id);
		if (!record) {
			createRecord(id, instance.type);
			record = map.get(id);
		}
		record.instances.add(instance);
	}
	function unregisterHMR(instance) {
		map.get(instance.type.__hmrId).instances.delete(instance);
	}
	function createRecord(id, initialDef) {
		if (map.has(id)) return false;
		map.set(id, {
			initialDef: normalizeClassComponent(initialDef),
			instances: /* @__PURE__ */ new Set()
		});
		return true;
	}
	function normalizeClassComponent(component) {
		return isClassComponent(component) ? component.__vccOpts : component;
	}
	function rerender(id, newRender) {
		const record = map.get(id);
		if (!record) return;
		record.initialDef.render = newRender;
		[...record.instances].forEach((instance) => {
			if (newRender) {
				instance.render = newRender;
				normalizeClassComponent(instance.type).render = newRender;
			}
			instance.renderCache = [];
			isHmrUpdating = true;
			if (!(instance.job.flags & 8)) instance.update();
			isHmrUpdating = false;
		});
	}
	function reload(id, newComp) {
		const record = map.get(id);
		if (!record) return;
		newComp = normalizeClassComponent(newComp);
		updateComponentDef(record.initialDef, newComp);
		const instances = [...record.instances];
		for (let i = 0; i < instances.length; i++) {
			const instance = instances[i];
			const oldComp = normalizeClassComponent(instance.type);
			let dirtyInstances = hmrDirtyComponents.get(oldComp);
			if (!dirtyInstances) {
				if (oldComp !== record.initialDef) updateComponentDef(oldComp, newComp);
				hmrDirtyComponents.set(oldComp, dirtyInstances = /* @__PURE__ */ new Set());
			}
			dirtyInstances.add(instance);
			instance.appContext.propsCache.delete(instance.type);
			instance.appContext.emitsCache.delete(instance.type);
			instance.appContext.optionsCache.delete(instance.type);
			if (instance.ceReload) {
				dirtyInstances.add(instance);
				instance.ceReload(newComp.styles);
				dirtyInstances.delete(instance);
			} else if (instance.parent) queueJob(() => {
				if (!(instance.job.flags & 8)) {
					isHmrUpdating = true;
					instance.parent.update();
					isHmrUpdating = false;
					dirtyInstances.delete(instance);
				}
			});
			else if (instance.appContext.reload) instance.appContext.reload();
			else if (typeof window !== "undefined") window.location.reload();
			else console.warn("[HMR] Root or manually mounted instance modified. Full reload required.");
			if (instance.root.ce && instance !== instance.root) instance.root.ce._removeChildStyle(oldComp);
		}
		queuePostFlushCb(() => {
			hmrDirtyComponents.clear();
		});
	}
	function updateComponentDef(oldComp, newComp) {
		extend(oldComp, newComp);
		for (const key in oldComp) if (key !== "__file" && !(key in newComp)) delete oldComp[key];
	}
	function tryWrap(fn) {
		return (id, arg) => {
			try {
				return fn(id, arg);
			} catch (e) {
				console.error(e);
				console.warn(`[HMR] Something went wrong during Vue component hot-reload. Full reload required.`);
			}
		};
	}
	var devtools$1;
	var buffer = [];
	var devtoolsNotInstalled = false;
	function emit$1(event, ...args) {
		if (devtools$1) devtools$1.emit(event, ...args);
		else if (!devtoolsNotInstalled) buffer.push({
			event,
			args
		});
	}
	function setDevtoolsHook$1(hook, target) {
		var _a, _b;
		devtools$1 = hook;
		if (devtools$1) {
			devtools$1.enabled = true;
			buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
			buffer = [];
		} else if (typeof window !== "undefined" && window.HTMLElement && !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))) {
			(target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((newHook) => {
				setDevtoolsHook$1(newHook, target);
			});
			setTimeout(() => {
				if (!devtools$1) {
					target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
					devtoolsNotInstalled = true;
					buffer = [];
				}
			}, 3e3);
		} else {
			devtoolsNotInstalled = true;
			buffer = [];
		}
	}
	function devtoolsInitApp(app, version) {
		emit$1("app:init", app, version, {
			Fragment,
			Text,
			Comment,
			Static
		});
	}
	function devtoolsUnmountApp(app) {
		emit$1("app:unmount", app);
	}
	var devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook("component:added");
	var devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook("component:updated");
	var _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook("component:removed");
	var devtoolsComponentRemoved = (component) => {
		if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && !devtools$1.cleanupBuffer(component)) _devtoolsComponentRemoved(component);
	};
	// @__NO_SIDE_EFFECTS__
	function createDevtoolsComponentHook(hook) {
		return (component) => {
			emit$1(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : void 0, component);
		};
	}
	var devtoolsPerfStart = /* @__PURE__ */ createDevtoolsPerformanceHook("perf:start");
	var devtoolsPerfEnd = /* @__PURE__ */ createDevtoolsPerformanceHook("perf:end");
	function createDevtoolsPerformanceHook(hook) {
		return (component, type, time) => {
			emit$1(hook, component.appContext.app, component.uid, component, type, time);
		};
	}
	function devtoolsComponentEmit(component, event, params) {
		emit$1("component:emit", component.appContext.app, component, event, params);
	}
	var currentRenderingInstance = null;
	var currentScopeId = null;
	function setCurrentRenderingInstance(instance) {
		const prev = currentRenderingInstance;
		currentRenderingInstance = instance;
		currentScopeId = instance && instance.type.__scopeId || null;
		return prev;
	}
	function pushScopeId(id) {
		currentScopeId = id;
	}
	function popScopeId() {
		currentScopeId = null;
	}
	var withScopeId = (_id) => withCtx;
	function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
		if (!ctx) return fn;
		if (fn._n) return fn;
		const renderFnWithContext = (...args) => {
			if (renderFnWithContext._d) setBlockTracking(-1);
			const prevInstance = setCurrentRenderingInstance(ctx);
			let res;
			try {
				res = fn(...args);
			} finally {
				setCurrentRenderingInstance(prevInstance);
				if (renderFnWithContext._d) setBlockTracking(1);
			}
			if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentUpdated(ctx);
			return res;
		};
		renderFnWithContext._n = true;
		renderFnWithContext._c = true;
		renderFnWithContext._d = true;
		return renderFnWithContext;
	}
	function validateDirectiveName(name) {
		if (isBuiltInDirective(name)) warn$1("Do not use built-in directive ids as custom directive id: " + name);
	}
	function withDirectives(vnode, directives) {
		if (currentRenderingInstance === null) {
			process.env.NODE_ENV !== "production" && warn$1(`withDirectives can only be used inside render functions.`);
			return vnode;
		}
		const instance = getComponentPublicInstance(currentRenderingInstance);
		const bindings = vnode.dirs || (vnode.dirs = []);
		for (let i = 0; i < directives.length; i++) {
			let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
			if (dir) {
				if (isFunction$1(dir)) dir = {
					mounted: dir,
					updated: dir
				};
				if (dir.deep) traverse(value);
				bindings.push({
					dir,
					instance,
					value,
					oldValue: void 0,
					arg,
					modifiers
				});
			}
		}
		return vnode;
	}
	function invokeDirectiveHook(vnode, prevVNode, instance, name) {
		const bindings = vnode.dirs;
		const oldBindings = prevVNode && prevVNode.dirs;
		for (let i = 0; i < bindings.length; i++) {
			const binding = bindings[i];
			if (oldBindings) binding.oldValue = oldBindings[i].value;
			let hook = binding.dir[name];
			if (hook) {
				pauseTracking();
				callWithAsyncErrorHandling(hook, instance, 8, [
					vnode.el,
					binding,
					vnode,
					prevVNode
				]);
				resetTracking();
			}
		}
	}
	function provide(key, value) {
		if (!!(process.env.NODE_ENV !== "production")) {
			if (!currentInstance || currentInstance.isMounted) warn$1(`provide() can only be used inside setup().`);
		}
		if (currentInstance) {
			let provides = currentInstance.provides;
			const parentProvides = currentInstance.parent && currentInstance.parent.provides;
			if (parentProvides === provides) provides = currentInstance.provides = Object.create(parentProvides);
			provides[key] = value;
		}
	}
	function inject(key, defaultValue, treatDefaultAsFactory = false) {
		const instance = getCurrentInstance();
		if (instance || currentApp) {
			let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
			if (provides && key in provides) return provides[key];
			else if (arguments.length > 1) return treatDefaultAsFactory && isFunction$1(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
			else if (!!(process.env.NODE_ENV !== "production")) warn$1(`injection "${String(key)}" not found.`);
		} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`inject() can only be used inside setup() or functional components.`);
	}
	function hasInjectionContext() {
		return !!(getCurrentInstance() || currentApp);
	}
	var ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
	var useSSRContext = () => {
		{
			const ctx = inject(ssrContextKey);
			if (!ctx) process.env.NODE_ENV !== "production" && warn$1(`Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build.`);
			return ctx;
		}
	};
	function watchEffect(effect, options) {
		return doWatch(effect, null, options);
	}
	function watchPostEffect(effect, options) {
		return doWatch(effect, null, !!(process.env.NODE_ENV !== "production") ? extend({}, options, { flush: "post" }) : { flush: "post" });
	}
	function watchSyncEffect(effect, options) {
		return doWatch(effect, null, !!(process.env.NODE_ENV !== "production") ? extend({}, options, { flush: "sync" }) : { flush: "sync" });
	}
	function watch(source, cb, options) {
		if (!!(process.env.NODE_ENV !== "production") && !isFunction$1(cb)) warn$1(`\`watch(fn, options?)\` signature has been moved to a separate API. Use \`watchEffect(fn, options?)\` instead. \`watch\` now only supports \`watch(source, cb, options?) signature.`);
		return doWatch(source, cb, options);
	}
	function doWatch(source, cb, options = EMPTY_OBJ) {
		const { immediate, deep, flush, once } = options;
		if (!!(process.env.NODE_ENV !== "production") && !cb) {
			if (immediate !== void 0) warn$1(`watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.`);
			if (deep !== void 0) warn$1(`watch() "deep" option is only respected when using the watch(source, callback, options?) signature.`);
			if (once !== void 0) warn$1(`watch() "once" option is only respected when using the watch(source, callback, options?) signature.`);
		}
		const baseWatchOptions = extend({}, options);
		if (!!(process.env.NODE_ENV !== "production")) baseWatchOptions.onWarn = warn$1;
		const runsImmediately = cb && immediate || !cb && flush !== "post";
		let ssrCleanup;
		if (isInSSRComponentSetup) {
			if (flush === "sync") {
				const ctx = useSSRContext();
				ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
			} else if (!runsImmediately) {
				const watchStopHandle = () => {};
				watchStopHandle.stop = NOOP;
				watchStopHandle.resume = NOOP;
				watchStopHandle.pause = NOOP;
				return watchStopHandle;
			}
		}
		const instance = currentInstance;
		baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
		let isPre = false;
		if (flush === "post") baseWatchOptions.scheduler = (job) => {
			queuePostRenderEffect(job, instance && instance.suspense);
		};
		else if (flush !== "sync") {
			isPre = true;
			baseWatchOptions.scheduler = (job, isFirstRun) => {
				if (isFirstRun) job();
				else queueJob(job);
			};
		}
		baseWatchOptions.augmentJob = (job) => {
			if (cb) job.flags |= 4;
			if (isPre) {
				job.flags |= 2;
				if (instance) {
					job.id = instance.uid;
					job.i = instance;
				}
			}
		};
		const watchHandle = watch$1(source, cb, baseWatchOptions);
		if (isInSSRComponentSetup) {
			if (ssrCleanup) ssrCleanup.push(watchHandle);
			else if (runsImmediately) watchHandle();
		}
		return watchHandle;
	}
	function instanceWatch(source, value, options) {
		const publicThis = this.proxy;
		const getter = isString$1(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
		let cb;
		if (isFunction$1(value)) cb = value;
		else {
			cb = value.handler;
			options = value;
		}
		const reset = setCurrentInstance(this);
		const res = doWatch(getter, cb.bind(publicThis), options);
		reset();
		return res;
	}
	function createPathGetter(ctx, path) {
		const segments = path.split(".");
		return () => {
			let cur = ctx;
			for (let i = 0; i < segments.length && cur; i++) cur = cur[segments[i]];
			return cur;
		};
	}
	var pendingMounts = /* @__PURE__ */ new WeakMap();
	var TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
	var isTeleport = (type) => type.__isTeleport;
	var isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
	var isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
	var isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
	var isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
	var resolveTarget = (props, select) => {
		const targetSelector = props && props.to;
		if (isString$1(targetSelector)) if (!select) {
			process.env.NODE_ENV !== "production" && warn$1(`Current renderer does not support string target for Teleports. (missing querySelector renderer option)`);
			return null;
		} else {
			const target = select(targetSelector);
			if (!!(process.env.NODE_ENV !== "production") && !target && !isTeleportDisabled(props)) warn$1(`Failed to locate Teleport target with selector "${targetSelector}". Note the target element must exist before the component is mounted - i.e. the target cannot be rendered by the component itself, and ideally should be outside of the entire Vue component tree.`);
			return target;
		}
		else {
			if (!!(process.env.NODE_ENV !== "production") && !targetSelector && !isTeleportDisabled(props)) warn$1(`Invalid Teleport target: ${targetSelector}`);
			return targetSelector;
		}
	};
	var TeleportImpl = {
		name: "Teleport",
		__isTeleport: true,
		process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
			const { mc: mountChildren, pc: patchChildren, pbc: patchBlockChildren, o: { insert, querySelector, createText, createComment, parentNode } } = internals;
			const disabled = isTeleportDisabled(n2.props);
			let { dynamicChildren } = n2;
			if (!!(process.env.NODE_ENV !== "production") && isHmrUpdating) {
				optimized = false;
				dynamicChildren = null;
			}
			const mount = (vnode, container2, anchor2) => {
				if (vnode.shapeFlag & 16) mountChildren(vnode.children, container2, anchor2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			};
			const mountToTarget = (vnode = n2) => {
				const disabled2 = isTeleportDisabled(vnode.props);
				const target = vnode.target = resolveTarget(vnode.props, querySelector);
				const targetAnchor = prepareAnchor(target, vnode, createText, insert);
				if (target) {
					if (namespace !== "svg" && isTargetSVG(target)) namespace = "svg";
					else if (namespace !== "mathml" && isTargetMathML(target)) namespace = "mathml";
					if (parentComponent && parentComponent.isCE) (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
					if (!disabled2) {
						mount(vnode, target, targetAnchor);
						updateCssVars(vnode, false);
					}
				} else if (!!(process.env.NODE_ENV !== "production") && !disabled2) warn$1("Invalid Teleport target on mount:", target, `(${typeof target})`);
			};
			const queuePendingMount = (vnode) => {
				const mountJob = () => {
					if (pendingMounts.get(vnode) !== mountJob) return;
					pendingMounts.delete(vnode);
					if (isTeleportDisabled(vnode.props)) {
						const mountContainer = parentNode(vnode.el) || container;
						mount(vnode, mountContainer, vnode.anchor);
						updateCssVars(vnode, true);
					}
					mountToTarget(vnode);
				};
				pendingMounts.set(vnode, mountJob);
				queuePostRenderEffect(mountJob, parentSuspense);
			};
			if (n1 == null) {
				const placeholder = n2.el = !!(process.env.NODE_ENV !== "production") ? createComment("teleport start") : createText("");
				const mainAnchor = n2.anchor = !!(process.env.NODE_ENV !== "production") ? createComment("teleport end") : createText("");
				insert(placeholder, container, anchor);
				insert(mainAnchor, container, anchor);
				if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
					queuePendingMount(n2);
					return;
				}
				if (disabled) {
					mount(n2, container, mainAnchor);
					updateCssVars(n2, true);
				}
				mountToTarget();
			} else {
				n2.el = n1.el;
				const mainAnchor = n2.anchor = n1.anchor;
				const pendingMount = pendingMounts.get(n1);
				if (pendingMount) {
					pendingMount.flags |= 8;
					pendingMounts.delete(n1);
					queuePendingMount(n2);
					return;
				}
				n2.targetStart = n1.targetStart;
				const target = n2.target = n1.target;
				const targetAnchor = n2.targetAnchor = n1.targetAnchor;
				const wasDisabled = isTeleportDisabled(n1.props);
				const currentContainer = wasDisabled ? container : target;
				const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
				if (namespace === "svg" || isTargetSVG(target)) namespace = "svg";
				else if (namespace === "mathml" || isTargetMathML(target)) namespace = "mathml";
				if (dynamicChildren) {
					patchBlockChildren(n1.dynamicChildren, dynamicChildren, currentContainer, parentComponent, parentSuspense, namespace, slotScopeIds);
					traverseStaticChildren(n1, n2, !!!(process.env.NODE_ENV !== "production"));
				} else if (!optimized) patchChildren(n1, n2, currentContainer, currentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, false);
				if (disabled) {
					if (!wasDisabled) moveTeleport(n2, container, mainAnchor, internals, 1);
					else if (n2.props && n1.props && n2.props.to !== n1.props.to) n2.props.to = n1.props.to;
				} else if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
					const nextTarget = resolveTarget(n2.props, querySelector);
					if (nextTarget) {
						n2.target = nextTarget;
						moveTeleport(n2, nextTarget, null, internals, 0);
					} else if (!!(process.env.NODE_ENV !== "production")) warn$1("Invalid Teleport target on update:", target, `(${typeof target})`);
				} else if (wasDisabled) moveTeleport(n2, target, targetAnchor, internals, 1);
				updateCssVars(n2, disabled);
			}
		},
		remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
			const { shapeFlag, children, anchor, targetStart, targetAnchor, target, props } = vnode;
			const disabled = isTeleportDisabled(props);
			const shouldRemove = doRemove || !disabled;
			const pendingMount = pendingMounts.get(vnode);
			if (pendingMount) {
				pendingMount.flags |= 8;
				pendingMounts.delete(vnode);
			}
			if (target) {
				hostRemove(targetStart);
				hostRemove(targetAnchor);
			}
			doRemove && hostRemove(anchor);
			if (!pendingMount && (disabled || target) && shapeFlag & 16) for (let i = 0; i < children.length; i++) {
				const child = children[i];
				unmount(child, parentComponent, parentSuspense, shouldRemove, !!child.dynamicChildren);
			}
		},
		move: moveTeleport,
		hydrate: hydrateTeleport
	};
	function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
		if (moveType === 0) insert(vnode.targetAnchor, container, parentAnchor);
		const { el, anchor, shapeFlag, children, props } = vnode;
		const isReorder = moveType === 2;
		if (isReorder) insert(el, container, parentAnchor);
		if (!pendingMounts.has(vnode) && (!isReorder || isTeleportDisabled(props))) {
			if (shapeFlag & 16) for (let i = 0; i < children.length; i++) move(children[i], container, parentAnchor, 2);
		}
		if (isReorder) insert(anchor, container, parentAnchor);
	}
	function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, { o: { nextSibling, parentNode, querySelector, insert, createText } }, hydrateChildren) {
		function hydrateAnchor(target2, targetNode) {
			let targetAnchor = targetNode;
			while (targetAnchor) {
				if (targetAnchor && targetAnchor.nodeType === 8) {
					if (targetAnchor.data === "teleport start anchor") vnode.targetStart = targetAnchor;
					else if (targetAnchor.data === "teleport anchor") {
						vnode.targetAnchor = targetAnchor;
						target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
						break;
					}
				}
				targetAnchor = nextSibling(targetAnchor);
			}
		}
		function hydrateDisabledTeleport(node2, vnode2) {
			vnode2.anchor = hydrateChildren(nextSibling(node2), vnode2, parentNode(node2), parentComponent, parentSuspense, slotScopeIds, optimized);
		}
		const target = vnode.target = resolveTarget(vnode.props, querySelector);
		const disabled = isTeleportDisabled(vnode.props);
		if (target) {
			const targetNode = target._lpa || target.firstChild;
			if (vnode.shapeFlag & 16) if (disabled) {
				hydrateDisabledTeleport(node, vnode);
				hydrateAnchor(target, targetNode);
				if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert, parentNode(node) === target ? node : null);
			} else {
				vnode.anchor = nextSibling(node);
				hydrateAnchor(target, targetNode);
				if (!vnode.targetAnchor) prepareAnchor(target, vnode, createText, insert);
				hydrateChildren(targetNode && nextSibling(targetNode), vnode, target, parentComponent, parentSuspense, slotScopeIds, optimized);
			}
			updateCssVars(vnode, disabled);
		} else if (disabled) {
			if (vnode.shapeFlag & 16) {
				hydrateDisabledTeleport(node, vnode);
				vnode.targetStart = node;
				vnode.targetAnchor = nextSibling(node);
			}
		}
		return vnode.anchor && nextSibling(vnode.anchor);
	}
	var Teleport = TeleportImpl;
	function updateCssVars(vnode, isDisabled) {
		const ctx = vnode.ctx;
		if (ctx && ctx.ut) {
			let node, anchor;
			if (isDisabled) {
				node = vnode.el;
				anchor = vnode.anchor;
			} else {
				node = vnode.targetStart;
				anchor = vnode.targetAnchor;
			}
			while (node && node !== anchor) {
				if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
				node = node.nextSibling;
			}
			ctx.ut();
		}
	}
	function prepareAnchor(target, vnode, createText, insert, anchor = null) {
		const targetStart = vnode.targetStart = createText("");
		const targetAnchor = vnode.targetAnchor = createText("");
		targetStart[TeleportEndKey] = targetAnchor;
		if (target) {
			insert(targetStart, target, anchor);
			insert(targetAnchor, target, anchor);
		}
		return targetAnchor;
	}
	var leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
	var enterCbKey$1 = /* @__PURE__ */ Symbol("_enterCb");
	function useTransitionState() {
		const state = {
			isMounted: false,
			isLeaving: false,
			isUnmounting: false,
			leavingVNodes: /* @__PURE__ */ new Map()
		};
		onMounted(() => {
			state.isMounted = true;
		});
		onBeforeUnmount(() => {
			state.isUnmounting = true;
		});
		return state;
	}
	var TransitionHookValidator = [Function, Array];
	var BaseTransitionPropsValidators = {
		mode: String,
		appear: Boolean,
		persisted: Boolean,
		onBeforeEnter: TransitionHookValidator,
		onEnter: TransitionHookValidator,
		onAfterEnter: TransitionHookValidator,
		onEnterCancelled: TransitionHookValidator,
		onBeforeLeave: TransitionHookValidator,
		onLeave: TransitionHookValidator,
		onAfterLeave: TransitionHookValidator,
		onLeaveCancelled: TransitionHookValidator,
		onBeforeAppear: TransitionHookValidator,
		onAppear: TransitionHookValidator,
		onAfterAppear: TransitionHookValidator,
		onAppearCancelled: TransitionHookValidator
	};
	var recursiveGetSubtree = (instance) => {
		const subTree = instance.subTree;
		return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
	};
	var BaseTransitionImpl = {
		name: `BaseTransition`,
		props: BaseTransitionPropsValidators,
		setup(props, { slots }) {
			const instance = getCurrentInstance();
			const state = useTransitionState();
			return () => {
				const children = slots.default && getTransitionRawChildren(slots.default(), true);
				const child = children && children.length ? findNonCommentChild(children) : instance.subTree ? createCommentVNode() : void 0;
				if (!child) return;
				const rawProps = /* @__PURE__ */ toRaw(props);
				const { mode } = rawProps;
				if (!!(process.env.NODE_ENV !== "production") && mode && mode !== "in-out" && mode !== "out-in" && mode !== "default") warn$1(`invalid <transition> mode: ${mode}`);
				if (state.isLeaving) return emptyPlaceholder(child);
				const innerChild = getInnerChild$1(child);
				if (!innerChild) return emptyPlaceholder(child);
				let enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance, (hooks) => enterHooks = hooks);
				if (innerChild.type !== Comment) setTransitionHooks(innerChild, enterHooks);
				let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
				if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
					let leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
					setTransitionHooks(oldInnerChild, leavingHooks);
					if (mode === "out-in" && innerChild.type !== Comment) {
						state.isLeaving = true;
						leavingHooks.afterLeave = () => {
							state.isLeaving = false;
							if (!(instance.job.flags & 8)) instance.update();
							delete leavingHooks.afterLeave;
							oldInnerChild = void 0;
						};
						return emptyPlaceholder(child);
					} else if (mode === "in-out" && innerChild.type !== Comment) leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
						const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
						leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
						el[leaveCbKey] = () => {
							earlyRemove();
							el[leaveCbKey] = void 0;
							delete enterHooks.delayedLeave;
							oldInnerChild = void 0;
						};
						enterHooks.delayedLeave = () => {
							delayedLeave();
							delete enterHooks.delayedLeave;
							oldInnerChild = void 0;
						};
					};
					else oldInnerChild = void 0;
				} else if (oldInnerChild) oldInnerChild = void 0;
				return child;
			};
		}
	};
	function findNonCommentChild(children) {
		let child = children[0];
		if (children.length > 1) {
			let hasFound = false;
			for (const c of children) if (c.type !== Comment) {
				if (!!(process.env.NODE_ENV !== "production") && hasFound) {
					warn$1("<transition> can only be used on a single element or component. Use <transition-group> for lists.");
					break;
				}
				child = c;
				hasFound = true;
				if (!!!(process.env.NODE_ENV !== "production")) break;
			}
		}
		return child;
	}
	var BaseTransition = BaseTransitionImpl;
	function getLeavingNodesForType(state, vnode) {
		const { leavingVNodes } = state;
		let leavingVNodesCache = leavingVNodes.get(vnode.type);
		if (!leavingVNodesCache) {
			leavingVNodesCache = /* @__PURE__ */ Object.create(null);
			leavingVNodes.set(vnode.type, leavingVNodesCache);
		}
		return leavingVNodesCache;
	}
	function resolveTransitionHooks(vnode, props, state, instance, postClone) {
		const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
		const key = String(vnode.key);
		const leavingVNodesCache = getLeavingNodesForType(state, vnode);
		const callHook = (hook, args) => {
			hook && callWithAsyncErrorHandling(hook, instance, 9, args);
		};
		const callAsyncHook = (hook, args) => {
			const done = args[1];
			callHook(hook, args);
			if (isArray$1(hook)) {
				if (hook.every((hook2) => hook2.length <= 1)) done();
			} else if (hook.length <= 1) done();
		};
		const hooks = {
			mode,
			persisted,
			beforeEnter(el) {
				let hook = onBeforeEnter;
				if (!state.isMounted) if (appear) hook = onBeforeAppear || onBeforeEnter;
				else return;
				if (el[leaveCbKey]) el[leaveCbKey](true);
				const leavingVNode = leavingVNodesCache[key];
				if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) leavingVNode.el[leaveCbKey]();
				callHook(hook, [el]);
			},
			enter(el) {
				if (!isHmrUpdating && leavingVNodesCache[key] === vnode) return;
				let hook = onEnter;
				let afterHook = onAfterEnter;
				let cancelHook = onEnterCancelled;
				if (!state.isMounted) if (appear) {
					hook = onAppear || onEnter;
					afterHook = onAfterAppear || onAfterEnter;
					cancelHook = onAppearCancelled || onEnterCancelled;
				} else return;
				let called = false;
				el[enterCbKey$1] = (cancelled) => {
					if (called) return;
					called = true;
					if (cancelled) callHook(cancelHook, [el]);
					else callHook(afterHook, [el]);
					if (hooks.delayedLeave) hooks.delayedLeave();
					el[enterCbKey$1] = void 0;
				};
				const done = el[enterCbKey$1].bind(null, false);
				if (hook) callAsyncHook(hook, [el, done]);
				else done();
			},
			leave(el, remove) {
				const key2 = String(vnode.key);
				if (el[enterCbKey$1]) el[enterCbKey$1](true);
				if (state.isUnmounting) return remove();
				callHook(onBeforeLeave, [el]);
				let called = false;
				el[leaveCbKey] = (cancelled) => {
					if (called) return;
					called = true;
					remove();
					if (cancelled) callHook(onLeaveCancelled, [el]);
					else callHook(onAfterLeave, [el]);
					el[leaveCbKey] = void 0;
					if (leavingVNodesCache[key2] === vnode) delete leavingVNodesCache[key2];
				};
				const done = el[leaveCbKey].bind(null, false);
				leavingVNodesCache[key2] = vnode;
				if (onLeave) callAsyncHook(onLeave, [el, done]);
				else done();
			},
			clone(vnode2) {
				const hooks2 = resolveTransitionHooks(vnode2, props, state, instance, postClone);
				if (postClone) postClone(hooks2);
				return hooks2;
			}
		};
		return hooks;
	}
	function emptyPlaceholder(vnode) {
		if (isKeepAlive(vnode)) {
			vnode = cloneVNode(vnode);
			vnode.children = null;
			return vnode;
		}
	}
	function getInnerChild$1(vnode) {
		if (!isKeepAlive(vnode)) {
			if (isTeleport(vnode.type) && vnode.children) return findNonCommentChild(vnode.children);
			return vnode;
		}
		if (vnode.component) return vnode.component.subTree;
		const { shapeFlag, children } = vnode;
		if (children) {
			if (shapeFlag & 16) return children[0];
			if (shapeFlag & 32 && isFunction$1(children.default)) return children.default();
		}
	}
	function setTransitionHooks(vnode, hooks) {
		if (vnode.shapeFlag & 6 && vnode.component) {
			vnode.transition = hooks;
			setTransitionHooks(vnode.component.subTree, hooks);
		} else if (vnode.shapeFlag & 128) {
			vnode.ssContent.transition = hooks.clone(vnode.ssContent);
			vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
		} else vnode.transition = hooks;
	}
	function getTransitionRawChildren(children, keepComment = false, parentKey) {
		let ret = [];
		let keyedFragmentCount = 0;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
			if (child.type === Fragment) {
				if (child.patchFlag & 128) keyedFragmentCount++;
				ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
			} else if (keepComment || child.type !== Comment) ret.push(key != null ? cloneVNode(child, { key }) : child);
		}
		if (keyedFragmentCount > 1) for (let i = 0; i < ret.length; i++) ret[i].patchFlag = -2;
		return ret;
	}
	// @__NO_SIDE_EFFECTS__
	function defineComponent(options, extraOptions) {
		return isFunction$1(options) ? /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))() : options;
	}
	function useId$1() {
		const i = getCurrentInstance();
		if (i) return (i.appContext.config.idPrefix || "v") + "-" + i.ids[0] + i.ids[1]++;
		else if (!!(process.env.NODE_ENV !== "production")) warn$1(`useId() is called when there is no active component instance to be associated with.`);
		return "";
	}
	function markAsyncBoundary(instance) {
		instance.ids = [
			instance.ids[0] + instance.ids[2]++ + "-",
			0,
			0
		];
	}
	var knownTemplateRefs = /* @__PURE__ */ new WeakSet();
	function useTemplateRef(key) {
		const i = getCurrentInstance();
		const r = /* @__PURE__ */ shallowRef(null);
		if (i) {
			const refs = i.refs === EMPTY_OBJ ? i.refs = {} : i.refs;
			if (!!(process.env.NODE_ENV !== "production") && isTemplateRefKey(refs, key)) warn$1(`useTemplateRef('${key}') already exists.`);
			else Object.defineProperty(refs, key, {
				enumerable: true,
				get: () => r.value,
				set: (val) => r.value = val
			});
		} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`useTemplateRef() is called when there is no active component instance to be associated with.`);
		const ret = !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ readonly(r) : r;
		if (!!(process.env.NODE_ENV !== "production")) knownTemplateRefs.add(ret);
		return ret;
	}
	function isTemplateRefKey(refs, key) {
		let desc;
		return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
	}
	var pendingSetRefMap = /* @__PURE__ */ new WeakMap();
	function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
		if (isArray$1(rawRef)) {
			rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
			return;
		}
		if (isAsyncWrapper(vnode) && !isUnmount) {
			if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
			return;
		}
		const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
		const value = isUnmount ? null : refValue;
		const { i: owner, r: ref } = rawRef;
		if (!!(process.env.NODE_ENV !== "production") && !owner) {
			warn$1(`Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.`);
			return;
		}
		const oldRef = oldRawRef && oldRawRef.r;
		const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
		const setupState = owner.setupState;
		const rawSetupState = /* @__PURE__ */ toRaw(setupState);
		const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
			if (!!(process.env.NODE_ENV !== "production")) {
				if (hasOwn$1(rawSetupState, key) && !/* @__PURE__ */ isRef(rawSetupState[key])) warn$1(`Template ref "${key}" used on a non-ref value. It will not work in the production build.`);
				if (knownTemplateRefs.has(rawSetupState[key])) return false;
			}
			if (isTemplateRefKey(refs, key)) return false;
			return hasOwn$1(rawSetupState, key);
		};
		const canSetRef = (ref2, key) => {
			if (!!(process.env.NODE_ENV !== "production") && knownTemplateRefs.has(ref2)) return false;
			if (key && isTemplateRefKey(refs, key)) return false;
			return true;
		};
		if (oldRef != null && oldRef !== ref) {
			invalidatePendingSetRef(oldRawRef);
			if (isString$1(oldRef)) {
				refs[oldRef] = null;
				if (canSetSetupRef(oldRef)) setupState[oldRef] = null;
			} else if (/* @__PURE__ */ isRef(oldRef)) {
				const oldRawRefAtom = oldRawRef;
				if (canSetRef(oldRef, oldRawRefAtom.k)) oldRef.value = null;
				if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
			}
		}
		if (isFunction$1(ref)) {
			pauseTracking();
			try {
				callWithErrorHandling(ref, owner, 12, [value, refs]);
			} finally {
				resetTracking();
			}
		} else {
			const _isString = isString$1(ref);
			const _isRef = /* @__PURE__ */ isRef(ref);
			if (_isString || _isRef) {
				const doSet = () => {
					if (rawRef.f) {
						const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef(ref) || !rawRef.k ? ref.value : refs[rawRef.k];
						if (isUnmount) isArray$1(existing) && remove(existing, refValue);
						else if (!isArray$1(existing)) if (_isString) {
							refs[ref] = [refValue];
							if (canSetSetupRef(ref)) setupState[ref] = refs[ref];
						} else {
							const newVal = [refValue];
							if (canSetRef(ref, rawRef.k)) ref.value = newVal;
							if (rawRef.k) refs[rawRef.k] = newVal;
						}
						else if (!existing.includes(refValue)) existing.push(refValue);
					} else if (_isString) {
						refs[ref] = value;
						if (canSetSetupRef(ref)) setupState[ref] = value;
					} else if (_isRef) {
						if (canSetRef(ref, rawRef.k)) ref.value = value;
						if (rawRef.k) refs[rawRef.k] = value;
					} else if (!!(process.env.NODE_ENV !== "production")) warn$1("Invalid template ref type:", ref, `(${typeof ref})`);
				};
				if (value) {
					const job = () => {
						doSet();
						pendingSetRefMap.delete(rawRef);
					};
					job.id = -1;
					pendingSetRefMap.set(rawRef, job);
					queuePostRenderEffect(job, parentSuspense);
				} else {
					invalidatePendingSetRef(rawRef);
					doSet();
				}
			} else if (!!(process.env.NODE_ENV !== "production")) warn$1("Invalid template ref type:", ref, `(${typeof ref})`);
		}
	}
	function invalidatePendingSetRef(rawRef) {
		const pendingSetRef = pendingSetRefMap.get(rawRef);
		if (pendingSetRef) {
			pendingSetRef.flags |= 8;
			pendingSetRefMap.delete(rawRef);
		}
	}
	var hasLoggedMismatchError = false;
	var logMismatchError = () => {
		if (hasLoggedMismatchError) return;
		console.error("Hydration completed but contains mismatches.");
		hasLoggedMismatchError = true;
	};
	var isSVGContainer = (container) => container.namespaceURI.includes("svg") && container.tagName !== "foreignObject";
	var isMathMLContainer = (container) => container.namespaceURI.includes("MathML");
	var getContainerType = (container) => {
		if (container.nodeType !== 1) return void 0;
		if (isSVGContainer(container)) return "svg";
		if (isMathMLContainer(container)) return "mathml";
	};
	var isComment = (node) => node.nodeType === 8;
	function createHydrationFunctions(rendererInternals) {
		const { mt: mountComponent, p: patch, o: { patchProp, createText, nextSibling, parentNode, remove, insert, createComment } } = rendererInternals;
		const hydrate = (vnode, container) => {
			if (!container.hasChildNodes()) {
				process.env.NODE_ENV !== "production" && warn$1(`Attempting to hydrate existing markup but container is empty. Performing full mount instead.`);
				patch(null, vnode, container);
				flushPostFlushCbs();
				container._vnode = vnode;
				return;
			}
			hydrateNode(container.firstChild, vnode, null, null, null);
			flushPostFlushCbs();
			container._vnode = vnode;
		};
		const hydrateNode = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized = false) => {
			optimized = optimized || !!vnode.dynamicChildren;
			const isFragmentStart = isComment(node) && node.data === "[";
			const onMismatch = () => handleMismatch(node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragmentStart);
			const { type, ref, shapeFlag, patchFlag } = vnode;
			let domType = node.nodeType;
			vnode.el = node;
			if (!!(process.env.NODE_ENV !== "production") || false) {
				def(node, "__vnode", vnode, true);
				def(node, "__vueParentComponent", parentComponent, true);
			}
			if (patchFlag === -2) {
				optimized = false;
				vnode.dynamicChildren = null;
			}
			let nextNode = null;
			switch (type) {
				case Text:
					if (domType !== 3) if (vnode.children === "") {
						insert(vnode.el = createText(""), parentNode(node), node);
						nextNode = node;
					} else nextNode = onMismatch();
					else {
						if (node.data !== vnode.children) {
							process.env.NODE_ENV !== "production" && warn$1(`Hydration text mismatch in`, node.parentNode, `
  - rendered on server: ${JSON.stringify(node.data)}
  - expected on client: ${JSON.stringify(vnode.children)}`);
							logMismatchError();
							node.data = vnode.children;
						}
						nextNode = nextSibling(node);
					}
					break;
				case Comment:
					if (isTemplateNode(node)) {
						nextNode = nextSibling(node);
						replaceNode(vnode.el = node.content.firstChild, node, parentComponent);
					} else if (domType !== 8 || isFragmentStart) nextNode = onMismatch();
					else nextNode = nextSibling(node);
					break;
				case Static:
					if (isFragmentStart) {
						node = nextSibling(node);
						domType = node.nodeType;
					}
					if (domType === 1 || domType === 3) {
						nextNode = node;
						const needToAdoptContent = !vnode.children.length;
						for (let i = 0; i < vnode.staticCount; i++) {
							if (needToAdoptContent) vnode.children += nextNode.nodeType === 1 ? nextNode.outerHTML : nextNode.data;
							if (i === vnode.staticCount - 1) vnode.anchor = nextNode;
							nextNode = nextSibling(nextNode);
						}
						return isFragmentStart ? nextSibling(nextNode) : nextNode;
					} else onMismatch();
					break;
				case Fragment:
					if (!isFragmentStart) nextNode = onMismatch();
					else nextNode = hydrateFragment(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
					break;
				default: if (shapeFlag & 1) if ((domType !== 1 || vnode.type.toLowerCase() !== node.tagName.toLowerCase()) && !isTemplateNode(node)) nextNode = onMismatch();
				else nextNode = hydrateElement(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
				else if (shapeFlag & 6) {
					vnode.slotScopeIds = slotScopeIds;
					const container = parentNode(node);
					if (isFragmentStart) nextNode = locateClosingAnchor(node);
					else if (isComment(node) && node.data === "teleport start") nextNode = locateClosingAnchor(node, node.data, "teleport end");
					else nextNode = nextSibling(node);
					mountComponent(vnode, container, null, parentComponent, parentSuspense, getContainerType(container), optimized);
					if (isAsyncWrapper(vnode) && !vnode.type.__asyncResolved) {
						let subTree;
						if (isFragmentStart) {
							subTree = createVNode(Fragment);
							subTree.anchor = nextNode ? nextNode.previousSibling : container.lastChild;
						} else subTree = node.nodeType === 3 ? createTextVNode("") : createVNode("div");
						subTree.el = node;
						vnode.component.subTree = subTree;
					}
				} else if (shapeFlag & 64) if (domType !== 8) nextNode = onMismatch();
				else nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, rendererInternals, hydrateChildren);
				else if (shapeFlag & 128) nextNode = vnode.type.hydrate(node, vnode, parentComponent, parentSuspense, getContainerType(parentNode(node)), slotScopeIds, optimized, rendererInternals, hydrateNode);
				else if (!!(process.env.NODE_ENV !== "production") || false) warn$1("Invalid HostVNode type:", type, `(${typeof type})`);
			}
			if (ref != null) setRef(ref, null, parentSuspense, vnode);
			return nextNode;
		};
		const hydrateElement = (el, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
			optimized = optimized || !!vnode.dynamicChildren;
			const { type, dynamicProps, props, patchFlag, shapeFlag, dirs, transition } = vnode;
			const forcePatch = type === "input" || type === "option";
			const hasDynamicProps = !!dynamicProps;
			if (!!(process.env.NODE_ENV !== "production") || forcePatch || hasDynamicProps || patchFlag !== -1) {
				if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
				let needCallTransitionHooks = false;
				if (isTemplateNode(el)) {
					needCallTransitionHooks = needTransition(null, transition) && parentComponent && parentComponent.vnode.props && parentComponent.vnode.props.appear;
					const content = el.content.firstChild;
					if (needCallTransitionHooks) {
						const cls = content.getAttribute("class");
						if (cls) content.$cls = cls;
						transition.beforeEnter(content);
					}
					replaceNode(content, el, parentComponent);
					vnode.el = el = content;
				}
				if (shapeFlag & 16 && !(props && (props.innerHTML || props.textContent))) {
					let next = hydrateChildren(el.firstChild, vnode, el, parentComponent, parentSuspense, slotScopeIds, optimized);
					if (next && !isMismatchAllowed(el, 1)) {
						process.env.NODE_ENV !== "production" && warn$1(`Hydration children mismatch on`, el, `
Server rendered element contains more child nodes than client vdom.`);
						logMismatchError();
					}
					while (next) {
						const cur = next;
						next = next.nextSibling;
						remove(cur);
					}
				} else if (shapeFlag & 8) {
					let clientText = vnode.children;
					if (clientText[0] === "\n" && (el.tagName === "PRE" || el.tagName === "TEXTAREA")) clientText = clientText.slice(1);
					const { textContent } = el;
					if (textContent !== clientText && textContent !== clientText.replace(/\r\n|\r/g, "\n")) {
						if (!isMismatchAllowed(el, 0)) {
							process.env.NODE_ENV !== "production" && warn$1(`Hydration text content mismatch on`, el, `
  - rendered on server: ${textContent}
  - expected on client: ${clientText}`);
							logMismatchError();
						}
						el.textContent = vnode.children;
					}
				}
				if (props) {
					if (!!(process.env.NODE_ENV !== "production") || forcePatch || hasDynamicProps || !optimized || patchFlag & 48) {
						const isCustomElement = el.tagName.includes("-");
						for (const key in props) {
							if ((!!(process.env.NODE_ENV !== "production") || false) && !(dirs && dirs.some((d) => d.dir.created)) && propHasMismatch(el, key, props[key], vnode, parentComponent)) logMismatchError();
							if (forcePatch && (key.endsWith("value") || key === "indeterminate") || isOn(key) && !isReservedProp(key) || key[0] === "." || isCustomElement && !isReservedProp(key) || dynamicProps && dynamicProps.includes(key)) patchProp(el, key, null, props[key], void 0, parentComponent);
						}
					} else if (props.onClick) patchProp(el, "onClick", null, props.onClick, void 0, parentComponent);
					else if (patchFlag & 4 && /* @__PURE__ */ isReactive(props.style)) for (const key in props.style) props.style[key];
				}
				let vnodeHooks;
				if (vnodeHooks = props && props.onVnodeBeforeMount) invokeVNodeHook(vnodeHooks, parentComponent, vnode);
				if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
				if ((vnodeHooks = props && props.onVnodeMounted) || dirs || needCallTransitionHooks) queueEffectWithSuspense(() => {
					vnodeHooks && invokeVNodeHook(vnodeHooks, parentComponent, vnode);
					needCallTransitionHooks && transition.enter(el);
					dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
				}, parentSuspense);
			}
			return el.nextSibling;
		};
		const hydrateChildren = (node, parentVNode, container, parentComponent, parentSuspense, slotScopeIds, optimized) => {
			optimized = optimized || !!parentVNode.dynamicChildren;
			const children = parentVNode.children;
			const l = children.length;
			let hasCheckedMismatch = false;
			for (let i = 0; i < l; i++) {
				const vnode = optimized ? children[i] : children[i] = normalizeVNode(children[i]);
				const isText = vnode.type === Text;
				if (node) {
					if (isText && !optimized) {
						if (i + 1 < l && normalizeVNode(children[i + 1]).type === Text) {
							insert(createText(node.data.slice(vnode.children.length)), container, nextSibling(node));
							node.data = vnode.children;
						}
					}
					node = hydrateNode(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized);
				} else if (isText && !vnode.children) insert(vnode.el = createText(""), container);
				else {
					if (!hasCheckedMismatch) {
						hasCheckedMismatch = true;
						if (!isMismatchAllowed(container, 1)) {
							process.env.NODE_ENV !== "production" && warn$1(`Hydration children mismatch on`, container, `
Server rendered element contains fewer child nodes than client vdom.`);
							logMismatchError();
						}
					}
					patch(null, vnode, container, null, parentComponent, parentSuspense, getContainerType(container), slotScopeIds);
				}
			}
			return node;
		};
		const hydrateFragment = (node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized) => {
			const { slotScopeIds: fragmentSlotScopeIds } = vnode;
			if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
			const container = parentNode(node);
			const next = hydrateChildren(nextSibling(node), vnode, container, parentComponent, parentSuspense, slotScopeIds, optimized);
			if (next && isComment(next) && next.data === "]") return nextSibling(vnode.anchor = next);
			else {
				logMismatchError();
				insert(vnode.anchor = createComment(`]`), container, next);
				return next;
			}
		};
		const handleMismatch = (node, vnode, parentComponent, parentSuspense, slotScopeIds, isFragment) => {
			if (!isNodeMismatchAllowed(node, vnode)) {
				process.env.NODE_ENV !== "production" && warn$1(`Hydration node mismatch:
- rendered on server:`, node, node.nodeType === 3 ? `(text)` : isComment(node) && node.data === "[" ? `(start of fragment)` : ``, `
- expected on client:`, vnode.type);
				logMismatchError();
			}
			vnode.el = null;
			if (isFragment) {
				const end = locateClosingAnchor(node);
				while (true) {
					const next2 = nextSibling(node);
					if (next2 && next2 !== end) remove(next2);
					else break;
				}
			}
			const next = nextSibling(node);
			const container = parentNode(node);
			remove(node);
			patch(null, vnode, container, next, parentComponent, parentSuspense, getContainerType(container), slotScopeIds);
			if (parentComponent) {
				parentComponent.vnode.el = vnode.el;
				updateHOCHostEl(parentComponent, vnode.el);
			}
			return next;
		};
		const locateClosingAnchor = (node, open = "[", close = "]") => {
			let match = 0;
			while (node) {
				node = nextSibling(node);
				if (node && isComment(node)) {
					if (node.data === open) match++;
					if (node.data === close) if (match === 0) return nextSibling(node);
					else match--;
				}
			}
			return node;
		};
		const replaceNode = (newNode, oldNode, parentComponent) => {
			const parentNode2 = oldNode.parentNode;
			if (parentNode2) parentNode2.replaceChild(newNode, oldNode);
			let parent = parentComponent;
			while (parent) {
				if (parent.vnode.el === oldNode) parent.vnode.el = parent.subTree.el = newNode;
				parent = parent.parent;
			}
		};
		const isTemplateNode = (node) => {
			return node.nodeType === 1 && node.tagName === "TEMPLATE";
		};
		return [hydrate, hydrateNode];
	}
	function propHasMismatch(el, key, clientValue, vnode, instance) {
		let mismatchType;
		let mismatchKey;
		let actual;
		let expected;
		if (key === "class") {
			if (el.$cls) {
				actual = el.$cls;
				delete el.$cls;
			} else actual = el.getAttribute("class");
			expected = normalizeClass(clientValue);
			if (!isSetEqual(toClassSet(actual || ""), toClassSet(expected))) {
				mismatchType = 2;
				mismatchKey = `class`;
			}
		} else if (key === "style") {
			actual = el.getAttribute("style") || "";
			expected = isString$1(clientValue) ? clientValue : stringifyStyle(normalizeStyle(clientValue));
			const actualMap = toStyleMap(actual);
			const expectedMap = toStyleMap(expected);
			if (vnode.dirs) {
				for (const { dir, value } of vnode.dirs) if (dir.name === "show" && !value) expectedMap.set("display", "none");
			}
			if (instance) resolveCssVars(instance, vnode, expectedMap);
			if (!isMapEqual(actualMap, expectedMap)) {
				mismatchType = 3;
				mismatchKey = "style";
			}
		} else if (el instanceof SVGElement && isKnownSvgAttr(key) || el instanceof HTMLElement && (isBooleanAttr(key) || isKnownHtmlAttr(key))) {
			if (isBooleanAttr(key)) {
				actual = el.hasAttribute(key);
				expected = includeBooleanAttr(clientValue);
			} else if (clientValue == null) {
				actual = el.hasAttribute(key);
				expected = false;
			} else {
				if (el.hasAttribute(key)) actual = el.getAttribute(key);
				else if (key === "value" && el.tagName === "TEXTAREA") actual = el.value;
				else actual = false;
				expected = isRenderableAttrValue(clientValue) ? String(clientValue) : false;
			}
			if (actual !== expected) {
				mismatchType = 4;
				mismatchKey = key;
			}
		}
		if (mismatchType != null && !isMismatchAllowed(el, mismatchType)) {
			const format = (v) => v === false ? `(not rendered)` : `${mismatchKey}="${v}"`;
			warn$1(`Hydration ${MismatchTypeString[mismatchType]} mismatch on`, el, `
  - rendered on server: ${format(actual)}
  - expected on client: ${format(expected)}
  Note: this mismatch is check-only. The DOM will not be rectified in production due to performance overhead.
  You should fix the source of the mismatch.`);
			return true;
		}
		return false;
	}
	function toClassSet(str) {
		return new Set(str.trim().split(/\s+/));
	}
	function isSetEqual(a, b) {
		if (a.size !== b.size) return false;
		for (const s of a) if (!b.has(s)) return false;
		return true;
	}
	function toStyleMap(str) {
		const styleMap = /* @__PURE__ */ new Map();
		for (const item of str.split(";")) {
			let [key, value] = item.split(":");
			key = key.trim();
			value = value && value.trim();
			if (key && value) styleMap.set(key, value);
		}
		return styleMap;
	}
	function isMapEqual(a, b) {
		if (a.size !== b.size) return false;
		for (const [key, value] of a) if (value !== b.get(key)) return false;
		return true;
	}
	function resolveCssVars(instance, vnode, expectedMap) {
		const root = instance.subTree;
		if (instance.getCssVars && (vnode === root || root && root.type === Fragment && root.children.includes(vnode))) {
			const cssVars = instance.getCssVars();
			for (const key in cssVars) {
				const value = normalizeCssVarValue(cssVars[key]);
				expectedMap.set(`--${getEscapedCssVarName(key, false)}`, value);
			}
		}
		if (vnode === root && instance.parent) resolveCssVars(instance.parent, instance.vnode, expectedMap);
	}
	var allowMismatchAttr = "data-allow-mismatch";
	var MismatchTypeString = {
		[0]: "text",
		[1]: "children",
		[2]: "class",
		[3]: "style",
		[4]: "attribute"
	};
	function isMismatchAllowed(el, allowedType) {
		if (allowedType === 0 || allowedType === 1) while (el && !el.hasAttribute(allowMismatchAttr)) el = el.parentElement;
		return isMismatchAllowedByAttr(el && el.getAttribute(allowMismatchAttr), allowedType);
	}
	function isMismatchAllowedByAttr(allowedAttr, allowedType) {
		if (allowedAttr == null) return false;
		else if (allowedAttr === "") return true;
		else {
			const list = allowedAttr.split(",");
			if (allowedType === 0 && list.includes("children")) return true;
			return list.includes(MismatchTypeString[allowedType]);
		}
	}
	function isNodeMismatchAllowed(node, vnode) {
		return isMismatchAllowed(node.parentElement, 1) || isMismatchAllowedByNode(node) || isMismatchAllowedByVNode(vnode);
	}
	function isMismatchAllowedByNode(node) {
		return node.nodeType === 1 && isMismatchAllowedByAttr(node.getAttribute(allowMismatchAttr), 1);
	}
	function isMismatchAllowedByVNode({ props }) {
		const allowedAttr = props && props[allowMismatchAttr];
		return typeof allowedAttr === "string" && isMismatchAllowedByAttr(allowedAttr, 1);
	}
	var requestIdleCallback = getGlobalThis$1().requestIdleCallback || ((cb) => setTimeout(cb, 1));
	var cancelIdleCallback = getGlobalThis$1().cancelIdleCallback || ((id) => clearTimeout(id));
	var hydrateOnIdle = (timeout = 1e4) => (hydrate) => {
		const id = requestIdleCallback(hydrate, { timeout });
		return () => cancelIdleCallback(id);
	};
	function elementIsVisibleInViewport(el) {
		const { top, left, bottom, right } = el.getBoundingClientRect();
		const { innerHeight, innerWidth } = window;
		return (top > 0 && top < innerHeight || bottom > 0 && bottom < innerHeight) && (left > 0 && left < innerWidth || right > 0 && right < innerWidth);
	}
	var hydrateOnVisible = (opts) => (hydrate, forEach) => {
		const ob = new IntersectionObserver((entries) => {
			for (const e of entries) {
				if (!e.isIntersecting) continue;
				ob.disconnect();
				hydrate();
				break;
			}
		}, opts);
		forEach((el) => {
			if (!(el instanceof Element)) return;
			if (elementIsVisibleInViewport(el)) {
				hydrate();
				ob.disconnect();
				return false;
			}
			ob.observe(el);
		});
		return () => ob.disconnect();
	};
	var hydrateOnMediaQuery = (query) => (hydrate) => {
		if (query) {
			const mql = matchMedia(query);
			if (mql.matches) hydrate();
			else {
				mql.addEventListener("change", hydrate, { once: true });
				return () => mql.removeEventListener("change", hydrate);
			}
		}
	};
	var hydrateOnInteraction = (interactions = []) => (hydrate, forEach) => {
		if (isString$1(interactions)) interactions = [interactions];
		let hasHydrated = false;
		const doHydrate = (e) => {
			if (!hasHydrated) {
				hasHydrated = true;
				teardown();
				hydrate();
				e.target.dispatchEvent(new e.constructor(e.type, e));
			}
		};
		const teardown = () => {
			forEach((el) => {
				for (const i of interactions) el.removeEventListener(i, doHydrate);
			});
		};
		forEach((el) => {
			for (const i of interactions) el.addEventListener(i, doHydrate, { once: true });
		});
		return teardown;
	};
	function forEachElement(node, cb) {
		if (isComment(node) && node.data === "[") {
			let depth = 1;
			let next = node.nextSibling;
			while (next) {
				if (next.nodeType === 1) {
					if (cb(next) === false) break;
				} else if (isComment(next)) {
					if (next.data === "]") {
						if (--depth === 0) break;
					} else if (next.data === "[") depth++;
				}
				next = next.nextSibling;
			}
		} else cb(node);
	}
	var isAsyncWrapper = (i) => !!i.type.__asyncLoader;
	// @__NO_SIDE_EFFECTS__
	function defineAsyncComponent(source) {
		if (isFunction$1(source)) source = { loader: source };
		const { loader, loadingComponent, errorComponent, delay = 200, hydrate: hydrateStrategy, timeout, suspensible = true, onError: userOnError } = source;
		let pendingRequest = null;
		let resolvedComp;
		let retries = 0;
		const retry = () => {
			retries++;
			pendingRequest = null;
			return load();
		};
		const load = () => {
			let thisRequest;
			return pendingRequest || (thisRequest = pendingRequest = loader().catch((err) => {
				err = err instanceof Error ? err : new Error(String(err));
				if (userOnError) return new Promise((resolve, reject) => {
					const userRetry = () => resolve(retry());
					const userFail = () => reject(err);
					userOnError(err, userRetry, userFail, retries + 1);
				});
				else throw err;
			}).then((comp) => {
				if (thisRequest !== pendingRequest && pendingRequest) return pendingRequest;
				if (!!(process.env.NODE_ENV !== "production") && !comp) warn$1(`Async component loader resolved to undefined. If you are using retry(), make sure to return its return value.`);
				if (comp && (comp.__esModule || comp[Symbol.toStringTag] === "Module")) comp = comp.default;
				if (!!(process.env.NODE_ENV !== "production") && comp && !isObject$2(comp) && !isFunction$1(comp)) throw new Error(`Invalid async component load result: ${comp}`);
				resolvedComp = comp;
				return comp;
			}));
		};
		return /* @__PURE__ */ defineComponent({
			name: "AsyncComponentWrapper",
			__asyncLoader: load,
			__asyncHydrate(el, instance, hydrate) {
				let patched = false;
				(instance.bu || (instance.bu = [])).push(() => patched = true);
				const performHydrate = () => {
					if (patched) {
						if (!!(process.env.NODE_ENV !== "production")) warn$1(`Skipping lazy hydration for component '${getComponentName(resolvedComp) || resolvedComp.__file}': it was updated before lazy hydration performed.`);
						return;
					}
					hydrate();
				};
				const doHydrate = hydrateStrategy ? () => {
					const teardown = hydrateStrategy(performHydrate, (cb) => forEachElement(el, cb));
					if (teardown) (instance.bum || (instance.bum = [])).push(teardown);
				} : performHydrate;
				if (resolvedComp) doHydrate();
				else load().then(() => !instance.isUnmounted && doHydrate());
			},
			get __asyncResolved() {
				return resolvedComp;
			},
			setup() {
				const instance = currentInstance;
				markAsyncBoundary(instance);
				if (resolvedComp) return () => createInnerComp(resolvedComp, instance);
				const onError = (err) => {
					pendingRequest = null;
					handleError(err, instance, 13, !errorComponent);
				};
				if (suspensible && instance.suspense || isInSSRComponentSetup) return load().then((comp) => {
					return () => createInnerComp(comp, instance);
				}).catch((err) => {
					onError(err);
					return () => errorComponent ? createVNode(errorComponent, { error: err }) : null;
				});
				const loaded = /* @__PURE__ */ ref(false);
				const error = /* @__PURE__ */ ref();
				const delayed = /* @__PURE__ */ ref(!!delay);
				let timeoutTimer;
				let delayTimer;
				onUnmounted(() => {
					if (timeoutTimer != null) clearTimeout(timeoutTimer);
					if (delayTimer != null) clearTimeout(delayTimer);
				});
				if (delay) delayTimer = setTimeout(() => {
					if (instance.isUnmounted) return;
					delayed.value = false;
				}, delay);
				if (timeout != null) timeoutTimer = setTimeout(() => {
					if (instance.isUnmounted) return;
					if (!loaded.value && !error.value) {
						const err = /* @__PURE__ */ new Error(`Async component timed out after ${timeout}ms.`);
						onError(err);
						error.value = err;
					}
				}, timeout);
				load().then(() => {
					if (instance.isUnmounted) return;
					loaded.value = true;
					if (instance.parent && isKeepAlive(instance.parent.vnode)) instance.parent.update();
				}).catch((err) => {
					if (instance.isUnmounted) {
						pendingRequest = null;
						return;
					}
					onError(err);
					error.value = err;
				});
				return () => {
					if (loaded.value && resolvedComp) return createInnerComp(resolvedComp, instance);
					else if (error.value && errorComponent) return createVNode(errorComponent, { error: error.value });
					else if (loadingComponent && !delayed.value) return createInnerComp(loadingComponent, instance);
				};
			}
		});
	}
	function createInnerComp(comp, parent) {
		const { ref: ref2, props, children, ce } = parent.vnode;
		const vnode = createVNode(comp, props, children);
		vnode.ref = ref2;
		vnode.ce = ce;
		delete parent.vnode.ce;
		return vnode;
	}
	var isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
	var KeepAlive = {
		name: `KeepAlive`,
		__isKeepAlive: true,
		props: {
			include: [
				String,
				RegExp,
				Array
			],
			exclude: [
				String,
				RegExp,
				Array
			],
			max: [String, Number]
		},
		setup(props, { slots }) {
			const instance = getCurrentInstance();
			const sharedContext = instance.ctx;
			if (!sharedContext.renderer) return () => {
				const children = slots.default && slots.default();
				return children && children.length === 1 ? children[0] : children;
			};
			const cache = /* @__PURE__ */ new Map();
			const keys = /* @__PURE__ */ new Set();
			let current = null;
			if (!!(process.env.NODE_ENV !== "production") || false) instance.__v_cache = cache;
			const parentSuspense = instance.suspense;
			const { renderer: { p: patch, m: move, um: _unmount, o: { createElement } } } = sharedContext;
			const storageContainer = createElement("div");
			sharedContext.activate = (vnode, container, anchor, namespace, optimized) => {
				const instance2 = vnode.component;
				move(vnode, container, anchor, 0, parentSuspense);
				patch(instance2.vnode, vnode, container, anchor, instance2, parentSuspense, namespace, vnode.slotScopeIds, optimized);
				queuePostRenderEffect(() => {
					instance2.isDeactivated = false;
					if (instance2.a) invokeArrayFns(instance2.a);
					const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
					if (vnodeHook) invokeVNodeHook(vnodeHook, instance2.parent, vnode);
				}, parentSuspense);
				if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentAdded(instance2);
			};
			sharedContext.deactivate = (vnode) => {
				const instance2 = vnode.component;
				invalidateMount(instance2.m);
				invalidateMount(instance2.a);
				move(vnode, storageContainer, null, 1, parentSuspense);
				queuePostRenderEffect(() => {
					if (instance2.da) invokeArrayFns(instance2.da);
					const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
					if (vnodeHook) invokeVNodeHook(vnodeHook, instance2.parent, vnode);
					instance2.isDeactivated = true;
				}, parentSuspense);
				if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentAdded(instance2);
				if (!!(process.env.NODE_ENV !== "production") && true) instance2.__keepAliveStorageContainer = storageContainer;
			};
			function unmount(vnode) {
				resetShapeFlag(vnode);
				_unmount(vnode, instance, parentSuspense, true);
			}
			function pruneCache(filter) {
				cache.forEach((vnode, key) => {
					const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : vnode.type);
					if (name && !filter(name)) pruneCacheEntry(key);
				});
			}
			function pruneCacheEntry(key) {
				const cached = cache.get(key);
				if (cached && (!current || !isSameVNodeType(cached, current))) unmount(cached);
				else if (current) resetShapeFlag(current);
				cache.delete(key);
				keys.delete(key);
			}
			watch(() => [props.include, props.exclude], ([include, exclude]) => {
				include && pruneCache((name) => matches(include, name));
				exclude && pruneCache((name) => !matches(exclude, name));
			}, {
				flush: "post",
				deep: true
			});
			let pendingCacheKey = null;
			const cacheSubtree = () => {
				if (pendingCacheKey != null) if (isSuspense(instance.subTree.type)) queuePostRenderEffect(() => {
					cache.set(pendingCacheKey, getInnerChild(instance.subTree));
				}, instance.subTree.suspense);
				else cache.set(pendingCacheKey, getInnerChild(instance.subTree));
			};
			onMounted(cacheSubtree);
			onUpdated(cacheSubtree);
			onBeforeUnmount(() => {
				cache.forEach((cached) => {
					const { subTree, suspense } = instance;
					const vnode = getInnerChild(subTree);
					if (cached.type === vnode.type && cached.key === vnode.key) {
						resetShapeFlag(vnode);
						const da = vnode.component.da;
						da && queuePostRenderEffect(da, suspense);
						return;
					}
					unmount(cached);
				});
			});
			return () => {
				pendingCacheKey = null;
				if (!slots.default) return current = null;
				const children = slots.default();
				const rawVNode = children[0];
				if (children.length > 1) {
					if (!!(process.env.NODE_ENV !== "production")) warn$1(`KeepAlive should contain exactly one component child.`);
					current = null;
					return children;
				} else if (!isVNode$1(rawVNode) || !(rawVNode.shapeFlag & 4) && !(rawVNode.shapeFlag & 128)) {
					current = null;
					return rawVNode;
				}
				let vnode = getInnerChild(rawVNode);
				if (vnode.type === Comment) {
					current = null;
					return vnode;
				}
				const comp = vnode.type;
				const name = getComponentName(isAsyncWrapper(vnode) ? vnode.type.__asyncResolved || {} : comp);
				const { include, exclude, max } = props;
				if (include && (!name || !matches(include, name)) || exclude && name && matches(exclude, name)) {
					vnode.shapeFlag &= -257;
					current = vnode;
					return rawVNode;
				}
				const key = vnode.key == null ? comp : vnode.key;
				const cachedVNode = cache.get(key);
				if (vnode.el) {
					vnode = cloneVNode(vnode);
					if (rawVNode.shapeFlag & 128) rawVNode.ssContent = vnode;
				}
				pendingCacheKey = key;
				if (cachedVNode) {
					vnode.el = cachedVNode.el;
					vnode.component = cachedVNode.component;
					if (vnode.transition) setTransitionHooks(vnode, vnode.transition);
					vnode.shapeFlag |= 512;
					keys.delete(key);
					keys.add(key);
				} else {
					keys.add(key);
					if (max && keys.size > parseInt(max, 10)) pruneCacheEntry(keys.values().next().value);
				}
				vnode.shapeFlag |= 256;
				current = vnode;
				return isSuspense(rawVNode.type) ? rawVNode : vnode;
			};
		}
	};
	function matches(pattern, name) {
		if (isArray$1(pattern)) return pattern.some((p) => matches(p, name));
		else if (isString$1(pattern)) return pattern.split(",").includes(name);
		else if (isRegExp$1(pattern)) {
			pattern.lastIndex = 0;
			return pattern.test(name);
		}
		return false;
	}
	function onActivated(hook, target) {
		registerKeepAliveHook(hook, "a", target);
	}
	function onDeactivated(hook, target) {
		registerKeepAliveHook(hook, "da", target);
	}
	function registerKeepAliveHook(hook, type, target = currentInstance) {
		const wrappedHook = hook.__wdc || (hook.__wdc = () => {
			let current = target;
			while (current) {
				if (current.isDeactivated) return;
				current = current.parent;
			}
			return hook();
		});
		injectHook(type, wrappedHook, target);
		if (target) {
			let current = target.parent;
			while (current && current.parent) {
				if (isKeepAlive(current.parent.vnode)) injectToKeepAliveRoot(wrappedHook, type, target, current);
				current = current.parent;
			}
		}
	}
	function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
		const injected = injectHook(type, hook, keepAliveRoot, true);
		onUnmounted(() => {
			remove(keepAliveRoot[type], injected);
		}, target);
	}
	function resetShapeFlag(vnode) {
		vnode.shapeFlag &= -257;
		vnode.shapeFlag &= -513;
	}
	function getInnerChild(vnode) {
		return vnode.shapeFlag & 128 ? vnode.ssContent : vnode;
	}
	function injectHook(type, hook, target = currentInstance, prepend = false) {
		if (target) {
			const hooks = target[type] || (target[type] = []);
			const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
				pauseTracking();
				const reset = setCurrentInstance(target);
				const res = callWithAsyncErrorHandling(hook, target, type, args);
				reset();
				resetTracking();
				return res;
			});
			if (prepend) hooks.unshift(wrappedHook);
			else hooks.push(wrappedHook);
			return wrappedHook;
		} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`${toHandlerKey(ErrorTypeStrings$1[type].replace(/ hook$/, ""))} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`);
	}
	var createHook = (lifecycle) => (hook, target = currentInstance) => {
		if (!isInSSRComponentSetup || lifecycle === "sp") injectHook(lifecycle, (...args) => hook(...args), target);
	};
	var onBeforeMount = createHook("bm");
	var onMounted = createHook("m");
	var onBeforeUpdate = createHook("bu");
	var onUpdated = createHook("u");
	var onBeforeUnmount = createHook("bum");
	var onUnmounted = createHook("um");
	var onServerPrefetch = createHook("sp");
	var onRenderTriggered = createHook("rtg");
	var onRenderTracked = createHook("rtc");
	function onErrorCaptured(hook, target = currentInstance) {
		injectHook("ec", hook, target);
	}
	var COMPONENTS = "components";
	var DIRECTIVES = "directives";
	function resolveComponent(name, maybeSelfReference) {
		return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
	}
	var NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
	function resolveDynamicComponent(component) {
		if (isString$1(component)) return resolveAsset(COMPONENTS, component, false) || component;
		else return component || NULL_DYNAMIC_COMPONENT;
	}
	function resolveDirective(name) {
		return resolveAsset(DIRECTIVES, name);
	}
	function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
		const instance = currentRenderingInstance || currentInstance;
		if (instance) {
			const Component = instance.type;
			if (type === COMPONENTS) {
				const selfName = getComponentName(Component, false);
				if (selfName && (selfName === name || selfName === camelize$1(name) || selfName === capitalize$1(camelize$1(name)))) return Component;
			}
			const res = resolve(instance[type] || Component[type], name) || resolve(instance.appContext[type], name);
			if (!res && maybeSelfReference) return Component;
			if (!!(process.env.NODE_ENV !== "production") && warnMissing && !res) {
				const extra = type === COMPONENTS ? `
If this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement.` : ``;
				warn$1(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
			}
			return res;
		} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`resolve${capitalize$1(type.slice(0, -1))} can only be used in render() or setup().`);
	}
	function resolve(registry, name) {
		return registry && (registry[name] || registry[camelize$1(name)] || registry[capitalize$1(camelize$1(name))]);
	}
	function renderList(source, renderItem, cache, index) {
		let ret;
		const cached = cache && cache[index];
		const sourceIsArray = isArray$1(source);
		if (sourceIsArray || isString$1(source)) {
			const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
			let needsWrap = false;
			let isReadonlySource = false;
			if (sourceIsReactiveArray) {
				needsWrap = !/* @__PURE__ */ isShallow(source);
				isReadonlySource = /* @__PURE__ */ isReadonly(source);
				source = shallowReadArray(source);
			}
			ret = new Array(source.length);
			for (let i = 0, l = source.length; i < l; i++) ret[i] = renderItem(needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i], i, void 0, cached && cached[i]);
		} else if (typeof source === "number") if (!!(process.env.NODE_ENV !== "production") && (!Number.isInteger(source) || source < 0)) {
			warn$1(`The v-for range expects a positive integer value but got ${source}.`);
			ret = [];
		} else {
			ret = new Array(source);
			for (let i = 0; i < source; i++) ret[i] = renderItem(i + 1, i, void 0, cached && cached[i]);
		}
		else if (isObject$2(source)) if (source[Symbol.iterator]) ret = Array.from(source, (item, i) => renderItem(item, i, void 0, cached && cached[i]));
		else {
			const keys = Object.keys(source);
			ret = new Array(keys.length);
			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				ret[i] = renderItem(source[key], key, i, cached && cached[i]);
			}
		}
		else ret = [];
		if (cache) cache[index] = ret;
		return ret;
	}
	function createSlots(slots, dynamicSlots) {
		for (let i = 0; i < dynamicSlots.length; i++) {
			const slot = dynamicSlots[i];
			if (isArray$1(slot)) for (let j = 0; j < slot.length; j++) slots[slot[j].name] = slot[j].fn;
			else if (slot) slots[slot.name] = slot.key ? (...args) => {
				const res = slot.fn(...args);
				if (res) res.key = slot.key;
				return res;
			} : slot.fn;
		}
		return slots;
	}
	function renderSlot(slots, name, props = {}, fallback, noSlotted) {
		if (currentRenderingInstance.ce || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.ce) {
			const hasProps = Object.keys(props).length > 0;
			if (name !== "default") props.name = name;
			return openBlock(), createBlock(Fragment, null, [createVNode("slot", props, fallback && fallback())], hasProps ? -2 : 64);
		}
		let slot = slots[name];
		if (!!(process.env.NODE_ENV !== "production") && slot && slot.length > 1) {
			warn$1(`SSR-optimized slot function detected in a non-SSR-optimized render function. You need to mark this component with $dynamic-slots in the parent template.`);
			slot = () => [];
		}
		if (slot && slot._c) slot._d = false;
		openBlock();
		const validSlotContent = slot && ensureValidVNode(slot(props));
		const slotKey = props.key || validSlotContent && validSlotContent.key;
		const rendered = createBlock(Fragment, { key: (slotKey && !isSymbol(slotKey) ? slotKey : `_${name}`) + (!validSlotContent && fallback ? "_fb" : "") }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 ? 64 : -2);
		if (!noSlotted && rendered.scopeId) rendered.slotScopeIds = [rendered.scopeId + "-s"];
		if (slot && slot._c) slot._d = true;
		return rendered;
	}
	function ensureValidVNode(vnodes) {
		return vnodes.some((child) => {
			if (!isVNode$1(child)) return true;
			if (child.type === Comment) return false;
			if (child.type === Fragment && !ensureValidVNode(child.children)) return false;
			return true;
		}) ? vnodes : null;
	}
	function toHandlers(obj, preserveCaseIfNecessary) {
		const ret = {};
		if (!!(process.env.NODE_ENV !== "production") && !isObject$2(obj)) {
			warn$1(`v-on with no argument expects an object value.`);
			return ret;
		}
		for (const key in obj) ret[preserveCaseIfNecessary && /[A-Z]/.test(key) ? `on:${key}` : toHandlerKey(key)] = obj[key];
		return ret;
	}
	var getPublicInstance = (i) => {
		if (!i) return null;
		if (isStatefulComponent(i)) return getComponentPublicInstance(i);
		return getPublicInstance(i.parent);
	};
	var publicPropertiesMap = /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
		$: (i) => i,
		$el: (i) => i.vnode.el,
		$data: (i) => i.data,
		$props: (i) => !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(i.props) : i.props,
		$attrs: (i) => !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(i.attrs) : i.attrs,
		$slots: (i) => !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(i.slots) : i.slots,
		$refs: (i) => !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(i.refs) : i.refs,
		$parent: (i) => getPublicInstance(i.parent),
		$root: (i) => getPublicInstance(i.root),
		$host: (i) => i.ce,
		$emit: (i) => i.emit,
		$options: (i) => resolveMergedOptions(i),
		$forceUpdate: (i) => i.f || (i.f = () => {
			queueJob(i.update);
		}),
		$nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
		$watch: (i) => instanceWatch.bind(i)
	});
	var isReservedPrefix = (key) => key === "_" || key === "$";
	var hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn$1(state, key);
	var PublicInstanceProxyHandlers = {
		get({ _: instance }, key) {
			if (key === "__v_skip") return true;
			const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
			if (!!(process.env.NODE_ENV !== "production") && key === "__isVue") return true;
			if (key[0] !== "$") {
				const n = accessCache[key];
				if (n !== void 0) switch (n) {
					case 1: return setupState[key];
					case 2: return data[key];
					case 4: return ctx[key];
					case 3: return props[key];
				}
				else if (hasSetupBinding(setupState, key)) {
					accessCache[key] = 1;
					return setupState[key];
				} else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
					accessCache[key] = 2;
					return data[key];
				} else if (hasOwn$1(props, key)) {
					accessCache[key] = 3;
					return props[key];
				} else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
					accessCache[key] = 4;
					return ctx[key];
				} else if (shouldCacheAccess) accessCache[key] = 0;
			}
			const publicGetter = publicPropertiesMap[key];
			let cssModule, globalProperties;
			if (publicGetter) {
				if (key === "$attrs") {
					track(instance.attrs, "get", "");
					process.env.NODE_ENV !== "production" && markAttrsAccessed();
				} else if (!!(process.env.NODE_ENV !== "production") && key === "$slots") track(instance, "get", key);
				return publicGetter(instance);
			} else if ((cssModule = type.__cssModules) && (cssModule = cssModule[key])) return cssModule;
			else if (ctx !== EMPTY_OBJ && hasOwn$1(ctx, key)) {
				accessCache[key] = 4;
				return ctx[key];
			} else if (globalProperties = appContext.config.globalProperties, hasOwn$1(globalProperties, key)) return globalProperties[key];
			else if (!!(process.env.NODE_ENV !== "production") && currentRenderingInstance && (!isString$1(key) || key.indexOf("__v") !== 0)) {
				if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn$1(data, key)) warn$1(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`);
				else if (instance === currentRenderingInstance) warn$1(`Property ${JSON.stringify(key)} was accessed during render but is not defined on instance.`);
			}
		},
		set({ _: instance }, key, value) {
			const { data, setupState, ctx } = instance;
			if (hasSetupBinding(setupState, key)) {
				setupState[key] = value;
				return true;
			} else if (!!(process.env.NODE_ENV !== "production") && setupState.__isScriptSetup && hasOwn$1(setupState, key)) {
				warn$1(`Cannot mutate <script setup> binding "${key}" from Options API.`);
				return false;
			} else if (data !== EMPTY_OBJ && hasOwn$1(data, key)) {
				data[key] = value;
				return true;
			} else if (hasOwn$1(instance.props, key)) {
				process.env.NODE_ENV !== "production" && warn$1(`Attempting to mutate prop "${key}". Props are readonly.`);
				return false;
			}
			if (key[0] === "$" && key.slice(1) in instance) {
				process.env.NODE_ENV !== "production" && warn$1(`Attempting to mutate public property "${key}". Properties starting with $ are reserved and readonly.`);
				return false;
			} else if (!!(process.env.NODE_ENV !== "production") && key in instance.appContext.config.globalProperties) Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				value
			});
			else ctx[key] = value;
			return true;
		},
		has({ _: { data, setupState, accessCache, ctx, appContext, props, type } }, key) {
			let cssModules;
			return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn$1(data, key) || hasSetupBinding(setupState, key) || hasOwn$1(props, key) || hasOwn$1(ctx, key) || hasOwn$1(publicPropertiesMap, key) || hasOwn$1(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
		},
		defineProperty(target, key, descriptor) {
			if (descriptor.get != null) target._.accessCache[key] = 0;
			else if (hasOwn$1(descriptor, "value")) this.set(target, key, descriptor.value, null);
			return Reflect.defineProperty(target, key, descriptor);
		}
	};
	if (!!(process.env.NODE_ENV !== "production") && true) PublicInstanceProxyHandlers.ownKeys = (target) => {
		warn$1(`Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead.`);
		return Reflect.ownKeys(target);
	};
	var RuntimeCompiledPublicInstanceProxyHandlers = /* @__PURE__ */ extend({}, PublicInstanceProxyHandlers, {
		get(target, key) {
			if (key === Symbol.unscopables) return;
			return PublicInstanceProxyHandlers.get(target, key, target);
		},
		has(_, key) {
			const has = key[0] !== "_" && !isGloballyAllowed(key);
			if (!!(process.env.NODE_ENV !== "production") && !has && PublicInstanceProxyHandlers.has(_, key)) warn$1(`Property ${JSON.stringify(key)} should not start with _ which is a reserved prefix for Vue internals.`);
			return has;
		}
	});
	function createDevRenderContext(instance) {
		const target = {};
		Object.defineProperty(target, `_`, {
			configurable: true,
			enumerable: false,
			get: () => instance
		});
		Object.keys(publicPropertiesMap).forEach((key) => {
			Object.defineProperty(target, key, {
				configurable: true,
				enumerable: false,
				get: () => publicPropertiesMap[key](instance),
				set: NOOP
			});
		});
		return target;
	}
	function exposePropsOnRenderContext(instance) {
		const { ctx, propsOptions: [propsOptions] } = instance;
		if (propsOptions) Object.keys(propsOptions).forEach((key) => {
			Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => instance.props[key],
				set: NOOP
			});
		});
	}
	function exposeSetupStateOnRenderContext(instance) {
		const { ctx, setupState } = instance;
		Object.keys(/* @__PURE__ */ toRaw(setupState)).forEach((key) => {
			if (!setupState.__isScriptSetup) {
				if (isReservedPrefix(key[0])) {
					warn$1(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" which are reserved prefixes for Vue internals.`);
					return;
				}
				Object.defineProperty(ctx, key, {
					enumerable: true,
					configurable: true,
					get: () => setupState[key],
					set: NOOP
				});
			}
		});
	}
	var warnRuntimeUsage = (method) => warn$1(`${method}() is a compiler-hint helper that is only usable inside <script setup> of a single file component. Its arguments should be compiled away and passing it at runtime has no effect.`);
	function defineProps() {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage(`defineProps`);
		return null;
	}
	function defineEmits() {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage(`defineEmits`);
		return null;
	}
	function defineExpose(exposed) {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage(`defineExpose`);
	}
	function defineOptions(options) {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage(`defineOptions`);
	}
	function defineSlots() {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage(`defineSlots`);
		return null;
	}
	function defineModel() {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage("defineModel");
	}
	function withDefaults(props, defaults) {
		if (!!(process.env.NODE_ENV !== "production")) warnRuntimeUsage(`withDefaults`);
		return null;
	}
	function useSlots() {
		return getContext("useSlots").slots;
	}
	function useAttrs() {
		return getContext("useAttrs").attrs;
	}
	function getContext(calledFunctionName) {
		const i = getCurrentInstance();
		if (!!(process.env.NODE_ENV !== "production") && !i) warn$1(`${calledFunctionName}() called without active instance.`);
		return i.setupContext || (i.setupContext = createSetupContext(i));
	}
	function normalizePropsOrEmits(props) {
		return isArray$1(props) ? props.reduce((normalized, p) => (normalized[p] = null, normalized), {}) : props;
	}
	function mergeDefaults(raw, defaults) {
		const props = normalizePropsOrEmits(raw);
		for (const key in defaults) {
			if (key.startsWith("__skip")) continue;
			let opt = props[key];
			if (opt) if (isArray$1(opt) || isFunction$1(opt)) opt = props[key] = {
				type: opt,
				default: defaults[key]
			};
			else opt.default = defaults[key];
			else if (opt === null) opt = props[key] = { default: defaults[key] };
			else if (!!(process.env.NODE_ENV !== "production")) warn$1(`props default key "${key}" has no corresponding declaration.`);
			if (opt && defaults[`__skip_${key}`]) opt.skipFactory = true;
		}
		return props;
	}
	function mergeModels(a, b) {
		if (!a || !b) return a || b;
		if (isArray$1(a) && isArray$1(b)) return a.concat(b);
		return extend({}, normalizePropsOrEmits(a), normalizePropsOrEmits(b));
	}
	function createPropsRestProxy(props, excludedKeys) {
		const ret = {};
		for (const key in props) if (!excludedKeys.includes(key)) Object.defineProperty(ret, key, {
			enumerable: true,
			get: () => props[key]
		});
		return ret;
	}
	function withAsyncContext(getAwaitable) {
		const ctx = getCurrentInstance();
		const inSSRSetup = isInSSRComponentSetup;
		if (!!(process.env.NODE_ENV !== "production") && !ctx) warn$1(`withAsyncContext called without active current instance. This is likely a bug.`);
		let awaitable = getAwaitable();
		unsetCurrentInstance();
		if (inSSRSetup) setInSSRSetupState(false);
		const restore = () => {
			setCurrentInstance(ctx);
			if (inSSRSetup) setInSSRSetupState(true);
		};
		const cleanup = () => {
			if (getCurrentInstance() !== ctx) ctx.scope.off();
			unsetCurrentInstance();
			if (inSSRSetup) setInSSRSetupState(false);
		};
		if (isPromise$1(awaitable)) awaitable = awaitable.catch((e) => {
			restore();
			Promise.resolve().then(() => Promise.resolve().then(cleanup));
			throw e;
		});
		return [awaitable, () => {
			restore();
			Promise.resolve().then(cleanup);
		}];
	}
	function createDuplicateChecker() {
		const cache = /* @__PURE__ */ Object.create(null);
		return (type, key) => {
			if (cache[key]) warn$1(`${type} property "${key}" is already defined in ${cache[key]}.`);
			else cache[key] = type;
		};
	}
	var shouldCacheAccess = true;
	function applyOptions(instance) {
		const options = resolveMergedOptions(instance);
		const publicThis = instance.proxy;
		const ctx = instance.ctx;
		shouldCacheAccess = false;
		if (options.beforeCreate) callHook$1(options.beforeCreate, instance, "bc");
		const { data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, expose, inheritAttrs, components, directives, filters } = options;
		const checkDuplicateProperties = !!(process.env.NODE_ENV !== "production") ? createDuplicateChecker() : null;
		if (!!(process.env.NODE_ENV !== "production")) {
			const [propsOptions] = instance.propsOptions;
			if (propsOptions) for (const key in propsOptions) checkDuplicateProperties("Props", key);
		}
		if (injectOptions) resolveInjections(injectOptions, ctx, checkDuplicateProperties);
		if (methods) for (const key in methods) {
			const methodHandler = methods[key];
			if (isFunction$1(methodHandler)) {
				if (!!(process.env.NODE_ENV !== "production")) Object.defineProperty(ctx, key, {
					value: methodHandler.bind(publicThis),
					configurable: true,
					enumerable: true,
					writable: true
				});
				else ctx[key] = methodHandler.bind(publicThis);
				if (!!(process.env.NODE_ENV !== "production")) checkDuplicateProperties("Methods", key);
			} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Method "${key}" has type "${typeof methodHandler}" in the component definition. Did you reference the function correctly?`);
		}
		if (dataOptions) {
			if (!!(process.env.NODE_ENV !== "production") && !isFunction$1(dataOptions)) warn$1(`The data option must be a function. Plain object usage is no longer supported.`);
			const data = dataOptions.call(publicThis, publicThis);
			if (!!(process.env.NODE_ENV !== "production") && isPromise$1(data)) warn$1(`data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>.`);
			if (!isObject$2(data)) process.env.NODE_ENV !== "production" && warn$1(`data() should return an object.`);
			else {
				instance.data = /* @__PURE__ */ reactive(data);
				if (!!(process.env.NODE_ENV !== "production")) for (const key in data) {
					checkDuplicateProperties("Data", key);
					if (!isReservedPrefix(key[0])) Object.defineProperty(ctx, key, {
						configurable: true,
						enumerable: true,
						get: () => data[key],
						set: NOOP
					});
				}
			}
		}
		shouldCacheAccess = true;
		if (computedOptions) for (const key in computedOptions) {
			const opt = computedOptions[key];
			const get = isFunction$1(opt) ? opt.bind(publicThis, publicThis) : isFunction$1(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
			if (!!(process.env.NODE_ENV !== "production") && get === NOOP) warn$1(`Computed property "${key}" has no getter.`);
			const c = computed({
				get,
				set: !isFunction$1(opt) && isFunction$1(opt.set) ? opt.set.bind(publicThis) : !!(process.env.NODE_ENV !== "production") ? () => {
					warn$1(`Write operation failed: computed property "${key}" is readonly.`);
				} : NOOP
			});
			Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => c.value,
				set: (v) => c.value = v
			});
			if (!!(process.env.NODE_ENV !== "production")) checkDuplicateProperties("Computed", key);
		}
		if (watchOptions) for (const key in watchOptions) createWatcher(watchOptions[key], ctx, publicThis, key);
		if (provideOptions) {
			const provides = isFunction$1(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
			Reflect.ownKeys(provides).forEach((key) => {
				provide(key, provides[key]);
			});
		}
		if (created) callHook$1(created, instance, "c");
		function registerLifecycleHook(register, hook) {
			if (isArray$1(hook)) hook.forEach((_hook) => register(_hook.bind(publicThis)));
			else if (hook) register(hook.bind(publicThis));
		}
		registerLifecycleHook(onBeforeMount, beforeMount);
		registerLifecycleHook(onMounted, mounted);
		registerLifecycleHook(onBeforeUpdate, beforeUpdate);
		registerLifecycleHook(onUpdated, updated);
		registerLifecycleHook(onActivated, activated);
		registerLifecycleHook(onDeactivated, deactivated);
		registerLifecycleHook(onErrorCaptured, errorCaptured);
		registerLifecycleHook(onRenderTracked, renderTracked);
		registerLifecycleHook(onRenderTriggered, renderTriggered);
		registerLifecycleHook(onBeforeUnmount, beforeUnmount);
		registerLifecycleHook(onUnmounted, unmounted);
		registerLifecycleHook(onServerPrefetch, serverPrefetch);
		if (isArray$1(expose)) {
			if (expose.length) {
				const exposed = instance.exposed || (instance.exposed = {});
				expose.forEach((key) => {
					Object.defineProperty(exposed, key, {
						get: () => publicThis[key],
						set: (val) => publicThis[key] = val,
						enumerable: true
					});
				});
			} else if (!instance.exposed) instance.exposed = {};
		}
		if (render && instance.render === NOOP) instance.render = render;
		if (inheritAttrs != null) instance.inheritAttrs = inheritAttrs;
		if (components) instance.components = components;
		if (directives) instance.directives = directives;
		if (serverPrefetch) markAsyncBoundary(instance);
	}
	function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
		if (isArray$1(injectOptions)) injectOptions = normalizeInject(injectOptions);
		for (const key in injectOptions) {
			const opt = injectOptions[key];
			let injected;
			if (isObject$2(opt)) if ("default" in opt) injected = inject(opt.from || key, opt.default, true);
			else injected = inject(opt.from || key);
			else injected = inject(opt);
			if (/* @__PURE__ */ isRef(injected)) Object.defineProperty(ctx, key, {
				enumerable: true,
				configurable: true,
				get: () => injected.value,
				set: (v) => injected.value = v
			});
			else ctx[key] = injected;
			if (!!(process.env.NODE_ENV !== "production")) checkDuplicateProperties("Inject", key);
		}
	}
	function callHook$1(hook, instance, type) {
		callWithAsyncErrorHandling(isArray$1(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy), instance, type);
	}
	function createWatcher(raw, ctx, publicThis, key) {
		let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
		if (isString$1(raw)) {
			const handler = ctx[raw];
			if (isFunction$1(handler)) watch(getter, handler);
			else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Invalid watch handler specified by key "${raw}"`, handler);
		} else if (isFunction$1(raw)) watch(getter, raw.bind(publicThis));
		else if (isObject$2(raw)) if (isArray$1(raw)) raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
		else {
			const handler = isFunction$1(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
			if (isFunction$1(handler)) watch(getter, handler, raw);
			else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Invalid watch handler specified by key "${raw.handler}"`, handler);
		}
		else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Invalid watch option: "${key}"`, raw);
	}
	function resolveMergedOptions(instance) {
		const base = instance.type;
		const { mixins, extends: extendsOptions } = base;
		const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
		const cached = cache.get(base);
		let resolved;
		if (cached) resolved = cached;
		else if (!globalMixins.length && !mixins && !extendsOptions) resolved = base;
		else {
			resolved = {};
			if (globalMixins.length) globalMixins.forEach((m) => mergeOptions(resolved, m, optionMergeStrategies, true));
			mergeOptions(resolved, base, optionMergeStrategies);
		}
		if (isObject$2(base)) cache.set(base, resolved);
		return resolved;
	}
	function mergeOptions(to, from, strats, asMixin = false) {
		const { mixins, extends: extendsOptions } = from;
		if (extendsOptions) mergeOptions(to, extendsOptions, strats, true);
		if (mixins) mixins.forEach((m) => mergeOptions(to, m, strats, true));
		for (const key in from) if (asMixin && key === "expose") process.env.NODE_ENV !== "production" && warn$1(`"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.`);
		else {
			const strat = internalOptionMergeStrats[key] || strats && strats[key];
			to[key] = strat ? strat(to[key], from[key]) : from[key];
		}
		return to;
	}
	var internalOptionMergeStrats = {
		data: mergeDataFn,
		props: mergeEmitsOrPropsOptions,
		emits: mergeEmitsOrPropsOptions,
		methods: mergeObjectOptions,
		computed: mergeObjectOptions,
		beforeCreate: mergeAsArray,
		created: mergeAsArray,
		beforeMount: mergeAsArray,
		mounted: mergeAsArray,
		beforeUpdate: mergeAsArray,
		updated: mergeAsArray,
		beforeDestroy: mergeAsArray,
		beforeUnmount: mergeAsArray,
		destroyed: mergeAsArray,
		unmounted: mergeAsArray,
		activated: mergeAsArray,
		deactivated: mergeAsArray,
		errorCaptured: mergeAsArray,
		serverPrefetch: mergeAsArray,
		components: mergeObjectOptions,
		directives: mergeObjectOptions,
		watch: mergeWatchOptions,
		provide: mergeDataFn,
		inject: mergeInject
	};
	function mergeDataFn(to, from) {
		if (!from) return to;
		if (!to) return from;
		return function mergedDataFn() {
			return extend(isFunction$1(to) ? to.call(this, this) : to, isFunction$1(from) ? from.call(this, this) : from);
		};
	}
	function mergeInject(to, from) {
		return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
	}
	function normalizeInject(raw) {
		if (isArray$1(raw)) {
			const res = {};
			for (let i = 0; i < raw.length; i++) res[raw[i]] = raw[i];
			return res;
		}
		return raw;
	}
	function mergeAsArray(to, from) {
		return to ? [...new Set([].concat(to, from))] : from;
	}
	function mergeObjectOptions(to, from) {
		return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
	}
	function mergeEmitsOrPropsOptions(to, from) {
		if (to) {
			if (isArray$1(to) && isArray$1(from)) return [.../* @__PURE__ */ new Set([...to, ...from])];
			return extend(/* @__PURE__ */ Object.create(null), normalizePropsOrEmits(to), normalizePropsOrEmits(from != null ? from : {}));
		} else return from;
	}
	function mergeWatchOptions(to, from) {
		if (!to) return from;
		if (!from) return to;
		const merged = extend(/* @__PURE__ */ Object.create(null), to);
		for (const key in from) merged[key] = mergeAsArray(to[key], from[key]);
		return merged;
	}
	function createAppContext() {
		return {
			app: null,
			config: {
				isNativeTag: NO,
				performance: false,
				globalProperties: {},
				optionMergeStrategies: {},
				errorHandler: void 0,
				warnHandler: void 0,
				compilerOptions: {}
			},
			mixins: [],
			components: {},
			directives: {},
			provides: /* @__PURE__ */ Object.create(null),
			optionsCache: /* @__PURE__ */ new WeakMap(),
			propsCache: /* @__PURE__ */ new WeakMap(),
			emitsCache: /* @__PURE__ */ new WeakMap()
		};
	}
	var uid$1 = 0;
	function createAppAPI(render, hydrate) {
		return function createApp(rootComponent, rootProps = null) {
			if (!isFunction$1(rootComponent)) rootComponent = extend({}, rootComponent);
			if (rootProps != null && !isObject$2(rootProps)) {
				process.env.NODE_ENV !== "production" && warn$1(`root props passed to app.mount() must be an object.`);
				rootProps = null;
			}
			const context = createAppContext();
			const installedPlugins = /* @__PURE__ */ new WeakSet();
			const pluginCleanupFns = [];
			let isMounted = false;
			const app = context.app = {
				_uid: uid$1++,
				_component: rootComponent,
				_props: rootProps,
				_container: null,
				_context: context,
				_instance: null,
				version,
				get config() {
					return context.config;
				},
				set config(v) {
					if (!!(process.env.NODE_ENV !== "production")) warn$1(`app.config cannot be replaced. Modify individual options instead.`);
				},
				use(plugin, ...options) {
					if (installedPlugins.has(plugin)) process.env.NODE_ENV !== "production" && warn$1(`Plugin has already been applied to target app.`);
					else if (plugin && isFunction$1(plugin.install)) {
						installedPlugins.add(plugin);
						plugin.install(app, ...options);
					} else if (isFunction$1(plugin)) {
						installedPlugins.add(plugin);
						plugin(app, ...options);
					} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`A plugin must either be a function or an object with an "install" function.`);
					return app;
				},
				mixin(mixin) {
					if (!context.mixins.includes(mixin)) context.mixins.push(mixin);
					else if (!!(process.env.NODE_ENV !== "production")) warn$1("Mixin has already been applied to target app" + (mixin.name ? `: ${mixin.name}` : ""));
					return app;
				},
				component(name, component) {
					if (!!(process.env.NODE_ENV !== "production")) validateComponentName(name, context.config);
					if (!component) return context.components[name];
					if (!!(process.env.NODE_ENV !== "production") && context.components[name]) warn$1(`Component "${name}" has already been registered in target app.`);
					context.components[name] = component;
					return app;
				},
				directive(name, directive) {
					if (!!(process.env.NODE_ENV !== "production")) validateDirectiveName(name);
					if (!directive) return context.directives[name];
					if (!!(process.env.NODE_ENV !== "production") && context.directives[name]) warn$1(`Directive "${name}" has already been registered in target app.`);
					context.directives[name] = directive;
					return app;
				},
				mount(rootContainer, isHydrate, namespace) {
					if (!isMounted) {
						if (!!(process.env.NODE_ENV !== "production") && rootContainer.__vue_app__) warn$1(`There is already an app instance mounted on the host container.
 If you want to mount another app on the same host container, you need to unmount the previous app by calling \`app.unmount()\` first.`);
						const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
						vnode.appContext = context;
						if (namespace === true) namespace = "svg";
						else if (namespace === false) namespace = void 0;
						if (!!(process.env.NODE_ENV !== "production")) context.reload = () => {
							const cloned = cloneVNode(vnode);
							cloned.el = null;
							render(cloned, rootContainer, namespace);
						};
						if (isHydrate && hydrate) hydrate(vnode, rootContainer);
						else render(vnode, rootContainer, namespace);
						isMounted = true;
						app._container = rootContainer;
						rootContainer.__vue_app__ = app;
						if (!!(process.env.NODE_ENV !== "production") || false) {
							app._instance = vnode.component;
							devtoolsInitApp(app, version);
						}
						return getComponentPublicInstance(vnode.component);
					} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`App has already been mounted.
If you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. \`const createMyApp = () => createApp(App)\``);
				},
				onUnmount(cleanupFn) {
					if (!!(process.env.NODE_ENV !== "production") && typeof cleanupFn !== "function") warn$1(`Expected function as first argument to app.onUnmount(), but got ${typeof cleanupFn}`);
					pluginCleanupFns.push(cleanupFn);
				},
				unmount() {
					if (isMounted) {
						callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16);
						render(null, app._container);
						if (!!(process.env.NODE_ENV !== "production") || false) {
							app._instance = null;
							devtoolsUnmountApp(app);
						}
						delete app._container.__vue_app__;
					} else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Cannot unmount an app that is not mounted.`);
				},
				provide(key, value) {
					if (!!(process.env.NODE_ENV !== "production") && key in context.provides) if (hasOwn$1(context.provides, key)) warn$1(`App already provides property with key "${String(key)}". It will be overwritten with the new value.`);
					else warn$1(`App already provides property with key "${String(key)}" inherited from its parent element. It will be overwritten with the new value.`);
					context.provides[key] = value;
					return app;
				},
				runWithContext(fn) {
					const lastApp = currentApp;
					currentApp = app;
					try {
						return fn();
					} finally {
						currentApp = lastApp;
					}
				}
			};
			return app;
		};
	}
	var currentApp = null;
	function useModel(props, name, options = EMPTY_OBJ) {
		const i = getCurrentInstance();
		if (!!(process.env.NODE_ENV !== "production") && !i) {
			warn$1(`useModel() called without active instance.`);
			return /* @__PURE__ */ ref();
		}
		const camelizedName = camelize$1(name);
		if (!!(process.env.NODE_ENV !== "production") && !i.propsOptions[0][camelizedName]) {
			warn$1(`useModel() called with prop "${name}" which is not declared.`);
			return /* @__PURE__ */ ref();
		}
		const hyphenatedName = hyphenate$1(name);
		const modifiers = getModelModifiers(props, camelizedName);
		const res = customRef((track, trigger) => {
			let localValue;
			let prevSetValue = EMPTY_OBJ;
			let prevEmittedValue;
			watchSyncEffect(() => {
				const propValue = props[camelizedName];
				if (hasChanged(localValue, propValue)) {
					localValue = propValue;
					trigger();
				}
			});
			return {
				get() {
					track();
					return options.get ? options.get(localValue) : localValue;
				},
				set(value) {
					const emittedValue = options.set ? options.set(value) : value;
					if (!hasChanged(emittedValue, localValue) && !(prevSetValue !== EMPTY_OBJ && hasChanged(value, prevSetValue))) return;
					const rawProps = i.vnode.props;
					const hasVModel = !!(rawProps && (name in rawProps || camelizedName in rawProps || hyphenatedName in rawProps) && (`onUpdate:${name}` in rawProps || `onUpdate:${camelizedName}` in rawProps || `onUpdate:${hyphenatedName}` in rawProps));
					if (!hasVModel) {
						localValue = value;
						trigger();
					}
					i.emit(`update:${name}`, emittedValue);
					if (hasChanged(value, prevSetValue) && (hasChanged(value, emittedValue) && !hasChanged(emittedValue, prevEmittedValue) || hasVModel && prevSetValue !== EMPTY_OBJ && !hasChanged(emittedValue, localValue))) trigger();
					prevSetValue = value;
					prevEmittedValue = emittedValue;
				}
			};
		});
		res[Symbol.iterator] = () => {
			let i2 = 0;
			return { next() {
				if (i2 < 2) return {
					value: i2++ ? modifiers || EMPTY_OBJ : res,
					done: false
				};
				else return { done: true };
			} };
		};
		return res;
	}
	var getModelModifiers = (props, modelName) => {
		return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize$1(modelName)}Modifiers`] || props[`${hyphenate$1(modelName)}Modifiers`];
	};
	function emit(instance, event, ...rawArgs) {
		if (instance.isUnmounted) return;
		const props = instance.vnode.props || EMPTY_OBJ;
		if (!!(process.env.NODE_ENV !== "production")) {
			const { emitsOptions, propsOptions: [propsOptions] } = instance;
			if (emitsOptions) if (!(event in emitsOptions) && true) {
				if (!propsOptions || !(toHandlerKey(camelize$1(event)) in propsOptions)) warn$1(`Component emitted event "${event}" but it is neither declared in the emits option nor as an "${toHandlerKey(camelize$1(event))}" prop.`);
			} else {
				const validator = emitsOptions[event];
				if (isFunction$1(validator)) {
					if (!validator(...rawArgs)) warn$1(`Invalid event arguments: event validation failed for event "${event}".`);
				}
			}
		}
		let args = rawArgs;
		const isModelListener = event.startsWith("update:");
		const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
		if (modifiers) {
			if (modifiers.trim) args = rawArgs.map((a) => isString$1(a) ? a.trim() : a);
			if (modifiers.number) args = rawArgs.map(looseToNumber);
		}
		if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentEmit(instance, event, args);
		if (!!(process.env.NODE_ENV !== "production")) {
			const lowerCaseEvent = event.toLowerCase();
			if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) warn$1(`Event "${lowerCaseEvent}" is emitted in component ${formatComponentName(instance, instance.type)} but the handler is registered for "${event}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${hyphenate$1(event)}" instead of "${event}".`);
		}
		let handlerName;
		let handler = props[handlerName = toHandlerKey(event)] || props[handlerName = toHandlerKey(camelize$1(event))];
		if (!handler && isModelListener) handler = props[handlerName = toHandlerKey(hyphenate$1(event))];
		if (handler) callWithAsyncErrorHandling(handler, instance, 6, args);
		const onceHandler = props[handlerName + `Once`];
		if (onceHandler) {
			if (!instance.emitted) instance.emitted = {};
			else if (instance.emitted[handlerName]) return;
			instance.emitted[handlerName] = true;
			callWithAsyncErrorHandling(onceHandler, instance, 6, args);
		}
	}
	var mixinEmitsCache = /* @__PURE__ */ new WeakMap();
	function normalizeEmitsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
		const cached = cache.get(comp);
		if (cached !== void 0) return cached;
		const raw = comp.emits;
		let normalized = {};
		let hasExtends = false;
		if (!isFunction$1(comp)) {
			const extendEmits = (raw2) => {
				const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
				if (normalizedFromExtend) {
					hasExtends = true;
					extend(normalized, normalizedFromExtend);
				}
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendEmits);
			if (comp.extends) extendEmits(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendEmits);
		}
		if (!raw && !hasExtends) {
			if (isObject$2(comp)) cache.set(comp, null);
			return null;
		}
		if (isArray$1(raw)) raw.forEach((key) => normalized[key] = null);
		else extend(normalized, raw);
		if (isObject$2(comp)) cache.set(comp, normalized);
		return normalized;
	}
	function isEmitListener(options, key) {
		if (!options || !isOn(key)) return false;
		key = key.slice(2);
		key = key === "Once" ? key : key.replace(/Once$/, "");
		return hasOwn$1(options, key[0].toLowerCase() + key.slice(1)) || hasOwn$1(options, hyphenate$1(key)) || hasOwn$1(options, key);
	}
	var accessedAttrs = false;
	function markAttrsAccessed() {
		accessedAttrs = true;
	}
	function renderComponentRoot(instance) {
		const { type: Component, vnode, proxy, withProxy, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, props, data, setupState, ctx, inheritAttrs } = instance;
		const prev = setCurrentRenderingInstance(instance);
		let result;
		let fallthroughAttrs;
		if (!!(process.env.NODE_ENV !== "production")) accessedAttrs = false;
		try {
			if (vnode.shapeFlag & 4) {
				const proxyToUse = withProxy || proxy;
				const thisProxy = !!(process.env.NODE_ENV !== "production") && setupState.__isScriptSetup ? new Proxy(proxyToUse, { get(target, key, receiver) {
					warn$1(`Property '${String(key)}' was accessed via 'this'. Avoid using 'this' in templates.`);
					return Reflect.get(target, key, receiver);
				} }) : proxyToUse;
				result = normalizeVNode(render.call(thisProxy, proxyToUse, renderCache, !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(props) : props, setupState, data, ctx));
				fallthroughAttrs = attrs;
			} else {
				const render2 = Component;
				if (!!(process.env.NODE_ENV !== "production") && attrs === props) markAttrsAccessed();
				result = normalizeVNode(render2.length > 1 ? render2(!!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(props) : props, !!(process.env.NODE_ENV !== "production") ? {
					get attrs() {
						markAttrsAccessed();
						return /* @__PURE__ */ shallowReadonly(attrs);
					},
					slots,
					emit
				} : {
					attrs,
					slots,
					emit
				}) : render2(!!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(props) : props, null));
				fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
			}
		} catch (err) {
			blockStack.length = 0;
			handleError(err, instance, 1);
			result = createVNode(Comment);
		}
		let root = result;
		let setRoot = void 0;
		if (!!(process.env.NODE_ENV !== "production") && result.patchFlag > 0 && result.patchFlag & 2048) [root, setRoot] = getChildRoot(result);
		if (fallthroughAttrs && inheritAttrs !== false) {
			const keys = Object.keys(fallthroughAttrs);
			const { shapeFlag } = root;
			if (keys.length) {
				if (shapeFlag & 7) {
					if (propsOptions && keys.some(isModelListener)) fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
					root = cloneVNode(root, fallthroughAttrs, false, true);
				} else if (!!(process.env.NODE_ENV !== "production") && !accessedAttrs && root.type !== Comment) {
					const allAttrs = Object.keys(attrs);
					const eventAttrs = [];
					const extraAttrs = [];
					for (let i = 0, l = allAttrs.length; i < l; i++) {
						const key = allAttrs[i];
						if (isOn(key)) {
							if (!isModelListener(key)) eventAttrs.push(key[2].toLowerCase() + key.slice(3));
						} else extraAttrs.push(key);
					}
					if (extraAttrs.length) warn$1(`Extraneous non-props attributes (${extraAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`);
					if (eventAttrs.length) warn$1(`Extraneous non-emits event listeners (${eventAttrs.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`);
				}
			}
		}
		if (vnode.dirs) {
			if (!!(process.env.NODE_ENV !== "production") && !isElementRoot(root)) warn$1(`Runtime directive used on component with non-element root node. The directives will not function as intended.`);
			root = cloneVNode(root, null, false, true);
			root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
		}
		if (vnode.transition) {
			if (!!(process.env.NODE_ENV !== "production") && !isElementRoot(root)) warn$1(`Component inside <Transition> renders non-element root node that cannot be animated.`);
			setTransitionHooks(root, vnode.transition);
		}
		if (!!(process.env.NODE_ENV !== "production") && setRoot) setRoot(root);
		else result = root;
		setCurrentRenderingInstance(prev);
		return result;
	}
	var getChildRoot = (vnode) => {
		const rawChildren = vnode.children;
		const dynamicChildren = vnode.dynamicChildren;
		const childRoot = filterSingleRoot(rawChildren, false);
		if (!childRoot) return [vnode, void 0];
		else if (!!(process.env.NODE_ENV !== "production") && childRoot.patchFlag > 0 && childRoot.patchFlag & 2048) return getChildRoot(childRoot);
		const index = rawChildren.indexOf(childRoot);
		const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
		const setRoot = (updatedRoot) => {
			rawChildren[index] = updatedRoot;
			if (dynamicChildren) {
				if (dynamicIndex > -1) dynamicChildren[dynamicIndex] = updatedRoot;
				else if (updatedRoot.patchFlag > 0) vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
			}
		};
		return [normalizeVNode(childRoot), setRoot];
	};
	function filterSingleRoot(children, recurse = true) {
		let singleRoot;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (isVNode$1(child)) {
				if (child.type !== Comment || child.children === "v-if") if (singleRoot) return;
				else {
					singleRoot = child;
					if (!!(process.env.NODE_ENV !== "production") && recurse && singleRoot.patchFlag > 0 && singleRoot.patchFlag & 2048) return filterSingleRoot(singleRoot.children);
				}
			} else return;
		}
		return singleRoot;
	}
	var getFunctionalFallthrough = (attrs) => {
		let res;
		for (const key in attrs) if (key === "class" || key === "style" || isOn(key)) (res || (res = {}))[key] = attrs[key];
		return res;
	};
	var filterModelListeners = (attrs, props) => {
		const res = {};
		for (const key in attrs) if (!isModelListener(key) || !(key.slice(9) in props)) res[key] = attrs[key];
		return res;
	};
	var isElementRoot = (vnode) => {
		return vnode.shapeFlag & 7 || vnode.type === Comment;
	};
	function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
		const { props: prevProps, children: prevChildren, component } = prevVNode;
		const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
		const emits = component.emitsOptions;
		if (!!(process.env.NODE_ENV !== "production") && (prevChildren || nextChildren) && isHmrUpdating) return true;
		if (nextVNode.dirs || nextVNode.transition) return true;
		if (optimized && patchFlag >= 0) {
			if (patchFlag & 1024) return true;
			if (patchFlag & 16) {
				if (!prevProps) return !!nextProps;
				return hasPropsChanged(prevProps, nextProps, emits);
			} else if (patchFlag & 8) {
				const dynamicProps = nextVNode.dynamicProps;
				for (let i = 0; i < dynamicProps.length; i++) {
					const key = dynamicProps[i];
					if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) return true;
				}
			}
		} else {
			if (prevChildren || nextChildren) {
				if (!nextChildren || !nextChildren.$stable) return true;
			}
			if (prevProps === nextProps) return false;
			if (!prevProps) return !!nextProps;
			if (!nextProps) return true;
			return hasPropsChanged(prevProps, nextProps, emits);
		}
		return false;
	}
	function hasPropsChanged(prevProps, nextProps, emitsOptions) {
		const nextKeys = Object.keys(nextProps);
		if (nextKeys.length !== Object.keys(prevProps).length) return true;
		for (let i = 0; i < nextKeys.length; i++) {
			const key = nextKeys[i];
			if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) return true;
		}
		return false;
	}
	function hasPropValueChanged(nextProps, prevProps, key) {
		const nextProp = nextProps[key];
		const prevProp = prevProps[key];
		if (key === "style" && isObject$2(nextProp) && isObject$2(prevProp)) return !looseEqual(nextProp, prevProp);
		return nextProp !== prevProp;
	}
	function updateHOCHostEl({ vnode, parent, suspense }, el) {
		while (parent) {
			const root = parent.subTree;
			if (root.suspense && root.suspense.activeBranch === vnode) {
				root.suspense.vnode.el = root.el = el;
				vnode = root;
			}
			if (root === vnode) {
				(vnode = parent.vnode).el = el;
				parent = parent.parent;
			} else break;
		}
		if (suspense && suspense.activeBranch === vnode) suspense.vnode.el = el;
	}
	var internalObjectProto = {};
	var createInternalObject = () => Object.create(internalObjectProto);
	var isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
	function initProps(instance, rawProps, isStateful, isSSR = false) {
		const props = {};
		const attrs = createInternalObject();
		instance.propsDefaults = /* @__PURE__ */ Object.create(null);
		setFullProps(instance, rawProps, props, attrs);
		for (const key in instance.propsOptions[0]) if (!(key in props)) props[key] = void 0;
		if (!!(process.env.NODE_ENV !== "production")) validateProps(rawProps || {}, props, instance);
		if (isStateful) instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
		else if (!instance.type.props) instance.props = attrs;
		else instance.props = props;
		instance.attrs = attrs;
	}
	function isInHmrContext(instance) {
		while (instance) {
			if (instance.type.__hmrId) return true;
			instance = instance.parent;
		}
	}
	function updateProps(instance, rawProps, rawPrevProps, optimized) {
		const { props, attrs, vnode: { patchFlag } } = instance;
		const rawCurrentProps = /* @__PURE__ */ toRaw(props);
		const [options] = instance.propsOptions;
		let hasAttrsChanged = false;
		if (!(!!(process.env.NODE_ENV !== "production") && isInHmrContext(instance)) && (optimized || patchFlag > 0) && !(patchFlag & 16)) {
			if (patchFlag & 8) {
				const propsToUpdate = instance.vnode.dynamicProps;
				for (let i = 0; i < propsToUpdate.length; i++) {
					let key = propsToUpdate[i];
					if (isEmitListener(instance.emitsOptions, key)) continue;
					const value = rawProps[key];
					if (options) if (hasOwn$1(attrs, key)) {
						if (value !== attrs[key]) {
							attrs[key] = value;
							hasAttrsChanged = true;
						}
					} else {
						const camelizedKey = camelize$1(key);
						props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false);
					}
					else if (value !== attrs[key]) {
						attrs[key] = value;
						hasAttrsChanged = true;
					}
				}
			}
		} else {
			if (setFullProps(instance, rawProps, props, attrs)) hasAttrsChanged = true;
			let kebabKey;
			for (const key in rawCurrentProps) if (!rawProps || !hasOwn$1(rawProps, key) && ((kebabKey = hyphenate$1(key)) === key || !hasOwn$1(rawProps, kebabKey))) if (options) {
				if (rawPrevProps && (rawPrevProps[key] !== void 0 || rawPrevProps[kebabKey] !== void 0)) props[key] = resolvePropValue(options, rawCurrentProps, key, void 0, instance, true);
			} else delete props[key];
			if (attrs !== rawCurrentProps) {
				for (const key in attrs) if (!rawProps || !hasOwn$1(rawProps, key) && true) {
					delete attrs[key];
					hasAttrsChanged = true;
				}
			}
		}
		if (hasAttrsChanged) trigger(instance.attrs, "set", "");
		if (!!(process.env.NODE_ENV !== "production")) validateProps(rawProps || {}, props, instance);
	}
	function setFullProps(instance, rawProps, props, attrs) {
		const [options, needCastKeys] = instance.propsOptions;
		let hasAttrsChanged = false;
		let rawCastValues;
		if (rawProps) for (let key in rawProps) {
			if (isReservedProp(key)) continue;
			const value = rawProps[key];
			let camelKey;
			if (options && hasOwn$1(options, camelKey = camelize$1(key))) if (!needCastKeys || !needCastKeys.includes(camelKey)) props[camelKey] = value;
			else (rawCastValues || (rawCastValues = {}))[camelKey] = value;
			else if (!isEmitListener(instance.emitsOptions, key)) {
				if (!(key in attrs) || value !== attrs[key]) {
					attrs[key] = value;
					hasAttrsChanged = true;
				}
			}
		}
		if (needCastKeys) {
			const rawCurrentProps = /* @__PURE__ */ toRaw(props);
			const castValues = rawCastValues || EMPTY_OBJ;
			for (let i = 0; i < needCastKeys.length; i++) {
				const key = needCastKeys[i];
				props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn$1(castValues, key));
			}
		}
		return hasAttrsChanged;
	}
	function resolvePropValue(options, props, key, value, instance, isAbsent) {
		const opt = options[key];
		if (opt != null) {
			const hasDefault = hasOwn$1(opt, "default");
			if (hasDefault && value === void 0) {
				const defaultValue = opt.default;
				if (opt.type !== Function && !opt.skipFactory && isFunction$1(defaultValue)) {
					const { propsDefaults } = instance;
					if (key in propsDefaults) value = propsDefaults[key];
					else {
						const reset = setCurrentInstance(instance);
						value = propsDefaults[key] = defaultValue.call(null, props);
						reset();
					}
				} else value = defaultValue;
				if (instance.ce) instance.ce._setProp(key, value);
			}
			if (opt[0]) {
				if (isAbsent && !hasDefault) value = false;
				else if (opt[1] && (value === "" || value === hyphenate$1(key))) value = true;
			}
		}
		return value;
	}
	var mixinPropsCache = /* @__PURE__ */ new WeakMap();
	function normalizePropsOptions(comp, appContext, asMixin = false) {
		const cache = asMixin ? mixinPropsCache : appContext.propsCache;
		const cached = cache.get(comp);
		if (cached) return cached;
		const raw = comp.props;
		const normalized = {};
		const needCastKeys = [];
		let hasExtends = false;
		if (!isFunction$1(comp)) {
			const extendProps = (raw2) => {
				hasExtends = true;
				const [props, keys] = normalizePropsOptions(raw2, appContext, true);
				extend(normalized, props);
				if (keys) needCastKeys.push(...keys);
			};
			if (!asMixin && appContext.mixins.length) appContext.mixins.forEach(extendProps);
			if (comp.extends) extendProps(comp.extends);
			if (comp.mixins) comp.mixins.forEach(extendProps);
		}
		if (!raw && !hasExtends) {
			if (isObject$2(comp)) cache.set(comp, EMPTY_ARR);
			return EMPTY_ARR;
		}
		if (isArray$1(raw)) for (let i = 0; i < raw.length; i++) {
			if (!!(process.env.NODE_ENV !== "production") && !isString$1(raw[i])) warn$1(`props must be strings when using array syntax.`, raw[i]);
			const normalizedKey = camelize$1(raw[i]);
			if (validatePropName(normalizedKey)) normalized[normalizedKey] = EMPTY_OBJ;
		}
		else if (raw) {
			if (!!(process.env.NODE_ENV !== "production") && !isObject$2(raw)) warn$1(`invalid props options`, raw);
			for (const key in raw) {
				const normalizedKey = camelize$1(key);
				if (validatePropName(normalizedKey)) {
					const opt = raw[key];
					const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction$1(opt) ? { type: opt } : extend({}, opt);
					const propType = prop.type;
					let shouldCast = false;
					let shouldCastTrue = true;
					if (isArray$1(propType)) for (let index = 0; index < propType.length; ++index) {
						const type = propType[index];
						const typeName = isFunction$1(type) && type.name;
						if (typeName === "Boolean") {
							shouldCast = true;
							break;
						} else if (typeName === "String") shouldCastTrue = false;
					}
					else shouldCast = isFunction$1(propType) && propType.name === "Boolean";
					prop[0] = shouldCast;
					prop[1] = shouldCastTrue;
					if (shouldCast || hasOwn$1(prop, "default")) needCastKeys.push(normalizedKey);
				}
			}
		}
		const res = [normalized, needCastKeys];
		if (isObject$2(comp)) cache.set(comp, res);
		return res;
	}
	function validatePropName(key) {
		if (key[0] !== "$" && !isReservedProp(key)) return true;
		else if (!!(process.env.NODE_ENV !== "production")) warn$1(`Invalid prop name: "${key}" is a reserved property.`);
		return false;
	}
	function getType(ctor) {
		if (ctor === null) return "null";
		if (typeof ctor === "function") return ctor.name || "";
		else if (typeof ctor === "object") return ctor.constructor && ctor.constructor.name || "";
		return "";
	}
	function validateProps(rawProps, props, instance) {
		const resolvedValues = /* @__PURE__ */ toRaw(props);
		const options = instance.propsOptions[0];
		const camelizePropsKey = Object.keys(rawProps).map((key) => camelize$1(key));
		for (const key in options) {
			let opt = options[key];
			if (opt == null) continue;
			validateProp(key, resolvedValues[key], opt, !!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(resolvedValues) : resolvedValues, !camelizePropsKey.includes(key));
		}
	}
	function validateProp(name, value, prop, props, isAbsent) {
		const { type, required, validator, skipCheck } = prop;
		if (required && isAbsent) {
			warn$1("Missing required prop: \"" + name + "\"");
			return;
		}
		if (value == null && !required) return;
		if (type != null && type !== true && !skipCheck) {
			let isValid = false;
			const types = isArray$1(type) ? type : [type];
			const expectedTypes = [];
			for (let i = 0; i < types.length && !isValid; i++) {
				const { valid, expectedType } = assertType(value, types[i]);
				expectedTypes.push(expectedType || "");
				isValid = valid;
			}
			if (!isValid) {
				warn$1(getInvalidTypeMessage(name, value, expectedTypes));
				return;
			}
		}
		if (validator && !validator(value, props)) warn$1("Invalid prop: custom validator check failed for prop \"" + name + "\".");
	}
	var isSimpleType = /* @__PURE__ */ makeMap("String,Number,Boolean,Function,Symbol,BigInt");
	function assertType(value, type) {
		let valid;
		const expectedType = getType(type);
		if (expectedType === "null") valid = value === null;
		else if (isSimpleType(expectedType)) {
			const t = typeof value;
			valid = t === expectedType.toLowerCase();
			if (!valid && t === "object") valid = value instanceof type;
		} else if (expectedType === "Object") valid = isObject$2(value);
		else if (expectedType === "Array") valid = isArray$1(value);
		else valid = value instanceof type;
		return {
			valid,
			expectedType
		};
	}
	function getInvalidTypeMessage(name, value, expectedTypes) {
		if (expectedTypes.length === 0) return `Prop type [] for prop "${name}" won't match anything. Did you mean to use type Array instead?`;
		let message = `Invalid prop: type check failed for prop "${name}". Expected ${expectedTypes.map(capitalize$1).join(" | ")}`;
		const expectedType = expectedTypes[0];
		const receivedType = toRawType(value);
		const expectedValue = styleValue(value, expectedType);
		const receivedValue = styleValue(value, receivedType);
		if (expectedTypes.length === 1 && isExplicable(expectedType) && isCoercible(expectedType, receivedType)) message += ` with value ${expectedValue}`;
		message += `, got ${receivedType} `;
		if (isExplicable(receivedType)) message += `with value ${receivedValue}.`;
		return message;
	}
	function styleValue(value, type) {
		if (isSymbol(value)) return value.toString();
		else if (type === "String") return `"${value}"`;
		else if (type === "Number") return `${Number(value)}`;
		else return `${value}`;
	}
	function isExplicable(type) {
		return [
			"string",
			"number",
			"boolean"
		].some((elem) => type.toLowerCase() === elem);
	}
	function isCoercible(...args) {
		return args.every((elem) => {
			const value = elem.toLowerCase();
			return value !== "boolean" && value !== "symbol";
		});
	}
	var isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
	var normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
	var normalizeSlot = (key, rawSlot, ctx) => {
		if (rawSlot._n) return rawSlot;
		const normalized = withCtx((...args) => {
			if (!!(process.env.NODE_ENV !== "production") && currentInstance && !(ctx === null && currentRenderingInstance) && !(ctx && ctx.root !== currentInstance.root)) warn$1(`Slot "${key}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`);
			return normalizeSlotValue(rawSlot(...args));
		}, ctx);
		normalized._c = false;
		return normalized;
	};
	var normalizeObjectSlots = (rawSlots, slots, instance) => {
		const ctx = rawSlots._ctx;
		for (const key in rawSlots) {
			if (isInternalKey(key)) continue;
			const value = rawSlots[key];
			if (isFunction$1(value)) slots[key] = normalizeSlot(key, value, ctx);
			else if (value != null) {
				if (!!(process.env.NODE_ENV !== "production") && true) warn$1(`Non-function value encountered for slot "${key}". Prefer function slots for better performance.`);
				const normalized = normalizeSlotValue(value);
				slots[key] = () => normalized;
			}
		}
	};
	var normalizeVNodeSlots = (instance, children) => {
		if (!!(process.env.NODE_ENV !== "production") && !isKeepAlive(instance.vnode) && true) warn$1(`Non-function value encountered for default slot. Prefer function slots for better performance.`);
		const normalized = normalizeSlotValue(children);
		instance.slots.default = () => normalized;
	};
	var assignSlots = (slots, children, optimized) => {
		for (const key in children) if (optimized || !isInternalKey(key)) slots[key] = children[key];
	};
	var initSlots = (instance, children, optimized) => {
		const slots = instance.slots = createInternalObject();
		if (instance.vnode.shapeFlag & 32) {
			const type = children._;
			if (type) {
				assignSlots(slots, children, optimized);
				if (optimized) def(slots, "_", type, true);
			} else normalizeObjectSlots(children, slots);
		} else if (children) normalizeVNodeSlots(instance, children);
	};
	var updateSlots = (instance, children, optimized) => {
		const { vnode, slots } = instance;
		let needDeletionCheck = true;
		let deletionComparisonTarget = EMPTY_OBJ;
		if (vnode.shapeFlag & 32) {
			const type = children._;
			if (type) if (!!(process.env.NODE_ENV !== "production") && isHmrUpdating) {
				assignSlots(slots, children, optimized);
				trigger(instance, "set", "$slots");
			} else if (optimized && type === 1) needDeletionCheck = false;
			else assignSlots(slots, children, optimized);
			else {
				needDeletionCheck = !children.$stable;
				normalizeObjectSlots(children, slots);
			}
			deletionComparisonTarget = children;
		} else if (children) {
			normalizeVNodeSlots(instance, children);
			deletionComparisonTarget = { default: 1 };
		}
		if (needDeletionCheck) {
			for (const key in slots) if (!isInternalKey(key) && deletionComparisonTarget[key] == null) delete slots[key];
		}
	};
	var supported$1;
	var perf$1;
	function startMeasure(instance, type) {
		if (instance.appContext.config.performance && isSupported()) perf$1.mark(`vue-${type}-${instance.uid}`);
		if (!!(process.env.NODE_ENV !== "production") || false) devtoolsPerfStart(instance, type, isSupported() ? perf$1.now() : Date.now());
	}
	function endMeasure(instance, type) {
		if (instance.appContext.config.performance && isSupported()) {
			const startTag = `vue-${type}-${instance.uid}`;
			const endTag = startTag + `:end`;
			const measureName = `<${formatComponentName(instance, instance.type)}> ${type}`;
			perf$1.mark(endTag);
			perf$1.measure(measureName, startTag, endTag);
			perf$1.clearMeasures(measureName);
			perf$1.clearMarks(startTag);
			perf$1.clearMarks(endTag);
		}
		if (!!(process.env.NODE_ENV !== "production") || false) devtoolsPerfEnd(instance, type, isSupported() ? perf$1.now() : Date.now());
	}
	function isSupported() {
		if (supported$1 !== void 0) return supported$1;
		if (typeof window !== "undefined" && window.performance) {
			supported$1 = true;
			perf$1 = window.performance;
		} else supported$1 = false;
		return supported$1;
	}
	function initFeatureFlags$2() {
		const needWarn = [];
		if (!!(process.env.NODE_ENV !== "production") && needWarn.length) {
			const multi = needWarn.length > 1;
			console.warn(`Feature flag${multi ? `s` : ``} ${needWarn.join(", ")} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`);
		}
	}
	var queuePostRenderEffect = queueEffectWithSuspense;
	function createRenderer(options) {
		return baseCreateRenderer(options);
	}
	function createHydrationRenderer(options) {
		return baseCreateRenderer(options, createHydrationFunctions);
	}
	function baseCreateRenderer(options, createHydrationFns) {
		initFeatureFlags$2();
		const target = getGlobalThis$1();
		target.__VUE__ = true;
		if (!!(process.env.NODE_ENV !== "production") || false) setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
		const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, insertStaticContent: hostInsertStaticContent } = options;
		const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!(process.env.NODE_ENV !== "production") && isHmrUpdating ? false : !!n2.dynamicChildren) => {
			if (n1 === n2) return;
			if (n1 && !isSameVNodeType(n1, n2)) {
				anchor = getNextHostNode(n1);
				unmount(n1, parentComponent, parentSuspense, true);
				n1 = null;
			}
			if (n2.patchFlag === -2) {
				optimized = false;
				n2.dynamicChildren = null;
			}
			const { type, ref, shapeFlag } = n2;
			switch (type) {
				case Text:
					processText(n1, n2, container, anchor);
					break;
				case Comment:
					processCommentNode(n1, n2, container, anchor);
					break;
				case Static:
					if (n1 == null) mountStaticNode(n2, container, anchor, namespace);
					else if (!!(process.env.NODE_ENV !== "production")) patchStaticNode(n1, n2, container, namespace);
					break;
				case Fragment:
					processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					break;
				default: if (shapeFlag & 1) processElement(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 6) processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else if (shapeFlag & 64) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				else if (shapeFlag & 128) type.process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals);
				else if (!!(process.env.NODE_ENV !== "production")) warn$1("Invalid VNode type:", type, `(${typeof type})`);
			}
			if (ref != null && parentComponent) setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
			else if (ref == null && n1 && n1.ref != null) setRef(n1.ref, null, parentSuspense, n1, true);
		};
		const processText = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateText(n2.children), container, anchor);
			else {
				const el = n2.el = n1.el;
				if (n2.children !== n1.children) hostSetText(el, n2.children);
			}
		};
		const processCommentNode = (n1, n2, container, anchor) => {
			if (n1 == null) hostInsert(n2.el = hostCreateComment(n2.children || ""), container, anchor);
			else n2.el = n1.el;
		};
		const mountStaticNode = (n2, container, anchor, namespace) => {
			[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace, n2.el, n2.anchor);
		};
		const patchStaticNode = (n1, n2, container, namespace) => {
			if (n2.children !== n1.children) {
				const anchor = hostNextSibling(n1.anchor);
				removeStaticNode(n1);
				[n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, namespace);
			} else {
				n2.el = n1.el;
				n2.anchor = n1.anchor;
			}
		};
		const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostInsert(el, container, nextSibling);
				el = next;
			}
			hostInsert(anchor, container, nextSibling);
		};
		const removeStaticNode = ({ el, anchor }) => {
			let next;
			while (el && el !== anchor) {
				next = hostNextSibling(el);
				hostRemove(el);
				el = next;
			}
			hostRemove(anchor);
		};
		const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			if (n2.type === "svg") namespace = "svg";
			else if (n2.type === "math") namespace = "mathml";
			if (n1 == null) mountElement(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else {
				const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
				try {
					if (customElement) customElement._beginPatch();
					patchElement(n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				} finally {
					if (customElement) customElement._endPatch();
				}
			}
		};
		const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let el;
			let vnodeHook;
			const { props, shapeFlag, transition, dirs } = vnode;
			el = vnode.el = hostCreateElement(vnode.type, namespace, props && props.is, props);
			if (shapeFlag & 8) hostSetElementText(el, vnode.children);
			else if (shapeFlag & 16) mountChildren(vnode.children, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(vnode, namespace), slotScopeIds, optimized);
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "created");
			setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
			if (props) {
				for (const key in props) if (key !== "value" && !isReservedProp(key)) hostPatchProp(el, key, null, props[key], namespace, parentComponent);
				if ("value" in props) hostPatchProp(el, "value", null, props.value, namespace);
				if (vnodeHook = props.onVnodeBeforeMount) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			}
			if (!!(process.env.NODE_ENV !== "production") || false) {
				def(el, "__vnode", vnode, true);
				def(el, "__vueParentComponent", parentComponent, true);
			}
			if (dirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
			const needCallTransitionHooks = needTransition(parentSuspense, transition);
			if (needCallTransitionHooks) transition.beforeEnter(el);
			hostInsert(el, container, anchor);
			if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
				const isHmr = !!(process.env.NODE_ENV !== "production") && isHmrUpdating;
				queuePostRenderEffect(() => {
					let prev;
					if (!!(process.env.NODE_ENV !== "production")) prev = setHmrUpdating(isHmr);
					try {
						vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
						needCallTransitionHooks && transition.enter(el);
						dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
					} finally {
						if (!!(process.env.NODE_ENV !== "production")) setHmrUpdating(prev);
					}
				}, parentSuspense);
			}
		};
		const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
			if (scopeId) hostSetScopeId(el, scopeId);
			if (slotScopeIds) for (let i = 0; i < slotScopeIds.length; i++) hostSetScopeId(el, slotScopeIds[i]);
			if (parentComponent) {
				let subTree = parentComponent.subTree;
				if (!!(process.env.NODE_ENV !== "production") && subTree.patchFlag > 0 && subTree.patchFlag & 2048) subTree = filterSingleRoot(subTree.children) || subTree;
				if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
					const parentVNode = parentComponent.vnode;
					setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
				}
			}
		};
		const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
			for (let i = start; i < children.length; i++) {
				const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
				patch(null, child, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
		};
		const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const el = n2.el = n1.el;
			if (!!(process.env.NODE_ENV !== "production") || false) el.__vnode = n2;
			let { patchFlag, dynamicChildren, dirs } = n2;
			patchFlag |= n1.patchFlag & 16;
			const oldProps = n1.props || EMPTY_OBJ;
			const newProps = n2.props || EMPTY_OBJ;
			let vnodeHook;
			parentComponent && toggleRecurse(parentComponent, false);
			if (vnodeHook = newProps.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
			if (dirs) invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
			parentComponent && toggleRecurse(parentComponent, true);
			if (!!(process.env.NODE_ENV !== "production") && isHmrUpdating || dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)) {
				patchFlag = 0;
				optimized = false;
				dynamicChildren = null;
			}
			if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) hostSetElementText(el, "");
			if (dynamicChildren) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds);
				if (!!(process.env.NODE_ENV !== "production")) traverseStaticChildren(n1, n2);
			} else if (!optimized) patchChildren(n1, n2, el, null, parentComponent, parentSuspense, resolveChildrenNamespace(n2, namespace), slotScopeIds, false);
			if (patchFlag > 0) {
				if (patchFlag & 16) patchProps(el, oldProps, newProps, parentComponent, namespace);
				else {
					if (patchFlag & 2) {
						if (oldProps.class !== newProps.class) hostPatchProp(el, "class", null, newProps.class, namespace);
					}
					if (patchFlag & 4) hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
					if (patchFlag & 8) {
						const propsToUpdate = n2.dynamicProps;
						for (let i = 0; i < propsToUpdate.length; i++) {
							const key = propsToUpdate[i];
							const prev = oldProps[key];
							const next = newProps[key];
							if (next !== prev || key === "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
						}
					}
				}
				if (patchFlag & 1) {
					if (n1.children !== n2.children) hostSetElementText(el, n2.children);
				}
			} else if (!optimized && dynamicChildren == null) patchProps(el, oldProps, newProps, parentComponent, namespace);
			if ((vnodeHook = newProps.onVnodeUpdated) || dirs) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
				dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
			}, parentSuspense);
		};
		const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
			for (let i = 0; i < newChildren.length; i++) {
				const oldVNode = oldChildren[i];
				const newVNode = newChildren[i];
				const container = oldVNode.el && (oldVNode.type === Fragment || !isSameVNodeType(oldVNode, newVNode) || oldVNode.shapeFlag & 198) ? hostParentNode(oldVNode.el) : fallbackContainer;
				patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, true);
			}
		};
		const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
			if (oldProps !== newProps) {
				if (oldProps !== EMPTY_OBJ) {
					for (const key in oldProps) if (!isReservedProp(key) && !(key in newProps)) hostPatchProp(el, key, oldProps[key], null, namespace, parentComponent);
				}
				for (const key in newProps) {
					if (isReservedProp(key)) continue;
					const next = newProps[key];
					const prev = oldProps[key];
					if (next !== prev && key !== "value") hostPatchProp(el, key, prev, next, namespace, parentComponent);
				}
				if ("value" in newProps) hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
			}
		};
		const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
			const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
			let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
			if (!!(process.env.NODE_ENV !== "production") && (isHmrUpdating || patchFlag & 2048)) {
				patchFlag = 0;
				optimized = false;
				dynamicChildren = null;
			}
			if (fragmentSlotScopeIds) slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
			if (n1 == null) {
				hostInsert(fragmentStartAnchor, container, anchor);
				hostInsert(fragmentEndAnchor, container, anchor);
				mountChildren(n2.children || [], container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			} else if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
				patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, namespace, slotScopeIds);
				if (!!(process.env.NODE_ENV !== "production")) traverseStaticChildren(n1, n2);
				else if (n2.key != null || parentComponent && n2 === parentComponent.subTree) traverseStaticChildren(n1, n2, true);
			} else patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
		};
		const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			n2.slotScopeIds = slotScopeIds;
			if (n1 == null) if (n2.shapeFlag & 512) parentComponent.ctx.activate(n2, container, anchor, namespace, optimized);
			else mountComponent(n2, container, anchor, parentComponent, parentSuspense, namespace, optimized);
			else updateComponent(n1, n2, optimized);
		};
		const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
			const instance = initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense);
			if (!!(process.env.NODE_ENV !== "production") && instance.type.__hmrId) registerHMR(instance);
			if (!!(process.env.NODE_ENV !== "production")) {
				pushWarningContext(initialVNode);
				startMeasure(instance, `mount`);
			}
			if (isKeepAlive(initialVNode)) instance.ctx.renderer = internals;
			if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `init`);
			setupComponent(instance, false, optimized);
			if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `init`);
			if (!!(process.env.NODE_ENV !== "production") && isHmrUpdating) initialVNode.el = null;
			if (instance.asyncDep) {
				parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
				if (!initialVNode.el) {
					const placeholder = instance.subTree = createVNode(Comment);
					processCommentNode(null, placeholder, container, anchor);
					initialVNode.placeholder = placeholder.el;
				}
			} else setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, namespace, optimized);
			if (!!(process.env.NODE_ENV !== "production")) {
				popWarningContext();
				endMeasure(instance, `mount`);
			}
		};
		const updateComponent = (n1, n2, optimized) => {
			const instance = n2.component = n1.component;
			if (shouldUpdateComponent(n1, n2, optimized)) if (instance.asyncDep && !instance.asyncResolved) {
				if (!!(process.env.NODE_ENV !== "production")) pushWarningContext(n2);
				updateComponentPreRender(instance, n2, optimized);
				if (!!(process.env.NODE_ENV !== "production")) popWarningContext();
				return;
			} else {
				instance.next = n2;
				instance.update();
			}
			else {
				n2.el = n1.el;
				instance.vnode = n2;
			}
		};
		const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
			const componentUpdateFn = () => {
				if (!instance.isMounted) {
					let vnodeHook;
					const { el, props } = initialVNode;
					const { bm, m, parent, root, type } = instance;
					const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
					toggleRecurse(instance, false);
					if (bm) invokeArrayFns(bm);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) invokeVNodeHook(vnodeHook, parent, initialVNode);
					toggleRecurse(instance, true);
					if (el && hydrateNode) {
						const hydrateSubTree = () => {
							if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `render`);
							instance.subTree = renderComponentRoot(instance);
							if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `render`);
							if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `hydrate`);
							hydrateNode(el, instance.subTree, instance, parentSuspense, null);
							if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `hydrate`);
						};
						if (isAsyncWrapperVNode && type.__asyncHydrate) type.__asyncHydrate(el, instance, hydrateSubTree);
						else hydrateSubTree();
					} else {
						if (root.ce && root.ce._hasShadowRoot()) root.ce._injectChildStyle(type, instance.parent ? instance.parent.type : void 0);
						if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `render`);
						const subTree = instance.subTree = renderComponentRoot(instance);
						if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `render`);
						if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `patch`);
						patch(null, subTree, container, anchor, instance, parentSuspense, namespace);
						if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `patch`);
						initialVNode.el = subTree.el;
					}
					if (m) queuePostRenderEffect(m, parentSuspense);
					if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
						const scopedInitialVNode = initialVNode;
						queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
					}
					if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) instance.a && queuePostRenderEffect(instance.a, parentSuspense);
					instance.isMounted = true;
					if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentAdded(instance);
					initialVNode = container = anchor = null;
				} else {
					let { next, bu, u, parent, vnode } = instance;
					{
						const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
						if (nonHydratedAsyncRoot) {
							if (next) {
								next.el = vnode.el;
								updateComponentPreRender(instance, next, optimized);
							}
							nonHydratedAsyncRoot.asyncDep.then(() => {
								queuePostRenderEffect(() => {
									if (!instance.isUnmounted) update();
								}, parentSuspense);
							});
							return;
						}
					}
					let originNext = next;
					let vnodeHook;
					if (!!(process.env.NODE_ENV !== "production")) pushWarningContext(next || instance.vnode);
					toggleRecurse(instance, false);
					if (next) {
						next.el = vnode.el;
						updateComponentPreRender(instance, next, optimized);
					} else next = vnode;
					if (bu) invokeArrayFns(bu);
					if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) invokeVNodeHook(vnodeHook, parent, next, vnode);
					toggleRecurse(instance, true);
					if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `render`);
					const nextTree = renderComponentRoot(instance);
					if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `render`);
					const prevTree = instance.subTree;
					instance.subTree = nextTree;
					if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `patch`);
					patch(prevTree, nextTree, hostParentNode(prevTree.el), getNextHostNode(prevTree), instance, parentSuspense, namespace);
					if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `patch`);
					next.el = nextTree.el;
					if (originNext === null) updateHOCHostEl(instance, nextTree.el);
					if (u) queuePostRenderEffect(u, parentSuspense);
					if (vnodeHook = next.props && next.props.onVnodeUpdated) queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
					if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentUpdated(instance);
					if (!!(process.env.NODE_ENV !== "production")) popWarningContext();
				}
			};
			instance.scope.on();
			const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
			instance.scope.off();
			const update = instance.update = effect.run.bind(effect);
			const job = instance.job = effect.runIfDirty.bind(effect);
			job.i = instance;
			job.id = instance.uid;
			effect.scheduler = () => queueJob(job);
			toggleRecurse(instance, true);
			if (!!(process.env.NODE_ENV !== "production")) {
				effect.onTrack = instance.rtc ? (e) => invokeArrayFns(instance.rtc, e) : void 0;
				effect.onTrigger = instance.rtg ? (e) => invokeArrayFns(instance.rtg, e) : void 0;
			}
			update();
		};
		const updateComponentPreRender = (instance, nextVNode, optimized) => {
			nextVNode.component = instance;
			const prevProps = instance.vnode.props;
			instance.vnode = nextVNode;
			instance.next = null;
			updateProps(instance, nextVNode.props, prevProps, optimized);
			updateSlots(instance, nextVNode.children, optimized);
			pauseTracking();
			flushPreFlushCbs(instance);
			resetTracking();
		};
		const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
			const c1 = n1 && n1.children;
			const prevShapeFlag = n1 ? n1.shapeFlag : 0;
			const c2 = n2.children;
			const { patchFlag, shapeFlag } = n2;
			if (patchFlag > 0) {
				if (patchFlag & 128) {
					patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				} else if (patchFlag & 256) {
					patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					return;
				}
			}
			if (shapeFlag & 8) {
				if (prevShapeFlag & 16) unmountChildren(c1, parentComponent, parentSuspense);
				if (c2 !== c1) hostSetElementText(container, c2);
			} else if (prevShapeFlag & 16) if (shapeFlag & 16) patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			else unmountChildren(c1, parentComponent, parentSuspense, true);
			else {
				if (prevShapeFlag & 8) hostSetElementText(container, "");
				if (shapeFlag & 16) mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
		};
		const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			c1 = c1 || EMPTY_ARR;
			c2 = c2 || EMPTY_ARR;
			const oldLength = c1.length;
			const newLength = c2.length;
			const commonLength = Math.min(oldLength, newLength);
			let i;
			for (i = 0; i < commonLength; i++) {
				const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
			}
			if (oldLength > newLength) unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
			else mountChildren(c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, commonLength);
		};
		const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
			let i = 0;
			const l2 = c2.length;
			let e1 = c1.length - 1;
			let e2 = l2 - 1;
			while (i <= e1 && i <= e2) {
				const n1 = c1[i];
				const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				i++;
			}
			while (i <= e1 && i <= e2) {
				const n1 = c1[e1];
				const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
				if (isSameVNodeType(n1, n2)) patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
				else break;
				e1--;
				e2--;
			}
			if (i > e1) {
				if (i <= e2) {
					const nextPos = e2 + 1;
					const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
					while (i <= e2) {
						patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						i++;
					}
				}
			} else if (i > e2) while (i <= e1) {
				unmount(c1[i], parentComponent, parentSuspense, true);
				i++;
			}
			else {
				const s1 = i;
				const s2 = i;
				const keyToNewIndexMap = /* @__PURE__ */ new Map();
				for (i = s2; i <= e2; i++) {
					const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
					if (nextChild.key != null) {
						if (!!(process.env.NODE_ENV !== "production") && keyToNewIndexMap.has(nextChild.key)) warn$1(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
						keyToNewIndexMap.set(nextChild.key, i);
					}
				}
				let j;
				let patched = 0;
				const toBePatched = e2 - s2 + 1;
				let moved = false;
				let maxNewIndexSoFar = 0;
				const newIndexToOldIndexMap = new Array(toBePatched);
				for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
				for (i = s1; i <= e1; i++) {
					const prevChild = c1[i];
					if (patched >= toBePatched) {
						unmount(prevChild, parentComponent, parentSuspense, true);
						continue;
					}
					let newIndex;
					if (prevChild.key != null) newIndex = keyToNewIndexMap.get(prevChild.key);
					else for (j = s2; j <= e2; j++) if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
						newIndex = j;
						break;
					}
					if (newIndex === void 0) unmount(prevChild, parentComponent, parentSuspense, true);
					else {
						newIndexToOldIndexMap[newIndex - s2] = i + 1;
						if (newIndex >= maxNewIndexSoFar) maxNewIndexSoFar = newIndex;
						else moved = true;
						patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
						patched++;
					}
				}
				const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
				j = increasingNewIndexSequence.length - 1;
				for (i = toBePatched - 1; i >= 0; i--) {
					const nextIndex = s2 + i;
					const nextChild = c2[nextIndex];
					const anchorVNode = c2[nextIndex + 1];
					const anchor = nextIndex + 1 < l2 ? anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode) : parentAnchor;
					if (newIndexToOldIndexMap[i] === 0) patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
					else if (moved) if (j < 0 || i !== increasingNewIndexSequence[j]) move(nextChild, container, anchor, 2);
					else j--;
				}
			}
		};
		const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
			const { el, type, transition, children, shapeFlag } = vnode;
			if (shapeFlag & 6) {
				move(vnode.component.subTree, container, anchor, moveType);
				return;
			}
			if (shapeFlag & 128) {
				vnode.suspense.move(container, anchor, moveType);
				return;
			}
			if (shapeFlag & 64) {
				type.move(vnode, container, anchor, internals);
				return;
			}
			if (type === Fragment) {
				hostInsert(el, container, anchor);
				for (let i = 0; i < children.length; i++) move(children[i], container, anchor, moveType);
				hostInsert(vnode.anchor, container, anchor);
				return;
			}
			if (type === Static) {
				moveStaticNode(vnode, container, anchor);
				return;
			}
			if (moveType !== 2 && shapeFlag & 1 && transition) if (moveType === 0) if (transition.persisted && !el[leaveCbKey]) hostInsert(el, container, anchor);
			else {
				transition.beforeEnter(el);
				hostInsert(el, container, anchor);
				queuePostRenderEffect(() => transition.enter(el), parentSuspense);
			}
			else {
				const { leave, delayLeave, afterLeave } = transition;
				const remove2 = () => {
					if (vnode.ctx.isUnmounted) hostRemove(el);
					else hostInsert(el, container, anchor);
				};
				const performLeave = () => {
					const wasLeaving = el._isLeaving || !!el[leaveCbKey];
					if (el._isLeaving) el[leaveCbKey](true);
					if (transition.persisted && !wasLeaving) remove2();
					else leave(el, () => {
						remove2();
						afterLeave && afterLeave();
					});
				};
				if (delayLeave) delayLeave(el, remove2, performLeave);
				else performLeave();
			}
			else hostInsert(el, container, anchor);
		};
		const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
			const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs, cacheIndex, memo } = vnode;
			if (patchFlag === -2) optimized = false;
			if (ref != null) {
				pauseTracking();
				setRef(ref, null, parentSuspense, vnode, true);
				resetTracking();
			}
			if (cacheIndex != null) parentComponent.renderCache[cacheIndex] = void 0;
			if (shapeFlag & 256) {
				parentComponent.ctx.deactivate(vnode);
				return;
			}
			const shouldInvokeDirs = shapeFlag & 1 && dirs;
			const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
			let vnodeHook;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) invokeVNodeHook(vnodeHook, parentComponent, vnode);
			if (shapeFlag & 6) unmountComponent(vnode.component, parentSuspense, doRemove);
			else {
				if (shapeFlag & 128) {
					vnode.suspense.unmount(parentSuspense, doRemove);
					return;
				}
				if (shouldInvokeDirs) invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
				if (shapeFlag & 64) vnode.type.remove(vnode, parentComponent, parentSuspense, internals, doRemove);
				else if (dynamicChildren && !dynamicChildren.hasOnce && (type !== Fragment || patchFlag > 0 && patchFlag & 64)) unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
				else if (type === Fragment && patchFlag & 384 || !optimized && shapeFlag & 16) unmountChildren(children, parentComponent, parentSuspense);
				if (doRemove) remove(vnode);
			}
			const shouldInvalidateMemo = memo != null && cacheIndex == null;
			if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) queuePostRenderEffect(() => {
				vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
				shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
				if (shouldInvalidateMemo) vnode.el = null;
			}, parentSuspense);
		};
		const remove = (vnode) => {
			const { type, el, anchor, transition } = vnode;
			if (type === Fragment) {
				if (!!(process.env.NODE_ENV !== "production") && vnode.patchFlag > 0 && vnode.patchFlag & 2048 && transition && !transition.persisted) vnode.children.forEach((child) => {
					if (child.type === Comment) hostRemove(child.el);
					else remove(child);
				});
				else removeFragment(el, anchor);
				return;
			}
			if (type === Static) {
				removeStaticNode(vnode);
				return;
			}
			const performRemove = () => {
				hostRemove(el);
				if (transition && !transition.persisted && transition.afterLeave) transition.afterLeave();
			};
			if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
				const { leave, delayLeave } = transition;
				const performLeave = () => leave(el, performRemove);
				if (delayLeave) delayLeave(vnode.el, performRemove, performLeave);
				else performLeave();
			} else performRemove();
		};
		const removeFragment = (cur, end) => {
			let next;
			while (cur !== end) {
				next = hostNextSibling(cur);
				hostRemove(cur);
				cur = next;
			}
			hostRemove(end);
		};
		const unmountComponent = (instance, parentSuspense, doRemove) => {
			if (!!(process.env.NODE_ENV !== "production") && instance.type.__hmrId) unregisterHMR(instance);
			const { bum, scope, job, subTree, um, m, a } = instance;
			invalidateMount(m);
			invalidateMount(a);
			if (bum) invokeArrayFns(bum);
			scope.stop();
			if (job) {
				job.flags |= 8;
				unmount(subTree, instance, parentSuspense, doRemove);
			}
			if (um) queuePostRenderEffect(um, parentSuspense);
			queuePostRenderEffect(() => {
				instance.isUnmounted = true;
			}, parentSuspense);
			if (!!(process.env.NODE_ENV !== "production") || false) devtoolsComponentRemoved(instance);
		};
		const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
			for (let i = start; i < children.length; i++) unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
		};
		const getNextHostNode = (vnode) => {
			if (vnode.shapeFlag & 6) return getNextHostNode(vnode.component.subTree);
			if (vnode.shapeFlag & 128) return vnode.suspense.next();
			const el = hostNextSibling(vnode.anchor || vnode.el);
			const teleportEnd = el && el[TeleportEndKey];
			return teleportEnd ? hostNextSibling(teleportEnd) : el;
		};
		let isFlushing = false;
		const render = (vnode, container, namespace) => {
			let instance;
			if (vnode == null) {
				if (container._vnode) {
					unmount(container._vnode, null, null, true);
					instance = container._vnode.component;
				}
			} else patch(container._vnode || null, vnode, container, null, null, null, namespace);
			container._vnode = vnode;
			if (!isFlushing) {
				isFlushing = true;
				flushPreFlushCbs(instance);
				flushPostFlushCbs();
				isFlushing = false;
			}
		};
		const internals = {
			p: patch,
			um: unmount,
			m: move,
			r: remove,
			mt: mountComponent,
			mc: mountChildren,
			pc: patchChildren,
			pbc: patchBlockChildren,
			n: getNextHostNode,
			o: options
		};
		let hydrate;
		let hydrateNode;
		if (createHydrationFns) [hydrate, hydrateNode] = createHydrationFns(internals);
		return {
			render,
			hydrate,
			createApp: createAppAPI(render, hydrate)
		};
	}
	function resolveChildrenNamespace({ type, props }, currentNamespace) {
		return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
	}
	function toggleRecurse({ effect, job }, allowed) {
		if (allowed) {
			effect.flags |= 32;
			job.flags |= 4;
		} else {
			effect.flags &= -33;
			job.flags &= -5;
		}
	}
	function needTransition(parentSuspense, transition) {
		return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
	}
	function traverseStaticChildren(n1, n2, shallow = false) {
		const ch1 = n1.children;
		const ch2 = n2.children;
		if (isArray$1(ch1) && isArray$1(ch2)) for (let i = 0; i < ch1.length; i++) {
			const c1 = ch1[i];
			let c2 = ch2[i];
			if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
				if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
					c2 = ch2[i] = cloneIfMounted(ch2[i]);
					c2.el = c1.el;
				}
				if (!shallow && c2.patchFlag !== -2) traverseStaticChildren(c1, c2);
			}
			if (c2.type === Text) {
				if (c2.patchFlag === -1) c2 = ch2[i] = cloneIfMounted(c2);
				c2.el = c1.el;
			}
			if (c2.type === Comment && !c2.el) c2.el = c1.el;
			if (!!(process.env.NODE_ENV !== "production")) c2.el && (c2.el.__vnode = c2);
		}
	}
	function getSequence(arr) {
		const p = arr.slice();
		const result = [0];
		let i, j, u, v, c;
		const len = arr.length;
		for (i = 0; i < len; i++) {
			const arrI = arr[i];
			if (arrI !== 0) {
				j = result[result.length - 1];
				if (arr[j] < arrI) {
					p[i] = j;
					result.push(i);
					continue;
				}
				u = 0;
				v = result.length - 1;
				while (u < v) {
					c = u + v >> 1;
					if (arr[result[c]] < arrI) u = c + 1;
					else v = c;
				}
				if (arrI < arr[result[u]]) {
					if (u > 0) p[i] = result[u - 1];
					result[u] = i;
				}
			}
		}
		u = result.length;
		v = result[u - 1];
		while (u-- > 0) {
			result[u] = v;
			v = p[v];
		}
		return result;
	}
	function locateNonHydratedAsyncRoot(instance) {
		const subComponent = instance.subTree.component;
		if (subComponent) if (subComponent.asyncDep && !subComponent.asyncResolved) return subComponent;
		else return locateNonHydratedAsyncRoot(subComponent);
	}
	function invalidateMount(hooks) {
		if (hooks) for (let i = 0; i < hooks.length; i++) hooks[i].flags |= 8;
	}
	function resolveAsyncComponentPlaceholder(anchorVnode) {
		if (anchorVnode.placeholder) return anchorVnode.placeholder;
		const instance = anchorVnode.component;
		if (instance) return resolveAsyncComponentPlaceholder(instance.subTree);
		return null;
	}
	var isSuspense = (type) => type.__isSuspense;
	var suspenseId = 0;
	var Suspense = {
		name: "Suspense",
		__isSuspense: true,
		process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
			if (n1 == null) mountSuspense(n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals);
			else {
				if (parentSuspense && parentSuspense.deps > 0 && !n1.suspense.isInFallback) {
					n2.suspense = n1.suspense;
					n2.suspense.vnode = n2;
					n2.el = n1.el;
					return;
				}
				patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, rendererInternals);
			}
		},
		hydrate: hydrateSuspense,
		normalize: normalizeSuspenseChildren
	};
	function triggerEvent(vnode, name) {
		const eventListener = vnode.props && vnode.props[name];
		if (isFunction$1(eventListener)) eventListener();
	}
	function mountSuspense(vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals) {
		const { p: patch, o: { createElement } } = rendererInternals;
		const hiddenContainer = createElement("div");
		const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals);
		patch(null, suspense.pendingBranch = vnode.ssContent, hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds);
		if (suspense.deps > 0) {
			triggerEvent(vnode, "onPending");
			triggerEvent(vnode, "onFallback");
			patch(null, vnode.ssFallback, container, anchor, parentComponent, null, namespace, slotScopeIds);
			setActiveBranch(suspense, vnode.ssFallback);
		} else suspense.resolve(false, true);
	}
	function patchSuspense(n1, n2, container, anchor, parentComponent, namespace, slotScopeIds, optimized, { p: patch, um: unmount, o: { createElement } }) {
		const suspense = n2.suspense = n1.suspense;
		suspense.vnode = n2;
		n2.el = n1.el;
		const newBranch = n2.ssContent;
		const newFallback = n2.ssFallback;
		const { activeBranch, pendingBranch, isInFallback, isHydrating } = suspense;
		if (pendingBranch) {
			suspense.pendingBranch = newBranch;
			if (isSameVNodeType(pendingBranch, newBranch)) {
				patch(pendingBranch, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
				if (suspense.deps <= 0) suspense.resolve();
				else if (isInFallback) {
					if (!isHydrating) {
						patch(activeBranch, newFallback, container, anchor, parentComponent, null, namespace, slotScopeIds, optimized);
						setActiveBranch(suspense, newFallback);
					}
				}
			} else {
				suspense.pendingId = suspenseId++;
				if (isHydrating) {
					suspense.isHydrating = false;
					suspense.activeBranch = pendingBranch;
				} else unmount(pendingBranch, parentComponent, suspense);
				suspense.deps = 0;
				suspense.effects.length = 0;
				suspense.hiddenContainer = createElement("div");
				if (isInFallback) {
					patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
					if (suspense.deps <= 0) suspense.resolve();
					else {
						patch(activeBranch, newFallback, container, anchor, parentComponent, null, namespace, slotScopeIds, optimized);
						setActiveBranch(suspense, newFallback);
					}
				} else if (activeBranch && isSameVNodeType(activeBranch, newBranch)) {
					patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, namespace, slotScopeIds, optimized);
					suspense.resolve(true);
				} else {
					patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
					if (suspense.deps <= 0) suspense.resolve();
				}
			}
		} else if (activeBranch && isSameVNodeType(activeBranch, newBranch)) {
			patch(activeBranch, newBranch, container, anchor, parentComponent, suspense, namespace, slotScopeIds, optimized);
			setActiveBranch(suspense, newBranch);
		} else {
			triggerEvent(n2, "onPending");
			suspense.pendingBranch = newBranch;
			if (newBranch.shapeFlag & 512) suspense.pendingId = newBranch.component.suspenseId;
			else suspense.pendingId = suspenseId++;
			patch(null, newBranch, suspense.hiddenContainer, null, parentComponent, suspense, namespace, slotScopeIds, optimized);
			if (suspense.deps <= 0) suspense.resolve();
			else {
				const { timeout, pendingId } = suspense;
				if (timeout > 0) setTimeout(() => {
					if (suspense.pendingId === pendingId) suspense.fallback(newFallback);
				}, timeout);
				else if (timeout === 0) suspense.fallback(newFallback);
			}
		}
	}
	var hasWarned$1 = false;
	function createSuspenseBoundary(vnode, parentSuspense, parentComponent, container, hiddenContainer, anchor, namespace, slotScopeIds, optimized, rendererInternals, isHydrating = false) {
		if (!!(process.env.NODE_ENV !== "production") && !hasWarned$1) {
			hasWarned$1 = true;
			console[console.info ? "info" : "log"](`<Suspense> is an experimental feature and its API will likely change.`);
		}
		const { p: patch, m: move, um: unmount, n: next, o: { parentNode, remove } } = rendererInternals;
		let parentSuspenseId;
		const isSuspensible = isVNodeSuspensible(vnode);
		if (isSuspensible) {
			if (parentSuspense && parentSuspense.pendingBranch) {
				parentSuspenseId = parentSuspense.pendingId;
				parentSuspense.deps++;
			}
		}
		const timeout = vnode.props ? toNumber(vnode.props.timeout) : void 0;
		if (!!(process.env.NODE_ENV !== "production")) assertNumber(timeout, `Suspense timeout`);
		const initialAnchor = anchor;
		const suspense = {
			vnode,
			parent: parentSuspense,
			parentComponent,
			namespace,
			container,
			hiddenContainer,
			deps: 0,
			pendingId: suspenseId++,
			timeout: typeof timeout === "number" ? timeout : -1,
			activeBranch: null,
			isFallbackMountPending: false,
			pendingBranch: null,
			isInFallback: !isHydrating,
			isHydrating,
			isUnmounted: false,
			effects: [],
			resolve(resume = false, sync = false) {
				if (!!(process.env.NODE_ENV !== "production")) {
					if (!resume && !suspense.pendingBranch) throw new Error(`suspense.resolve() is called without a pending branch.`);
					if (suspense.isUnmounted) throw new Error(`suspense.resolve() is called on an already unmounted suspense boundary.`);
				}
				const { vnode: vnode2, activeBranch, pendingBranch, pendingId, effects, parentComponent: parentComponent2, container: container2, isInFallback } = suspense;
				let delayEnter = false;
				if (suspense.isHydrating) suspense.isHydrating = false;
				else if (!resume) {
					delayEnter = activeBranch && pendingBranch.transition && pendingBranch.transition.mode === "out-in";
					let hasUpdatedAnchor = false;
					if (delayEnter) activeBranch.transition.afterLeave = () => {
						if (pendingId === suspense.pendingId) {
							move(pendingBranch, container2, anchor === initialAnchor && !hasUpdatedAnchor ? next(activeBranch) : anchor, 0);
							queuePostFlushCb(effects);
							if (isInFallback && vnode2.ssFallback) vnode2.ssFallback.el = null;
						}
					};
					if (activeBranch && !suspense.isFallbackMountPending) {
						if (parentNode(activeBranch.el) === container2) {
							anchor = next(activeBranch);
							hasUpdatedAnchor = true;
						}
						unmount(activeBranch, parentComponent2, suspense, true);
						if (!delayEnter && isInFallback && vnode2.ssFallback) queuePostRenderEffect(() => vnode2.ssFallback.el = null, suspense);
					}
					if (!delayEnter) move(pendingBranch, container2, anchor, 0);
				}
				suspense.isFallbackMountPending = false;
				setActiveBranch(suspense, pendingBranch);
				suspense.pendingBranch = null;
				suspense.isInFallback = false;
				let parent = suspense.parent;
				let hasUnresolvedAncestor = false;
				while (parent) {
					if (parent.pendingBranch) {
						parent.effects.push(...effects);
						hasUnresolvedAncestor = true;
						break;
					}
					parent = parent.parent;
				}
				if (!hasUnresolvedAncestor && !delayEnter) queuePostFlushCb(effects);
				suspense.effects = [];
				if (isSuspensible) {
					if (parentSuspense && parentSuspense.pendingBranch && parentSuspenseId === parentSuspense.pendingId) {
						parentSuspense.deps--;
						if (parentSuspense.deps === 0 && !sync) parentSuspense.resolve();
					}
				}
				triggerEvent(vnode2, "onResolve");
			},
			fallback(fallbackVNode) {
				if (!suspense.pendingBranch) return;
				const { vnode: vnode2, activeBranch, parentComponent: parentComponent2, container: container2, namespace: namespace2 } = suspense;
				triggerEvent(vnode2, "onFallback");
				const anchor2 = next(activeBranch);
				const mountFallback = () => {
					suspense.isFallbackMountPending = false;
					if (!suspense.isInFallback) return;
					patch(null, fallbackVNode, container2, anchor2, parentComponent2, null, namespace2, slotScopeIds, optimized);
					setActiveBranch(suspense, fallbackVNode);
				};
				const delayEnter = fallbackVNode.transition && fallbackVNode.transition.mode === "out-in";
				if (delayEnter) {
					suspense.isFallbackMountPending = true;
					activeBranch.transition.afterLeave = mountFallback;
				}
				suspense.isInFallback = true;
				unmount(activeBranch, parentComponent2, null, true);
				if (!delayEnter) mountFallback();
			},
			move(container2, anchor2, type) {
				suspense.activeBranch && move(suspense.activeBranch, container2, anchor2, type);
				suspense.container = container2;
			},
			next() {
				return suspense.activeBranch && next(suspense.activeBranch);
			},
			registerDep(instance, setupRenderEffect, optimized2) {
				const isInPendingSuspense = !!suspense.pendingBranch;
				if (isInPendingSuspense) suspense.deps++;
				const hydratedEl = instance.vnode.el;
				instance.asyncDep.catch((err) => {
					handleError(err, instance, 0);
				}).then((asyncSetupResult) => {
					if (instance.isUnmounted || suspense.isUnmounted || suspense.pendingId !== instance.suspenseId) return;
					unsetCurrentInstance();
					instance.asyncResolved = true;
					const { vnode: vnode2 } = instance;
					if (!!(process.env.NODE_ENV !== "production")) pushWarningContext(vnode2);
					handleSetupResult(instance, asyncSetupResult, false);
					if (hydratedEl) vnode2.el = hydratedEl;
					const placeholder = !hydratedEl && instance.subTree.el;
					setupRenderEffect(instance, vnode2, parentNode(hydratedEl || instance.subTree.el), hydratedEl ? null : next(instance.subTree), suspense, namespace, optimized2);
					if (placeholder) {
						vnode2.placeholder = null;
						remove(placeholder);
					}
					updateHOCHostEl(instance, vnode2.el);
					if (!!(process.env.NODE_ENV !== "production")) popWarningContext();
					if (isInPendingSuspense && --suspense.deps === 0) suspense.resolve();
				});
			},
			unmount(parentSuspense2, doRemove) {
				suspense.isUnmounted = true;
				if (suspense.activeBranch) unmount(suspense.activeBranch, parentComponent, parentSuspense2, doRemove);
				if (suspense.pendingBranch) unmount(suspense.pendingBranch, parentComponent, parentSuspense2, doRemove);
			}
		};
		return suspense;
	}
	function hydrateSuspense(node, vnode, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, rendererInternals, hydrateNode) {
		const suspense = vnode.suspense = createSuspenseBoundary(vnode, parentSuspense, parentComponent, node.parentNode, document.createElement("div"), null, namespace, slotScopeIds, optimized, rendererInternals, true);
		const result = hydrateNode(node, suspense.pendingBranch = vnode.ssContent, parentComponent, suspense, slotScopeIds, optimized);
		if (suspense.deps === 0) suspense.resolve(false, true);
		return result;
	}
	function normalizeSuspenseChildren(vnode) {
		const { shapeFlag, children } = vnode;
		const isSlotChildren = shapeFlag & 32;
		vnode.ssContent = normalizeSuspenseSlot(isSlotChildren ? children.default : children);
		vnode.ssFallback = isSlotChildren ? normalizeSuspenseSlot(children.fallback) : createVNode(Comment);
	}
	function normalizeSuspenseSlot(s) {
		let block;
		if (isFunction$1(s)) {
			const trackBlock = isBlockTreeEnabled && s._c;
			if (trackBlock) {
				s._d = false;
				openBlock();
			}
			s = s();
			if (trackBlock) {
				s._d = true;
				block = currentBlock;
				closeBlock();
			}
		}
		if (isArray$1(s)) {
			const singleChild = filterSingleRoot(s);
			if (!!(process.env.NODE_ENV !== "production") && !singleChild && s.filter((child) => child !== NULL_DYNAMIC_COMPONENT).length > 0) warn$1(`<Suspense> slots expect a single root node.`);
			s = singleChild;
		}
		s = normalizeVNode(s);
		if (block && !s.dynamicChildren) s.dynamicChildren = block.filter((c) => c !== s);
		return s;
	}
	function queueEffectWithSuspense(fn, suspense) {
		if (suspense && suspense.pendingBranch) if (isArray$1(fn)) suspense.effects.push(...fn);
		else suspense.effects.push(fn);
		else queuePostFlushCb(fn);
	}
	function setActiveBranch(suspense, branch) {
		suspense.activeBranch = branch;
		const { vnode, parentComponent } = suspense;
		let el = branch.el;
		while (!el && branch.component) {
			branch = branch.component.subTree;
			el = branch.el;
		}
		vnode.el = el;
		if (parentComponent && parentComponent.subTree === vnode) {
			parentComponent.vnode.el = el;
			updateHOCHostEl(parentComponent, el);
		}
	}
	function isVNodeSuspensible(vnode) {
		const suspensible = vnode.props && vnode.props.suspensible;
		return suspensible != null && suspensible !== false;
	}
	var Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
	var Text = /* @__PURE__ */ Symbol.for("v-txt");
	var Comment = /* @__PURE__ */ Symbol.for("v-cmt");
	var Static = /* @__PURE__ */ Symbol.for("v-stc");
	var blockStack = [];
	var currentBlock = null;
	function openBlock(disableTracking = false) {
		blockStack.push(currentBlock = disableTracking ? null : []);
	}
	function closeBlock() {
		blockStack.pop();
		currentBlock = blockStack[blockStack.length - 1] || null;
	}
	var isBlockTreeEnabled = 1;
	function setBlockTracking(value, inVOnce = false) {
		isBlockTreeEnabled += value;
		if (value < 0 && currentBlock && inVOnce) currentBlock.hasOnce = true;
	}
	function setupBlock(vnode) {
		vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
		closeBlock();
		if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(vnode);
		return vnode;
	}
	function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
		return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true));
	}
	function createBlock(type, props, children, patchFlag, dynamicProps) {
		return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true));
	}
	function isVNode$1(value) {
		return value ? value.__v_isVNode === true : false;
	}
	function isSameVNodeType(n1, n2) {
		if (!!(process.env.NODE_ENV !== "production") && n2.shapeFlag & 6 && n1.component) {
			const dirtyInstances = hmrDirtyComponents.get(n2.type);
			if (dirtyInstances && dirtyInstances.has(n1.component)) {
				n1.shapeFlag &= -257;
				n2.shapeFlag &= -513;
				return false;
			}
		}
		return n1.type === n2.type && n1.key === n2.key;
	}
	var vnodeArgsTransformer;
	function transformVNodeArgs(transformer) {
		vnodeArgsTransformer = transformer;
	}
	var createVNodeWithArgsTransform = (...args) => {
		return _createVNode(...vnodeArgsTransformer ? vnodeArgsTransformer(args, currentRenderingInstance) : args);
	};
	var normalizeKey = ({ key }) => key != null ? key : null;
	var normalizeRef = ({ ref, ref_key, ref_for }) => {
		if (typeof ref === "number") ref = "" + ref;
		return ref != null ? isString$1(ref) || /* @__PURE__ */ isRef(ref) || isFunction$1(ref) ? {
			i: currentRenderingInstance,
			r: ref,
			k: ref_key,
			f: !!ref_for
		} : ref : null;
	};
	function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
		const vnode = {
			__v_isVNode: true,
			__v_skip: true,
			type,
			props,
			key: props && normalizeKey(props),
			ref: props && normalizeRef(props),
			scopeId: currentScopeId,
			slotScopeIds: null,
			children,
			component: null,
			suspense: null,
			ssContent: null,
			ssFallback: null,
			dirs: null,
			transition: null,
			el: null,
			anchor: null,
			target: null,
			targetStart: null,
			targetAnchor: null,
			staticCount: 0,
			shapeFlag,
			patchFlag,
			dynamicProps,
			dynamicChildren: null,
			appContext: null,
			ctx: currentRenderingInstance
		};
		if (needFullChildrenNormalization) {
			normalizeChildren(vnode, children);
			if (shapeFlag & 128) type.normalize(vnode);
		} else if (children) vnode.shapeFlag |= isString$1(children) ? 8 : 16;
		if (!!(process.env.NODE_ENV !== "production") && vnode.key !== vnode.key) warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
		if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock && (vnode.patchFlag > 0 || shapeFlag & 6) && vnode.patchFlag !== 32) currentBlock.push(vnode);
		return vnode;
	}
	var createVNode = !!(process.env.NODE_ENV !== "production") ? createVNodeWithArgsTransform : _createVNode;
	function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
		if (!type || type === NULL_DYNAMIC_COMPONENT) {
			if (!!(process.env.NODE_ENV !== "production") && !type) warn$1(`Invalid vnode type when creating vnode: ${type}.`);
			type = Comment;
		}
		if (isVNode$1(type)) {
			const cloned = cloneVNode(type, props, true);
			if (children) normalizeChildren(cloned, children);
			if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) if (cloned.shapeFlag & 6) currentBlock[currentBlock.indexOf(type)] = cloned;
			else currentBlock.push(cloned);
			cloned.patchFlag = -2;
			return cloned;
		}
		if (isClassComponent(type)) type = type.__vccOpts;
		if (props) {
			props = guardReactiveProps(props);
			let { class: klass, style } = props;
			if (klass && !isString$1(klass)) props.class = normalizeClass(klass);
			if (isObject$2(style)) {
				if (/* @__PURE__ */ isProxy(style) && !isArray$1(style)) style = extend({}, style);
				props.style = normalizeStyle(style);
			}
		}
		const shapeFlag = isString$1(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$2(type) ? 4 : isFunction$1(type) ? 2 : 0;
		if (!!(process.env.NODE_ENV !== "production") && shapeFlag & 4 && /* @__PURE__ */ isProxy(type)) {
			type = /* @__PURE__ */ toRaw(type);
			warn$1(`Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with \`markRaw\` or using \`shallowRef\` instead of \`ref\`.`, `
Component that was made reactive: `, type);
		}
		return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
	}
	function guardReactiveProps(props) {
		if (!props) return null;
		return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
	}
	function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
		const { props, ref, patchFlag, children, transition } = vnode;
		const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
		const cloned = {
			__v_isVNode: true,
			__v_skip: true,
			type: vnode.type,
			props: mergedProps,
			key: mergedProps && normalizeKey(mergedProps),
			ref: extraProps && extraProps.ref ? mergeRef && ref ? isArray$1(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref,
			scopeId: vnode.scopeId,
			slotScopeIds: vnode.slotScopeIds,
			children: !!(process.env.NODE_ENV !== "production") && patchFlag === -1 && isArray$1(children) ? children.map(deepCloneVNode) : children,
			target: vnode.target,
			targetStart: vnode.targetStart,
			targetAnchor: vnode.targetAnchor,
			staticCount: vnode.staticCount,
			shapeFlag: vnode.shapeFlag,
			patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
			dynamicProps: vnode.dynamicProps,
			dynamicChildren: vnode.dynamicChildren,
			appContext: vnode.appContext,
			dirs: vnode.dirs,
			transition,
			component: vnode.component,
			suspense: vnode.suspense,
			ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
			ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
			placeholder: vnode.placeholder,
			el: vnode.el,
			anchor: vnode.anchor,
			ctx: vnode.ctx,
			ce: vnode.ce
		};
		if (transition && cloneTransition) setTransitionHooks(cloned, transition.clone(cloned));
		return cloned;
	}
	function deepCloneVNode(vnode) {
		const cloned = cloneVNode(vnode);
		if (isArray$1(vnode.children)) cloned.children = vnode.children.map(deepCloneVNode);
		return cloned;
	}
	function createTextVNode(text = " ", flag = 0) {
		return createVNode(Text, null, text, flag);
	}
	function createStaticVNode(content, numberOfNodes) {
		const vnode = createVNode(Static, null, content);
		vnode.staticCount = numberOfNodes;
		return vnode;
	}
	function createCommentVNode(text = "", asBlock = false) {
		return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
	}
	function normalizeVNode(child) {
		if (child == null || typeof child === "boolean") return createVNode(Comment);
		else if (isArray$1(child)) return createVNode(Fragment, null, child.slice());
		else if (isVNode$1(child)) return cloneIfMounted(child);
		else return createVNode(Text, null, String(child));
	}
	function cloneIfMounted(child) {
		return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
	}
	function normalizeChildren(vnode, children) {
		let type = 0;
		const { shapeFlag } = vnode;
		if (children == null) children = null;
		else if (isArray$1(children)) type = 16;
		else if (typeof children === "object") if (shapeFlag & 65) {
			const slot = children.default;
			if (slot) {
				slot._c && (slot._d = false);
				normalizeChildren(vnode, slot());
				slot._c && (slot._d = true);
			}
			return;
		} else {
			type = 32;
			const slotFlag = children._;
			if (!slotFlag && !isInternalObject(children)) children._ctx = currentRenderingInstance;
			else if (slotFlag === 3 && currentRenderingInstance) if (currentRenderingInstance.slots._ === 1) children._ = 1;
			else {
				children._ = 2;
				vnode.patchFlag |= 1024;
			}
		}
		else if (isFunction$1(children)) {
			if (shapeFlag & 65) {
				normalizeChildren(vnode, { default: children });
				return;
			}
			children = {
				default: children,
				_ctx: currentRenderingInstance
			};
			type = 32;
		} else {
			children = String(children);
			if (shapeFlag & 64) {
				type = 16;
				children = [createTextVNode(children)];
			} else type = 8;
		}
		vnode.children = children;
		vnode.shapeFlag |= type;
	}
	function mergeProps(...args) {
		const ret = {};
		for (let i = 0; i < args.length; i++) {
			const toMerge = args[i];
			for (const key in toMerge) if (key === "class") {
				if (ret.class !== toMerge.class) ret.class = normalizeClass([ret.class, toMerge.class]);
			} else if (key === "style") ret.style = normalizeStyle([ret.style, toMerge.style]);
			else if (isOn(key)) {
				const existing = ret[key];
				const incoming = toMerge[key];
				if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) ret[key] = existing ? [].concat(existing, incoming) : incoming;
				else if (incoming == null && existing == null && !isModelListener(key)) ret[key] = incoming;
			} else if (key !== "") ret[key] = toMerge[key];
		}
		return ret;
	}
	function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
		callWithAsyncErrorHandling(hook, instance, 7, [vnode, prevVNode]);
	}
	var emptyAppContext = createAppContext();
	var uid = 0;
	function createComponentInstance(vnode, parent, suspense) {
		const type = vnode.type;
		const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
		const instance = {
			uid: uid++,
			vnode,
			type,
			parent,
			appContext,
			root: null,
			next: null,
			subTree: null,
			effect: null,
			update: null,
			job: null,
			scope: new EffectScope(true),
			render: null,
			proxy: null,
			exposed: null,
			exposeProxy: null,
			withProxy: null,
			provides: parent ? parent.provides : Object.create(appContext.provides),
			ids: parent ? parent.ids : [
				"",
				0,
				0
			],
			accessCache: null,
			renderCache: [],
			components: null,
			directives: null,
			propsOptions: normalizePropsOptions(type, appContext),
			emitsOptions: normalizeEmitsOptions(type, appContext),
			emit: null,
			emitted: null,
			propsDefaults: EMPTY_OBJ,
			inheritAttrs: type.inheritAttrs,
			ctx: EMPTY_OBJ,
			data: EMPTY_OBJ,
			props: EMPTY_OBJ,
			attrs: EMPTY_OBJ,
			slots: EMPTY_OBJ,
			refs: EMPTY_OBJ,
			setupState: EMPTY_OBJ,
			setupContext: null,
			suspense,
			suspenseId: suspense ? suspense.pendingId : 0,
			asyncDep: null,
			asyncResolved: false,
			isMounted: false,
			isUnmounted: false,
			isDeactivated: false,
			bc: null,
			c: null,
			bm: null,
			m: null,
			bu: null,
			u: null,
			um: null,
			bum: null,
			da: null,
			a: null,
			rtg: null,
			rtc: null,
			ec: null,
			sp: null
		};
		if (!!(process.env.NODE_ENV !== "production")) instance.ctx = createDevRenderContext(instance);
		else instance.ctx = { _: instance };
		instance.root = parent ? parent.root : instance;
		instance.emit = emit.bind(null, instance);
		if (vnode.ce) vnode.ce(instance);
		return instance;
	}
	var currentInstance = null;
	var getCurrentInstance = () => currentInstance || currentRenderingInstance;
	var internalSetCurrentInstance;
	var setInSSRSetupState;
	{
		const g = getGlobalThis$1();
		const registerGlobalSetter = (key, setter) => {
			let setters;
			if (!(setters = g[key])) setters = g[key] = [];
			setters.push(setter);
			return (v) => {
				if (setters.length > 1) setters.forEach((set) => set(v));
				else setters[0](v);
			};
		};
		internalSetCurrentInstance = registerGlobalSetter(`__VUE_INSTANCE_SETTERS__`, (v) => currentInstance = v);
		setInSSRSetupState = registerGlobalSetter(`__VUE_SSR_SETTERS__`, (v) => isInSSRComponentSetup = v);
	}
	var setCurrentInstance = (instance) => {
		const prev = currentInstance;
		internalSetCurrentInstance(instance);
		instance.scope.on();
		return () => {
			instance.scope.off();
			internalSetCurrentInstance(prev);
		};
	};
	var unsetCurrentInstance = () => {
		currentInstance && currentInstance.scope.off();
		internalSetCurrentInstance(null);
	};
	var isBuiltInTag = /* @__PURE__ */ makeMap("slot,component");
	function validateComponentName(name, { isNativeTag }) {
		if (isBuiltInTag(name) || isNativeTag(name)) warn$1("Do not use built-in or reserved HTML elements as component id: " + name);
	}
	function isStatefulComponent(instance) {
		return instance.vnode.shapeFlag & 4;
	}
	var isInSSRComponentSetup = false;
	function setupComponent(instance, isSSR = false, optimized = false) {
		isSSR && setInSSRSetupState(isSSR);
		const { props, children } = instance.vnode;
		const isStateful = isStatefulComponent(instance);
		initProps(instance, props, isStateful, isSSR);
		initSlots(instance, children, optimized || isSSR);
		const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
		isSSR && setInSSRSetupState(false);
		return setupResult;
	}
	function setupStatefulComponent(instance, isSSR) {
		const Component = instance.type;
		if (!!(process.env.NODE_ENV !== "production")) {
			if (Component.name) validateComponentName(Component.name, instance.appContext.config);
			if (Component.components) {
				const names = Object.keys(Component.components);
				for (let i = 0; i < names.length; i++) validateComponentName(names[i], instance.appContext.config);
			}
			if (Component.directives) {
				const names = Object.keys(Component.directives);
				for (let i = 0; i < names.length; i++) validateDirectiveName(names[i]);
			}
			if (Component.compilerOptions && isRuntimeOnly()) warn$1(`"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.`);
		}
		instance.accessCache = /* @__PURE__ */ Object.create(null);
		instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
		if (!!(process.env.NODE_ENV !== "production")) exposePropsOnRenderContext(instance);
		const { setup } = Component;
		if (setup) {
			pauseTracking();
			const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
			const reset = setCurrentInstance(instance);
			const setupResult = callWithErrorHandling(setup, instance, 0, [!!(process.env.NODE_ENV !== "production") ? /* @__PURE__ */ shallowReadonly(instance.props) : instance.props, setupContext]);
			const isAsyncSetup = isPromise$1(setupResult);
			resetTracking();
			reset();
			if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) markAsyncBoundary(instance);
			if (isAsyncSetup) {
				setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
				if (isSSR) return setupResult.then((resolvedResult) => {
					handleSetupResult(instance, resolvedResult, isSSR);
				}).catch((e) => {
					handleError(e, instance, 0);
				});
				else {
					instance.asyncDep = setupResult;
					if (!!(process.env.NODE_ENV !== "production") && !instance.suspense) warn$1(`Component <${formatComponentName(instance, Component)}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`);
				}
			} else handleSetupResult(instance, setupResult, isSSR);
		} else finishComponentSetup(instance, isSSR);
	}
	function handleSetupResult(instance, setupResult, isSSR) {
		if (isFunction$1(setupResult)) if (instance.type.__ssrInlineRender) instance.ssrRender = setupResult;
		else instance.render = setupResult;
		else if (isObject$2(setupResult)) {
			if (!!(process.env.NODE_ENV !== "production") && isVNode$1(setupResult)) warn$1(`setup() should not return VNodes directly - return a render function instead.`);
			if (!!(process.env.NODE_ENV !== "production") || false) instance.devtoolsRawSetupState = setupResult;
			instance.setupState = proxyRefs(setupResult);
			if (!!(process.env.NODE_ENV !== "production")) exposeSetupStateOnRenderContext(instance);
		} else if (!!(process.env.NODE_ENV !== "production") && setupResult !== void 0) warn$1(`setup() should return an object. Received: ${setupResult === null ? "null" : typeof setupResult}`);
		finishComponentSetup(instance, isSSR);
	}
	var compile$2;
	var installWithProxy;
	function registerRuntimeCompiler(_compile) {
		compile$2 = _compile;
		installWithProxy = (i) => {
			if (i.render._rc) i.withProxy = new Proxy(i.ctx, RuntimeCompiledPublicInstanceProxyHandlers);
		};
	}
	var isRuntimeOnly = () => !compile$2;
	function finishComponentSetup(instance, isSSR, skipOptions) {
		const Component = instance.type;
		if (!instance.render) {
			if (!isSSR && compile$2 && !Component.render) {
				const template = Component.template || resolveMergedOptions(instance).template;
				if (template) {
					if (!!(process.env.NODE_ENV !== "production")) startMeasure(instance, `compile`);
					const { isCustomElement, compilerOptions } = instance.appContext.config;
					const { delimiters, compilerOptions: componentCompilerOptions } = Component;
					const finalCompilerOptions = extend(extend({
						isCustomElement,
						delimiters
					}, compilerOptions), componentCompilerOptions);
					Component.render = compile$2(template, finalCompilerOptions);
					if (!!(process.env.NODE_ENV !== "production")) endMeasure(instance, `compile`);
				}
			}
			instance.render = Component.render || NOOP;
			if (installWithProxy) installWithProxy(instance);
		}
		{
			const reset = setCurrentInstance(instance);
			pauseTracking();
			try {
				applyOptions(instance);
			} finally {
				resetTracking();
				reset();
			}
		}
		if (!!(process.env.NODE_ENV !== "production") && !Component.render && instance.render === NOOP && !isSSR) if (!compile$2 && Component.template) warn$1("Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias \"vue\" to \"vue/dist/vue.esm-bundler.js\".");
		else warn$1(`Component is missing template or render function: `, Component);
	}
	var attrsProxyHandlers = !!(process.env.NODE_ENV !== "production") ? {
		get(target, key) {
			markAttrsAccessed();
			track(target, "get", "");
			return target[key];
		},
		set() {
			warn$1(`setupContext.attrs is readonly.`);
			return false;
		},
		deleteProperty() {
			warn$1(`setupContext.attrs is readonly.`);
			return false;
		}
	} : { get(target, key) {
		track(target, "get", "");
		return target[key];
	} };
	function getSlotsProxy(instance) {
		return new Proxy(instance.slots, { get(target, key) {
			track(instance, "get", "$slots");
			return target[key];
		} });
	}
	function createSetupContext(instance) {
		const expose = (exposed) => {
			if (!!(process.env.NODE_ENV !== "production")) {
				if (instance.exposed) warn$1(`expose() should be called only once per setup().`);
				if (exposed != null) {
					let exposedType = typeof exposed;
					if (exposedType === "object") {
						if (isArray$1(exposed)) exposedType = "array";
						else if (/* @__PURE__ */ isRef(exposed)) exposedType = "ref";
					}
					if (exposedType !== "object") warn$1(`expose() should be passed a plain object, received ${exposedType}.`);
				}
			}
			instance.exposed = exposed || {};
		};
		if (!!(process.env.NODE_ENV !== "production")) {
			let attrsProxy;
			let slotsProxy;
			return Object.freeze({
				get attrs() {
					return attrsProxy || (attrsProxy = new Proxy(instance.attrs, attrsProxyHandlers));
				},
				get slots() {
					return slotsProxy || (slotsProxy = getSlotsProxy(instance));
				},
				get emit() {
					return (event, ...args) => instance.emit(event, ...args);
				},
				expose
			});
		} else return {
			attrs: new Proxy(instance.attrs, attrsProxyHandlers),
			slots: instance.slots,
			emit: instance.emit,
			expose
		};
	}
	function getComponentPublicInstance(instance) {
		if (instance.exposed) return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
			get(target, key) {
				if (key in target) return target[key];
				else if (key in publicPropertiesMap) return publicPropertiesMap[key](instance);
			},
			has(target, key) {
				return key in target || key in publicPropertiesMap;
			}
		}));
		else return instance.proxy;
	}
	var classifyRE = /(?:^|[-_])\w/g;
	var classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
	function getComponentName(Component, includeInferred = true) {
		return isFunction$1(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
	}
	function formatComponentName(instance, Component, isRoot = false) {
		let name = getComponentName(Component);
		if (!name && Component.__file) {
			const match = Component.__file.match(/([^/\\]+)\.\w+$/);
			if (match) name = match[1];
		}
		if (!name && instance) {
			const inferFromRegistry = (registry) => {
				for (const key in registry) if (registry[key] === Component) return key;
			};
			name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
		}
		return name ? classify(name) : isRoot ? `App` : `Anonymous`;
	}
	function isClassComponent(value) {
		return isFunction$1(value) && "__vccOpts" in value;
	}
	var computed = (getterOrOptions, debugOptions) => {
		const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
		if (!!(process.env.NODE_ENV !== "production")) {
			const i = getCurrentInstance();
			if (i && i.appContext.config.warnRecursiveComputed) c._warnRecursive = true;
		}
		return c;
	};
	function h(type, propsOrChildren, children) {
		try {
			setBlockTracking(-1);
			const l = arguments.length;
			if (l === 2) if (isObject$2(propsOrChildren) && !isArray$1(propsOrChildren)) {
				if (isVNode$1(propsOrChildren)) return createVNode(type, null, [propsOrChildren]);
				return createVNode(type, propsOrChildren);
			} else return createVNode(type, null, propsOrChildren);
			else {
				if (l > 3) children = Array.prototype.slice.call(arguments, 2);
				else if (l === 3 && isVNode$1(children)) children = [children];
				return createVNode(type, propsOrChildren, children);
			}
		} finally {
			setBlockTracking(1);
		}
	}
	function initCustomFormatter() {
		if (!!!(process.env.NODE_ENV !== "production") || typeof window === "undefined") return;
		const vueStyle = { style: "color:#3ba776" };
		const numberStyle = { style: "color:#1677ff" };
		const stringStyle = { style: "color:#f5222d" };
		const keywordStyle = { style: "color:#eb2f96" };
		const formatter = {
			__vue_custom_formatter: true,
			header(obj) {
				if (!isObject$2(obj)) return null;
				if (obj.__isVue) return [
					"div",
					vueStyle,
					`VueInstance`
				];
				else if (/* @__PURE__ */ isRef(obj)) {
					pauseTracking();
					const value = obj.value;
					resetTracking();
					return [
						"div",
						{},
						[
							"span",
							vueStyle,
							genRefFlag(obj)
						],
						"<",
						formatValue(value),
						`>`
					];
				} else if (/* @__PURE__ */ isReactive(obj)) return [
					"div",
					{},
					[
						"span",
						vueStyle,
						/* @__PURE__ */ isShallow(obj) ? "ShallowReactive" : "Reactive"
					],
					"<",
					formatValue(obj),
					`>${/* @__PURE__ */ isReadonly(obj) ? ` (readonly)` : ``}`
				];
				else if (/* @__PURE__ */ isReadonly(obj)) return [
					"div",
					{},
					[
						"span",
						vueStyle,
						/* @__PURE__ */ isShallow(obj) ? "ShallowReadonly" : "Readonly"
					],
					"<",
					formatValue(obj),
					">"
				];
				return null;
			},
			hasBody(obj) {
				return obj && obj.__isVue;
			},
			body(obj) {
				if (obj && obj.__isVue) return [
					"div",
					{},
					...formatInstance(obj.$)
				];
			}
		};
		function formatInstance(instance) {
			const blocks = [];
			if (instance.type.props && instance.props) blocks.push(createInstanceBlock("props", /* @__PURE__ */ toRaw(instance.props)));
			if (instance.setupState !== EMPTY_OBJ) blocks.push(createInstanceBlock("setup", instance.setupState));
			if (instance.data !== EMPTY_OBJ) blocks.push(createInstanceBlock("data", /* @__PURE__ */ toRaw(instance.data)));
			const computed = extractKeys(instance, "computed");
			if (computed) blocks.push(createInstanceBlock("computed", computed));
			const injected = extractKeys(instance, "inject");
			if (injected) blocks.push(createInstanceBlock("injected", injected));
			blocks.push([
				"div",
				{},
				[
					"span",
					{ style: keywordStyle.style + ";opacity:0.66" },
					"$ (internal): "
				],
				["object", { object: instance }]
			]);
			return blocks;
		}
		function createInstanceBlock(type, target) {
			target = extend({}, target);
			if (!Object.keys(target).length) return ["span", {}];
			return [
				"div",
				{ style: "line-height:1.25em;margin-bottom:0.6em" },
				[
					"div",
					{ style: "color:#476582" },
					type
				],
				[
					"div",
					{ style: "padding-left:1.25em" },
					...Object.keys(target).map((key) => {
						return [
							"div",
							{},
							[
								"span",
								keywordStyle,
								key + ": "
							],
							formatValue(target[key], false)
						];
					})
				]
			];
		}
		function formatValue(v, asRaw = true) {
			if (typeof v === "number") return [
				"span",
				numberStyle,
				v
			];
			else if (typeof v === "string") return [
				"span",
				stringStyle,
				JSON.stringify(v)
			];
			else if (typeof v === "boolean") return [
				"span",
				keywordStyle,
				v
			];
			else if (isObject$2(v)) return ["object", { object: asRaw ? /* @__PURE__ */ toRaw(v) : v }];
			else return [
				"span",
				stringStyle,
				String(v)
			];
		}
		function extractKeys(instance, type) {
			const Comp = instance.type;
			if (isFunction$1(Comp)) return;
			const extracted = {};
			for (const key in instance.ctx) if (isKeyOfType(Comp, key, type)) extracted[key] = instance.ctx[key];
			return extracted;
		}
		function isKeyOfType(Comp, key, type) {
			const opts = Comp[type];
			if (isArray$1(opts) && opts.includes(key) || isObject$2(opts) && key in opts) return true;
			if (Comp.extends && isKeyOfType(Comp.extends, key, type)) return true;
			if (Comp.mixins && Comp.mixins.some((m) => isKeyOfType(m, key, type))) return true;
		}
		function genRefFlag(v) {
			if (/* @__PURE__ */ isShallow(v)) return `ShallowRef`;
			if (v.effect) return `ComputedRef`;
			return `Ref`;
		}
		if (window.devtoolsFormatters) window.devtoolsFormatters.push(formatter);
		else window.devtoolsFormatters = [formatter];
	}
	function withMemo(memo, render, cache, index) {
		const cached = cache[index];
		if (cached && isMemoSame(cached, memo)) return cached;
		const ret = render();
		ret.memo = memo.slice();
		ret.cacheIndex = index;
		return cache[index] = ret;
	}
	function isMemoSame(cached, memo) {
		const prev = cached.memo;
		if (prev.length != memo.length) return false;
		for (let i = 0; i < prev.length; i++) if (hasChanged(prev[i], memo[i])) return false;
		if (isBlockTreeEnabled > 0 && currentBlock) currentBlock.push(cached);
		return true;
	}
	var version = "3.5.39";
	var warn$2 = !!(process.env.NODE_ENV !== "production") ? warn$1 : NOOP;
	var ErrorTypeStrings = ErrorTypeStrings$1;
	var devtools$2 = (process.env.NODE_ENV, devtools$1);
	var setDevtoolsHook = (process.env.NODE_ENV, setDevtoolsHook$1);
	var ssrUtils = {
		createComponentInstance,
		setupComponent,
		renderComponentRoot,
		setCurrentRenderingInstance,
		isVNode: isVNode$1,
		normalizeVNode,
		getComponentPublicInstance,
		ensureValidVNode,
		pushWarningContext,
		popWarningContext
	};
	//#endregion
	//#region node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
	/**
	* @vue/runtime-dom v3.5.39
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	var policy = void 0;
	var tt = typeof window !== "undefined" && window.trustedTypes;
	if (tt) try {
		policy = /* @__PURE__ */ tt.createPolicy("vue", { createHTML: (val) => val });
	} catch (e) {
		process.env.NODE_ENV !== "production" && warn$2(`Error creating trusted types policy: ${e}`);
	}
	var unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
	var svgNS = "http://www.w3.org/2000/svg";
	var mathmlNS = "http://www.w3.org/1998/Math/MathML";
	var doc = typeof document !== "undefined" ? document : null;
	var templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
	var nodeOps = {
		insert: (child, parent, anchor) => {
			parent.insertBefore(child, anchor || null);
		},
		remove: (child) => {
			const parent = child.parentNode;
			if (parent) parent.removeChild(child);
		},
		createElement: (tag, namespace, is, props) => {
			const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
			if (tag === "select" && props && props.multiple != null) el.setAttribute("multiple", props.multiple);
			return el;
		},
		createText: (text) => doc.createTextNode(text),
		createComment: (text) => doc.createComment(text),
		setText: (node, text) => {
			node.nodeValue = text;
		},
		setElementText: (el, text) => {
			el.textContent = text;
		},
		parentNode: (node) => node.parentNode,
		nextSibling: (node) => node.nextSibling,
		querySelector: (selector) => doc.querySelector(selector),
		setScopeId(el, id) {
			el.setAttribute(id, "");
		},
		insertStaticContent(content, parent, anchor, namespace, start, end) {
			const before = anchor ? anchor.previousSibling : parent.lastChild;
			if (start && (start === end || start.nextSibling)) while (true) {
				parent.insertBefore(start.cloneNode(true), anchor);
				if (start === end || !(start = start.nextSibling)) break;
			}
			else {
				templateContainer.innerHTML = unsafeToTrustedHTML(namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content);
				const template = templateContainer.content;
				if (namespace === "svg" || namespace === "mathml") {
					const wrapper = template.firstChild;
					while (wrapper.firstChild) template.appendChild(wrapper.firstChild);
					template.removeChild(wrapper);
				}
				parent.insertBefore(template, anchor);
			}
			return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild];
		}
	};
	var TRANSITION = "transition";
	var ANIMATION = "animation";
	var vtcKey = /* @__PURE__ */ Symbol("_vtc");
	var DOMTransitionPropsValidators = {
		name: String,
		type: String,
		css: {
			type: Boolean,
			default: true
		},
		duration: [
			String,
			Number,
			Object
		],
		enterFromClass: String,
		enterActiveClass: String,
		enterToClass: String,
		appearFromClass: String,
		appearActiveClass: String,
		appearToClass: String,
		leaveFromClass: String,
		leaveActiveClass: String,
		leaveToClass: String
	};
	var TransitionPropsValidators = /* @__PURE__ */ extend({}, BaseTransitionPropsValidators, DOMTransitionPropsValidators);
	var decorate$1 = (t) => {
		t.displayName = "Transition";
		t.props = TransitionPropsValidators;
		return t;
	};
	var Transition = /* @__PURE__ */ decorate$1((props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots));
	var callHook = (hook, args = []) => {
		if (isArray$1(hook)) hook.forEach((h2) => h2(...args));
		else if (hook) hook(...args);
	};
	var hasExplicitCallback = (hook) => {
		return hook ? isArray$1(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
	};
	function resolveTransitionProps(rawProps) {
		const baseProps = {};
		for (const key in rawProps) if (!(key in DOMTransitionPropsValidators)) baseProps[key] = rawProps[key];
		if (rawProps.css === false) return baseProps;
		const { name = "v", type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
		const durations = normalizeDuration(duration);
		const enterDuration = durations && durations[0];
		const leaveDuration = durations && durations[1];
		const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
		const finishEnter = (el, isAppear, done, isCancelled) => {
			el._enterCancelled = isCancelled;
			removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
			removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
			done && done();
		};
		const finishLeave = (el, done) => {
			el._isLeaving = false;
			removeTransitionClass(el, leaveFromClass);
			removeTransitionClass(el, leaveToClass);
			removeTransitionClass(el, leaveActiveClass);
			done && done();
		};
		const makeEnterHook = (isAppear) => {
			return (el, done) => {
				const hook = isAppear ? onAppear : onEnter;
				const resolve = () => finishEnter(el, isAppear, done);
				callHook(hook, [el, resolve]);
				nextFrame(() => {
					removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
					addTransitionClass(el, isAppear ? appearToClass : enterToClass);
					if (!hasExplicitCallback(hook)) whenTransitionEnds(el, type, enterDuration, resolve);
				});
			};
		};
		return extend(baseProps, {
			onBeforeEnter(el) {
				callHook(onBeforeEnter, [el]);
				addTransitionClass(el, enterFromClass);
				addTransitionClass(el, enterActiveClass);
			},
			onBeforeAppear(el) {
				callHook(onBeforeAppear, [el]);
				addTransitionClass(el, appearFromClass);
				addTransitionClass(el, appearActiveClass);
			},
			onEnter: makeEnterHook(false),
			onAppear: makeEnterHook(true),
			onLeave(el, done) {
				el._isLeaving = true;
				const resolve = () => finishLeave(el, done);
				addTransitionClass(el, leaveFromClass);
				if (!el._enterCancelled) {
					forceReflow(el);
					addTransitionClass(el, leaveActiveClass);
				} else {
					addTransitionClass(el, leaveActiveClass);
					forceReflow(el);
				}
				nextFrame(() => {
					if (!el._isLeaving) return;
					removeTransitionClass(el, leaveFromClass);
					addTransitionClass(el, leaveToClass);
					if (!hasExplicitCallback(onLeave)) whenTransitionEnds(el, type, leaveDuration, resolve);
				});
				callHook(onLeave, [el, resolve]);
			},
			onEnterCancelled(el) {
				finishEnter(el, false, void 0, true);
				callHook(onEnterCancelled, [el]);
			},
			onAppearCancelled(el) {
				finishEnter(el, true, void 0, true);
				callHook(onAppearCancelled, [el]);
			},
			onLeaveCancelled(el) {
				finishLeave(el);
				callHook(onLeaveCancelled, [el]);
			}
		});
	}
	function normalizeDuration(duration) {
		if (duration == null) return null;
		else if (isObject$2(duration)) return [NumberOf(duration.enter), NumberOf(duration.leave)];
		else {
			const n = NumberOf(duration);
			return [n, n];
		}
	}
	function NumberOf(val) {
		const res = toNumber(val);
		if (!!(process.env.NODE_ENV !== "production")) assertNumber(res, "<transition> explicit duration");
		return res;
	}
	function addTransitionClass(el, cls) {
		cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
		(el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
	}
	function removeTransitionClass(el, cls) {
		cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
		const _vtc = el[vtcKey];
		if (_vtc) {
			_vtc.delete(cls);
			if (!_vtc.size) el[vtcKey] = void 0;
		}
	}
	function nextFrame(cb) {
		requestAnimationFrame(() => {
			requestAnimationFrame(cb);
		});
	}
	var endId = 0;
	function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
		const id = el._endId = ++endId;
		const resolveIfNotStale = () => {
			if (id === el._endId) resolve();
		};
		if (explicitTimeout != null) return setTimeout(resolveIfNotStale, explicitTimeout);
		const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
		if (!type) return resolve();
		const endEvent = type + "end";
		let ended = 0;
		const end = () => {
			el.removeEventListener(endEvent, onEnd);
			resolveIfNotStale();
		};
		const onEnd = (e) => {
			if (e.target === el && ++ended >= propCount) end();
		};
		setTimeout(() => {
			if (ended < propCount) end();
		}, timeout + 1);
		el.addEventListener(endEvent, onEnd);
	}
	function getTransitionInfo(el, expectedType) {
		const styles = window.getComputedStyle(el);
		const getStyleProperties = (key) => (styles[key] || "").split(", ");
		const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
		const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
		const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
		const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
		const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
		const animationTimeout = getTimeout(animationDelays, animationDurations);
		let type = null;
		let timeout = 0;
		let propCount = 0;
		if (expectedType === TRANSITION) {
			if (transitionTimeout > 0) {
				type = TRANSITION;
				timeout = transitionTimeout;
				propCount = transitionDurations.length;
			}
		} else if (expectedType === ANIMATION) {
			if (animationTimeout > 0) {
				type = ANIMATION;
				timeout = animationTimeout;
				propCount = animationDurations.length;
			}
		} else {
			timeout = Math.max(transitionTimeout, animationTimeout);
			type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
			propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
		}
		const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(getStyleProperties(`${TRANSITION}Property`).toString());
		return {
			type,
			timeout,
			propCount,
			hasTransform
		};
	}
	function getTimeout(delays, durations) {
		while (delays.length < durations.length) delays = delays.concat(delays);
		return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
	}
	function toMs(s) {
		if (s === "auto") return 0;
		return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
	}
	function forceReflow(el) {
		return (el ? el.ownerDocument : document).body.offsetHeight;
	}
	function patchClass(el, value, isSVG) {
		const transitionClasses = el[vtcKey];
		if (transitionClasses) value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
		if (value == null) el.removeAttribute("class");
		else if (isSVG) el.setAttribute("class", value);
		else el.className = value;
	}
	var vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
	var vShowHidden = /* @__PURE__ */ Symbol("_vsh");
	var vShow = {
		name: "show",
		beforeMount(el, { value }, { transition }) {
			el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
			if (transition && value) transition.beforeEnter(el);
			else setDisplay(el, value);
		},
		mounted(el, { value }, { transition }) {
			if (transition && value) transition.enter(el);
		},
		updated(el, { value, oldValue }, { transition }) {
			if (!value === !oldValue) return;
			if (transition) if (value) {
				transition.beforeEnter(el);
				setDisplay(el, true);
				transition.enter(el);
			} else transition.leave(el, () => {
				setDisplay(el, false);
			});
			else setDisplay(el, value);
		},
		beforeUnmount(el, { value }) {
			setDisplay(el, value);
		}
	};
	function setDisplay(el, value) {
		el.style.display = value ? el[vShowOriginalDisplay] : "none";
		el[vShowHidden] = !value;
	}
	function initVShowForSSR() {
		vShow.getSSRProps = ({ value }) => {
			if (!value) return { style: { display: "none" } };
		};
	}
	var CSS_VAR_TEXT = /* @__PURE__ */ Symbol(!!(process.env.NODE_ENV !== "production") ? "CSS_VAR_TEXT" : "");
	function useCssVars(getter) {
		const instance = getCurrentInstance();
		if (!instance) {
			process.env.NODE_ENV !== "production" && warn$2(`useCssVars is called without current active component instance.`);
			return;
		}
		const updateTeleports = instance.ut = (vars = getter(instance.proxy)) => {
			Array.from(document.querySelectorAll(`[data-v-owner="${instance.uid}"]`)).forEach((node) => setVarsOnNode(node, vars));
		};
		if (!!(process.env.NODE_ENV !== "production")) instance.getCssVars = () => getter(instance.proxy);
		const setVars = () => {
			const vars = getter(instance.proxy);
			if (instance.ce) setVarsOnNode(instance.ce, vars);
			else setVarsOnVNode(instance.subTree, vars);
			updateTeleports(vars);
		};
		onBeforeUpdate(() => {
			queuePostFlushCb(setVars);
		});
		onMounted(() => {
			watch(setVars, NOOP, { flush: "post" });
			const ob = new MutationObserver(setVars);
			ob.observe(instance.subTree.el.parentNode, { childList: true });
			onUnmounted(() => ob.disconnect());
		});
	}
	function setVarsOnVNode(vnode, vars) {
		if (vnode.shapeFlag & 128) {
			const suspense = vnode.suspense;
			vnode = suspense.activeBranch;
			if (suspense.pendingBranch && !suspense.isHydrating) suspense.effects.push(() => {
				setVarsOnVNode(suspense.activeBranch, vars);
			});
		}
		while (vnode.component) vnode = vnode.component.subTree;
		if (vnode.shapeFlag & 1 && vnode.el) setVarsOnNode(vnode.el, vars);
		else if (vnode.type === Fragment) vnode.children.forEach((c) => setVarsOnVNode(c, vars));
		else if (vnode.type === Static) {
			let { el, anchor } = vnode;
			while (el) {
				setVarsOnNode(el, vars);
				if (el === anchor) break;
				el = el.nextSibling;
			}
		}
	}
	function setVarsOnNode(el, vars) {
		if (el.nodeType === 1) {
			const style = el.style;
			let cssText = "";
			for (const key in vars) {
				const value = normalizeCssVarValue(vars[key]);
				style.setProperty(`--${key}`, value);
				cssText += `--${key}: ${value};`;
			}
			style[CSS_VAR_TEXT] = cssText;
		}
	}
	var displayRE = /(?:^|;)\s*display\s*:/;
	function patchStyle(el, prev, next) {
		const style = el.style;
		const isCssString = isString$1(next);
		let hasControlledDisplay = false;
		if (next && !isCssString) {
			if (prev) if (!isString$1(prev)) {
				for (const key in prev) if (next[key] == null) setStyle(style, key, "");
			} else for (const prevStyle of prev.split(";")) {
				const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
				if (next[key] == null) setStyle(style, key, "");
			}
			for (const key in next) {
				if (key === "display") hasControlledDisplay = true;
				const value = next[key];
				if (value != null) {
					if (!shouldPreserveTextareaResizeStyle(el, key, !isString$1(prev) && prev ? prev[key] : void 0, value)) setStyle(style, key, value);
				} else setStyle(style, key, "");
			}
		} else if (isCssString) {
			if (prev !== next) {
				const cssVarText = style[CSS_VAR_TEXT];
				if (cssVarText) next += ";" + cssVarText;
				style.cssText = next;
				hasControlledDisplay = displayRE.test(next);
			}
		} else if (prev) el.removeAttribute("style");
		if (vShowOriginalDisplay in el) {
			el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
			if (el[vShowHidden]) style.display = "none";
		}
	}
	var semicolonRE = /[^\\];\s*$/;
	var importantRE = /\s*!important$/;
	function setStyle(style, name, val) {
		if (isArray$1(val)) val.forEach((v) => setStyle(style, name, v));
		else {
			if (val == null) val = "";
			if (!!(process.env.NODE_ENV !== "production")) {
				if (semicolonRE.test(val)) warn$2(`Unexpected semicolon at the end of '${name}' style value: '${val}'`);
			}
			if (name.startsWith("--")) style.setProperty(name, val);
			else {
				const prefixed = autoPrefix(style, name);
				if (importantRE.test(val)) style.setProperty(hyphenate$1(prefixed), val.replace(importantRE, ""), "important");
				else style[prefixed] = val;
			}
		}
	}
	var prefixes = [
		"Webkit",
		"Moz",
		"ms"
	];
	var prefixCache = {};
	function autoPrefix(style, rawName) {
		const cached = prefixCache[rawName];
		if (cached) return cached;
		let name = camelize$1(rawName);
		if (name !== "filter" && name in style) return prefixCache[rawName] = name;
		name = capitalize$1(name);
		for (let i = 0; i < prefixes.length; i++) {
			const prefixed = prefixes[i] + name;
			if (prefixed in style) return prefixCache[rawName] = prefixed;
		}
		return rawName;
	}
	function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
		return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString$1(next) && prev === next;
	}
	var xlinkNS = "http://www.w3.org/1999/xlink";
	function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
		if (isSVG && key.startsWith("xlink:")) if (value == null) el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
		else el.setAttributeNS(xlinkNS, key, value);
		else if (value == null || isBoolean && !includeBooleanAttr(value)) el.removeAttribute(key);
		else el.setAttribute(key, isBoolean ? "" : isSymbol(value) ? String(value) : value);
	}
	function patchDOMProp(el, key, value, parentComponent, attrName) {
		if (key === "innerHTML" || key === "textContent") {
			if (value != null) el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
			return;
		}
		const tag = el.tagName;
		if (key === "value" && tag !== "PROGRESS" && !tag.includes("-")) {
			const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
			const newValue = value == null ? el.type === "checkbox" ? "on" : "" : String(value);
			if (oldValue !== newValue || !("_value" in el)) el.value = newValue;
			if (value == null) el.removeAttribute(key);
			el._value = value;
			return;
		}
		let needRemove = false;
		if (value === "" || value == null) {
			const type = typeof el[key];
			if (type === "boolean") value = includeBooleanAttr(value);
			else if (value == null && type === "string") {
				value = "";
				needRemove = true;
			} else if (type === "number") {
				value = 0;
				needRemove = true;
			}
		}
		try {
			el[key] = value;
		} catch (e) {
			if (!!(process.env.NODE_ENV !== "production") && !needRemove) warn$2(`Failed setting prop "${key}" on <${tag.toLowerCase()}>: value ${value} is invalid.`, e);
		}
		needRemove && el.removeAttribute(attrName || key);
	}
	function addEventListener(el, event, handler, options) {
		el.addEventListener(event, handler, options);
	}
	function removeEventListener(el, event, handler, options) {
		el.removeEventListener(event, handler, options);
	}
	var veiKey = /* @__PURE__ */ Symbol("_vei");
	function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
		const invokers = el[veiKey] || (el[veiKey] = {});
		const existingInvoker = invokers[rawName];
		if (nextValue && existingInvoker) existingInvoker.value = !!(process.env.NODE_ENV !== "production") ? sanitizeEventValue(nextValue, rawName) : nextValue;
		else {
			const [name, options] = parseName(rawName);
			if (nextValue) addEventListener(el, name, invokers[rawName] = createInvoker(!!(process.env.NODE_ENV !== "production") ? sanitizeEventValue(nextValue, rawName) : nextValue, instance), options);
			else if (existingInvoker) {
				removeEventListener(el, name, existingInvoker, options);
				invokers[rawName] = void 0;
			}
		}
	}
	var optionsModifierRE = /(Once|Passive|Capture)$/;
	var optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
	function parseName(name) {
		let options;
		let m;
		while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
			if (!options) options = {};
			name = name.slice(0, name.length - m[1].length);
			options[m[1].toLowerCase()] = true;
		}
		return [name[2] === ":" ? name.slice(3) : hyphenate$1(name.slice(2)), options];
	}
	var cachedNow = 0;
	var p = /* @__PURE__ */ Promise.resolve();
	var getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
	function createInvoker(initialValue, instance) {
		const invoker = (e) => {
			if (!e._vts) e._vts = Date.now();
			else if (e._vts <= invoker.attached) return;
			const value = invoker.value;
			if (isArray$1(value)) {
				const originalStop = e.stopImmediatePropagation;
				e.stopImmediatePropagation = () => {
					originalStop.call(e);
					e._stopped = true;
				};
				const handlers = value.slice();
				const args = [e];
				for (let i = 0; i < handlers.length; i++) {
					if (e._stopped) break;
					const handler = handlers[i];
					if (handler) callWithAsyncErrorHandling(handler, instance, 5, args);
				}
			} else callWithAsyncErrorHandling(value, instance, 5, [e]);
		};
		invoker.value = initialValue;
		invoker.attached = getNow();
		return invoker;
	}
	function sanitizeEventValue(value, propName) {
		if (isFunction$1(value) || isArray$1(value)) return value;
		warn$2(`Wrong type passed as event handler to ${propName} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof value}.`);
		return NOOP;
	}
	var isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
	var patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
		const isSVG = namespace === "svg";
		if (key === "class") patchClass(el, nextValue, isSVG);
		else if (key === "style") patchStyle(el, prevValue, nextValue);
		else if (isOn(key)) {
			if (!isModelListener(key)) patchEvent(el, key, prevValue, nextValue, parentComponent);
		} else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
			patchDOMProp(el, key, nextValue);
			if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
		} else if (el._isVueCE && (shouldSetAsPropForVueCE(el, key) || el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString$1(nextValue)))) patchDOMProp(el, camelize$1(key), nextValue, parentComponent, key);
		else {
			if (key === "true-value") el._trueValue = nextValue;
			else if (key === "false-value") el._falseValue = nextValue;
			patchAttr(el, key, nextValue, isSVG);
		}
	};
	function shouldSetAsProp(el, key, value, isSVG) {
		if (isSVG) {
			if (key === "innerHTML" || key === "textContent") return true;
			if (key in el && isNativeOn(key) && isFunction$1(value)) return true;
			return false;
		}
		if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") return false;
		if (key === "sandbox" && el.tagName === "IFRAME") return false;
		if (key === "form") return false;
		if (key === "list" && el.tagName === "INPUT") return false;
		if (key === "type" && el.tagName === "TEXTAREA") return false;
		if (key === "width" || key === "height") {
			const tag = el.tagName;
			if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") return false;
		}
		if (isNativeOn(key) && isString$1(value)) return false;
		return key in el;
	}
	function shouldSetAsPropForVueCE(el, key) {
		const props = el._def.props;
		if (!props) return false;
		const camelKey = camelize$1(key);
		return Array.isArray(props) ? props.some((prop) => camelize$1(prop) === camelKey) : Object.keys(props).some((prop) => camelize$1(prop) === camelKey);
	}
	var REMOVAL = {};
	// @__NO_SIDE_EFFECTS__
	function defineCustomElement(options, extraOptions, _createApp) {
		let Comp = /* @__PURE__ */ defineComponent(options, extraOptions);
		if (isPlainObject$2(Comp)) Comp = extend({}, Comp, extraOptions);
		class VueCustomElement extends VueElement {
			constructor(initialProps) {
				super(Comp, initialProps, _createApp);
			}
		}
		VueCustomElement.def = Comp;
		return VueCustomElement;
	}
	var defineSSRCustomElement = /* @__NO_SIDE_EFFECTS__ */ ((options, extraOptions) => {
		return /* @__PURE__ */ defineCustomElement(options, extraOptions, createSSRApp);
	});
	var BaseClass = typeof HTMLElement !== "undefined" ? HTMLElement : class {};
	var VueElement = class VueElement extends BaseClass {
		constructor(_def, _props = {}, _createApp = createApp) {
			super();
			this._def = _def;
			this._props = _props;
			this._createApp = _createApp;
			this._isVueCE = true;
			/**
			* @internal
			*/
			this._instance = null;
			/**
			* @internal
			*/
			this._app = null;
			/**
			* @internal
			*/
			this._nonce = this._def.nonce;
			this._connected = false;
			this._resolved = false;
			this._patching = false;
			this._dirty = false;
			this._numberProps = null;
			this._styleChildren = /* @__PURE__ */ new WeakSet();
			this._styleAnchors = /* @__PURE__ */ new WeakMap();
			this._ob = null;
			if (this.shadowRoot && _createApp !== createApp) this._root = this.shadowRoot;
			else {
				if (!!(process.env.NODE_ENV !== "production") && this.shadowRoot) warn$2(`Custom element has pre-rendered declarative shadow root but is not defined as hydratable. Use \`defineSSRCustomElement\`.`);
				if (_def.shadowRoot !== false) {
					this.attachShadow(extend({}, _def.shadowRootOptions, { mode: "open" }));
					this._root = this.shadowRoot;
				} else this._root = this;
			}
		}
		connectedCallback() {
			if (!this.isConnected) return;
			if (!this.shadowRoot && !this._resolved) this._parseSlots();
			this._connected = true;
			let parent = this;
			while (parent = parent && (parent.assignedSlot || parent.parentNode || parent.host)) if (parent instanceof VueElement) {
				this._parent = parent;
				break;
			}
			if (!this._instance) if (this._resolved) this._mount(this._def);
			else if (parent && parent._pendingResolve) this._pendingResolve = parent._pendingResolve.then(() => {
				this._pendingResolve = void 0;
				this._resolveDef();
			});
			else this._resolveDef();
		}
		_setParent(parent = this._parent) {
			if (parent) {
				this._instance.parent = parent._instance;
				this._inheritParentContext(parent);
			}
		}
		_inheritParentContext(parent = this._parent) {
			if (parent && this._app) Object.setPrototypeOf(this._app._context.provides, parent._instance.provides);
		}
		disconnectedCallback() {
			this._connected = false;
			nextTick(() => {
				if (!this._connected) {
					if (this._ob) {
						this._ob.disconnect();
						this._ob = null;
					}
					this._app && this._app.unmount();
					if (this._instance) this._instance.ce = void 0;
					this._app = this._instance = null;
					if (this._teleportTargets) {
						this._teleportTargets.clear();
						this._teleportTargets = void 0;
					}
				}
			});
		}
		_processMutations(mutations) {
			for (const m of mutations) this._setAttr(m.attributeName);
		}
		/**
		* resolve inner component definition (handle possible async component)
		*/
		_resolveDef() {
			if (this._pendingResolve) return;
			for (let i = 0; i < this.attributes.length; i++) this._setAttr(this.attributes[i].name);
			this._ob = new MutationObserver(this._processMutations.bind(this));
			this._ob.observe(this, { attributes: true });
			const resolve = (def, isAsync = false) => {
				this._resolved = true;
				this._pendingResolve = void 0;
				const { props, styles } = def;
				let numberProps;
				if (props && !isArray$1(props)) for (const key in props) {
					const opt = props[key];
					if (opt === Number || opt && opt.type === Number) {
						if (key in this._props) this._props[key] = toNumber(this._props[key]);
						(numberProps || (numberProps = /* @__PURE__ */ Object.create(null)))[camelize$1(key)] = true;
					}
				}
				this._numberProps = numberProps;
				this._resolveProps(def);
				if (this.shadowRoot) this._applyStyles(styles);
				else if (!!(process.env.NODE_ENV !== "production") && styles) warn$2("Custom element style injection is not supported when using shadowRoot: false");
				this._mount(def);
			};
			const asyncDef = this._def.__asyncLoader;
			if (asyncDef) this._pendingResolve = asyncDef().then((def) => {
				def.configureApp = this._def.configureApp;
				resolve(this._def = def, true);
			});
			else resolve(this._def);
		}
		_mount(def) {
			if ((!!(process.env.NODE_ENV !== "production") || false) && !def.name) def.name = "VueElement";
			this._app = this._createApp(def);
			this._inheritParentContext();
			if (def.configureApp) def.configureApp(this._app);
			this._app._ceVNode = this._createVNode();
			this._app.mount(this._root);
			const exposed = this._instance && this._instance.exposed;
			if (!exposed) return;
			for (const key in exposed) if (!hasOwn$1(this, key)) Object.defineProperty(this, key, { get: () => unref(exposed[key]) });
			else if (!!(process.env.NODE_ENV !== "production")) warn$2(`Exposed property "${key}" already exists on custom element.`);
		}
		_resolveProps(def) {
			const { props } = def;
			const declaredPropKeys = isArray$1(props) ? props : Object.keys(props || {});
			for (const key of Object.keys(this)) if (key[0] !== "_" && declaredPropKeys.includes(key)) this._setProp(key, this[key]);
			for (const key of declaredPropKeys.map(camelize$1)) Object.defineProperty(this, key, {
				get() {
					return this._getProp(key);
				},
				set(val) {
					this._setProp(key, val, true, !this._patching);
				}
			});
		}
		_setAttr(key) {
			if (key.startsWith("data-v-")) return;
			const has = this.hasAttribute(key);
			let value = has ? this.getAttribute(key) : REMOVAL;
			const camelKey = camelize$1(key);
			if (has && this._numberProps && this._numberProps[camelKey]) value = toNumber(value);
			this._setProp(camelKey, value, false, true);
		}
		/**
		* @internal
		*/
		_getProp(key) {
			return this._props[key];
		}
		/**
		* @internal
		*/
		_setProp(key, val, shouldReflect = true, shouldUpdate = false) {
			if (val !== this._props[key]) {
				this._dirty = true;
				if (val === REMOVAL) delete this._props[key];
				else {
					this._props[key] = val;
					if (key === "key" && this._app) this._app._ceVNode.key = val;
				}
				if (shouldUpdate && this._instance) this._update();
				if (shouldReflect) {
					const ob = this._ob;
					if (ob) {
						this._processMutations(ob.takeRecords());
						ob.disconnect();
					}
					if (val === true) this.setAttribute(hyphenate$1(key), "");
					else if (typeof val === "string" || typeof val === "number") this.setAttribute(hyphenate$1(key), val + "");
					else if (!val) this.removeAttribute(hyphenate$1(key));
					ob && ob.observe(this, { attributes: true });
				}
			}
		}
		_update() {
			const vnode = this._createVNode();
			if (this._app) vnode.appContext = this._app._context;
			render(vnode, this._root);
		}
		_createVNode() {
			const baseProps = {};
			if (!this.shadowRoot) baseProps.onVnodeMounted = baseProps.onVnodeUpdated = this._renderSlots.bind(this);
			const vnode = createVNode(this._def, extend(baseProps, this._props));
			if (!this._instance) vnode.ce = (instance) => {
				this._instance = instance;
				instance.ce = this;
				instance.isCE = true;
				if (!!(process.env.NODE_ENV !== "production")) instance.ceReload = (newStyles) => {
					if (this._styles) {
						this._styles.forEach((s) => this._root.removeChild(s));
						this._styles.length = 0;
					}
					this._styleAnchors.delete(this._def);
					this._applyStyles(newStyles);
					this._instance = null;
					this._update();
				};
				const dispatch = (event, args) => {
					this.dispatchEvent(new CustomEvent(event, isPlainObject$2(args[0]) ? extend({ detail: args }, args[0]) : { detail: args }));
				};
				instance.emit = (event, ...args) => {
					dispatch(event, args);
					if (hyphenate$1(event) !== event) dispatch(hyphenate$1(event), args);
				};
				this._setParent();
			};
			return vnode;
		}
		_applyStyles(styles, owner, parentComp) {
			if (!styles) return;
			if (owner) {
				if (owner === this._def || this._styleChildren.has(owner)) return;
				this._styleChildren.add(owner);
			}
			const nonce = this._nonce;
			const root = this.shadowRoot;
			const insertionAnchor = parentComp ? this._getStyleAnchor(parentComp) || this._getStyleAnchor(this._def) : this._getRootStyleInsertionAnchor(root);
			let last = null;
			for (let i = styles.length - 1; i >= 0; i--) {
				const s = document.createElement("style");
				if (nonce) s.setAttribute("nonce", nonce);
				s.textContent = styles[i];
				root.insertBefore(s, last || insertionAnchor);
				last = s;
				if (i === 0) {
					if (!parentComp) this._styleAnchors.set(this._def, s);
					if (owner) this._styleAnchors.set(owner, s);
				}
				if (!!(process.env.NODE_ENV !== "production")) if (owner) {
					if (owner.__hmrId) {
						if (!this._childStyles) this._childStyles = /* @__PURE__ */ new Map();
						let entry = this._childStyles.get(owner.__hmrId);
						if (!entry) this._childStyles.set(owner.__hmrId, entry = []);
						entry.push(s);
					}
				} else (this._styles || (this._styles = [])).push(s);
			}
		}
		_getStyleAnchor(comp) {
			if (!comp) return null;
			const anchor = this._styleAnchors.get(comp);
			if (anchor && anchor.parentNode === this.shadowRoot) return anchor;
			if (anchor) this._styleAnchors.delete(comp);
			return null;
		}
		_getRootStyleInsertionAnchor(root) {
			for (let i = 0; i < root.childNodes.length; i++) {
				const node = root.childNodes[i];
				if (!(node instanceof HTMLStyleElement)) return node;
			}
			return null;
		}
		/**
		* Only called when shadowRoot is false
		*/
		_parseSlots() {
			const slots = this._slots = {};
			let n;
			while (n = this.firstChild) {
				const slotName = n.nodeType === 1 && n.getAttribute("slot") || "default";
				(slots[slotName] || (slots[slotName] = [])).push(n);
				this.removeChild(n);
			}
		}
		/**
		* Only called when shadowRoot is false
		*/
		_renderSlots() {
			const outlets = this._getSlots();
			const scopeId = this._instance.type.__scopeId;
			for (let i = 0; i < outlets.length; i++) {
				const o = outlets[i];
				const slotName = o.getAttribute("name") || "default";
				const content = this._slots[slotName];
				const parent = o.parentNode;
				if (content) for (const n of content) {
					if (scopeId && n.nodeType === 1) {
						const id = scopeId + "-s";
						const walker = document.createTreeWalker(n, 1);
						n.setAttribute(id, "");
						let child;
						while (child = walker.nextNode()) child.setAttribute(id, "");
					}
					parent.insertBefore(n, o);
				}
				else while (o.firstChild) parent.insertBefore(o.firstChild, o);
				parent.removeChild(o);
			}
		}
		/**
		* @internal
		*/
		_getSlots() {
			const roots = [this];
			if (this._teleportTargets) roots.push(...this._teleportTargets);
			const slots = /* @__PURE__ */ new Set();
			for (const root of roots) {
				const found = root.querySelectorAll("slot");
				for (let i = 0; i < found.length; i++) slots.add(found[i]);
			}
			return Array.from(slots);
		}
		/**
		* @internal
		*/
		_injectChildStyle(comp, parentComp) {
			this._applyStyles(comp.styles, comp, parentComp);
		}
		/**
		* @internal
		*/
		_beginPatch() {
			this._patching = true;
			this._dirty = false;
		}
		/**
		* @internal
		*/
		_endPatch() {
			this._patching = false;
			if (this._dirty && this._instance) this._update();
		}
		/**
		* @internal
		*/
		_hasShadowRoot() {
			return this._def.shadowRoot !== false;
		}
		/**
		* @internal
		*/
		_removeChildStyle(comp) {
			if (!!(process.env.NODE_ENV !== "production")) {
				this._styleChildren.delete(comp);
				this._styleAnchors.delete(comp);
				if (this._childStyles && comp.__hmrId) {
					const oldStyles = this._childStyles.get(comp.__hmrId);
					if (oldStyles) {
						oldStyles.forEach((s) => this._root.removeChild(s));
						oldStyles.length = 0;
					}
				}
			}
		}
	};
	function useHost(caller) {
		const instance = getCurrentInstance();
		const el = instance && instance.ce;
		if (el) return el;
		else if (!!(process.env.NODE_ENV !== "production")) if (!instance) warn$2(`${caller || "useHost"} called without an active component instance.`);
		else warn$2(`${caller || "useHost"} can only be used in components defined via defineCustomElement.`);
		return null;
	}
	function useShadowRoot() {
		const el = !!(process.env.NODE_ENV !== "production") ? useHost("useShadowRoot") : useHost();
		return el && el.shadowRoot;
	}
	function useCssModule(name = "$style") {
		{
			const instance = getCurrentInstance();
			if (!instance) {
				process.env.NODE_ENV !== "production" && warn$2(`useCssModule must be called inside setup()`);
				return EMPTY_OBJ;
			}
			const modules = instance.type.__cssModules;
			if (!modules) {
				process.env.NODE_ENV !== "production" && warn$2(`Current instance does not have CSS modules injected.`);
				return EMPTY_OBJ;
			}
			const mod = modules[name];
			if (!mod) {
				process.env.NODE_ENV !== "production" && warn$2(`Current instance does not have CSS module named "${name}".`);
				return EMPTY_OBJ;
			}
			return mod;
		}
	}
	var positionMap = /* @__PURE__ */ new WeakMap();
	var newPositionMap = /* @__PURE__ */ new WeakMap();
	var moveCbKey = /* @__PURE__ */ Symbol("_moveCb");
	var enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
	var decorate = (t) => {
		delete t.props.mode;
		return t;
	};
	var TransitionGroup = /* @__PURE__ */ decorate({
		name: "TransitionGroup",
		props: /* @__PURE__ */ extend({}, TransitionPropsValidators, {
			tag: String,
			moveClass: String
		}),
		setup(props, { slots }) {
			const instance = getCurrentInstance();
			const state = useTransitionState();
			let prevChildren;
			let children;
			onUpdated(() => {
				if (!prevChildren.length) return;
				const moveClass = props.moveClass || `${props.name || "v"}-move`;
				if (!hasCSSTransform(prevChildren[0].el, instance.vnode.el, moveClass)) {
					prevChildren = [];
					return;
				}
				prevChildren.forEach(callPendingCbs);
				prevChildren.forEach(recordPosition);
				const movedChildren = prevChildren.filter(applyTranslation);
				forceReflow(instance.vnode.el);
				movedChildren.forEach((c) => {
					const el = c.el;
					const style = el.style;
					addTransitionClass(el, moveClass);
					style.transform = style.webkitTransform = style.transitionDuration = "";
					const cb = el[moveCbKey] = (e) => {
						if (e && e.target !== el) return;
						if (!e || e.propertyName.endsWith("transform")) {
							el.removeEventListener("transitionend", cb);
							el[moveCbKey] = null;
							removeTransitionClass(el, moveClass);
						}
					};
					el.addEventListener("transitionend", cb);
				});
				prevChildren = [];
			});
			return () => {
				const rawProps = /* @__PURE__ */ toRaw(props);
				const cssTransitionProps = resolveTransitionProps(rawProps);
				let tag = rawProps.tag || Fragment;
				prevChildren = [];
				if (children) for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (child.el && child.el instanceof Element && !child.el[vShowHidden]) {
						prevChildren.push(child);
						setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
						positionMap.set(child, getPosition(child.el));
					}
				}
				children = slots.default ? getTransitionRawChildren(slots.default()) : [];
				for (let i = 0; i < children.length; i++) {
					const child = children[i];
					if (child.key != null) setTransitionHooks(child, resolveTransitionHooks(child, cssTransitionProps, state, instance));
					else if (!!(process.env.NODE_ENV !== "production") && child.type !== Text) warn$2(`<TransitionGroup> children must be keyed.`);
				}
				return createVNode(tag, null, children);
			};
		}
	});
	function callPendingCbs(c) {
		const el = c.el;
		if (el[moveCbKey]) el[moveCbKey]();
		if (el[enterCbKey]) el[enterCbKey]();
	}
	function recordPosition(c) {
		newPositionMap.set(c, getPosition(c.el));
	}
	function applyTranslation(c) {
		const oldPos = positionMap.get(c);
		const newPos = newPositionMap.get(c);
		const dx = oldPos.left - newPos.left;
		const dy = oldPos.top - newPos.top;
		if (dx || dy) {
			const el = c.el;
			const s = el.style;
			const rect = el.getBoundingClientRect();
			let scaleX = 1;
			let scaleY = 1;
			if (el.offsetWidth) scaleX = rect.width / el.offsetWidth;
			if (el.offsetHeight) scaleY = rect.height / el.offsetHeight;
			if (!Number.isFinite(scaleX) || scaleX === 0) scaleX = 1;
			if (!Number.isFinite(scaleY) || scaleY === 0) scaleY = 1;
			if (Math.abs(scaleX - 1) < .01) scaleX = 1;
			if (Math.abs(scaleY - 1) < .01) scaleY = 1;
			s.transform = s.webkitTransform = `translate(${dx / scaleX}px,${dy / scaleY}px)`;
			s.transitionDuration = "0s";
			return c;
		}
	}
	function getPosition(el) {
		const rect = el.getBoundingClientRect();
		return {
			left: rect.left,
			top: rect.top
		};
	}
	function hasCSSTransform(el, root, moveClass) {
		const clone = el.cloneNode();
		const _vtc = el[vtcKey];
		if (_vtc) _vtc.forEach((cls) => {
			cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
		});
		moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
		clone.style.display = "none";
		const container = root.nodeType === 1 ? root : root.parentNode;
		container.appendChild(clone);
		const { hasTransform } = getTransitionInfo(clone);
		container.removeChild(clone);
		return hasTransform;
	}
	var getModelAssigner = (vnode) => {
		const fn = vnode.props["onUpdate:modelValue"] || false;
		return isArray$1(fn) ? (value) => invokeArrayFns(fn, value) : fn;
	};
	function onCompositionStart(e) {
		e.target.composing = true;
	}
	function onCompositionEnd(e) {
		const target = e.target;
		if (target.composing) {
			target.composing = false;
			target.dispatchEvent(new Event("input"));
		}
	}
	var assignKey = /* @__PURE__ */ Symbol("_assign");
	function castValue(value, trim, number) {
		if (trim) value = value.trim();
		if (number) value = looseToNumber(value);
		return value;
	}
	var vModelText = {
		created(el, { modifiers: { lazy, trim, number } }, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			const castToNumber = number || vnode.props && vnode.props.type === "number";
			addEventListener(el, lazy ? "change" : "input", (e) => {
				if (e.target.composing) return;
				el[assignKey](castValue(el.value, trim, castToNumber));
			});
			if (trim || castToNumber) addEventListener(el, "change", () => {
				el.value = castValue(el.value, trim, castToNumber);
			});
			if (!lazy) {
				addEventListener(el, "compositionstart", onCompositionStart);
				addEventListener(el, "compositionend", onCompositionEnd);
				addEventListener(el, "change", onCompositionEnd);
			}
		},
		mounted(el, { value }) {
			el.value = value == null ? "" : value;
		},
		beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			if (el.composing) return;
			const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
			const newValue = value == null ? "" : value;
			if (elValue === newValue) return;
			const rootNode = el.getRootNode();
			if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
				if (lazy && value === oldValue) return;
				if (trim && el.value.trim() === newValue) return;
			}
			el.value = newValue;
		}
	};
	var vModelCheckbox = {
		deep: true,
		created(el, _, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			addEventListener(el, "change", () => {
				const modelValue = el._modelValue;
				const elementValue = getValue(el);
				const checked = el.checked;
				const assign = el[assignKey];
				if (isArray$1(modelValue)) {
					const index = looseIndexOf(modelValue, elementValue);
					const found = index !== -1;
					if (checked && !found) assign(modelValue.concat(elementValue));
					else if (!checked && found) {
						const filtered = [...modelValue];
						filtered.splice(index, 1);
						assign(filtered);
					}
				} else if (isSet(modelValue)) {
					const cloned = new Set(modelValue);
					if (checked) cloned.add(elementValue);
					else cloned.delete(elementValue);
					assign(cloned);
				} else assign(getCheckboxValue(el, checked));
			});
		},
		mounted: setChecked,
		beforeUpdate(el, binding, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			setChecked(el, binding, vnode);
		}
	};
	function setChecked(el, { value, oldValue }, vnode) {
		el._modelValue = value;
		let checked;
		if (isArray$1(value)) checked = looseIndexOf(value, vnode.props.value) > -1;
		else if (isSet(value)) checked = value.has(vnode.props.value);
		else {
			if (value === oldValue) return;
			checked = looseEqual(value, getCheckboxValue(el, true));
		}
		if (el.checked !== checked) el.checked = checked;
	}
	var vModelRadio = {
		created(el, { value }, vnode) {
			el.checked = looseEqual(value, vnode.props.value);
			el[assignKey] = getModelAssigner(vnode);
			addEventListener(el, "change", () => {
				el[assignKey](getValue(el));
			});
		},
		beforeUpdate(el, { value, oldValue }, vnode) {
			el[assignKey] = getModelAssigner(vnode);
			if (value !== oldValue) el.checked = looseEqual(value, vnode.props.value);
		}
	};
	var vModelSelect = {
		deep: true,
		created(el, { value, modifiers: { number } }, vnode) {
			const isSetModel = isSet(value);
			addEventListener(el, "change", () => {
				const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map((o) => number ? looseToNumber(getValue(o)) : getValue(o));
				el[assignKey](el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]);
				el._assigning = true;
				nextTick(() => {
					el._assigning = false;
				});
			});
			el[assignKey] = getModelAssigner(vnode);
		},
		mounted(el, { value }) {
			setSelected(el, value);
		},
		beforeUpdate(el, _binding, vnode) {
			el[assignKey] = getModelAssigner(vnode);
		},
		updated(el, { value }) {
			if (!el._assigning) setSelected(el, value);
		}
	};
	function setSelected(el, value) {
		const isMultiple = el.multiple;
		const isArrayValue = isArray$1(value);
		if (isMultiple && !isArrayValue && !isSet(value)) {
			process.env.NODE_ENV !== "production" && warn$2(`<select multiple v-model> expects an Array or Set value for its binding, but got ${Object.prototype.toString.call(value).slice(8, -1)}.`);
			return;
		}
		for (let i = 0, l = el.options.length; i < l; i++) {
			const option = el.options[i];
			const optionValue = getValue(option);
			if (isMultiple) if (isArrayValue) {
				const optionType = typeof optionValue;
				if (optionType === "string" || optionType === "number") option.selected = value.some((v) => String(v) === String(optionValue));
				else option.selected = looseIndexOf(value, optionValue) > -1;
			} else option.selected = value.has(optionValue);
			else if (looseEqual(getValue(option), value)) {
				if (el.selectedIndex !== i) el.selectedIndex = i;
				return;
			}
		}
		if (!isMultiple && el.selectedIndex !== -1) el.selectedIndex = -1;
	}
	function getValue(el) {
		return "_value" in el ? el._value : el.value;
	}
	function getCheckboxValue(el, checked) {
		const key = checked ? "_trueValue" : "_falseValue";
		return key in el ? el[key] : checked;
	}
	var vModelDynamic = {
		created(el, binding, vnode) {
			callModelHook(el, binding, vnode, null, "created");
		},
		mounted(el, binding, vnode) {
			callModelHook(el, binding, vnode, null, "mounted");
		},
		beforeUpdate(el, binding, vnode, prevVNode) {
			callModelHook(el, binding, vnode, prevVNode, "beforeUpdate");
		},
		updated(el, binding, vnode, prevVNode) {
			callModelHook(el, binding, vnode, prevVNode, "updated");
		}
	};
	function resolveDynamicModel(tagName, type) {
		switch (tagName) {
			case "SELECT": return vModelSelect;
			case "TEXTAREA": return vModelText;
			default: switch (type) {
				case "checkbox": return vModelCheckbox;
				case "radio": return vModelRadio;
				default: return vModelText;
			}
		}
	}
	function callModelHook(el, binding, vnode, prevVNode, hook) {
		const fn = resolveDynamicModel(el.tagName, vnode.props && vnode.props.type)[hook];
		fn && fn(el, binding, vnode, prevVNode);
	}
	function initVModelForSSR() {
		vModelText.getSSRProps = ({ value }) => ({ value });
		vModelRadio.getSSRProps = ({ value }, vnode) => {
			if (vnode.props && looseEqual(vnode.props.value, value)) return { checked: true };
		};
		vModelCheckbox.getSSRProps = ({ value }, vnode) => {
			if (isArray$1(value)) {
				if (vnode.props && looseIndexOf(value, vnode.props.value) > -1) return { checked: true };
			} else if (isSet(value)) {
				if (vnode.props && value.has(vnode.props.value)) return { checked: true };
			} else if (value) return { checked: true };
		};
		vModelDynamic.getSSRProps = (binding, vnode) => {
			if (typeof vnode.type !== "string") return;
			const modelToUse = resolveDynamicModel(vnode.type.toUpperCase(), vnode.props && vnode.props.type);
			if (modelToUse.getSSRProps) return modelToUse.getSSRProps(binding, vnode);
		};
	}
	var systemModifiers = [
		"ctrl",
		"shift",
		"alt",
		"meta"
	];
	var modifierGuards = {
		stop: (e) => e.stopPropagation(),
		prevent: (e) => e.preventDefault(),
		self: (e) => e.target !== e.currentTarget,
		ctrl: (e) => !e.ctrlKey,
		shift: (e) => !e.shiftKey,
		alt: (e) => !e.altKey,
		meta: (e) => !e.metaKey,
		left: (e) => "button" in e && e.button !== 0,
		middle: (e) => "button" in e && e.button !== 1,
		right: (e) => "button" in e && e.button !== 2,
		exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
	};
	var withModifiers = (fn, modifiers) => {
		if (!fn) return fn;
		const cache = fn._withMods || (fn._withMods = {});
		const cacheKey = modifiers.join(".");
		return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
			for (let i = 0; i < modifiers.length; i++) {
				const guard = modifierGuards[modifiers[i]];
				if (guard && guard(event, modifiers)) return;
			}
			return fn(event, ...args);
		}));
	};
	var keyNames = {
		esc: "escape",
		space: " ",
		up: "arrow-up",
		left: "arrow-left",
		right: "arrow-right",
		down: "arrow-down",
		delete: "backspace"
	};
	var withKeys = (fn, modifiers) => {
		const cache = fn._withKeys || (fn._withKeys = {});
		const cacheKey = modifiers.join(".");
		return cache[cacheKey] || (cache[cacheKey] = ((event) => {
			if (!("key" in event)) return;
			const eventKey = hyphenate$1(event.key);
			if (modifiers.some((k) => k === eventKey || keyNames[k] === eventKey)) return fn(event);
		}));
	};
	var rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
	var renderer;
	var enabledHydration = false;
	function ensureRenderer() {
		return renderer || (renderer = createRenderer(rendererOptions));
	}
	function ensureHydrationRenderer() {
		renderer = enabledHydration ? renderer : createHydrationRenderer(rendererOptions);
		enabledHydration = true;
		return renderer;
	}
	var render = ((...args) => {
		ensureRenderer().render(...args);
	});
	var hydrate = ((...args) => {
		ensureHydrationRenderer().hydrate(...args);
	});
	var createApp = ((...args) => {
		const app = ensureRenderer().createApp(...args);
		if (!!(process.env.NODE_ENV !== "production")) {
			injectNativeTagCheck(app);
			injectCompilerOptionsCheck(app);
		}
		const { mount } = app;
		app.mount = (containerOrSelector) => {
			const container = normalizeContainer(containerOrSelector);
			if (!container) return;
			const component = app._component;
			if (!isFunction$1(component) && !component.render && !component.template) component.template = container.innerHTML;
			if (container.nodeType === 1) container.textContent = "";
			const proxy = mount(container, false, resolveRootNamespace(container));
			if (container instanceof Element) {
				container.removeAttribute("v-cloak");
				container.setAttribute("data-v-app", "");
			}
			return proxy;
		};
		return app;
	});
	var createSSRApp = ((...args) => {
		const app = ensureHydrationRenderer().createApp(...args);
		if (!!(process.env.NODE_ENV !== "production")) {
			injectNativeTagCheck(app);
			injectCompilerOptionsCheck(app);
		}
		const { mount } = app;
		app.mount = (containerOrSelector) => {
			const container = normalizeContainer(containerOrSelector);
			if (container) return mount(container, true, resolveRootNamespace(container));
		};
		return app;
	});
	function resolveRootNamespace(container) {
		if (container instanceof SVGElement) return "svg";
		if (typeof MathMLElement === "function" && container instanceof MathMLElement) return "mathml";
	}
	function injectNativeTagCheck(app) {
		Object.defineProperty(app.config, "isNativeTag", {
			value: (tag) => isHTMLTag(tag) || isSVGTag(tag) || isMathMLTag(tag),
			writable: false
		});
	}
	function injectCompilerOptionsCheck(app) {
		if (isRuntimeOnly()) {
			const isCustomElement = app.config.isCustomElement;
			Object.defineProperty(app.config, "isCustomElement", {
				get() {
					return isCustomElement;
				},
				set() {
					warn$2(`The \`isCustomElement\` config option is deprecated. Use \`compilerOptions.isCustomElement\` instead.`);
				}
			});
			const compilerOptions = app.config.compilerOptions;
			const msg = `The \`compilerOptions\` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, \`compilerOptions\` must be passed to \`@vue/compiler-dom\` in the build setup instead.
- For vue-loader: pass it via vue-loader's \`compilerOptions\` loader option.
- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader
- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc`;
			Object.defineProperty(app.config, "compilerOptions", {
				get() {
					warn$2(msg);
					return compilerOptions;
				},
				set() {
					warn$2(msg);
				}
			});
		}
	}
	function normalizeContainer(container) {
		if (isString$1(container)) {
			const res = document.querySelector(container);
			if (!!(process.env.NODE_ENV !== "production") && !res) warn$2(`Failed to mount app: mount target selector "${container}" returned null.`);
			return res;
		}
		if (!!(process.env.NODE_ENV !== "production") && window.ShadowRoot && container instanceof window.ShadowRoot && container.mode === "closed") warn$2(`mounting on a ShadowRoot with \`{mode: "closed"}\` may lead to unpredictable bugs`);
		return container;
	}
	var ssrDirectiveInitialized = false;
	var initDirectivesForSSR = () => {
		if (!ssrDirectiveInitialized) {
			ssrDirectiveInitialized = true;
			initVModelForSSR();
			initVShowForSSR();
		}
	};
	//#endregion
	//#region node_modules/vue/dist/vue.runtime.esm-bundler.js
	/**
	* vue v3.5.39
	* (c) 2018-present Yuxi (Evan) You and Vue contributors
	* @license MIT
	**/
	var vue_runtime_esm_bundler_exports = /* @__PURE__ */ __exportAll({
		BaseTransition: () => BaseTransition,
		BaseTransitionPropsValidators: () => BaseTransitionPropsValidators,
		Comment: () => Comment,
		DeprecationTypes: () => null,
		EffectScope: () => EffectScope,
		ErrorCodes: () => ErrorCodes,
		ErrorTypeStrings: () => ErrorTypeStrings,
		Fragment: () => Fragment,
		KeepAlive: () => KeepAlive,
		ReactiveEffect: () => ReactiveEffect,
		Static: () => Static,
		Suspense: () => Suspense,
		Teleport: () => Teleport,
		Text: () => Text,
		TrackOpTypes: () => TrackOpTypes,
		Transition: () => Transition,
		TransitionGroup: () => TransitionGroup,
		TriggerOpTypes: () => TriggerOpTypes,
		VueElement: () => VueElement,
		assertNumber: () => assertNumber,
		callWithAsyncErrorHandling: () => callWithAsyncErrorHandling,
		callWithErrorHandling: () => callWithErrorHandling,
		camelize: () => camelize$1,
		capitalize: () => capitalize$1,
		cloneVNode: () => cloneVNode,
		compatUtils: () => null,
		compile: () => compile$1,
		computed: () => computed,
		createApp: () => createApp,
		createBlock: () => createBlock,
		createCommentVNode: () => createCommentVNode,
		createElementBlock: () => createElementBlock,
		createElementVNode: () => createBaseVNode,
		createHydrationRenderer: () => createHydrationRenderer,
		createPropsRestProxy: () => createPropsRestProxy,
		createRenderer: () => createRenderer,
		createSSRApp: () => createSSRApp,
		createSlots: () => createSlots,
		createStaticVNode: () => createStaticVNode,
		createTextVNode: () => createTextVNode,
		createVNode: () => createVNode,
		customRef: () => customRef,
		defineAsyncComponent: () => defineAsyncComponent,
		defineComponent: () => defineComponent,
		defineCustomElement: () => defineCustomElement,
		defineEmits: () => defineEmits,
		defineExpose: () => defineExpose,
		defineModel: () => defineModel,
		defineOptions: () => defineOptions,
		defineProps: () => defineProps,
		defineSSRCustomElement: () => defineSSRCustomElement,
		defineSlots: () => defineSlots,
		devtools: () => devtools$2,
		effect: () => effect,
		effectScope: () => effectScope,
		getCurrentInstance: () => getCurrentInstance,
		getCurrentScope: () => getCurrentScope,
		getCurrentWatcher: () => getCurrentWatcher,
		getTransitionRawChildren: () => getTransitionRawChildren,
		guardReactiveProps: () => guardReactiveProps,
		h: () => h,
		handleError: () => handleError,
		hasInjectionContext: () => hasInjectionContext,
		hydrate: () => hydrate,
		hydrateOnIdle: () => hydrateOnIdle,
		hydrateOnInteraction: () => hydrateOnInteraction,
		hydrateOnMediaQuery: () => hydrateOnMediaQuery,
		hydrateOnVisible: () => hydrateOnVisible,
		initCustomFormatter: () => initCustomFormatter,
		initDirectivesForSSR: () => initDirectivesForSSR,
		inject: () => inject,
		isMemoSame: () => isMemoSame,
		isProxy: () => isProxy,
		isReactive: () => isReactive,
		isReadonly: () => isReadonly,
		isRef: () => isRef,
		isRuntimeOnly: () => isRuntimeOnly,
		isShallow: () => isShallow,
		isVNode: () => isVNode$1,
		markRaw: () => markRaw,
		mergeDefaults: () => mergeDefaults,
		mergeModels: () => mergeModels,
		mergeProps: () => mergeProps,
		nextTick: () => nextTick,
		nodeOps: () => nodeOps,
		normalizeClass: () => normalizeClass,
		normalizeProps: () => normalizeProps,
		normalizeStyle: () => normalizeStyle,
		onActivated: () => onActivated,
		onBeforeMount: () => onBeforeMount,
		onBeforeUnmount: () => onBeforeUnmount,
		onBeforeUpdate: () => onBeforeUpdate,
		onDeactivated: () => onDeactivated,
		onErrorCaptured: () => onErrorCaptured,
		onMounted: () => onMounted,
		onRenderTracked: () => onRenderTracked,
		onRenderTriggered: () => onRenderTriggered,
		onScopeDispose: () => onScopeDispose,
		onServerPrefetch: () => onServerPrefetch,
		onUnmounted: () => onUnmounted,
		onUpdated: () => onUpdated,
		onWatcherCleanup: () => onWatcherCleanup,
		openBlock: () => openBlock,
		patchProp: () => patchProp,
		popScopeId: () => popScopeId,
		provide: () => provide,
		proxyRefs: () => proxyRefs,
		pushScopeId: () => pushScopeId,
		queuePostFlushCb: () => queuePostFlushCb,
		reactive: () => reactive,
		readonly: () => readonly,
		ref: () => ref,
		registerRuntimeCompiler: () => registerRuntimeCompiler,
		render: () => render,
		renderList: () => renderList,
		renderSlot: () => renderSlot,
		resolveComponent: () => resolveComponent,
		resolveDirective: () => resolveDirective,
		resolveDynamicComponent: () => resolveDynamicComponent,
		resolveFilter: () => null,
		resolveTransitionHooks: () => resolveTransitionHooks,
		setBlockTracking: () => setBlockTracking,
		setDevtoolsHook: () => setDevtoolsHook,
		setTransitionHooks: () => setTransitionHooks,
		shallowReactive: () => shallowReactive,
		shallowReadonly: () => shallowReadonly,
		shallowRef: () => shallowRef,
		ssrContextKey: () => ssrContextKey,
		ssrUtils: () => ssrUtils,
		stop: () => stop,
		toDisplayString: () => toDisplayString$1,
		toHandlerKey: () => toHandlerKey,
		toHandlers: () => toHandlers,
		toRaw: () => toRaw,
		toRef: () => toRef,
		toRefs: () => toRefs,
		toValue: () => toValue$1,
		transformVNodeArgs: () => transformVNodeArgs,
		triggerRef: () => triggerRef,
		unref: () => unref,
		useAttrs: () => useAttrs,
		useCssModule: () => useCssModule,
		useCssVars: () => useCssVars,
		useHost: () => useHost,
		useId: () => useId$1,
		useModel: () => useModel,
		useSSRContext: () => useSSRContext,
		useShadowRoot: () => useShadowRoot,
		useSlots: () => useSlots,
		useTemplateRef: () => useTemplateRef,
		useTransitionState: () => useTransitionState,
		vModelCheckbox: () => vModelCheckbox,
		vModelDynamic: () => vModelDynamic,
		vModelRadio: () => vModelRadio,
		vModelSelect: () => vModelSelect,
		vModelText: () => vModelText,
		vShow: () => vShow,
		version: () => version,
		warn: () => warn$2,
		watch: () => watch,
		watchEffect: () => watchEffect,
		watchPostEffect: () => watchPostEffect,
		watchSyncEffect: () => watchSyncEffect,
		withAsyncContext: () => withAsyncContext,
		withCtx: () => withCtx,
		withDefaults: () => withDefaults,
		withDirectives: () => withDirectives,
		withKeys: () => withKeys,
		withMemo: () => withMemo,
		withModifiers: () => withModifiers,
		withScopeId: () => withScopeId
	});
	function initDev() {
		initCustomFormatter();
	}
	if (!!(process.env.NODE_ENV !== "production")) initDev();
	var compile$1 = () => {
		if (!!(process.env.NODE_ENV !== "production")) warn$2("Runtime compilation is not supported in this build of Vue. Configure your bundler to alias \"vue\" to \"vue/dist/vue.esm-bundler.js\".");
	};
	//#endregion
	//#region node_modules/@intlify/shared/dist/shared.mjs
	/*!
	* shared v10.0.8
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	function warn(msg, err) {
		if (typeof console !== "undefined") {
			console.warn(`[intlify] ` + msg);
			/* istanbul ignore if */
			if (err) console.warn(err.stack);
		}
	}
	var hasWarned = {};
	function warnOnce(msg) {
		if (!hasWarned[msg]) {
			hasWarned[msg] = true;
			warn(msg);
		}
	}
	/**
	* Original Utilities
	* written by kazuya kawaguchi
	*/
	var inBrowser = typeof window !== "undefined";
	var mark;
	var measure;
	if (process.env.NODE_ENV !== "production") {
		const perf = inBrowser && window.performance;
		if (perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) {
			mark = (tag) => {
				perf.mark(tag);
			};
			measure = (name, startTag, endTag) => {
				perf.measure(name, startTag, endTag);
				perf.clearMarks(startTag);
				perf.clearMarks(endTag);
			};
		}
	}
	var RE_ARGS = /\{([0-9a-zA-Z]+)\}/g;
	function format$1(message, ...args) {
		if (args.length === 1 && isObject$1(args[0])) args = args[0];
		if (!args || !args.hasOwnProperty) args = {};
		return message.replace(RE_ARGS, (match, identifier) => {
			return args.hasOwnProperty(identifier) ? args[identifier] : "";
		});
	}
	var makeSymbol = (name, shareable = false) => !shareable ? Symbol(name) : Symbol.for(name);
	var generateFormatCacheKey = (locale, key, source) => friendlyJSONstringify({
		l: locale,
		k: key,
		s: source
	});
	var friendlyJSONstringify = (json) => JSON.stringify(json).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029").replace(/\u0027/g, "\\u0027");
	var isNumber$1 = (val) => typeof val === "number" && isFinite(val);
	var isDate = (val) => toTypeString(val) === "[object Date]";
	var isRegExp = (val) => toTypeString(val) === "[object RegExp]";
	var isEmptyObject = (val) => isPlainObject$1(val) && Object.keys(val).length === 0;
	var assign = Object.assign;
	var _create = Object.create;
	var create = (obj = null) => _create(obj);
	var _globalThis;
	var getGlobalThis = () => {
		return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : create());
	};
	function escapeHtml(rawText) {
		return rawText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\//g, "&#x2F;").replace(/=/g, "&#x3D;");
	}
	function escapeAttributeValue(value) {
		return value.replace(/&(?![a-zA-Z0-9#]{2,6};)/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	function sanitizeTranslatedHtml(html) {
		html = html.replace(/(\w+)\s*=\s*"([^"]*)"/g, (_, attrName, attrValue) => `${attrName}="${escapeAttributeValue(attrValue)}"`);
		html = html.replace(/(\w+)\s*=\s*'([^']*)'/g, (_, attrName, attrValue) => `${attrName}='${escapeAttributeValue(attrValue)}'`);
		if (/\s*on\w+\s*=\s*["']?[^"'>]+["']?/gi.test(html)) {
			if (process.env.NODE_ENV !== "production") warn("Potentially dangerous event handlers detected in translation. Consider removing onclick, onerror, etc. from your translation messages.");
			html = html.replace(/(\s+)(on)(\w+\s*=)/gi, "$1&#111;n$3");
		}
		[/(\s+(?:href|src|action|formaction)\s*=\s*["']?)\s*javascript:/gi, /(style\s*=\s*["'][^"']*url\s*\(\s*)javascript:/gi].forEach((pattern) => {
			html = html.replace(pattern, "$1javascript&#58;");
		});
		return html;
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function hasOwn(obj, key) {
		return hasOwnProperty.call(obj, key);
	}
	/**
	* Useful Utilities By Evan you
	* Modified by kazuya kawaguchi
	* MIT License
	* https://github.com/vuejs/vue-next/blob/master/packages/shared/src/index.ts
	* https://github.com/vuejs/vue-next/blob/master/packages/shared/src/codeframe.ts
	*/
	var isArray = Array.isArray;
	var isFunction = (val) => typeof val === "function";
	var isString = (val) => typeof val === "string";
	var isBoolean = (val) => typeof val === "boolean";
	var isObject$1 = (val) => val !== null && typeof val === "object";
	var isPromise = (val) => {
		return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
	};
	var objectToString = Object.prototype.toString;
	var toTypeString = (value) => objectToString.call(value);
	var isPlainObject$1 = (val) => toTypeString(val) === "[object Object]";
	var toDisplayString = (val) => {
		return val == null ? "" : isArray(val) || isPlainObject$1(val) && val.toString === objectToString ? JSON.stringify(val, null, 2) : String(val);
	};
	function join(items, separator = "") {
		return items.reduce((str, item, index) => index === 0 ? str + item : str + separator + item, "");
	}
	var RANGE = 2;
	function generateCodeFrame(source, start = 0, end = source.length) {
		const lines = source.split(/\r?\n/);
		let count = 0;
		const res = [];
		for (let i = 0; i < lines.length; i++) {
			count += lines[i].length + 1;
			if (count >= start) {
				for (let j = i - RANGE; j <= i + RANGE || end > count; j++) {
					if (j < 0 || j >= lines.length) continue;
					const line = j + 1;
					res.push(`${line}${" ".repeat(3 - String(line).length)}|  ${lines[j]}`);
					const lineLength = lines[j].length;
					if (j === i) {
						const pad = start - (count - lineLength) + 1;
						const length = Math.max(1, end > count ? lineLength - pad : end - start);
						res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
					} else if (j > i) {
						if (end > count) {
							const length = Math.max(Math.min(end - count, lineLength), 1);
							res.push(`   |  ` + "^".repeat(length));
						}
						count += lineLength + 1;
					}
				}
				break;
			}
		}
		return res.join("\n");
	}
	/**
	* Event emitter, forked from the below:
	* - original repository url: https://github.com/developit/mitt
	* - code url: https://github.com/developit/mitt/blob/master/src/index.ts
	* - author: Jason Miller (https://github.com/developit)
	* - license: MIT
	*/
	/**
	* Create a event emitter
	*
	* @returns An event emitter
	*/
	function createEmitter() {
		const events = /* @__PURE__ */ new Map();
		return {
			events,
			on(event, handler) {
				const handlers = events.get(event);
				if (!(handlers && handlers.push(handler))) events.set(event, [handler]);
			},
			off(event, handler) {
				const handlers = events.get(event);
				if (handlers) handlers.splice(handlers.indexOf(handler) >>> 0, 1);
			},
			emit(event, payload) {
				(events.get(event) || []).slice().map((handler) => handler(payload));
				(events.get("*") || []).slice().map((handler) => handler(event, payload));
			}
		};
	}
	var isNotObjectOrIsArray = (val) => !isObject$1(val) || isArray(val);
	function deepCopy(src, des) {
		if (isNotObjectOrIsArray(src) || isNotObjectOrIsArray(des)) throw new Error("Invalid value");
		const stack = [{
			src,
			des
		}];
		while (stack.length) {
			const { src, des } = stack.pop();
			Object.keys(src).forEach((key) => {
				if (key === "__proto__") return;
				if (isObject$1(src[key]) && !isObject$1(des[key])) des[key] = Array.isArray(src[key]) ? [] : create();
				if (isNotObjectOrIsArray(des[key]) || isNotObjectOrIsArray(src[key])) des[key] = src[key];
				else stack.push({
					src: src[key],
					des: des[key]
				});
			});
		}
	}
	//#endregion
	//#region node_modules/@intlify/message-compiler/dist/message-compiler.mjs
	/*!
	* message-compiler v10.0.8
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	function createPosition(line, column, offset) {
		return {
			line,
			column,
			offset
		};
	}
	function createLocation(start, end, source) {
		const loc = {
			start,
			end
		};
		if (source != null) loc.source = source;
		return loc;
	}
	var CompileErrorCodes = {
		EXPECTED_TOKEN: 1,
		INVALID_TOKEN_IN_PLACEHOLDER: 2,
		UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER: 3,
		UNKNOWN_ESCAPE_SEQUENCE: 4,
		INVALID_UNICODE_ESCAPE_SEQUENCE: 5,
		UNBALANCED_CLOSING_BRACE: 6,
		UNTERMINATED_CLOSING_BRACE: 7,
		EMPTY_PLACEHOLDER: 8,
		NOT_ALLOW_NEST_PLACEHOLDER: 9,
		INVALID_LINKED_FORMAT: 10,
		MUST_HAVE_MESSAGES_IN_PLURAL: 11,
		UNEXPECTED_EMPTY_LINKED_MODIFIER: 12,
		UNEXPECTED_EMPTY_LINKED_KEY: 13,
		UNEXPECTED_LEXICAL_ANALYSIS: 14,
		UNHANDLED_CODEGEN_NODE_TYPE: 15,
		UNHANDLED_MINIFIER_NODE_TYPE: 16
	};
	/** @internal */
	var errorMessages$2 = {
		[CompileErrorCodes.EXPECTED_TOKEN]: `Expected token: '{0}'`,
		[CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER]: `Invalid token in placeholder: '{0}'`,
		[CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER]: `Unterminated single quote in placeholder`,
		[CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE]: `Unknown escape sequence: \\{0}`,
		[CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE]: `Invalid unicode escape sequence: {0}`,
		[CompileErrorCodes.UNBALANCED_CLOSING_BRACE]: `Unbalanced closing brace`,
		[CompileErrorCodes.UNTERMINATED_CLOSING_BRACE]: `Unterminated closing brace`,
		[CompileErrorCodes.EMPTY_PLACEHOLDER]: `Empty placeholder`,
		[CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER]: `Not allowed nest placeholder`,
		[CompileErrorCodes.INVALID_LINKED_FORMAT]: `Invalid linked format`,
		[CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL]: `Plural must have messages`,
		[CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER]: `Unexpected empty linked modifier`,
		[CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY]: `Unexpected empty linked key`,
		[CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS]: `Unexpected lexical analysis in token: '{0}'`,
		[CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE]: `unhandled codegen node type: '{0}'`,
		[CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE]: `unhandled mimifier node type: '{0}'`
	};
	function createCompileError(code, loc, options = {}) {
		const { domain, messages, args } = options;
		const msg = process.env.NODE_ENV !== "production" ? format$1((messages || errorMessages$2)[code] || "", ...args || []) : code;
		const error = new SyntaxError(String(msg));
		error.code = code;
		if (loc) error.location = loc;
		error.domain = domain;
		return error;
	}
	/** @internal */
	function defaultOnError(error) {
		throw error;
	}
	var RE_HTML_TAG = /<\/?[\w\s="/.':;#-\/]+>/;
	var detectHtmlTag = (source) => RE_HTML_TAG.test(source);
	var CHAR_SP = " ";
	var CHAR_CR = "\r";
	var CHAR_LF = "\n";
	var CHAR_LS = String.fromCharCode(8232);
	var CHAR_PS = String.fromCharCode(8233);
	function createScanner(str) {
		const _buf = str;
		let _index = 0;
		let _line = 1;
		let _column = 1;
		let _peekOffset = 0;
		const isCRLF = (index) => _buf[index] === CHAR_CR && _buf[index + 1] === CHAR_LF;
		const isLF = (index) => _buf[index] === CHAR_LF;
		const isPS = (index) => _buf[index] === CHAR_PS;
		const isLS = (index) => _buf[index] === CHAR_LS;
		const isLineEnd = (index) => isCRLF(index) || isLF(index) || isPS(index) || isLS(index);
		const index = () => _index;
		const line = () => _line;
		const column = () => _column;
		const peekOffset = () => _peekOffset;
		const charAt = (offset) => isCRLF(offset) || isPS(offset) || isLS(offset) ? CHAR_LF : _buf[offset];
		const currentChar = () => charAt(_index);
		const currentPeek = () => charAt(_index + _peekOffset);
		function next() {
			_peekOffset = 0;
			if (isLineEnd(_index)) {
				_line++;
				_column = 0;
			}
			if (isCRLF(_index)) _index++;
			_index++;
			_column++;
			return _buf[_index];
		}
		function peek() {
			if (isCRLF(_index + _peekOffset)) _peekOffset++;
			_peekOffset++;
			return _buf[_index + _peekOffset];
		}
		function reset() {
			_index = 0;
			_line = 1;
			_column = 1;
			_peekOffset = 0;
		}
		function resetPeek(offset = 0) {
			_peekOffset = offset;
		}
		function skipToPeek() {
			const target = _index + _peekOffset;
			while (target !== _index) next();
			_peekOffset = 0;
		}
		return {
			index,
			line,
			column,
			peekOffset,
			charAt,
			currentChar,
			currentPeek,
			next,
			peek,
			reset,
			resetPeek,
			skipToPeek
		};
	}
	var EOF = void 0;
	var DOT = ".";
	var LITERAL_DELIMITER = "'";
	var ERROR_DOMAIN$3 = "tokenizer";
	function createTokenizer(source, options = {}) {
		const location = options.location !== false;
		const _scnr = createScanner(source);
		const currentOffset = () => _scnr.index();
		const currentPosition = () => createPosition(_scnr.line(), _scnr.column(), _scnr.index());
		const _initLoc = currentPosition();
		const _initOffset = currentOffset();
		const _context = {
			currentType: 13,
			offset: _initOffset,
			startLoc: _initLoc,
			endLoc: _initLoc,
			lastType: 13,
			lastOffset: _initOffset,
			lastStartLoc: _initLoc,
			lastEndLoc: _initLoc,
			braceNest: 0,
			inLinked: false,
			text: ""
		};
		const context = () => _context;
		const { onError } = options;
		function emitError(code, pos, offset, ...args) {
			const ctx = context();
			pos.column += offset;
			pos.offset += offset;
			if (onError) {
				const err = createCompileError(code, location ? createLocation(ctx.startLoc, pos) : null, {
					domain: ERROR_DOMAIN$3,
					args
				});
				onError(err);
			}
		}
		function getToken(context, type, value) {
			context.endLoc = currentPosition();
			context.currentType = type;
			const token = { type };
			if (location) token.loc = createLocation(context.startLoc, context.endLoc);
			if (value != null) token.value = value;
			return token;
		}
		const getEndToken = (context) => getToken(context, 13);
		function eat(scnr, ch) {
			if (scnr.currentChar() === ch) {
				scnr.next();
				return ch;
			} else {
				emitError(CompileErrorCodes.EXPECTED_TOKEN, currentPosition(), 0, ch);
				return "";
			}
		}
		function peekSpaces(scnr) {
			let buf = "";
			while (scnr.currentPeek() === CHAR_SP || scnr.currentPeek() === CHAR_LF) {
				buf += scnr.currentPeek();
				scnr.peek();
			}
			return buf;
		}
		function skipSpaces(scnr) {
			const buf = peekSpaces(scnr);
			scnr.skipToPeek();
			return buf;
		}
		function isIdentifierStart(ch) {
			if (ch === EOF) return false;
			const cc = ch.charCodeAt(0);
			return cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc === 95;
		}
		function isNumberStart(ch) {
			if (ch === EOF) return false;
			const cc = ch.charCodeAt(0);
			return cc >= 48 && cc <= 57;
		}
		function isNamedIdentifierStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 2) return false;
			peekSpaces(scnr);
			const ret = isIdentifierStart(scnr.currentPeek());
			scnr.resetPeek();
			return ret;
		}
		function isListIdentifierStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 2) return false;
			peekSpaces(scnr);
			const ret = isNumberStart(scnr.currentPeek() === "-" ? scnr.peek() : scnr.currentPeek());
			scnr.resetPeek();
			return ret;
		}
		function isLiteralStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 2) return false;
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === LITERAL_DELIMITER;
			scnr.resetPeek();
			return ret;
		}
		function isLinkedDotStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 7) return false;
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === ".";
			scnr.resetPeek();
			return ret;
		}
		function isLinkedModifierStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 8) return false;
			peekSpaces(scnr);
			const ret = isIdentifierStart(scnr.currentPeek());
			scnr.resetPeek();
			return ret;
		}
		function isLinkedDelimiterStart(scnr, context) {
			const { currentType } = context;
			if (!(currentType === 7 || currentType === 11)) return false;
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === ":";
			scnr.resetPeek();
			return ret;
		}
		function isLinkedReferStart(scnr, context) {
			const { currentType } = context;
			if (currentType !== 9) return false;
			const fn = () => {
				const ch = scnr.currentPeek();
				if (ch === "{") return isIdentifierStart(scnr.peek());
				else if (ch === "@" || ch === "|" || ch === ":" || ch === "." || ch === CHAR_SP || !ch) return false;
				else if (ch === CHAR_LF) {
					scnr.peek();
					return fn();
				} else return isTextStart(scnr, false);
			};
			const ret = fn();
			scnr.resetPeek();
			return ret;
		}
		function isPluralStart(scnr) {
			peekSpaces(scnr);
			const ret = scnr.currentPeek() === "|";
			scnr.resetPeek();
			return ret;
		}
		function isTextStart(scnr, reset = true) {
			const fn = (hasSpace = false, prev = "") => {
				const ch = scnr.currentPeek();
				if (ch === "{") return hasSpace;
				else if (ch === "@" || !ch) return hasSpace;
				else if (ch === "|") return !(prev === CHAR_SP || prev === CHAR_LF);
				else if (ch === CHAR_SP) {
					scnr.peek();
					return fn(true, CHAR_SP);
				} else if (ch === CHAR_LF) {
					scnr.peek();
					return fn(true, CHAR_LF);
				} else return true;
			};
			const ret = fn();
			reset && scnr.resetPeek();
			return ret;
		}
		function takeChar(scnr, fn) {
			const ch = scnr.currentChar();
			if (ch === EOF) return;
			if (fn(ch)) {
				scnr.next();
				return ch;
			}
			return null;
		}
		function isIdentifier(ch) {
			const cc = ch.charCodeAt(0);
			return cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 36;
		}
		function takeIdentifierChar(scnr) {
			return takeChar(scnr, isIdentifier);
		}
		function isNamedIdentifier(ch) {
			const cc = ch.charCodeAt(0);
			return cc >= 97 && cc <= 122 || cc >= 65 && cc <= 90 || cc >= 48 && cc <= 57 || cc === 95 || cc === 36 || cc === 45;
		}
		function takeNamedIdentifierChar(scnr) {
			return takeChar(scnr, isNamedIdentifier);
		}
		function isDigit(ch) {
			const cc = ch.charCodeAt(0);
			return cc >= 48 && cc <= 57;
		}
		function takeDigit(scnr) {
			return takeChar(scnr, isDigit);
		}
		function isHexDigit(ch) {
			const cc = ch.charCodeAt(0);
			return cc >= 48 && cc <= 57 || cc >= 65 && cc <= 70 || cc >= 97 && cc <= 102;
		}
		function takeHexDigit(scnr) {
			return takeChar(scnr, isHexDigit);
		}
		function getDigits(scnr) {
			let ch = "";
			let num = "";
			while (ch = takeDigit(scnr)) num += ch;
			return num;
		}
		function readText(scnr) {
			let buf = "";
			while (true) {
				const ch = scnr.currentChar();
				if (ch === "{" || ch === "}" || ch === "@" || ch === "|" || !ch) break;
				else if (ch === CHAR_SP || ch === CHAR_LF) if (isTextStart(scnr)) {
					buf += ch;
					scnr.next();
				} else if (isPluralStart(scnr)) break;
				else {
					buf += ch;
					scnr.next();
				}
				else {
					buf += ch;
					scnr.next();
				}
			}
			return buf;
		}
		function readNamedIdentifier(scnr) {
			skipSpaces(scnr);
			let ch = "";
			let name = "";
			while (ch = takeNamedIdentifierChar(scnr)) name += ch;
			if (scnr.currentChar() === EOF) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
			return name;
		}
		function readListIdentifier(scnr) {
			skipSpaces(scnr);
			let value = "";
			if (scnr.currentChar() === "-") {
				scnr.next();
				value += `-${getDigits(scnr)}`;
			} else value += getDigits(scnr);
			if (scnr.currentChar() === EOF) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
			return value;
		}
		function isLiteral(ch) {
			return ch !== LITERAL_DELIMITER && ch !== CHAR_LF;
		}
		function readLiteral(scnr) {
			skipSpaces(scnr);
			eat(scnr, `\'`);
			let ch = "";
			let literal = "";
			while (ch = takeChar(scnr, isLiteral)) if (ch === "\\") literal += readEscapeSequence(scnr);
			else literal += ch;
			const current = scnr.currentChar();
			if (current === CHAR_LF || current === EOF) {
				emitError(CompileErrorCodes.UNTERMINATED_SINGLE_QUOTE_IN_PLACEHOLDER, currentPosition(), 0);
				if (current === CHAR_LF) {
					scnr.next();
					eat(scnr, `\'`);
				}
				return literal;
			}
			eat(scnr, `\'`);
			return literal;
		}
		function readEscapeSequence(scnr) {
			const ch = scnr.currentChar();
			switch (ch) {
				case "\\":
				case `\'`:
					scnr.next();
					return `\\${ch}`;
				case "u": return readUnicodeEscapeSequence(scnr, ch, 4);
				case "U": return readUnicodeEscapeSequence(scnr, ch, 6);
				default:
					emitError(CompileErrorCodes.UNKNOWN_ESCAPE_SEQUENCE, currentPosition(), 0, ch);
					return "";
			}
		}
		function readUnicodeEscapeSequence(scnr, unicode, digits) {
			eat(scnr, unicode);
			let sequence = "";
			for (let i = 0; i < digits; i++) {
				const ch = takeHexDigit(scnr);
				if (!ch) {
					emitError(CompileErrorCodes.INVALID_UNICODE_ESCAPE_SEQUENCE, currentPosition(), 0, `\\${unicode}${sequence}${scnr.currentChar()}`);
					break;
				}
				sequence += ch;
			}
			return `\\${unicode}${sequence}`;
		}
		function isInvalidIdentifier(ch) {
			return ch !== "{" && ch !== "}" && ch !== CHAR_SP && ch !== CHAR_LF;
		}
		function readInvalidIdentifier(scnr) {
			skipSpaces(scnr);
			let ch = "";
			let identifiers = "";
			while (ch = takeChar(scnr, isInvalidIdentifier)) identifiers += ch;
			return identifiers;
		}
		function readLinkedModifier(scnr) {
			let ch = "";
			let name = "";
			while (ch = takeIdentifierChar(scnr)) name += ch;
			return name;
		}
		function readLinkedRefer(scnr) {
			const fn = (buf) => {
				const ch = scnr.currentChar();
				if (ch === "{" || ch === "@" || ch === "|" || ch === "(" || ch === ")" || !ch) return buf;
				else if (ch === CHAR_SP) return buf;
				else if (ch === CHAR_LF || ch === DOT) {
					buf += ch;
					scnr.next();
					return fn(buf);
				} else {
					buf += ch;
					scnr.next();
					return fn(buf);
				}
			};
			return fn("");
		}
		function readPlural(scnr) {
			skipSpaces(scnr);
			const plural = eat(scnr, "|");
			skipSpaces(scnr);
			return plural;
		}
		function readTokenInPlaceholder(scnr, context) {
			let token = null;
			switch (scnr.currentChar()) {
				case "{":
					if (context.braceNest >= 1) emitError(CompileErrorCodes.NOT_ALLOW_NEST_PLACEHOLDER, currentPosition(), 0);
					scnr.next();
					token = getToken(context, 2, "{");
					skipSpaces(scnr);
					context.braceNest++;
					return token;
				case "}":
					if (context.braceNest > 0 && context.currentType === 2) emitError(CompileErrorCodes.EMPTY_PLACEHOLDER, currentPosition(), 0);
					scnr.next();
					token = getToken(context, 3, "}");
					context.braceNest--;
					context.braceNest > 0 && skipSpaces(scnr);
					if (context.inLinked && context.braceNest === 0) context.inLinked = false;
					return token;
				case "@":
					if (context.braceNest > 0) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
					token = readTokenInLinked(scnr, context) || getEndToken(context);
					context.braceNest = 0;
					return token;
				default: {
					let validNamedIdentifier = true;
					let validListIdentifier = true;
					let validLiteral = true;
					if (isPluralStart(scnr)) {
						if (context.braceNest > 0) emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
						token = getToken(context, 1, readPlural(scnr));
						context.braceNest = 0;
						context.inLinked = false;
						return token;
					}
					if (context.braceNest > 0 && (context.currentType === 4 || context.currentType === 5 || context.currentType === 6)) {
						emitError(CompileErrorCodes.UNTERMINATED_CLOSING_BRACE, currentPosition(), 0);
						context.braceNest = 0;
						return readToken(scnr, context);
					}
					if (validNamedIdentifier = isNamedIdentifierStart(scnr, context)) {
						token = getToken(context, 4, readNamedIdentifier(scnr));
						skipSpaces(scnr);
						return token;
					}
					if (validListIdentifier = isListIdentifierStart(scnr, context)) {
						token = getToken(context, 5, readListIdentifier(scnr));
						skipSpaces(scnr);
						return token;
					}
					if (validLiteral = isLiteralStart(scnr, context)) {
						token = getToken(context, 6, readLiteral(scnr));
						skipSpaces(scnr);
						return token;
					}
					if (!validNamedIdentifier && !validListIdentifier && !validLiteral) {
						token = getToken(context, 12, readInvalidIdentifier(scnr));
						emitError(CompileErrorCodes.INVALID_TOKEN_IN_PLACEHOLDER, currentPosition(), 0, token.value);
						skipSpaces(scnr);
						return token;
					}
					break;
				}
			}
			return token;
		}
		function readTokenInLinked(scnr, context) {
			const { currentType } = context;
			let token = null;
			const ch = scnr.currentChar();
			if ((currentType === 7 || currentType === 8 || currentType === 11 || currentType === 9) && (ch === CHAR_LF || ch === CHAR_SP)) emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
			switch (ch) {
				case "@":
					scnr.next();
					token = getToken(context, 7, "@");
					context.inLinked = true;
					return token;
				case ".":
					skipSpaces(scnr);
					scnr.next();
					return getToken(context, 8, ".");
				case ":":
					skipSpaces(scnr);
					scnr.next();
					return getToken(context, 9, ":");
				default:
					if (isPluralStart(scnr)) {
						token = getToken(context, 1, readPlural(scnr));
						context.braceNest = 0;
						context.inLinked = false;
						return token;
					}
					if (isLinkedDotStart(scnr, context) || isLinkedDelimiterStart(scnr, context)) {
						skipSpaces(scnr);
						return readTokenInLinked(scnr, context);
					}
					if (isLinkedModifierStart(scnr, context)) {
						skipSpaces(scnr);
						return getToken(context, 11, readLinkedModifier(scnr));
					}
					if (isLinkedReferStart(scnr, context)) {
						skipSpaces(scnr);
						if (ch === "{") return readTokenInPlaceholder(scnr, context) || token;
						else return getToken(context, 10, readLinkedRefer(scnr));
					}
					if (currentType === 7) emitError(CompileErrorCodes.INVALID_LINKED_FORMAT, currentPosition(), 0);
					context.braceNest = 0;
					context.inLinked = false;
					return readToken(scnr, context);
			}
		}
		function readToken(scnr, context) {
			let token = { type: 13 };
			if (context.braceNest > 0) return readTokenInPlaceholder(scnr, context) || getEndToken(context);
			if (context.inLinked) return readTokenInLinked(scnr, context) || getEndToken(context);
			switch (scnr.currentChar()) {
				case "{": return readTokenInPlaceholder(scnr, context) || getEndToken(context);
				case "}":
					emitError(CompileErrorCodes.UNBALANCED_CLOSING_BRACE, currentPosition(), 0);
					scnr.next();
					return getToken(context, 3, "}");
				case "@": return readTokenInLinked(scnr, context) || getEndToken(context);
				default:
					if (isPluralStart(scnr)) {
						token = getToken(context, 1, readPlural(scnr));
						context.braceNest = 0;
						context.inLinked = false;
						return token;
					}
					if (isTextStart(scnr)) return getToken(context, 0, readText(scnr));
					break;
			}
			return token;
		}
		function nextToken() {
			const { currentType, offset, startLoc, endLoc } = _context;
			_context.lastType = currentType;
			_context.lastOffset = offset;
			_context.lastStartLoc = startLoc;
			_context.lastEndLoc = endLoc;
			_context.offset = currentOffset();
			_context.startLoc = currentPosition();
			if (_scnr.currentChar() === EOF) return getToken(_context, 13);
			return readToken(_scnr, _context);
		}
		return {
			nextToken,
			currentOffset,
			currentPosition,
			context
		};
	}
	var ERROR_DOMAIN$2 = "parser";
	var KNOWN_ESCAPES = /(?:\\\\|\\'|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
	function fromEscapeSequence(match, codePoint4, codePoint6) {
		switch (match) {
			case `\\\\`: return `\\`;
			case `\\\'`: return `\'`;
			default: {
				const codePoint = parseInt(codePoint4 || codePoint6, 16);
				if (codePoint <= 55295 || codePoint >= 57344) return String.fromCodePoint(codePoint);
				return "�";
			}
		}
	}
	function createParser(options = {}) {
		const location = options.location !== false;
		const { onError } = options;
		function emitError(tokenzer, code, start, offset, ...args) {
			const end = tokenzer.currentPosition();
			end.offset += offset;
			end.column += offset;
			if (onError) {
				const err = createCompileError(code, location ? createLocation(start, end) : null, {
					domain: ERROR_DOMAIN$2,
					args
				});
				onError(err);
			}
		}
		function startNode(type, offset, loc) {
			const node = { type };
			if (location) {
				node.start = offset;
				node.end = offset;
				node.loc = {
					start: loc,
					end: loc
				};
			}
			return node;
		}
		function endNode(node, offset, pos, type) {
			if (location) {
				node.end = offset;
				if (node.loc) node.loc.end = pos;
			}
		}
		function parseText(tokenizer, value) {
			const context = tokenizer.context();
			const node = startNode(3, context.offset, context.startLoc);
			node.value = value;
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseList(tokenizer, index) {
			const { lastOffset: offset, lastStartLoc: loc } = tokenizer.context();
			const node = startNode(5, offset, loc);
			node.index = parseInt(index, 10);
			tokenizer.nextToken();
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseNamed(tokenizer, key) {
			const { lastOffset: offset, lastStartLoc: loc } = tokenizer.context();
			const node = startNode(4, offset, loc);
			node.key = key;
			tokenizer.nextToken();
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseLiteral(tokenizer, value) {
			const { lastOffset: offset, lastStartLoc: loc } = tokenizer.context();
			const node = startNode(9, offset, loc);
			node.value = value.replace(KNOWN_ESCAPES, fromEscapeSequence);
			tokenizer.nextToken();
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseLinkedModifier(tokenizer) {
			const token = tokenizer.nextToken();
			const context = tokenizer.context();
			const { lastOffset: offset, lastStartLoc: loc } = context;
			const node = startNode(8, offset, loc);
			if (token.type !== 11) {
				emitError(tokenizer, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_MODIFIER, context.lastStartLoc, 0);
				node.value = "";
				endNode(node, offset, loc);
				return {
					nextConsumeToken: token,
					node
				};
			}
			if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
			node.value = token.value || "";
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return { node };
		}
		function parseLinkedKey(tokenizer, value) {
			const context = tokenizer.context();
			const node = startNode(7, context.offset, context.startLoc);
			node.value = value;
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseLinked(tokenizer) {
			const context = tokenizer.context();
			const linkedNode = startNode(6, context.offset, context.startLoc);
			let token = tokenizer.nextToken();
			if (token.type === 8) {
				const parsed = parseLinkedModifier(tokenizer);
				linkedNode.modifier = parsed.node;
				token = parsed.nextConsumeToken || tokenizer.nextToken();
			}
			if (token.type !== 9) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
			token = tokenizer.nextToken();
			if (token.type === 2) token = tokenizer.nextToken();
			switch (token.type) {
				case 10:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseLinkedKey(tokenizer, token.value || "");
					break;
				case 4:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseNamed(tokenizer, token.value || "");
					break;
				case 5:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseList(tokenizer, token.value || "");
					break;
				case 6:
					if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
					linkedNode.key = parseLiteral(tokenizer, token.value || "");
					break;
				default: {
					emitError(tokenizer, CompileErrorCodes.UNEXPECTED_EMPTY_LINKED_KEY, context.lastStartLoc, 0);
					const nextContext = tokenizer.context();
					const emptyLinkedKeyNode = startNode(7, nextContext.offset, nextContext.startLoc);
					emptyLinkedKeyNode.value = "";
					endNode(emptyLinkedKeyNode, nextContext.offset, nextContext.startLoc);
					linkedNode.key = emptyLinkedKeyNode;
					endNode(linkedNode, nextContext.offset, nextContext.startLoc);
					return {
						nextConsumeToken: token,
						node: linkedNode
					};
				}
			}
			endNode(linkedNode, tokenizer.currentOffset(), tokenizer.currentPosition());
			return { node: linkedNode };
		}
		function parseMessage(tokenizer) {
			const context = tokenizer.context();
			const node = startNode(2, context.currentType === 1 ? tokenizer.currentOffset() : context.offset, context.currentType === 1 ? context.endLoc : context.startLoc);
			node.items = [];
			let nextToken = null;
			do {
				const token = nextToken || tokenizer.nextToken();
				nextToken = null;
				switch (token.type) {
					case 0:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseText(tokenizer, token.value || ""));
						break;
					case 5:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseList(tokenizer, token.value || ""));
						break;
					case 4:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseNamed(tokenizer, token.value || ""));
						break;
					case 6:
						if (token.value == null) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, getTokenCaption(token));
						node.items.push(parseLiteral(tokenizer, token.value || ""));
						break;
					case 7: {
						const parsed = parseLinked(tokenizer);
						node.items.push(parsed.node);
						nextToken = parsed.nextConsumeToken || null;
						break;
					}
				}
			} while (context.currentType !== 13 && context.currentType !== 1);
			endNode(node, context.currentType === 1 ? context.lastOffset : tokenizer.currentOffset(), context.currentType === 1 ? context.lastEndLoc : tokenizer.currentPosition());
			return node;
		}
		function parsePlural(tokenizer, offset, loc, msgNode) {
			const context = tokenizer.context();
			let hasEmptyMessage = msgNode.items.length === 0;
			const node = startNode(1, offset, loc);
			node.cases = [];
			node.cases.push(msgNode);
			do {
				const msg = parseMessage(tokenizer);
				if (!hasEmptyMessage) hasEmptyMessage = msg.items.length === 0;
				node.cases.push(msg);
			} while (context.currentType !== 13);
			if (hasEmptyMessage) emitError(tokenizer, CompileErrorCodes.MUST_HAVE_MESSAGES_IN_PLURAL, loc, 0);
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		function parseResource(tokenizer) {
			const context = tokenizer.context();
			const { offset, startLoc } = context;
			const msgNode = parseMessage(tokenizer);
			if (context.currentType === 13) return msgNode;
			else return parsePlural(tokenizer, offset, startLoc, msgNode);
		}
		function parse(source) {
			const tokenizer = createTokenizer(source, assign({}, options));
			const context = tokenizer.context();
			const node = startNode(0, context.offset, context.startLoc);
			if (location && node.loc) node.loc.source = source;
			node.body = parseResource(tokenizer);
			if (options.onCacheKey) node.cacheKey = options.onCacheKey(source);
			if (context.currentType !== 13) emitError(tokenizer, CompileErrorCodes.UNEXPECTED_LEXICAL_ANALYSIS, context.lastStartLoc, 0, source[context.offset] || "");
			endNode(node, tokenizer.currentOffset(), tokenizer.currentPosition());
			return node;
		}
		return { parse };
	}
	function getTokenCaption(token) {
		if (token.type === 13) return "EOF";
		const name = (token.value || "").replace(/\r?\n/gu, "\\n");
		return name.length > 10 ? name.slice(0, 9) + "…" : name;
	}
	function createTransformer(ast, options = {}) {
		const _context = {
			ast,
			helpers: /* @__PURE__ */ new Set()
		};
		const context = () => _context;
		const helper = (name) => {
			_context.helpers.add(name);
			return name;
		};
		return {
			context,
			helper
		};
	}
	function traverseNodes(nodes, transformer) {
		for (let i = 0; i < nodes.length; i++) traverseNode(nodes[i], transformer);
	}
	function traverseNode(node, transformer) {
		switch (node.type) {
			case 1:
				traverseNodes(node.cases, transformer);
				transformer.helper("plural");
				break;
			case 2:
				traverseNodes(node.items, transformer);
				break;
			case 6:
				traverseNode(node.key, transformer);
				transformer.helper("linked");
				transformer.helper("type");
				break;
			case 5:
				transformer.helper("interpolate");
				transformer.helper("list");
				break;
			case 4:
				transformer.helper("interpolate");
				transformer.helper("named");
				break;
		}
	}
	function transform(ast, options = {}) {
		const transformer = createTransformer(ast);
		transformer.helper("normalize");
		ast.body && traverseNode(ast.body, transformer);
		const context = transformer.context();
		ast.helpers = Array.from(context.helpers);
	}
	function optimize(ast) {
		const body = ast.body;
		if (body.type === 2) optimizeMessageNode(body);
		else body.cases.forEach((c) => optimizeMessageNode(c));
		return ast;
	}
	function optimizeMessageNode(message) {
		if (message.items.length === 1) {
			const item = message.items[0];
			if (item.type === 3 || item.type === 9) {
				message.static = item.value;
				delete item.value;
			}
		} else {
			const values = [];
			for (let i = 0; i < message.items.length; i++) {
				const item = message.items[i];
				if (!(item.type === 3 || item.type === 9)) break;
				if (item.value == null) break;
				values.push(item.value);
			}
			if (values.length === message.items.length) {
				message.static = join(values);
				for (let i = 0; i < message.items.length; i++) {
					const item = message.items[i];
					if (item.type === 3 || item.type === 9) delete item.value;
				}
			}
		}
	}
	var ERROR_DOMAIN$1 = "minifier";
	function minify(node) {
		node.t = node.type;
		switch (node.type) {
			case 0: {
				const resource = node;
				minify(resource.body);
				resource.b = resource.body;
				delete resource.body;
				break;
			}
			case 1: {
				const plural = node;
				const cases = plural.cases;
				for (let i = 0; i < cases.length; i++) minify(cases[i]);
				plural.c = cases;
				delete plural.cases;
				break;
			}
			case 2: {
				const message = node;
				const items = message.items;
				for (let i = 0; i < items.length; i++) minify(items[i]);
				message.i = items;
				delete message.items;
				if (message.static) {
					message.s = message.static;
					delete message.static;
				}
				break;
			}
			case 3:
			case 9:
			case 8:
			case 7: {
				const valueNode = node;
				if (valueNode.value) {
					valueNode.v = valueNode.value;
					delete valueNode.value;
				}
				break;
			}
			case 6: {
				const linked = node;
				minify(linked.key);
				linked.k = linked.key;
				delete linked.key;
				if (linked.modifier) {
					minify(linked.modifier);
					linked.m = linked.modifier;
					delete linked.modifier;
				}
				break;
			}
			case 5: {
				const list = node;
				list.i = list.index;
				delete list.index;
				break;
			}
			case 4: {
				const named = node;
				named.k = named.key;
				delete named.key;
				break;
			}
			default: if (process.env.NODE_ENV !== "production") throw createCompileError(CompileErrorCodes.UNHANDLED_MINIFIER_NODE_TYPE, null, {
				domain: ERROR_DOMAIN$1,
				args: [node.type]
			});
		}
		delete node.type;
	}
	var ERROR_DOMAIN = "parser";
	function createCodeGenerator(ast, options) {
		const { sourceMap, filename, breakLineCode, needIndent: _needIndent } = options;
		const location = options.location !== false;
		const _context = {
			filename,
			code: "",
			column: 1,
			line: 1,
			offset: 0,
			map: void 0,
			breakLineCode,
			needIndent: _needIndent,
			indentLevel: 0
		};
		if (location && ast.loc) _context.source = ast.loc.source;
		const context = () => _context;
		function push(code, node) {
			_context.code += code;
		}
		function _newline(n, withBreakLine = true) {
			const _breakLineCode = withBreakLine ? breakLineCode : "";
			push(_needIndent ? _breakLineCode + `  `.repeat(n) : _breakLineCode);
		}
		function indent(withNewLine = true) {
			const level = ++_context.indentLevel;
			withNewLine && _newline(level);
		}
		function deindent(withNewLine = true) {
			const level = --_context.indentLevel;
			withNewLine && _newline(level);
		}
		function newline() {
			_newline(_context.indentLevel);
		}
		const helper = (key) => `_${key}`;
		const needIndent = () => _context.needIndent;
		return {
			context,
			push,
			indent,
			deindent,
			newline,
			helper,
			needIndent
		};
	}
	function generateLinkedNode(generator, node) {
		const { helper } = generator;
		generator.push(`${helper("linked")}(`);
		generateNode(generator, node.key);
		if (node.modifier) {
			generator.push(`, `);
			generateNode(generator, node.modifier);
			generator.push(`, _type`);
		} else generator.push(`, undefined, _type`);
		generator.push(`)`);
	}
	function generateMessageNode(generator, node) {
		const { helper, needIndent } = generator;
		generator.push(`${helper("normalize")}([`);
		generator.indent(needIndent());
		const length = node.items.length;
		for (let i = 0; i < length; i++) {
			generateNode(generator, node.items[i]);
			if (i === length - 1) break;
			generator.push(", ");
		}
		generator.deindent(needIndent());
		generator.push("])");
	}
	function generatePluralNode(generator, node) {
		const { helper, needIndent } = generator;
		if (node.cases.length > 1) {
			generator.push(`${helper("plural")}([`);
			generator.indent(needIndent());
			const length = node.cases.length;
			for (let i = 0; i < length; i++) {
				generateNode(generator, node.cases[i]);
				if (i === length - 1) break;
				generator.push(", ");
			}
			generator.deindent(needIndent());
			generator.push(`])`);
		}
	}
	function generateResource(generator, node) {
		if (node.body) generateNode(generator, node.body);
		else generator.push("null");
	}
	function generateNode(generator, node) {
		const { helper } = generator;
		switch (node.type) {
			case 0:
				generateResource(generator, node);
				break;
			case 1:
				generatePluralNode(generator, node);
				break;
			case 2:
				generateMessageNode(generator, node);
				break;
			case 6:
				generateLinkedNode(generator, node);
				break;
			case 8:
				generator.push(JSON.stringify(node.value), node);
				break;
			case 7:
				generator.push(JSON.stringify(node.value), node);
				break;
			case 5:
				generator.push(`${helper("interpolate")}(${helper("list")}(${node.index}))`, node);
				break;
			case 4:
				generator.push(`${helper("interpolate")}(${helper("named")}(${JSON.stringify(node.key)}))`, node);
				break;
			case 9:
				generator.push(JSON.stringify(node.value), node);
				break;
			case 3:
				generator.push(JSON.stringify(node.value), node);
				break;
			default: if (process.env.NODE_ENV !== "production") throw createCompileError(CompileErrorCodes.UNHANDLED_CODEGEN_NODE_TYPE, null, {
				domain: ERROR_DOMAIN,
				args: [node.type]
			});
		}
	}
	var generate = (ast, options = {}) => {
		const mode = isString(options.mode) ? options.mode : "normal";
		const filename = isString(options.filename) ? options.filename : "message.intl";
		const sourceMap = !!options.sourceMap;
		const breakLineCode = options.breakLineCode != null ? options.breakLineCode : mode === "arrow" ? ";" : "\n";
		const needIndent = options.needIndent ? options.needIndent : mode !== "arrow";
		const helpers = ast.helpers || [];
		const generator = createCodeGenerator(ast, {
			mode,
			filename,
			sourceMap,
			breakLineCode,
			needIndent
		});
		generator.push(mode === "normal" ? `function __msg__ (ctx) {` : `(ctx) => {`);
		generator.indent(needIndent);
		if (helpers.length > 0) {
			generator.push(`const { ${join(helpers.map((s) => `${s}: _${s}`), ", ")} } = ctx`);
			generator.newline();
		}
		generator.push(`return `);
		generateNode(generator, ast);
		generator.deindent(needIndent);
		generator.push(`}`);
		delete ast.helpers;
		const { code, map } = generator.context();
		return {
			ast,
			code,
			map: map ? map.toJSON() : void 0
		};
	};
	function baseCompile$1(source, options = {}) {
		const assignedOptions = assign({}, options);
		const jit = !!assignedOptions.jit;
		const enalbeMinify = !!assignedOptions.minify;
		const enambeOptimize = assignedOptions.optimize == null ? true : assignedOptions.optimize;
		const ast = createParser(assignedOptions).parse(source);
		if (!jit) {
			transform(ast, assignedOptions);
			return generate(ast, assignedOptions);
		} else {
			enambeOptimize && optimize(ast);
			enalbeMinify && minify(ast);
			return {
				ast,
				code: ""
			};
		}
	}
	//#endregion
	//#region node_modules/@intlify/core-base/dist/core-base.mjs
	/*!
	* core-base v10.0.8
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	/**
	* This is only called in esm-bundler builds.
	* istanbul-ignore-next
	*/
	function initFeatureFlags$1() {
		if (typeof __INTLIFY_PROD_DEVTOOLS__ !== "boolean") getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = false;
		if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
	}
	function isMessageAST(val) {
		return isObject$1(val) && resolveType(val) === 0 && (hasOwn(val, "b") || hasOwn(val, "body"));
	}
	var PROPS_BODY = ["b", "body"];
	function resolveBody(node) {
		return resolveProps(node, PROPS_BODY);
	}
	var PROPS_CASES = ["c", "cases"];
	function resolveCases(node) {
		return resolveProps(node, PROPS_CASES, []);
	}
	var PROPS_STATIC = ["s", "static"];
	function resolveStatic(node) {
		return resolveProps(node, PROPS_STATIC);
	}
	var PROPS_ITEMS = ["i", "items"];
	function resolveItems(node) {
		return resolveProps(node, PROPS_ITEMS, []);
	}
	var PROPS_TYPE = ["t", "type"];
	function resolveType(node) {
		return resolveProps(node, PROPS_TYPE);
	}
	var PROPS_VALUE = ["v", "value"];
	function resolveValue$1(node, type) {
		const resolved = resolveProps(node, PROPS_VALUE);
		if (resolved != null) return resolved;
		else throw createUnhandleNodeError(type);
	}
	var PROPS_MODIFIER = ["m", "modifier"];
	function resolveLinkedModifier(node) {
		return resolveProps(node, PROPS_MODIFIER);
	}
	var PROPS_KEY = ["k", "key"];
	function resolveLinkedKey(node) {
		const resolved = resolveProps(node, PROPS_KEY);
		if (resolved) return resolved;
		else throw createUnhandleNodeError(6);
	}
	function resolveProps(node, props, defaultValue) {
		for (let i = 0; i < props.length; i++) {
			const prop = props[i];
			if (hasOwn(node, prop) && node[prop] != null) return node[prop];
		}
		return defaultValue;
	}
	var AST_NODE_PROPS_KEYS = [
		...PROPS_BODY,
		...PROPS_CASES,
		...PROPS_STATIC,
		...PROPS_ITEMS,
		...PROPS_KEY,
		...PROPS_MODIFIER,
		...PROPS_VALUE,
		...PROPS_TYPE
	];
	function createUnhandleNodeError(type) {
		return /* @__PURE__ */ new Error(`unhandled node type: ${type}`);
	}
	function format(ast) {
		const msg = (ctx) => formatParts(ctx, ast);
		return msg;
	}
	function formatParts(ctx, ast) {
		const body = resolveBody(ast);
		if (body == null) throw createUnhandleNodeError(0);
		if (resolveType(body) === 1) {
			const cases = resolveCases(body);
			return ctx.plural(cases.reduce((messages, c) => [...messages, formatMessageParts(ctx, c)], []));
		} else return formatMessageParts(ctx, body);
	}
	function formatMessageParts(ctx, node) {
		const static_ = resolveStatic(node);
		if (static_ != null) return ctx.type === "text" ? static_ : ctx.normalize([static_]);
		else {
			const messages = resolveItems(node).reduce((acm, c) => [...acm, formatMessagePart(ctx, c)], []);
			return ctx.normalize(messages);
		}
	}
	function formatMessagePart(ctx, node) {
		const type = resolveType(node);
		switch (type) {
			case 3: return resolveValue$1(node, type);
			case 9: return resolveValue$1(node, type);
			case 4: {
				const named = node;
				if (hasOwn(named, "k") && named.k) return ctx.interpolate(ctx.named(named.k));
				if (hasOwn(named, "key") && named.key) return ctx.interpolate(ctx.named(named.key));
				throw createUnhandleNodeError(type);
			}
			case 5: {
				const list = node;
				if (hasOwn(list, "i") && isNumber$1(list.i)) return ctx.interpolate(ctx.list(list.i));
				if (hasOwn(list, "index") && isNumber$1(list.index)) return ctx.interpolate(ctx.list(list.index));
				throw createUnhandleNodeError(type);
			}
			case 6: {
				const linked = node;
				const modifier = resolveLinkedModifier(linked);
				const key = resolveLinkedKey(linked);
				return ctx.linked(formatMessagePart(ctx, key), modifier ? formatMessagePart(ctx, modifier) : void 0, ctx.type);
			}
			case 7: return resolveValue$1(node, type);
			case 8: return resolveValue$1(node, type);
			default: throw new Error(`unhandled node on format message part: ${type}`);
		}
	}
	var WARN_MESSAGE = `Detected HTML in '{source}' message. Recommend not using HTML messages to avoid XSS.`;
	function checkHtmlMessage(source, warnHtmlMessage) {
		if (warnHtmlMessage && detectHtmlTag(source)) warn(format$1(WARN_MESSAGE, { source }));
	}
	var defaultOnCacheKey = (message) => message;
	var compileCache = create();
	function baseCompile(message, options = {}) {
		let detectError = false;
		const onError = options.onError || defaultOnError;
		options.onError = (err) => {
			detectError = true;
			onError(err);
		};
		return {
			...baseCompile$1(message, options),
			detectError
		};
	}
	/* #__NO_SIDE_EFFECTS__ */
	function compile(message, context) {
		if (!__INTLIFY_DROP_MESSAGE_COMPILER__ && isString(message)) {
			const warnHtmlMessage = isBoolean(context.warnHtmlMessage) ? context.warnHtmlMessage : true;
			process.env.NODE_ENV !== "production" && checkHtmlMessage(message, warnHtmlMessage);
			const cacheKey = (context.onCacheKey || defaultOnCacheKey)(message);
			const cached = compileCache[cacheKey];
			if (cached) return cached;
			const { ast, detectError } = baseCompile(message, {
				...context,
				location: process.env.NODE_ENV !== "production",
				jit: true
			});
			const msg = format(ast);
			return !detectError ? compileCache[cacheKey] = msg : msg;
		} else {
			if (process.env.NODE_ENV !== "production" && !isMessageAST(message)) {
				warn(`the message that is resolve with key '${context.key}' is not supported for jit compilation`);
				return (() => message);
			}
			const cacheKey = message.cacheKey;
			if (cacheKey) {
				const cached = compileCache[cacheKey];
				if (cached) return cached;
				return compileCache[cacheKey] = format(message);
			} else return format(message);
		}
	}
	var devtools = null;
	function setDevToolsHook(hook) {
		devtools = hook;
	}
	function initI18nDevTools(i18n, version, meta) {
		devtools && devtools.emit("i18n:init", {
			timestamp: Date.now(),
			i18n,
			version,
			meta
		});
	}
	var translateDevTools = /* #__PURE__*/ createDevToolsHook("function:translate");
	function createDevToolsHook(hook) {
		return (payloads) => devtools && devtools.emit(hook, payloads);
	}
	var CoreErrorCodes = {
		INVALID_ARGUMENT: 17,
		INVALID_DATE_ARGUMENT: 18,
		INVALID_ISO_DATE_ARGUMENT: 19,
		NOT_SUPPORT_NON_STRING_MESSAGE: 20,
		NOT_SUPPORT_LOCALE_PROMISE_VALUE: 21,
		NOT_SUPPORT_LOCALE_ASYNC_FUNCTION: 22,
		NOT_SUPPORT_LOCALE_TYPE: 23
	};
	function createCoreError(code) {
		return createCompileError(code, null, process.env.NODE_ENV !== "production" ? { messages: errorMessages$1 } : void 0);
	}
	/** @internal */
	var errorMessages$1 = {
		[CoreErrorCodes.INVALID_ARGUMENT]: "Invalid arguments",
		[CoreErrorCodes.INVALID_DATE_ARGUMENT]: "The date provided is an invalid Date object.Make sure your Date represents a valid date.",
		[CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT]: "The argument provided is not a valid ISO date string",
		[CoreErrorCodes.NOT_SUPPORT_NON_STRING_MESSAGE]: "Not support non-string message",
		[CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE]: "cannot support promise value",
		[CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION]: "cannot support async function",
		[CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE]: "cannot support locale type"
	};
	/** @internal */
	function getLocale(context, options) {
		return options.locale != null ? resolveLocale(options.locale) : resolveLocale(context.locale);
	}
	var _resolveLocale;
	/** @internal */
	function resolveLocale(locale) {
		if (isString(locale)) return locale;
		else if (isFunction(locale)) if (locale.resolvedOnce && _resolveLocale != null) return _resolveLocale;
		else if (locale.constructor.name === "Function") {
			const resolve = locale();
			if (isPromise(resolve)) throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_PROMISE_VALUE);
			return _resolveLocale = resolve;
		} else throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_ASYNC_FUNCTION);
		else throw createCoreError(CoreErrorCodes.NOT_SUPPORT_LOCALE_TYPE);
	}
	/**
	* Fallback with simple implemenation
	*
	* @remarks
	* A fallback locale function implemented with a simple fallback algorithm.
	*
	* Basically, it returns the value as specified in the `fallbackLocale` props, and is processed with the fallback inside intlify.
	*
	* @param ctx - A {@link CoreContext | context}
	* @param fallback - A {@link FallbackLocale | fallback locale}
	* @param start - A starting {@link Locale | locale}
	*
	* @returns Fallback locales
	*
	* @VueI18nGeneral
	*/
	function fallbackWithSimple(ctx, fallback, start) {
		return [.../* @__PURE__ */ new Set([start, ...isArray(fallback) ? fallback : isObject$1(fallback) ? Object.keys(fallback) : isString(fallback) ? [fallback] : [start]])];
	}
	/**
	* Fallback with locale chain
	*
	* @remarks
	* A fallback locale function implemented with a fallback chain algorithm. It's used in VueI18n as default.
	*
	* @param ctx - A {@link CoreContext | context}
	* @param fallback - A {@link FallbackLocale | fallback locale}
	* @param start - A starting {@link Locale | locale}
	*
	* @returns Fallback locales
	*
	* @VueI18nSee [Fallbacking](../guide/essentials/fallback)
	*
	* @VueI18nGeneral
	*/
	function fallbackWithLocaleChain(ctx, fallback, start) {
		const startLocale = isString(start) ? start : DEFAULT_LOCALE;
		const context = ctx;
		if (!context.__localeChainCache) context.__localeChainCache = /* @__PURE__ */ new Map();
		let chain = context.__localeChainCache.get(startLocale);
		if (!chain) {
			chain = [];
			let block = [start];
			while (isArray(block)) block = appendBlockToChain(chain, block, fallback);
			const defaults = isArray(fallback) || !isPlainObject$1(fallback) ? fallback : fallback["default"] ? fallback["default"] : null;
			block = isString(defaults) ? [defaults] : defaults;
			if (isArray(block)) appendBlockToChain(chain, block, false);
			context.__localeChainCache.set(startLocale, chain);
		}
		return chain;
	}
	function appendBlockToChain(chain, block, blocks) {
		let follow = true;
		for (let i = 0; i < block.length && isBoolean(follow); i++) {
			const locale = block[i];
			if (isString(locale)) follow = appendLocaleToChain(chain, block[i], blocks);
		}
		return follow;
	}
	function appendLocaleToChain(chain, locale, blocks) {
		let follow;
		const tokens = locale.split("-");
		do {
			follow = appendItemToChain(chain, tokens.join("-"), blocks);
			tokens.splice(-1, 1);
		} while (tokens.length && follow === true);
		return follow;
	}
	function appendItemToChain(chain, target, blocks) {
		let follow = false;
		if (!chain.includes(target)) {
			follow = true;
			if (target) {
				follow = target[target.length - 1] !== "!";
				const locale = target.replace(/!/g, "");
				chain.push(locale);
				if ((isArray(blocks) || isPlainObject$1(blocks)) && blocks[locale]) follow = blocks[locale];
			}
		}
		return follow;
	}
	var pathStateMachine = [];
	pathStateMachine[0] = {
		["w"]: [0],
		["i"]: [3, 0],
		["["]: [4],
		["o"]: [7]
	};
	pathStateMachine[1] = {
		["w"]: [1],
		["."]: [2],
		["["]: [4],
		["o"]: [7]
	};
	pathStateMachine[2] = {
		["w"]: [2],
		["i"]: [3, 0],
		["0"]: [3, 0]
	};
	pathStateMachine[3] = {
		["i"]: [3, 0],
		["0"]: [3, 0],
		["w"]: [1, 1],
		["."]: [2, 1],
		["["]: [4, 1],
		["o"]: [7, 1]
	};
	pathStateMachine[4] = {
		["'"]: [5, 0],
		["\""]: [6, 0],
		["["]: [4, 2],
		["]"]: [1, 3],
		["o"]: 8,
		["l"]: [4, 0]
	};
	pathStateMachine[5] = {
		["'"]: [4, 0],
		["o"]: 8,
		["l"]: [5, 0]
	};
	pathStateMachine[6] = {
		["\""]: [4, 0],
		["o"]: 8,
		["l"]: [6, 0]
	};
	/**
	* Check if an expression is a literal value.
	*/
	var literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
	function isLiteral(exp) {
		return literalValueRE.test(exp);
	}
	/**
	* Strip quotes from a string
	*/
	function stripQuotes(str) {
		const a = str.charCodeAt(0);
		return a === str.charCodeAt(str.length - 1) && (a === 34 || a === 39) ? str.slice(1, -1) : str;
	}
	/**
	* Determine the type of a character in a keypath.
	*/
	function getPathCharType(ch) {
		if (ch === void 0 || ch === null) return "o";
		switch (ch.charCodeAt(0)) {
			case 91:
			case 93:
			case 46:
			case 34:
			case 39: return ch;
			case 95:
			case 36:
			case 45: return "i";
			case 9:
			case 10:
			case 13:
			case 160:
			case 65279:
			case 8232:
			case 8233: return "w";
		}
		return "i";
	}
	/**
	* Format a subPath, return its plain form if it is
	* a literal string or number. Otherwise prepend the
	* dynamic indicator (*).
	*/
	function formatSubPath(path) {
		const trimmed = path.trim();
		if (path.charAt(0) === "0" && isNaN(parseInt(path))) return false;
		return isLiteral(trimmed) ? stripQuotes(trimmed) : "*" + trimmed;
	}
	/**
	* Parse a string path into an array of segments
	*/
	function parse(path) {
		const keys = [];
		let index = -1;
		let mode = 0;
		let subPathDepth = 0;
		let c;
		let key;
		let newChar;
		let type;
		let transition;
		let action;
		let typeMap;
		const actions = [];
		actions[0] = () => {
			if (key === void 0) key = newChar;
			else key += newChar;
		};
		actions[1] = () => {
			if (key !== void 0) {
				keys.push(key);
				key = void 0;
			}
		};
		actions[2] = () => {
			actions[0]();
			subPathDepth++;
		};
		actions[3] = () => {
			if (subPathDepth > 0) {
				subPathDepth--;
				mode = 4;
				actions[0]();
			} else {
				subPathDepth = 0;
				if (key === void 0) return false;
				key = formatSubPath(key);
				if (key === false) return false;
				else actions[1]();
			}
		};
		function maybeUnescapeQuote() {
			const nextChar = path[index + 1];
			if (mode === 5 && nextChar === "'" || mode === 6 && nextChar === "\"") {
				index++;
				newChar = "\\" + nextChar;
				actions[0]();
				return true;
			}
		}
		while (mode !== null) {
			index++;
			c = path[index];
			if (c === "\\" && maybeUnescapeQuote()) continue;
			type = getPathCharType(c);
			typeMap = pathStateMachine[mode];
			transition = typeMap[type] || typeMap["l"] || 8;
			if (transition === 8) return;
			mode = transition[0];
			if (transition[1] !== void 0) {
				action = actions[transition[1]];
				if (action) {
					newChar = c;
					if (action() === false) return;
				}
			}
			if (mode === 7) return keys;
		}
	}
	var cache = /* @__PURE__ */ new Map();
	/**
	* key-value message resolver
	*
	* @remarks
	* Resolves messages with the key-value structure. Note that messages with a hierarchical structure such as objects cannot be resolved
	*
	* @param obj - A target object to be resolved with path
	* @param path - A {@link Path | path} to resolve the value of message
	*
	* @returns A resolved {@link PathValue | path value}
	*
	* @VueI18nGeneral
	*/
	function resolveWithKeyValue(obj, path) {
		return isObject$1(obj) ? obj[path] : null;
	}
	/**
	* message resolver
	*
	* @remarks
	* Resolves messages. messages with a hierarchical structure such as objects can be resolved. This resolver is used in VueI18n as default.
	*
	* @param obj - A target object to be resolved with path
	* @param path - A {@link Path | path} to resolve the value of message
	*
	* @returns A resolved {@link PathValue | path value}
	*
	* @VueI18nGeneral
	*/
	function resolveValue(obj, path) {
		if (!isObject$1(obj)) return null;
		let hit = cache.get(path);
		if (!hit) {
			hit = parse(path);
			if (hit) cache.set(path, hit);
		}
		if (!hit) return null;
		const len = hit.length;
		let last = obj;
		let i = 0;
		while (i < len) {
			const key = hit[i];
			/**
			* NOTE:
			* if `key` is intlify message format AST node key and `last` is intlify message format AST, skip it.
			* because the AST node is not a key-value structure.
			*/
			if (AST_NODE_PROPS_KEYS.includes(key) && isMessageAST(last)) return null;
			const val = last[key];
			if (val === void 0) return null;
			if (isFunction(last)) return null;
			last = val;
			i++;
		}
		return last;
	}
	var CoreWarnCodes = {
		NOT_FOUND_KEY: 1,
		FALLBACK_TO_TRANSLATE: 2,
		CANNOT_FORMAT_NUMBER: 3,
		FALLBACK_TO_NUMBER_FORMAT: 4,
		CANNOT_FORMAT_DATE: 5,
		FALLBACK_TO_DATE_FORMAT: 6,
		EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER: 7
	};
	/** @internal */
	var warnMessages$1 = {
		[CoreWarnCodes.NOT_FOUND_KEY]: `Not found '{key}' key in '{locale}' locale messages.`,
		[CoreWarnCodes.FALLBACK_TO_TRANSLATE]: `Fall back to translate '{key}' key with '{target}' locale.`,
		[CoreWarnCodes.CANNOT_FORMAT_NUMBER]: `Cannot format a number value due to not supported Intl.NumberFormat.`,
		[CoreWarnCodes.FALLBACK_TO_NUMBER_FORMAT]: `Fall back to number format '{key}' key with '{target}' locale.`,
		[CoreWarnCodes.CANNOT_FORMAT_DATE]: `Cannot format a date value due to not supported Intl.DateTimeFormat.`,
		[CoreWarnCodes.FALLBACK_TO_DATE_FORMAT]: `Fall back to datetime format '{key}' key with '{target}' locale.`,
		[CoreWarnCodes.EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER]: `This project is using Custom Message Compiler, which is an experimental feature. It may receive breaking changes or be removed in the future.`
	};
	function getWarnMessage$1(code, ...args) {
		return format$1(warnMessages$1[code], ...args);
	}
	/**
	* Intlify core-base version
	* @internal
	*/
	var VERSION$1 = "10.0.8";
	var DEFAULT_LOCALE = "en-US";
	var capitalize = (str) => `${str.charAt(0).toLocaleUpperCase()}${str.substr(1)}`;
	function getDefaultLinkedModifiers() {
		return {
			upper: (val, type) => {
				return type === "text" && isString(val) ? val.toUpperCase() : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? val.children.toUpperCase() : val;
			},
			lower: (val, type) => {
				return type === "text" && isString(val) ? val.toLowerCase() : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? val.children.toLowerCase() : val;
			},
			capitalize: (val, type) => {
				return type === "text" && isString(val) ? capitalize(val) : type === "vnode" && isObject$1(val) && "__v_isVNode" in val ? capitalize(val.children) : val;
			}
		};
	}
	var _compiler;
	function registerMessageCompiler(compiler) {
		_compiler = compiler;
	}
	var _resolver;
	/**
	* Register the message resolver
	*
	* @param resolver - A {@link MessageResolver} function
	*
	* @VueI18nGeneral
	*/
	function registerMessageResolver(resolver) {
		_resolver = resolver;
	}
	var _fallbacker;
	/**
	* Register the locale fallbacker
	*
	* @param fallbacker - A {@link LocaleFallbacker} function
	*
	* @VueI18nGeneral
	*/
	function registerLocaleFallbacker(fallbacker) {
		_fallbacker = fallbacker;
	}
	var _additionalMeta = null;
	var getAdditionalMeta = /* @__NO_SIDE_EFFECTS__ */ () => _additionalMeta;
	var _fallbackContext = null;
	var setFallbackContext = (context) => {
		_fallbackContext = context;
	};
	var getFallbackContext = () => _fallbackContext;
	var _cid = 0;
	function createCoreContext(options = {}) {
		const onWarn = isFunction(options.onWarn) ? options.onWarn : warn;
		const version = isString(options.version) ? options.version : VERSION$1;
		const locale = isString(options.locale) || isFunction(options.locale) ? options.locale : DEFAULT_LOCALE;
		const _locale = isFunction(locale) ? DEFAULT_LOCALE : locale;
		const fallbackLocale = isArray(options.fallbackLocale) || isPlainObject$1(options.fallbackLocale) || isString(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale;
		const messages = isPlainObject$1(options.messages) ? options.messages : createResources(_locale);
		const datetimeFormats = isPlainObject$1(options.datetimeFormats) ? options.datetimeFormats : createResources(_locale);
		const numberFormats = isPlainObject$1(options.numberFormats) ? options.numberFormats : createResources(_locale);
		const modifiers = assign(create(), options.modifiers, getDefaultLinkedModifiers());
		const pluralRules = options.pluralRules || create();
		const missing = isFunction(options.missing) ? options.missing : null;
		const missingWarn = isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
		const fallbackWarn = isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
		const fallbackFormat = !!options.fallbackFormat;
		const unresolving = !!options.unresolving;
		const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
		const processor = isPlainObject$1(options.processor) ? options.processor : null;
		const warnHtmlMessage = isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
		const escapeParameter = !!options.escapeParameter;
		const messageCompiler = isFunction(options.messageCompiler) ? options.messageCompiler : _compiler;
		if (process.env.NODE_ENV !== "production" && isFunction(options.messageCompiler)) warnOnce(getWarnMessage$1(CoreWarnCodes.EXPERIMENTAL_CUSTOM_MESSAGE_COMPILER));
		const messageResolver = isFunction(options.messageResolver) ? options.messageResolver : _resolver || resolveWithKeyValue;
		const localeFallbacker = isFunction(options.localeFallbacker) ? options.localeFallbacker : _fallbacker || fallbackWithSimple;
		const fallbackContext = isObject$1(options.fallbackContext) ? options.fallbackContext : void 0;
		const internalOptions = options;
		const __datetimeFormatters = isObject$1(internalOptions.__datetimeFormatters) ? internalOptions.__datetimeFormatters : /* @__PURE__ */ new Map();
		const __numberFormatters = isObject$1(internalOptions.__numberFormatters) ? internalOptions.__numberFormatters : /* @__PURE__ */ new Map();
		const __meta = isObject$1(internalOptions.__meta) ? internalOptions.__meta : {};
		_cid++;
		const context = {
			version,
			cid: _cid,
			locale,
			fallbackLocale,
			messages,
			modifiers,
			pluralRules,
			missing,
			missingWarn,
			fallbackWarn,
			fallbackFormat,
			unresolving,
			postTranslation,
			processor,
			warnHtmlMessage,
			escapeParameter,
			messageCompiler,
			messageResolver,
			localeFallbacker,
			fallbackContext,
			onWarn,
			__meta
		};
		context.datetimeFormats = datetimeFormats;
		context.numberFormats = numberFormats;
		context.__datetimeFormatters = __datetimeFormatters;
		context.__numberFormatters = __numberFormatters;
		if (process.env.NODE_ENV !== "production") context.__v_emitter = internalOptions.__v_emitter != null ? internalOptions.__v_emitter : void 0;
		if (process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) initI18nDevTools(context, version, __meta);
		return context;
	}
	var createResources = (locale) => ({ [locale]: create() });
	/** @internal */
	function isTranslateFallbackWarn(fallback, key) {
		return fallback instanceof RegExp ? fallback.test(key) : fallback;
	}
	/** @internal */
	function isTranslateMissingWarn(missing, key) {
		return missing instanceof RegExp ? missing.test(key) : missing;
	}
	/** @internal */
	function handleMissing(context, key, locale, missingWarn, type) {
		const { missing, onWarn } = context;
		if (process.env.NODE_ENV !== "production") {
			const emitter = context.__v_emitter;
			if (emitter) emitter.emit("missing", {
				locale,
				key,
				type,
				groupId: `${type}:${key}`
			});
		}
		if (missing !== null) {
			const ret = missing(context, locale, key, type);
			return isString(ret) ? ret : key;
		} else {
			if (process.env.NODE_ENV !== "production" && isTranslateMissingWarn(missingWarn, key)) onWarn(getWarnMessage$1(CoreWarnCodes.NOT_FOUND_KEY, {
				key,
				locale
			}));
			return key;
		}
	}
	/** @internal */
	function updateFallbackLocale(ctx, locale, fallback) {
		const context = ctx;
		context.__localeChainCache = /* @__PURE__ */ new Map();
		ctx.localeFallbacker(ctx, fallback, locale);
	}
	/** @internal */
	function isAlmostSameLocale(locale, compareLocale) {
		if (locale === compareLocale) return false;
		return locale.split("-")[0] === compareLocale.split("-")[0];
	}
	/** @internal */
	function isImplicitFallback(targetLocale, locales) {
		const index = locales.indexOf(targetLocale);
		if (index === -1) return false;
		for (let i = index + 1; i < locales.length; i++) if (isAlmostSameLocale(targetLocale, locales[i])) return true;
		return false;
	}
	var intlDefined = typeof Intl !== "undefined";
	var Availabilities = {
		dateTimeFormat: intlDefined && typeof Intl.DateTimeFormat !== "undefined",
		numberFormat: intlDefined && typeof Intl.NumberFormat !== "undefined"
	};
	function datetime(context, ...args) {
		const { datetimeFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
		const { __datetimeFormatters } = context;
		if (process.env.NODE_ENV !== "production" && !Availabilities.dateTimeFormat) {
			onWarn(getWarnMessage$1(CoreWarnCodes.CANNOT_FORMAT_DATE));
			return "";
		}
		const [key, value, options, overrides] = parseDateTimeArgs(...args);
		const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
		const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
		const part = !!options.part;
		const locale = getLocale(context, options);
		const locales = localeFallbacker(context, fallbackLocale, locale);
		if (!isString(key) || key === "") return new Intl.DateTimeFormat(locale, overrides).format(value);
		let datetimeFormat = {};
		let targetLocale;
		let format = null;
		let from = locale;
		let to = null;
		const type = "datetime format";
		for (let i = 0; i < locales.length; i++) {
			targetLocale = to = locales[i];
			if (process.env.NODE_ENV !== "production" && locale !== targetLocale && isTranslateFallbackWarn(fallbackWarn, key)) onWarn(getWarnMessage$1(CoreWarnCodes.FALLBACK_TO_DATE_FORMAT, {
				key,
				target: targetLocale
			}));
			if (process.env.NODE_ENV !== "production" && locale !== targetLocale) {
				const emitter = context.__v_emitter;
				if (emitter) emitter.emit("fallback", {
					type,
					key,
					from,
					to,
					groupId: `${type}:${key}`
				});
			}
			datetimeFormat = datetimeFormats[targetLocale] || {};
			format = datetimeFormat[key];
			if (isPlainObject$1(format)) break;
			handleMissing(context, key, targetLocale, missingWarn, type);
			from = to;
		}
		if (!isPlainObject$1(format) || !isString(targetLocale)) return unresolving ? -1 : key;
		let id = `${targetLocale}__${key}`;
		if (!isEmptyObject(overrides)) id = `${id}__${JSON.stringify(overrides)}`;
		let formatter = __datetimeFormatters.get(id);
		if (!formatter) {
			formatter = new Intl.DateTimeFormat(targetLocale, assign({}, format, overrides));
			__datetimeFormatters.set(id, formatter);
		}
		return !part ? formatter.format(value) : formatter.formatToParts(value);
	}
	/** @internal */
	var DATETIME_FORMAT_OPTIONS_KEYS = [
		"localeMatcher",
		"weekday",
		"era",
		"year",
		"month",
		"day",
		"hour",
		"minute",
		"second",
		"timeZoneName",
		"formatMatcher",
		"hour12",
		"timeZone",
		"dateStyle",
		"timeStyle",
		"calendar",
		"dayPeriod",
		"numberingSystem",
		"hourCycle",
		"fractionalSecondDigits"
	];
	/** @internal */
	function parseDateTimeArgs(...args) {
		const [arg1, arg2, arg3, arg4] = args;
		const options = create();
		let overrides = create();
		let value;
		if (isString(arg1)) {
			const matches = arg1.match(/(\d{4}-\d{2}-\d{2})(T|\s)?(.*)/);
			if (!matches) throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
			const dateTime = matches[3] ? matches[3].trim().startsWith("T") ? `${matches[1].trim()}${matches[3].trim()}` : `${matches[1].trim()}T${matches[3].trim()}` : matches[1].trim();
			value = new Date(dateTime);
			try {
				value.toISOString();
			} catch {
				throw createCoreError(CoreErrorCodes.INVALID_ISO_DATE_ARGUMENT);
			}
		} else if (isDate(arg1)) {
			if (isNaN(arg1.getTime())) throw createCoreError(CoreErrorCodes.INVALID_DATE_ARGUMENT);
			value = arg1;
		} else if (isNumber$1(arg1)) value = arg1;
		else throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
		if (isString(arg2)) options.key = arg2;
		else if (isPlainObject$1(arg2)) Object.keys(arg2).forEach((key) => {
			if (DATETIME_FORMAT_OPTIONS_KEYS.includes(key)) overrides[key] = arg2[key];
			else options[key] = arg2[key];
		});
		if (isString(arg3)) options.locale = arg3;
		else if (isPlainObject$1(arg3)) overrides = arg3;
		if (isPlainObject$1(arg4)) overrides = arg4;
		return [
			options.key || "",
			value,
			options,
			overrides
		];
	}
	/** @internal */
	function clearDateTimeFormat(ctx, locale, format) {
		const context = ctx;
		for (const key in format) {
			const id = `${locale}__${key}`;
			if (!context.__datetimeFormatters.has(id)) continue;
			context.__datetimeFormatters.delete(id);
		}
	}
	function number(context, ...args) {
		const { numberFormats, unresolving, fallbackLocale, onWarn, localeFallbacker } = context;
		const { __numberFormatters } = context;
		if (process.env.NODE_ENV !== "production" && !Availabilities.numberFormat) {
			onWarn(getWarnMessage$1(CoreWarnCodes.CANNOT_FORMAT_NUMBER));
			return "";
		}
		const [key, value, options, overrides] = parseNumberArgs(...args);
		const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
		const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
		const part = !!options.part;
		const locale = getLocale(context, options);
		const locales = localeFallbacker(context, fallbackLocale, locale);
		if (!isString(key) || key === "") return new Intl.NumberFormat(locale, overrides).format(value);
		let numberFormat = {};
		let targetLocale;
		let format = null;
		let from = locale;
		let to = null;
		const type = "number format";
		for (let i = 0; i < locales.length; i++) {
			targetLocale = to = locales[i];
			if (process.env.NODE_ENV !== "production" && locale !== targetLocale && isTranslateFallbackWarn(fallbackWarn, key)) onWarn(getWarnMessage$1(CoreWarnCodes.FALLBACK_TO_NUMBER_FORMAT, {
				key,
				target: targetLocale
			}));
			if (process.env.NODE_ENV !== "production" && locale !== targetLocale) {
				const emitter = context.__v_emitter;
				if (emitter) emitter.emit("fallback", {
					type,
					key,
					from,
					to,
					groupId: `${type}:${key}`
				});
			}
			numberFormat = numberFormats[targetLocale] || {};
			format = numberFormat[key];
			if (isPlainObject$1(format)) break;
			handleMissing(context, key, targetLocale, missingWarn, type);
			from = to;
		}
		if (!isPlainObject$1(format) || !isString(targetLocale)) return unresolving ? -1 : key;
		let id = `${targetLocale}__${key}`;
		if (!isEmptyObject(overrides)) id = `${id}__${JSON.stringify(overrides)}`;
		let formatter = __numberFormatters.get(id);
		if (!formatter) {
			formatter = new Intl.NumberFormat(targetLocale, assign({}, format, overrides));
			__numberFormatters.set(id, formatter);
		}
		return !part ? formatter.format(value) : formatter.formatToParts(value);
	}
	/** @internal */
	var NUMBER_FORMAT_OPTIONS_KEYS = [
		"localeMatcher",
		"style",
		"currency",
		"currencyDisplay",
		"currencySign",
		"useGrouping",
		"minimumIntegerDigits",
		"minimumFractionDigits",
		"maximumFractionDigits",
		"minimumSignificantDigits",
		"maximumSignificantDigits",
		"compactDisplay",
		"notation",
		"signDisplay",
		"unit",
		"unitDisplay",
		"roundingMode",
		"roundingPriority",
		"roundingIncrement",
		"trailingZeroDisplay"
	];
	/** @internal */
	function parseNumberArgs(...args) {
		const [arg1, arg2, arg3, arg4] = args;
		const options = create();
		let overrides = create();
		if (!isNumber$1(arg1)) throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
		const value = arg1;
		if (isString(arg2)) options.key = arg2;
		else if (isPlainObject$1(arg2)) Object.keys(arg2).forEach((key) => {
			if (NUMBER_FORMAT_OPTIONS_KEYS.includes(key)) overrides[key] = arg2[key];
			else options[key] = arg2[key];
		});
		if (isString(arg3)) options.locale = arg3;
		else if (isPlainObject$1(arg3)) overrides = arg3;
		if (isPlainObject$1(arg4)) overrides = arg4;
		return [
			options.key || "",
			value,
			options,
			overrides
		];
	}
	/** @internal */
	function clearNumberFormat(ctx, locale, format) {
		const context = ctx;
		for (const key in format) {
			const id = `${locale}__${key}`;
			if (!context.__numberFormatters.has(id)) continue;
			context.__numberFormatters.delete(id);
		}
	}
	var DEFAULT_MODIFIER = (str) => str;
	var DEFAULT_MESSAGE = (ctx) => "";
	var DEFAULT_MESSAGE_DATA_TYPE = "text";
	var DEFAULT_NORMALIZE = (values) => values.length === 0 ? "" : join(values);
	var DEFAULT_INTERPOLATE = toDisplayString;
	function pluralDefault(choice, choicesLength) {
		choice = Math.abs(choice);
		if (choicesLength === 2) return choice ? choice > 1 ? 1 : 0 : 1;
		return choice ? Math.min(choice, 2) : 0;
	}
	function getPluralIndex(options) {
		const index = isNumber$1(options.pluralIndex) ? options.pluralIndex : -1;
		return options.named && (isNumber$1(options.named.count) || isNumber$1(options.named.n)) ? isNumber$1(options.named.count) ? options.named.count : isNumber$1(options.named.n) ? options.named.n : index : index;
	}
	function normalizeNamed(pluralIndex, props) {
		if (!props.count) props.count = pluralIndex;
		if (!props.n) props.n = pluralIndex;
	}
	function createMessageContext(options = {}) {
		const locale = options.locale;
		const pluralIndex = getPluralIndex(options);
		const pluralRule = isObject$1(options.pluralRules) && isString(locale) && isFunction(options.pluralRules[locale]) ? options.pluralRules[locale] : pluralDefault;
		const orgPluralRule = isObject$1(options.pluralRules) && isString(locale) && isFunction(options.pluralRules[locale]) ? pluralDefault : void 0;
		const plural = (messages) => {
			return messages[pluralRule(pluralIndex, messages.length, orgPluralRule)];
		};
		const _list = options.list || [];
		const list = (index) => _list[index];
		const _named = options.named || create();
		isNumber$1(options.pluralIndex) && normalizeNamed(pluralIndex, _named);
		const named = (key) => _named[key];
		function message(key, useLinked) {
			const msg = isFunction(options.messages) ? options.messages(key, !!useLinked) : isObject$1(options.messages) ? options.messages[key] : false;
			return !msg ? options.parent ? options.parent.message(key) : DEFAULT_MESSAGE : msg;
		}
		const _modifier = (name) => options.modifiers ? options.modifiers[name] : DEFAULT_MODIFIER;
		const normalize = isPlainObject$1(options.processor) && isFunction(options.processor.normalize) ? options.processor.normalize : DEFAULT_NORMALIZE;
		const interpolate = isPlainObject$1(options.processor) && isFunction(options.processor.interpolate) ? options.processor.interpolate : DEFAULT_INTERPOLATE;
		const type = isPlainObject$1(options.processor) && isString(options.processor.type) ? options.processor.type : DEFAULT_MESSAGE_DATA_TYPE;
		const linked = (key, ...args) => {
			const [arg1, arg2] = args;
			let type = "text";
			let modifier = "";
			if (args.length === 1) {
				if (isObject$1(arg1)) {
					modifier = arg1.modifier || modifier;
					type = arg1.type || type;
				} else if (isString(arg1)) modifier = arg1 || modifier;
			} else if (args.length === 2) {
				if (isString(arg1)) modifier = arg1 || modifier;
				if (isString(arg2)) type = arg2 || type;
			}
			const ret = message(key, true)(ctx);
			const msg = type === "vnode" && isArray(ret) && modifier ? ret[0] : ret;
			return modifier ? _modifier(modifier)(msg, type) : msg;
		};
		const ctx = {
			["list"]: list,
			["named"]: named,
			["plural"]: plural,
			["linked"]: linked,
			["message"]: message,
			["type"]: type,
			["interpolate"]: interpolate,
			["normalize"]: normalize,
			["values"]: assign(create(), _list, _named)
		};
		return ctx;
	}
	var NOOP_MESSAGE_FUNCTION = () => "";
	var isMessageFunction = (val) => isFunction(val);
	function translate(context, ...args) {
		const { fallbackFormat, postTranslation, unresolving, messageCompiler, fallbackLocale, messages } = context;
		const [key, options] = parseTranslateArgs(...args);
		const missingWarn = isBoolean(options.missingWarn) ? options.missingWarn : context.missingWarn;
		const fallbackWarn = isBoolean(options.fallbackWarn) ? options.fallbackWarn : context.fallbackWarn;
		const escapeParameter = isBoolean(options.escapeParameter) ? options.escapeParameter : context.escapeParameter;
		const resolvedMessage = !!options.resolvedMessage;
		const defaultMsgOrKey = isString(options.default) || isBoolean(options.default) ? !isBoolean(options.default) ? options.default : !messageCompiler ? () => key : key : fallbackFormat ? !messageCompiler ? () => key : key : null;
		const enableDefaultMsg = fallbackFormat || defaultMsgOrKey != null && (isString(defaultMsgOrKey) || isFunction(defaultMsgOrKey));
		const locale = getLocale(context, options);
		escapeParameter && escapeParams(options);
		let [formatScope, targetLocale, message] = !resolvedMessage ? resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) : [
			key,
			locale,
			messages[locale] || create()
		];
		let format = formatScope;
		let cacheBaseKey = key;
		if (!resolvedMessage && !(isString(format) || isMessageAST(format) || isMessageFunction(format))) {
			if (enableDefaultMsg) {
				format = defaultMsgOrKey;
				cacheBaseKey = format;
			}
		}
		if (!resolvedMessage && (!(isString(format) || isMessageAST(format) || isMessageFunction(format)) || !isString(targetLocale))) return unresolving ? -1 : key;
		if (process.env.NODE_ENV !== "production" && isString(format) && context.messageCompiler == null) {
			warn(`The message format compilation is not supported in this build. Because message compiler isn't included. You need to pre-compilation all message format. So translate function return '${key}'.`);
			return key;
		}
		let occurred = false;
		const onError = () => {
			occurred = true;
		};
		const msg = !isMessageFunction(format) ? compileMessageFormat(context, key, targetLocale, format, cacheBaseKey, onError) : format;
		if (occurred) return format;
		const messaged = evaluateMessage(context, msg, createMessageContext(getMessageContextOptions(context, targetLocale, message, options)));
		let ret = postTranslation ? postTranslation(messaged, key) : messaged;
		if (escapeParameter && isString(ret)) ret = sanitizeTranslatedHtml(ret);
		if (process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) {
			const payloads = {
				timestamp: Date.now(),
				key: isString(key) ? key : isMessageFunction(format) ? format.key : "",
				locale: targetLocale || (isMessageFunction(format) ? format.locale : ""),
				format: isString(format) ? format : isMessageFunction(format) ? format.source : "",
				message: ret
			};
			payloads.meta = assign({}, context.__meta, /* @__PURE__ */ getAdditionalMeta() || {});
			translateDevTools(payloads);
		}
		return ret;
	}
	function escapeParams(options) {
		if (isArray(options.list)) options.list = options.list.map((item) => isString(item) ? escapeHtml(item) : item);
		else if (isObject$1(options.named)) Object.keys(options.named).forEach((key) => {
			if (isString(options.named[key])) options.named[key] = escapeHtml(options.named[key]);
		});
	}
	function resolveMessageFormat(context, key, locale, fallbackLocale, fallbackWarn, missingWarn) {
		const { messages, onWarn, messageResolver: resolveValue, localeFallbacker } = context;
		const locales = localeFallbacker(context, fallbackLocale, locale);
		let message = create();
		let targetLocale;
		let format = null;
		let from = locale;
		let to = null;
		const type = "translate";
		for (let i = 0; i < locales.length; i++) {
			targetLocale = to = locales[i];
			if (process.env.NODE_ENV !== "production" && locale !== targetLocale && !isAlmostSameLocale(locale, targetLocale) && isTranslateFallbackWarn(fallbackWarn, key)) onWarn(getWarnMessage$1(CoreWarnCodes.FALLBACK_TO_TRANSLATE, {
				key,
				target: targetLocale
			}));
			if (process.env.NODE_ENV !== "production" && locale !== targetLocale) {
				const emitter = context.__v_emitter;
				if (emitter) emitter.emit("fallback", {
					type,
					key,
					from,
					to,
					groupId: `${type}:${key}`
				});
			}
			message = messages[targetLocale] || create();
			let start = null;
			let startTag;
			let endTag;
			if (process.env.NODE_ENV !== "production" && inBrowser) {
				start = window.performance.now();
				startTag = "intlify-message-resolve-start";
				endTag = "intlify-message-resolve-end";
				mark && mark(startTag);
			}
			if ((format = resolveValue(message, key)) === null) format = message[key];
			if (process.env.NODE_ENV !== "production" && inBrowser) {
				const end = window.performance.now();
				const emitter = context.__v_emitter;
				if (emitter && start && format) emitter.emit("message-resolve", {
					type: "message-resolve",
					key,
					message: format,
					time: end - start,
					groupId: `${type}:${key}`
				});
				if (startTag && endTag && mark && measure) {
					mark(endTag);
					measure("intlify message resolve", startTag, endTag);
				}
			}
			if (isString(format) || isMessageAST(format) || isMessageFunction(format)) break;
			if (!isImplicitFallback(targetLocale, locales)) {
				const missingRet = handleMissing(context, key, targetLocale, missingWarn, type);
				if (missingRet !== key) format = missingRet;
			}
			from = to;
		}
		return [
			format,
			targetLocale,
			message
		];
	}
	function compileMessageFormat(context, key, targetLocale, format, cacheBaseKey, onError) {
		const { messageCompiler, warnHtmlMessage } = context;
		if (isMessageFunction(format)) {
			const msg = format;
			msg.locale = msg.locale || targetLocale;
			msg.key = msg.key || key;
			return msg;
		}
		if (messageCompiler == null) {
			const msg = (() => format);
			msg.locale = targetLocale;
			msg.key = key;
			return msg;
		}
		let start = null;
		let startTag;
		let endTag;
		if (process.env.NODE_ENV !== "production" && inBrowser) {
			start = window.performance.now();
			startTag = "intlify-message-compilation-start";
			endTag = "intlify-message-compilation-end";
			mark && mark(startTag);
		}
		const msg = messageCompiler(format, getCompileContext(context, targetLocale, cacheBaseKey, format, warnHtmlMessage, onError));
		if (process.env.NODE_ENV !== "production" && inBrowser) {
			const end = window.performance.now();
			const emitter = context.__v_emitter;
			if (emitter && start) emitter.emit("message-compilation", {
				type: "message-compilation",
				message: format,
				time: end - start,
				groupId: `translate:${key}`
			});
			if (startTag && endTag && mark && measure) {
				mark(endTag);
				measure("intlify message compilation", startTag, endTag);
			}
		}
		msg.locale = targetLocale;
		msg.key = key;
		msg.source = format;
		return msg;
	}
	function evaluateMessage(context, msg, msgCtx) {
		let start = null;
		let startTag;
		let endTag;
		if (process.env.NODE_ENV !== "production" && inBrowser) {
			start = window.performance.now();
			startTag = "intlify-message-evaluation-start";
			endTag = "intlify-message-evaluation-end";
			mark && mark(startTag);
		}
		const messaged = msg(msgCtx);
		if (process.env.NODE_ENV !== "production" && inBrowser) {
			const end = window.performance.now();
			const emitter = context.__v_emitter;
			if (emitter && start) emitter.emit("message-evaluation", {
				type: "message-evaluation",
				value: messaged,
				time: end - start,
				groupId: `translate:${msg.key}`
			});
			if (startTag && endTag && mark && measure) {
				mark(endTag);
				measure("intlify message evaluation", startTag, endTag);
			}
		}
		return messaged;
	}
	/** @internal */
	function parseTranslateArgs(...args) {
		const [arg1, arg2, arg3] = args;
		const options = create();
		if (!isString(arg1) && !isNumber$1(arg1) && !isMessageFunction(arg1) && !isMessageAST(arg1)) throw createCoreError(CoreErrorCodes.INVALID_ARGUMENT);
		const key = isNumber$1(arg1) ? String(arg1) : isMessageFunction(arg1) ? arg1 : arg1;
		if (isNumber$1(arg2)) options.plural = arg2;
		else if (isString(arg2)) options.default = arg2;
		else if (isPlainObject$1(arg2) && !isEmptyObject(arg2)) options.named = arg2;
		else if (isArray(arg2)) options.list = arg2;
		if (isNumber$1(arg3)) options.plural = arg3;
		else if (isString(arg3)) options.default = arg3;
		else if (isPlainObject$1(arg3)) assign(options, arg3);
		return [key, options];
	}
	function getCompileContext(context, locale, key, source, warnHtmlMessage, onError) {
		return {
			locale,
			key,
			warnHtmlMessage,
			onError: (err) => {
				onError && onError(err);
				if (process.env.NODE_ENV !== "production") {
					const _source = getSourceForCodeFrame(source);
					const message = `Message compilation error: ${err.message}`;
					const codeFrame = err.location && _source && generateCodeFrame(_source, err.location.start.offset, err.location.end.offset);
					const emitter = context.__v_emitter;
					if (emitter && _source) emitter.emit("compile-error", {
						message: _source,
						error: err.message,
						start: err.location && err.location.start.offset,
						end: err.location && err.location.end.offset,
						groupId: `translate:${key}`
					});
					console.error(codeFrame ? `${message}\n${codeFrame}` : message);
				} else throw err;
			},
			onCacheKey: (source) => generateFormatCacheKey(locale, key, source)
		};
	}
	function getSourceForCodeFrame(source) {
		if (isString(source)) return source;
		else if (source.loc && source.loc.source) return source.loc.source;
	}
	function getMessageContextOptions(context, locale, message, options) {
		const { modifiers, pluralRules, messageResolver: resolveValue, fallbackLocale, fallbackWarn, missingWarn, fallbackContext } = context;
		const resolveMessage = (key, useLinked) => {
			let val = resolveValue(message, key);
			if (val == null && (fallbackContext || useLinked)) {
				const [, , message] = resolveMessageFormat(fallbackContext || context, key, locale, fallbackLocale, fallbackWarn, missingWarn);
				val = resolveValue(message, key);
			}
			if (isString(val) || isMessageAST(val)) {
				let occurred = false;
				const onError = () => {
					occurred = true;
				};
				const msg = compileMessageFormat(context, key, locale, val, key, onError);
				return !occurred ? msg : NOOP_MESSAGE_FUNCTION;
			} else if (isMessageFunction(val)) return val;
			else return NOOP_MESSAGE_FUNCTION;
		};
		const ctxOptions = {
			locale,
			modifiers,
			pluralRules,
			messages: resolveMessage
		};
		if (context.processor) ctxOptions.processor = context.processor;
		if (options.list) ctxOptions.list = options.list;
		if (options.named) ctxOptions.named = options.named;
		if (isNumber$1(options.plural)) ctxOptions.pluralIndex = options.plural;
		return ctxOptions;
	}
	initFeatureFlags$1();
	//#endregion
	//#region node_modules/@vue/devtools-api/lib/esm/env.js
	function getDevtoolsGlobalHook() {
		return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
	}
	function getTarget() {
		return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
	}
	var isProxyAvailable = typeof Proxy === "function";
	//#endregion
	//#region node_modules/@vue/devtools-api/lib/esm/const.js
	var HOOK_SETUP = "devtools-plugin:setup";
	var HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
	//#endregion
	//#region node_modules/@vue/devtools-api/lib/esm/time.js
	var supported;
	var perf;
	function isPerformanceSupported() {
		var _a;
		if (supported !== void 0) return supported;
		if (typeof window !== "undefined" && window.performance) {
			supported = true;
			perf = window.performance;
		} else if (typeof globalThis !== "undefined" && ((_a = globalThis.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
			supported = true;
			perf = globalThis.perf_hooks.performance;
		} else supported = false;
		return supported;
	}
	function now() {
		return isPerformanceSupported() ? perf.now() : Date.now();
	}
	//#endregion
	//#region node_modules/@vue/devtools-api/lib/esm/proxy.js
	var ApiProxy = class {
		constructor(plugin, hook) {
			this.target = null;
			this.targetQueue = [];
			this.onQueue = [];
			this.plugin = plugin;
			this.hook = hook;
			const defaultSettings = {};
			if (plugin.settings) for (const id in plugin.settings) defaultSettings[id] = plugin.settings[id].defaultValue;
			const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
			let currentSettings = Object.assign({}, defaultSettings);
			try {
				const raw = localStorage.getItem(localSettingsSaveId);
				const data = JSON.parse(raw);
				Object.assign(currentSettings, data);
			} catch (e) {}
			this.fallbacks = {
				getSettings() {
					return currentSettings;
				},
				setSettings(value) {
					try {
						localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
					} catch (e) {}
					currentSettings = value;
				},
				now() {
					return now();
				}
			};
			if (hook) hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
				if (pluginId === this.plugin.id) this.fallbacks.setSettings(value);
			});
			this.proxiedOn = new Proxy({}, { get: (_target, prop) => {
				if (this.target) return this.target.on[prop];
				else return (...args) => {
					this.onQueue.push({
						method: prop,
						args
					});
				};
			} });
			this.proxiedTarget = new Proxy({}, { get: (_target, prop) => {
				if (this.target) return this.target[prop];
				else if (prop === "on") return this.proxiedOn;
				else if (Object.keys(this.fallbacks).includes(prop)) return (...args) => {
					this.targetQueue.push({
						method: prop,
						args,
						resolve: () => {}
					});
					return this.fallbacks[prop](...args);
				};
				else return (...args) => {
					return new Promise((resolve) => {
						this.targetQueue.push({
							method: prop,
							args,
							resolve
						});
					});
				};
			} });
		}
		async setRealTarget(target) {
			this.target = target;
			for (const item of this.onQueue) this.target.on[item.method](...item.args);
			for (const item of this.targetQueue) item.resolve(await this.target[item.method](...item.args));
		}
	};
	//#endregion
	//#region node_modules/@vue/devtools-api/lib/esm/index.js
	function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
		const descriptor = pluginDescriptor;
		const target = getTarget();
		const hook = getDevtoolsGlobalHook();
		const enableProxy = isProxyAvailable && descriptor.enableEarlyProxy;
		if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
		else {
			const proxy = enableProxy ? new ApiProxy(descriptor, hook) : null;
			(target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || []).push({
				pluginDescriptor: descriptor,
				setupFn,
				proxy
			});
			if (proxy) setupFn(proxy.proxiedTarget);
		}
	}
	//#endregion
	//#region node_modules/vue-i18n/dist/vue-i18n.mjs
	/*!
	* vue-i18n v10.0.8
	* (c) 2025 kazuya kawaguchi
	* Released under the MIT License.
	*/
	/**
	* Vue I18n Version
	*
	* @remarks
	* Semver format. Same format as the package.json `version` field.
	*
	* @VueI18nGeneral
	*/
	var VERSION = "10.0.8";
	/**
	* This is only called in esm-bundler builds.
	* istanbul-ignore-next
	*/
	function initFeatureFlags() {
		if (typeof __VUE_I18N_FULL_INSTALL__ !== "boolean") getGlobalThis().__VUE_I18N_FULL_INSTALL__ = true;
		if (typeof __VUE_I18N_LEGACY_API__ !== "boolean") getGlobalThis().__VUE_I18N_LEGACY_API__ = true;
		if (typeof __INTLIFY_DROP_MESSAGE_COMPILER__ !== "boolean") getGlobalThis().__INTLIFY_DROP_MESSAGE_COMPILER__ = false;
		if (typeof __INTLIFY_PROD_DEVTOOLS__ !== "boolean") getGlobalThis().__INTLIFY_PROD_DEVTOOLS__ = false;
	}
	var I18nWarnCodes = {
		FALLBACK_TO_ROOT: 8,
		NOT_FOUND_PARENT_SCOPE: 9,
		IGNORE_OBJ_FLATTEN: 10,
		DEPRECATE_TC: 11
	};
	var warnMessages = {
		[I18nWarnCodes.FALLBACK_TO_ROOT]: `Fall back to {type} '{key}' with root locale.`,
		[I18nWarnCodes.NOT_FOUND_PARENT_SCOPE]: `Not found parent scope. use the global scope.`,
		[I18nWarnCodes.IGNORE_OBJ_FLATTEN]: `Ignore object flatten: '{key}' key has an string value`,
		[I18nWarnCodes.DEPRECATE_TC]: `'tc' and '$tc' has been deprecated in v10. Use 't' or '$t' instead. 'tc' and '$tc’ are going to remove in v11.`
	};
	function getWarnMessage(code, ...args) {
		return format$1(warnMessages[code], ...args);
	}
	var I18nErrorCodes = {
		UNEXPECTED_RETURN_TYPE: 24,
		INVALID_ARGUMENT: 25,
		MUST_BE_CALL_SETUP_TOP: 26,
		NOT_INSTALLED: 27,
		REQUIRED_VALUE: 28,
		INVALID_VALUE: 29,
		CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN: 30,
		NOT_INSTALLED_WITH_PROVIDE: 31,
		UNEXPECTED_ERROR: 32,
		NOT_COMPATIBLE_LEGACY_VUE_I18N: 33,
		NOT_AVAILABLE_COMPOSITION_IN_LEGACY: 34
	};
	function createI18nError(code, ...args) {
		return createCompileError(code, null, process.env.NODE_ENV !== "production" ? {
			messages: errorMessages,
			args
		} : void 0);
	}
	var errorMessages = {
		[I18nErrorCodes.UNEXPECTED_RETURN_TYPE]: "Unexpected return type in composer",
		[I18nErrorCodes.INVALID_ARGUMENT]: "Invalid argument",
		[I18nErrorCodes.MUST_BE_CALL_SETUP_TOP]: "Must be called at the top of a `setup` function",
		[I18nErrorCodes.NOT_INSTALLED]: "Need to install with `app.use` function",
		[I18nErrorCodes.UNEXPECTED_ERROR]: "Unexpected error",
		[I18nErrorCodes.REQUIRED_VALUE]: `Required in value: {0}`,
		[I18nErrorCodes.INVALID_VALUE]: `Invalid value`,
		[I18nErrorCodes.CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN]: `Cannot setup vue-devtools plugin`,
		[I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE]: "Need to install with `provide` function",
		[I18nErrorCodes.NOT_COMPATIBLE_LEGACY_VUE_I18N]: "Not compatible legacy VueI18n.",
		[I18nErrorCodes.NOT_AVAILABLE_COMPOSITION_IN_LEGACY]: "Not available Compostion API in Legacy API mode. Please make sure that the legacy API mode is working properly"
	};
	var TranslateVNodeSymbol = /* #__PURE__*/ makeSymbol("__translateVNode");
	var DatetimePartsSymbol = /* #__PURE__*/ makeSymbol("__datetimeParts");
	var NumberPartsSymbol = /* #__PURE__*/ makeSymbol("__numberParts");
	var EnableEmitter = /* #__PURE__*/ makeSymbol("__enableEmitter");
	var DisableEmitter = /* #__PURE__*/ makeSymbol("__disableEmitter");
	var SetPluralRulesSymbol = makeSymbol("__setPluralRules");
	makeSymbol("__intlifyMeta");
	var InejctWithOptionSymbol = /* #__PURE__*/ makeSymbol("__injectWithOption");
	var DisposeSymbol = /* #__PURE__*/ makeSymbol("__dispose");
	/**
	* Transform flat json in obj to normal json in obj
	*/
	function handleFlatJson(obj) {
		if (!isObject$1(obj)) return obj;
		if (isMessageAST(obj)) return obj;
		for (const key in obj) {
			if (!hasOwn(obj, key)) continue;
			if (!key.includes(".")) {
				if (isObject$1(obj[key])) handleFlatJson(obj[key]);
			} else {
				const subKeys = key.split(".");
				const lastIndex = subKeys.length - 1;
				let currentObj = obj;
				let hasStringValue = false;
				for (let i = 0; i < lastIndex; i++) {
					if (subKeys[i] === "__proto__") throw new Error(`unsafe key: ${subKeys[i]}`);
					if (!(subKeys[i] in currentObj)) currentObj[subKeys[i]] = create();
					if (!isObject$1(currentObj[subKeys[i]])) {
						process.env.NODE_ENV !== "production" && warn(getWarnMessage(I18nWarnCodes.IGNORE_OBJ_FLATTEN, { key: subKeys[i] }));
						hasStringValue = true;
						break;
					}
					currentObj = currentObj[subKeys[i]];
				}
				if (!hasStringValue) {
					if (!isMessageAST(currentObj)) {
						currentObj[subKeys[lastIndex]] = obj[key];
						delete obj[key];
					} else if (!AST_NODE_PROPS_KEYS.includes(subKeys[lastIndex])) delete obj[key];
				}
				if (!isMessageAST(currentObj)) {
					const target = currentObj[subKeys[lastIndex]];
					if (isObject$1(target)) handleFlatJson(target);
				}
			}
		}
		return obj;
	}
	function getLocaleMessages(locale, options) {
		const { messages, __i18n, messageResolver, flatJson } = options;
		const ret = isPlainObject$1(messages) ? messages : isArray(__i18n) ? create() : { [locale]: create() };
		if (isArray(__i18n)) __i18n.forEach((custom) => {
			if ("locale" in custom && "resource" in custom) {
				const { locale, resource } = custom;
				if (locale) {
					ret[locale] = ret[locale] || create();
					deepCopy(resource, ret[locale]);
				} else deepCopy(resource, ret);
			} else isString(custom) && deepCopy(JSON.parse(custom), ret);
		});
		if (messageResolver == null && flatJson) {
			for (const key in ret) if (hasOwn(ret, key)) handleFlatJson(ret[key]);
		}
		return ret;
	}
	function getComponentOptions(instance) {
		return instance.type;
	}
	function adjustI18nResources(gl, options, componentOptions) {
		let messages = isObject$1(options.messages) ? options.messages : create();
		if ("__i18nGlobal" in componentOptions) messages = getLocaleMessages(gl.locale.value, {
			messages,
			__i18n: componentOptions.__i18nGlobal
		});
		const locales = Object.keys(messages);
		if (locales.length) locales.forEach((locale) => {
			gl.mergeLocaleMessage(locale, messages[locale]);
		});
		if (isObject$1(options.datetimeFormats)) {
			const locales = Object.keys(options.datetimeFormats);
			if (locales.length) locales.forEach((locale) => {
				gl.mergeDateTimeFormat(locale, options.datetimeFormats[locale]);
			});
		}
		if (isObject$1(options.numberFormats)) {
			const locales = Object.keys(options.numberFormats);
			if (locales.length) locales.forEach((locale) => {
				gl.mergeNumberFormat(locale, options.numberFormats[locale]);
			});
		}
	}
	function createTextNode(key) {
		return createVNode(Text, null, key, 0);
	}
	var NOOP_RETURN_ARRAY = () => [];
	var NOOP_RETURN_FALSE = () => false;
	var composerID = 0;
	function defineCoreMissingHandler(missing) {
		return ((ctx, locale, key, type) => {
			return missing(locale, key, getCurrentInstance() || void 0, type);
		});
	}
	/**
	* Create composer interface factory
	*
	* @internal
	*/
	function createComposer(options = {}) {
		const { __root, __injectWithOption } = options;
		const _isGlobal = __root === void 0;
		const flatJson = options.flatJson;
		const _ref = inBrowser ? ref : shallowRef;
		let _inheritLocale = isBoolean(options.inheritLocale) ? options.inheritLocale : true;
		const _locale = _ref(__root && _inheritLocale ? __root.locale.value : isString(options.locale) ? options.locale : DEFAULT_LOCALE);
		const _fallbackLocale = _ref(__root && _inheritLocale ? __root.fallbackLocale.value : isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject$1(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : _locale.value);
		const _messages = _ref(getLocaleMessages(_locale.value, options));
		const _datetimeFormats = _ref(isPlainObject$1(options.datetimeFormats) ? options.datetimeFormats : { [_locale.value]: {} });
		const _numberFormats = _ref(isPlainObject$1(options.numberFormats) ? options.numberFormats : { [_locale.value]: {} });
		let _missingWarn = __root ? __root.missingWarn : isBoolean(options.missingWarn) || isRegExp(options.missingWarn) ? options.missingWarn : true;
		let _fallbackWarn = __root ? __root.fallbackWarn : isBoolean(options.fallbackWarn) || isRegExp(options.fallbackWarn) ? options.fallbackWarn : true;
		let _fallbackRoot = __root ? __root.fallbackRoot : isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
		let _fallbackFormat = !!options.fallbackFormat;
		let _missing = isFunction(options.missing) ? options.missing : null;
		let _runtimeMissing = isFunction(options.missing) ? defineCoreMissingHandler(options.missing) : null;
		let _postTranslation = isFunction(options.postTranslation) ? options.postTranslation : null;
		let _warnHtmlMessage = __root ? __root.warnHtmlMessage : isBoolean(options.warnHtmlMessage) ? options.warnHtmlMessage : true;
		let _escapeParameter = !!options.escapeParameter;
		const _modifiers = __root ? __root.modifiers : isPlainObject$1(options.modifiers) ? options.modifiers : {};
		let _pluralRules = options.pluralRules || __root && __root.pluralRules;
		let _context;
		const getCoreContext = () => {
			_isGlobal && setFallbackContext(null);
			const ctxOptions = {
				version: VERSION,
				locale: _locale.value,
				fallbackLocale: _fallbackLocale.value,
				messages: _messages.value,
				modifiers: _modifiers,
				pluralRules: _pluralRules,
				missing: _runtimeMissing === null ? void 0 : _runtimeMissing,
				missingWarn: _missingWarn,
				fallbackWarn: _fallbackWarn,
				fallbackFormat: _fallbackFormat,
				unresolving: true,
				postTranslation: _postTranslation === null ? void 0 : _postTranslation,
				warnHtmlMessage: _warnHtmlMessage,
				escapeParameter: _escapeParameter,
				messageResolver: options.messageResolver,
				messageCompiler: options.messageCompiler,
				__meta: { framework: "vue" }
			};
			ctxOptions.datetimeFormats = _datetimeFormats.value;
			ctxOptions.numberFormats = _numberFormats.value;
			ctxOptions.__datetimeFormatters = isPlainObject$1(_context) ? _context.__datetimeFormatters : void 0;
			ctxOptions.__numberFormatters = isPlainObject$1(_context) ? _context.__numberFormatters : void 0;
			if (process.env.NODE_ENV !== "production") ctxOptions.__v_emitter = isPlainObject$1(_context) ? _context.__v_emitter : void 0;
			const ctx = createCoreContext(ctxOptions);
			_isGlobal && setFallbackContext(ctx);
			return ctx;
		};
		_context = getCoreContext();
		updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
		function trackReactivityValues() {
			return [
				_locale.value,
				_fallbackLocale.value,
				_messages.value,
				_datetimeFormats.value,
				_numberFormats.value
			];
		}
		const locale = computed({
			get: () => _locale.value,
			set: (val) => {
				_locale.value = val;
				_context.locale = _locale.value;
			}
		});
		const fallbackLocale = computed({
			get: () => _fallbackLocale.value,
			set: (val) => {
				_fallbackLocale.value = val;
				_context.fallbackLocale = _fallbackLocale.value;
				updateFallbackLocale(_context, _locale.value, val);
			}
		});
		const messages = computed(() => _messages.value);
		const datetimeFormats = /* #__PURE__*/ computed(() => _datetimeFormats.value);
		const numberFormats = /* #__PURE__*/ computed(() => _numberFormats.value);
		function getPostTranslationHandler() {
			return isFunction(_postTranslation) ? _postTranslation : null;
		}
		function setPostTranslationHandler(handler) {
			_postTranslation = handler;
			_context.postTranslation = handler;
		}
		function getMissingHandler() {
			return _missing;
		}
		function setMissingHandler(handler) {
			if (handler !== null) _runtimeMissing = defineCoreMissingHandler(handler);
			_missing = handler;
			_context.missing = _runtimeMissing;
		}
		function isResolvedTranslateMessage(type, arg) {
			return type !== "translate" || !arg.resolvedMessage;
		}
		const wrapWithDeps = (fn, argumentParser, warnType, fallbackSuccess, fallbackFail, successCondition) => {
			trackReactivityValues();
			let ret;
			try {
				if (process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__);
				if (!_isGlobal) _context.fallbackContext = __root ? getFallbackContext() : void 0;
				ret = fn(_context);
			} finally {
				if (process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__);
				if (!_isGlobal) _context.fallbackContext = void 0;
			}
			if (warnType !== "translate exists" && isNumber$1(ret) && ret === -1 || warnType === "translate exists" && !ret) {
				const [key, arg2] = argumentParser();
				if (process.env.NODE_ENV !== "production" && __root && isString(key) && isResolvedTranslateMessage(warnType, arg2)) {
					if (_fallbackRoot && (isTranslateFallbackWarn(_fallbackWarn, key) || isTranslateMissingWarn(_missingWarn, key))) warn(getWarnMessage(I18nWarnCodes.FALLBACK_TO_ROOT, {
						key,
						type: warnType
					}));
					if (process.env.NODE_ENV !== "production") {
						const { __v_emitter: emitter } = _context;
						if (emitter && _fallbackRoot) emitter.emit("fallback", {
							type: warnType,
							key,
							to: "global",
							groupId: `${warnType}:${key}`
						});
					}
				}
				return __root && _fallbackRoot ? fallbackSuccess(__root) : fallbackFail(key);
			} else if (successCondition(ret)) return ret;
			else
 /* istanbul ignore next */
			throw createI18nError(I18nErrorCodes.UNEXPECTED_RETURN_TYPE);
		};
		function t(...args) {
			return wrapWithDeps((context) => Reflect.apply(translate, null, [context, ...args]), () => parseTranslateArgs(...args), "translate", (root) => Reflect.apply(root.t, root, [...args]), (key) => key, (val) => isString(val));
		}
		function rt(...args) {
			const [arg1, arg2, arg3] = args;
			if (arg3 && !isObject$1(arg3)) throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
			return t(...[
				arg1,
				arg2,
				assign({ resolvedMessage: true }, arg3 || {})
			]);
		}
		function d(...args) {
			return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root) => Reflect.apply(root.d, root, [...args]), () => "", (val) => isString(val));
		}
		function n(...args) {
			return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root) => Reflect.apply(root.n, root, [...args]), () => "", (val) => isString(val));
		}
		function normalize(values) {
			return values.map((val) => isString(val) || isNumber$1(val) || isBoolean(val) ? createTextNode(String(val)) : val);
		}
		const interpolate = (val) => val;
		const processor = {
			normalize,
			interpolate,
			type: "vnode"
		};
		function translateVNode(...args) {
			return wrapWithDeps((context) => {
				let ret;
				const _context = context;
				try {
					_context.processor = processor;
					ret = Reflect.apply(translate, null, [_context, ...args]);
				} finally {
					_context.processor = null;
				}
				return ret;
			}, () => parseTranslateArgs(...args), "translate", (root) => root[TranslateVNodeSymbol](...args), (key) => [createTextNode(key)], (val) => isArray(val));
		}
		function numberParts(...args) {
			return wrapWithDeps((context) => Reflect.apply(number, null, [context, ...args]), () => parseNumberArgs(...args), "number format", (root) => root[NumberPartsSymbol](...args), NOOP_RETURN_ARRAY, (val) => isString(val) || isArray(val));
		}
		function datetimeParts(...args) {
			return wrapWithDeps((context) => Reflect.apply(datetime, null, [context, ...args]), () => parseDateTimeArgs(...args), "datetime format", (root) => root[DatetimePartsSymbol](...args), NOOP_RETURN_ARRAY, (val) => isString(val) || isArray(val));
		}
		function setPluralRules(rules) {
			_pluralRules = rules;
			_context.pluralRules = _pluralRules;
		}
		function te(key, locale) {
			return wrapWithDeps(() => {
				if (!key) return false;
				const message = getLocaleMessage(isString(locale) ? locale : _locale.value);
				const resolved = _context.messageResolver(message, key);
				return isMessageAST(resolved) || isMessageFunction(resolved) || isString(resolved);
			}, () => [key], "translate exists", (root) => {
				return Reflect.apply(root.te, root, [key, locale]);
			}, NOOP_RETURN_FALSE, (val) => isBoolean(val));
		}
		function resolveMessages(key) {
			let messages = null;
			const locales = fallbackWithLocaleChain(_context, _fallbackLocale.value, _locale.value);
			for (let i = 0; i < locales.length; i++) {
				const targetLocaleMessages = _messages.value[locales[i]] || {};
				const messageValue = _context.messageResolver(targetLocaleMessages, key);
				if (messageValue != null) {
					messages = messageValue;
					break;
				}
			}
			return messages;
		}
		function tm(key) {
			const messages = resolveMessages(key);
			return messages != null ? messages : __root ? __root.tm(key) || {} : {};
		}
		function getLocaleMessage(locale) {
			return _messages.value[locale] || {};
		}
		function setLocaleMessage(locale, message) {
			if (flatJson) {
				const _message = { [locale]: message };
				for (const key in _message) if (hasOwn(_message, key)) handleFlatJson(_message[key]);
				message = _message[locale];
			}
			_messages.value[locale] = message;
			_context.messages = _messages.value;
		}
		function mergeLocaleMessage(locale, message) {
			_messages.value[locale] = _messages.value[locale] || {};
			const _message = { [locale]: message };
			if (flatJson) {
				for (const key in _message) if (hasOwn(_message, key)) handleFlatJson(_message[key]);
			}
			message = _message[locale];
			deepCopy(message, _messages.value[locale]);
			_context.messages = _messages.value;
		}
		function getDateTimeFormat(locale) {
			return _datetimeFormats.value[locale] || {};
		}
		function setDateTimeFormat(locale, format) {
			_datetimeFormats.value[locale] = format;
			_context.datetimeFormats = _datetimeFormats.value;
			clearDateTimeFormat(_context, locale, format);
		}
		function mergeDateTimeFormat(locale, format) {
			_datetimeFormats.value[locale] = assign(_datetimeFormats.value[locale] || {}, format);
			_context.datetimeFormats = _datetimeFormats.value;
			clearDateTimeFormat(_context, locale, format);
		}
		function getNumberFormat(locale) {
			return _numberFormats.value[locale] || {};
		}
		function setNumberFormat(locale, format) {
			_numberFormats.value[locale] = format;
			_context.numberFormats = _numberFormats.value;
			clearNumberFormat(_context, locale, format);
		}
		function mergeNumberFormat(locale, format) {
			_numberFormats.value[locale] = assign(_numberFormats.value[locale] || {}, format);
			_context.numberFormats = _numberFormats.value;
			clearNumberFormat(_context, locale, format);
		}
		composerID++;
		if (__root && inBrowser) {
			watch(__root.locale, (val) => {
				if (_inheritLocale) {
					_locale.value = val;
					_context.locale = val;
					updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
				}
			});
			watch(__root.fallbackLocale, (val) => {
				if (_inheritLocale) {
					_fallbackLocale.value = val;
					_context.fallbackLocale = val;
					updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
				}
			});
		}
		const composer = {
			id: composerID,
			locale,
			fallbackLocale,
			get inheritLocale() {
				return _inheritLocale;
			},
			set inheritLocale(val) {
				_inheritLocale = val;
				if (val && __root) {
					_locale.value = __root.locale.value;
					_fallbackLocale.value = __root.fallbackLocale.value;
					updateFallbackLocale(_context, _locale.value, _fallbackLocale.value);
				}
			},
			get availableLocales() {
				return Object.keys(_messages.value).sort();
			},
			messages,
			get modifiers() {
				return _modifiers;
			},
			get pluralRules() {
				return _pluralRules || {};
			},
			get isGlobal() {
				return _isGlobal;
			},
			get missingWarn() {
				return _missingWarn;
			},
			set missingWarn(val) {
				_missingWarn = val;
				_context.missingWarn = _missingWarn;
			},
			get fallbackWarn() {
				return _fallbackWarn;
			},
			set fallbackWarn(val) {
				_fallbackWarn = val;
				_context.fallbackWarn = _fallbackWarn;
			},
			get fallbackRoot() {
				return _fallbackRoot;
			},
			set fallbackRoot(val) {
				_fallbackRoot = val;
			},
			get fallbackFormat() {
				return _fallbackFormat;
			},
			set fallbackFormat(val) {
				_fallbackFormat = val;
				_context.fallbackFormat = _fallbackFormat;
			},
			get warnHtmlMessage() {
				return _warnHtmlMessage;
			},
			set warnHtmlMessage(val) {
				_warnHtmlMessage = val;
				_context.warnHtmlMessage = val;
			},
			get escapeParameter() {
				return _escapeParameter;
			},
			set escapeParameter(val) {
				_escapeParameter = val;
				_context.escapeParameter = val;
			},
			t,
			getLocaleMessage,
			setLocaleMessage,
			mergeLocaleMessage,
			getPostTranslationHandler,
			setPostTranslationHandler,
			getMissingHandler,
			setMissingHandler,
			[SetPluralRulesSymbol]: setPluralRules
		};
		composer.datetimeFormats = datetimeFormats;
		composer.numberFormats = numberFormats;
		composer.rt = rt;
		composer.te = te;
		composer.tm = tm;
		composer.d = d;
		composer.n = n;
		composer.getDateTimeFormat = getDateTimeFormat;
		composer.setDateTimeFormat = setDateTimeFormat;
		composer.mergeDateTimeFormat = mergeDateTimeFormat;
		composer.getNumberFormat = getNumberFormat;
		composer.setNumberFormat = setNumberFormat;
		composer.mergeNumberFormat = mergeNumberFormat;
		composer[InejctWithOptionSymbol] = __injectWithOption;
		composer[TranslateVNodeSymbol] = translateVNode;
		composer[DatetimePartsSymbol] = datetimeParts;
		composer[NumberPartsSymbol] = numberParts;
		if (process.env.NODE_ENV !== "production") {
			composer[EnableEmitter] = (emitter) => {
				_context.__v_emitter = emitter;
			};
			composer[DisableEmitter] = () => {
				_context.__v_emitter = void 0;
			};
		}
		return composer;
	}
	var VUE_I18N_COMPONENT_TYPES = "vue-i18n: composer properties";
	var VueDevToolsLabels = {
		"vue-devtools-plugin-vue-i18n": "Vue I18n DevTools",
		"vue-i18n-resource-inspector": "Vue I18n DevTools",
		"vue-i18n-timeline": "Vue I18n"
	};
	var VueDevToolsPlaceholders = { "vue-i18n-resource-inspector": "Search for scopes ..." };
	var VueDevToolsTimelineColors = { "vue-i18n-timeline": 16764185 };
	var devtoolsApi;
	async function enableDevTools(app, i18n) {
		return new Promise((resolve, reject) => {
			try {
				setupDevtoolsPlugin({
					id: "vue-devtools-plugin-vue-i18n",
					label: VueDevToolsLabels["vue-devtools-plugin-vue-i18n"],
					packageName: "vue-i18n",
					homepage: "https://vue-i18n.intlify.dev",
					logo: "https://vue-i18n.intlify.dev/vue-i18n-devtools-logo.png",
					componentStateTypes: [VUE_I18N_COMPONENT_TYPES],
					app
				}, (api) => {
					devtoolsApi = api;
					api.on.visitComponentTree(({ componentInstance, treeNode }) => {
						updateComponentTreeTags(componentInstance, treeNode, i18n);
					});
					api.on.inspectComponent(({ componentInstance, instanceData }) => {
						if (componentInstance.vnode.el && componentInstance.vnode.el.__VUE_I18N__ && instanceData) if (i18n.mode === "legacy") {
							if (componentInstance.vnode.el.__VUE_I18N__ !== i18n.global.__composer) inspectComposer(instanceData, componentInstance.vnode.el.__VUE_I18N__);
						} else inspectComposer(instanceData, componentInstance.vnode.el.__VUE_I18N__);
					});
					api.addInspector({
						id: "vue-i18n-resource-inspector",
						label: VueDevToolsLabels["vue-i18n-resource-inspector"],
						icon: "language",
						treeFilterPlaceholder: VueDevToolsPlaceholders["vue-i18n-resource-inspector"]
					});
					api.on.getInspectorTree((payload) => {
						if (payload.app === app && payload.inspectorId === "vue-i18n-resource-inspector") registerScope(payload, i18n);
					});
					const roots = /* @__PURE__ */ new Map();
					api.on.getInspectorState(async (payload) => {
						if (payload.app === app && payload.inspectorId === "vue-i18n-resource-inspector") {
							api.unhighlightElement();
							inspectScope(payload, i18n);
							if (payload.nodeId === "global") {
								if (!roots.has(payload.app)) {
									const [root] = await api.getComponentInstances(payload.app);
									roots.set(payload.app, root);
								}
								api.highlightElement(roots.get(payload.app));
							} else {
								const instance = getComponentInstance(payload.nodeId, i18n);
								instance && api.highlightElement(instance);
							}
						}
					});
					api.on.editInspectorState((payload) => {
						if (payload.app === app && payload.inspectorId === "vue-i18n-resource-inspector") editScope(payload, i18n);
					});
					api.addTimelineLayer({
						id: "vue-i18n-timeline",
						label: VueDevToolsLabels["vue-i18n-timeline"],
						color: VueDevToolsTimelineColors["vue-i18n-timeline"]
					});
					resolve(true);
				});
			} catch (e) {
				console.error(e);
				reject(false);
			}
		});
	}
	function getI18nScopeLable(instance) {
		return instance.type.name || instance.type.displayName || instance.type.__file || "Anonymous";
	}
	function updateComponentTreeTags(instance, treeNode, i18n) {
		const global = i18n.mode === "composition" ? i18n.global : i18n.global.__composer;
		if (instance && instance.vnode.el && instance.vnode.el.__VUE_I18N__) {
			if (instance.vnode.el.__VUE_I18N__ !== global) {
				const tag = {
					label: `i18n (${getI18nScopeLable(instance)} Scope)`,
					textColor: 0,
					backgroundColor: 16764185
				};
				treeNode.tags.push(tag);
			}
		}
	}
	function inspectComposer(instanceData, composer) {
		const type = VUE_I18N_COMPONENT_TYPES;
		instanceData.state.push({
			type,
			key: "locale",
			editable: true,
			value: composer.locale.value
		});
		instanceData.state.push({
			type,
			key: "availableLocales",
			editable: false,
			value: composer.availableLocales
		});
		instanceData.state.push({
			type,
			key: "fallbackLocale",
			editable: true,
			value: composer.fallbackLocale.value
		});
		instanceData.state.push({
			type,
			key: "inheritLocale",
			editable: true,
			value: composer.inheritLocale
		});
		instanceData.state.push({
			type,
			key: "messages",
			editable: false,
			value: getLocaleMessageValue(composer.messages.value)
		});
		instanceData.state.push({
			type,
			key: "datetimeFormats",
			editable: false,
			value: composer.datetimeFormats.value
		});
		instanceData.state.push({
			type,
			key: "numberFormats",
			editable: false,
			value: composer.numberFormats.value
		});
	}
	function getLocaleMessageValue(messages) {
		const value = {};
		Object.keys(messages).forEach((key) => {
			const v = messages[key];
			if (isFunction(v) && "source" in v) value[key] = getMessageFunctionDetails(v);
			else if (isMessageAST(v) && v.loc && v.loc.source) value[key] = v.loc.source;
			else if (isObject$1(v)) value[key] = getLocaleMessageValue(v);
			else value[key] = v;
		});
		return value;
	}
	var ESC = {
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"&": "&amp;"
	};
	function escape(s) {
		return s.replace(/[<>"&]/g, escapeChar);
	}
	function escapeChar(a) {
		return ESC[a] || a;
	}
	function getMessageFunctionDetails(func) {
		return { _custom: {
			type: "function",
			display: `<span>ƒ</span> ${func.source ? `("${escape(func.source)}")` : `(?)`}`
		} };
	}
	function registerScope(payload, i18n) {
		payload.rootNodes.push({
			id: "global",
			label: "Global Scope"
		});
		const global = i18n.mode === "composition" ? i18n.global : i18n.global.__composer;
		for (const [keyInstance, instance] of i18n.__instances) {
			const composer = i18n.mode === "composition" ? instance : instance.__composer;
			if (global === composer) continue;
			payload.rootNodes.push({
				id: composer.id.toString(),
				label: `${getI18nScopeLable(keyInstance)} Scope`
			});
		}
	}
	function getComponentInstance(nodeId, i18n) {
		let instance = null;
		if (nodeId !== "global") {
			for (const [component, composer] of i18n.__instances.entries()) if (composer.id.toString() === nodeId) {
				instance = component;
				break;
			}
		}
		return instance;
	}
	function getComposer$2(nodeId, i18n) {
		if (nodeId === "global") return i18n.mode === "composition" ? i18n.global : i18n.global.__composer;
		else {
			const instance = Array.from(i18n.__instances.values()).find((item) => item.id.toString() === nodeId);
			if (instance) return i18n.mode === "composition" ? instance : instance.__composer;
			else return null;
		}
	}
	function inspectScope(payload, i18n) {
		const composer = getComposer$2(payload.nodeId, i18n);
		if (composer) payload.state = makeScopeInspectState(composer);
		return null;
	}
	function makeScopeInspectState(composer) {
		const state = {};
		const localeType = "Locale related info";
		state[localeType] = [
			{
				type: localeType,
				key: "locale",
				editable: true,
				value: composer.locale.value
			},
			{
				type: localeType,
				key: "fallbackLocale",
				editable: true,
				value: composer.fallbackLocale.value
			},
			{
				type: localeType,
				key: "availableLocales",
				editable: false,
				value: composer.availableLocales
			},
			{
				type: localeType,
				key: "inheritLocale",
				editable: true,
				value: composer.inheritLocale
			}
		];
		const localeMessagesType = "Locale messages info";
		state[localeMessagesType] = [{
			type: localeMessagesType,
			key: "messages",
			editable: false,
			value: getLocaleMessageValue(composer.messages.value)
		}];
		{
			const datetimeFormatsType = "Datetime formats info";
			state[datetimeFormatsType] = [{
				type: datetimeFormatsType,
				key: "datetimeFormats",
				editable: false,
				value: composer.datetimeFormats.value
			}];
			const numberFormatsType = "Datetime formats info";
			state[numberFormatsType] = [{
				type: numberFormatsType,
				key: "numberFormats",
				editable: false,
				value: composer.numberFormats.value
			}];
		}
		return state;
	}
	function addTimelineEvent(event, payload) {
		if (devtoolsApi) {
			let groupId;
			if (payload && "groupId" in payload) {
				groupId = payload.groupId;
				delete payload.groupId;
			}
			devtoolsApi.addTimelineEvent({
				layerId: "vue-i18n-timeline",
				event: {
					title: event,
					groupId,
					time: Date.now(),
					meta: {},
					data: payload || {},
					logType: event === "compile-error" ? "error" : event === "fallback" || event === "missing" ? "warning" : "default"
				}
			});
		}
	}
	function editScope(payload, i18n) {
		const composer = getComposer$2(payload.nodeId, i18n);
		if (composer) {
			const [field] = payload.path;
			if (field === "locale" && isString(payload.state.value)) composer.locale.value = payload.state.value;
			else if (field === "fallbackLocale" && (isString(payload.state.value) || isArray(payload.state.value) || isObject$1(payload.state.value))) composer.fallbackLocale.value = payload.state.value;
			else if (field === "inheritLocale" && isBoolean(payload.state.value)) composer.inheritLocale = payload.state.value;
		}
	}
	/**
	* Convert to I18n Composer Options from VueI18n Options
	*
	* @internal
	*/
	function convertComposerOptions(options) {
		const locale = isString(options.locale) ? options.locale : DEFAULT_LOCALE;
		const fallbackLocale = isString(options.fallbackLocale) || isArray(options.fallbackLocale) || isPlainObject$1(options.fallbackLocale) || options.fallbackLocale === false ? options.fallbackLocale : locale;
		const missing = isFunction(options.missing) ? options.missing : void 0;
		const missingWarn = isBoolean(options.silentTranslationWarn) || isRegExp(options.silentTranslationWarn) ? !options.silentTranslationWarn : true;
		const fallbackWarn = isBoolean(options.silentFallbackWarn) || isRegExp(options.silentFallbackWarn) ? !options.silentFallbackWarn : true;
		const fallbackRoot = isBoolean(options.fallbackRoot) ? options.fallbackRoot : true;
		const fallbackFormat = !!options.formatFallbackMessages;
		const modifiers = isPlainObject$1(options.modifiers) ? options.modifiers : {};
		const pluralizationRules = options.pluralizationRules;
		const postTranslation = isFunction(options.postTranslation) ? options.postTranslation : void 0;
		const warnHtmlMessage = isString(options.warnHtmlInMessage) ? options.warnHtmlInMessage !== "off" : true;
		const escapeParameter = !!options.escapeParameterHtml;
		const inheritLocale = isBoolean(options.sync) ? options.sync : true;
		let messages = options.messages;
		if (isPlainObject$1(options.sharedMessages)) {
			const sharedMessages = options.sharedMessages;
			messages = Object.keys(sharedMessages).reduce((messages, locale) => {
				assign(messages[locale] || (messages[locale] = {}), sharedMessages[locale]);
				return messages;
			}, messages || {});
		}
		const { __i18n, __root, __injectWithOption } = options;
		const datetimeFormats = options.datetimeFormats;
		const numberFormats = options.numberFormats;
		const flatJson = options.flatJson;
		return {
			locale,
			fallbackLocale,
			messages,
			flatJson,
			datetimeFormats,
			numberFormats,
			missing,
			missingWarn,
			fallbackWarn,
			fallbackRoot,
			fallbackFormat,
			modifiers,
			pluralRules: pluralizationRules,
			postTranslation,
			warnHtmlMessage,
			escapeParameter,
			messageResolver: options.messageResolver,
			inheritLocale,
			__i18n,
			__root,
			__injectWithOption
		};
	}
	/**
	* create VueI18n interface factory
	*
	* @internal
	*/
	function createVueI18n(options = {}) {
		const composer = createComposer(convertComposerOptions(options));
		const { __extender } = options;
		const vueI18n = {
			id: composer.id,
			get locale() {
				return composer.locale.value;
			},
			set locale(val) {
				composer.locale.value = val;
			},
			get fallbackLocale() {
				return composer.fallbackLocale.value;
			},
			set fallbackLocale(val) {
				composer.fallbackLocale.value = val;
			},
			get messages() {
				return composer.messages.value;
			},
			get datetimeFormats() {
				return composer.datetimeFormats.value;
			},
			get numberFormats() {
				return composer.numberFormats.value;
			},
			get availableLocales() {
				return composer.availableLocales;
			},
			get missing() {
				return composer.getMissingHandler();
			},
			set missing(handler) {
				composer.setMissingHandler(handler);
			},
			get silentTranslationWarn() {
				return isBoolean(composer.missingWarn) ? !composer.missingWarn : composer.missingWarn;
			},
			set silentTranslationWarn(val) {
				composer.missingWarn = isBoolean(val) ? !val : val;
			},
			get silentFallbackWarn() {
				return isBoolean(composer.fallbackWarn) ? !composer.fallbackWarn : composer.fallbackWarn;
			},
			set silentFallbackWarn(val) {
				composer.fallbackWarn = isBoolean(val) ? !val : val;
			},
			get modifiers() {
				return composer.modifiers;
			},
			get formatFallbackMessages() {
				return composer.fallbackFormat;
			},
			set formatFallbackMessages(val) {
				composer.fallbackFormat = val;
			},
			get postTranslation() {
				return composer.getPostTranslationHandler();
			},
			set postTranslation(handler) {
				composer.setPostTranslationHandler(handler);
			},
			get sync() {
				return composer.inheritLocale;
			},
			set sync(val) {
				composer.inheritLocale = val;
			},
			get warnHtmlInMessage() {
				return composer.warnHtmlMessage ? "warn" : "off";
			},
			set warnHtmlInMessage(val) {
				composer.warnHtmlMessage = val !== "off";
			},
			get escapeParameterHtml() {
				return composer.escapeParameter;
			},
			set escapeParameterHtml(val) {
				composer.escapeParameter = val;
			},
			get pluralizationRules() {
				return composer.pluralRules || {};
			},
			__composer: composer,
			t(...args) {
				return Reflect.apply(composer.t, composer, [...args]);
			},
			rt(...args) {
				return Reflect.apply(composer.rt, composer, [...args]);
			},
			tc(...args) {
				const [arg1, arg2, arg3] = args;
				const options = { plural: 1 };
				let list = null;
				let named = null;
				if (process.env.NODE_ENV !== "production") warnOnce(getWarnMessage(I18nWarnCodes.DEPRECATE_TC));
				if (!isString(arg1)) throw createI18nError(I18nErrorCodes.INVALID_ARGUMENT);
				const key = arg1;
				if (isString(arg2)) options.locale = arg2;
				else if (isNumber$1(arg2)) options.plural = arg2;
				else if (isArray(arg2)) list = arg2;
				else if (isPlainObject$1(arg2)) named = arg2;
				if (isString(arg3)) options.locale = arg3;
				else if (isArray(arg3)) list = arg3;
				else if (isPlainObject$1(arg3)) named = arg3;
				return Reflect.apply(composer.t, composer, [
					key,
					list || named || {},
					options
				]);
			},
			te(key, locale) {
				return composer.te(key, locale);
			},
			tm(key) {
				return composer.tm(key);
			},
			getLocaleMessage(locale) {
				return composer.getLocaleMessage(locale);
			},
			setLocaleMessage(locale, message) {
				composer.setLocaleMessage(locale, message);
			},
			mergeLocaleMessage(locale, message) {
				composer.mergeLocaleMessage(locale, message);
			},
			d(...args) {
				return Reflect.apply(composer.d, composer, [...args]);
			},
			getDateTimeFormat(locale) {
				return composer.getDateTimeFormat(locale);
			},
			setDateTimeFormat(locale, format) {
				composer.setDateTimeFormat(locale, format);
			},
			mergeDateTimeFormat(locale, format) {
				composer.mergeDateTimeFormat(locale, format);
			},
			n(...args) {
				return Reflect.apply(composer.n, composer, [...args]);
			},
			getNumberFormat(locale) {
				return composer.getNumberFormat(locale);
			},
			setNumberFormat(locale, format) {
				composer.setNumberFormat(locale, format);
			},
			mergeNumberFormat(locale, format) {
				composer.mergeNumberFormat(locale, format);
			}
		};
		vueI18n.__extender = __extender;
		if (process.env.NODE_ENV !== "production") {
			vueI18n.__enableEmitter = (emitter) => {
				const __composer = composer;
				__composer[EnableEmitter] && __composer[EnableEmitter](emitter);
			};
			vueI18n.__disableEmitter = () => {
				const __composer = composer;
				__composer[DisableEmitter] && __composer[DisableEmitter]();
			};
		}
		return vueI18n;
	}
	/**
	* Supports compatibility for legacy vue-i18n APIs
	* This mixin is used when we use vue-i18n@v9.x or later
	*/
	function defineMixin(vuei18n, composer, i18n) {
		return {
			beforeCreate() {
				const instance = getCurrentInstance();
				/* istanbul ignore if */
				if (!instance) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
				const options = this.$options;
				if (options.i18n) {
					const optionsI18n = options.i18n;
					if (options.__i18n) optionsI18n.__i18n = options.__i18n;
					optionsI18n.__root = composer;
					if (this === this.$root) this.$i18n = mergeToGlobal(vuei18n, optionsI18n);
					else {
						optionsI18n.__injectWithOption = true;
						optionsI18n.__extender = i18n.__vueI18nExtend;
						this.$i18n = createVueI18n(optionsI18n);
						const _vueI18n = this.$i18n;
						if (_vueI18n.__extender) _vueI18n.__disposer = _vueI18n.__extender(this.$i18n);
					}
				} else if (options.__i18n) if (this === this.$root) this.$i18n = mergeToGlobal(vuei18n, options);
				else {
					this.$i18n = createVueI18n({
						__i18n: options.__i18n,
						__injectWithOption: true,
						__extender: i18n.__vueI18nExtend,
						__root: composer
					});
					const _vueI18n = this.$i18n;
					if (_vueI18n.__extender) _vueI18n.__disposer = _vueI18n.__extender(this.$i18n);
				}
				else this.$i18n = vuei18n;
				if (options.__i18nGlobal) adjustI18nResources(composer, options, options);
				this.$t = (...args) => this.$i18n.t(...args);
				this.$rt = (...args) => this.$i18n.rt(...args);
				this.$tc = (...args) => this.$i18n.tc(...args);
				this.$te = (key, locale) => this.$i18n.te(key, locale);
				this.$d = (...args) => this.$i18n.d(...args);
				this.$n = (...args) => this.$i18n.n(...args);
				this.$tm = (key) => this.$i18n.tm(key);
				i18n.__setInstance(instance, this.$i18n);
			},
			mounted() {
				/* istanbul ignore if */
				if ((process.env.NODE_ENV !== "production" || false) && this.$el && this.$i18n) {
					const _vueI18n = this.$i18n;
					this.$el.__VUE_I18N__ = _vueI18n.__composer;
					const emitter = this.__v_emitter = createEmitter();
					_vueI18n.__enableEmitter && _vueI18n.__enableEmitter(emitter);
					emitter.on("*", addTimelineEvent);
				}
			},
			unmounted() {
				const instance = getCurrentInstance();
				/* istanbul ignore if */
				if (!instance) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
				const _vueI18n = this.$i18n;
				/* istanbul ignore if */
				if ((process.env.NODE_ENV !== "production" || false) && this.$el && this.$el.__VUE_I18N__) {
					if (this.__v_emitter) {
						this.__v_emitter.off("*", addTimelineEvent);
						delete this.__v_emitter;
					}
					if (this.$i18n) {
						_vueI18n.__disableEmitter && _vueI18n.__disableEmitter();
						delete this.$el.__VUE_I18N__;
					}
				}
				delete this.$t;
				delete this.$rt;
				delete this.$tc;
				delete this.$te;
				delete this.$d;
				delete this.$n;
				delete this.$tm;
				if (_vueI18n.__disposer) {
					_vueI18n.__disposer();
					delete _vueI18n.__disposer;
					delete _vueI18n.__extender;
				}
				i18n.__deleteInstance(instance);
				delete this.$i18n;
			}
		};
	}
	function mergeToGlobal(g, options) {
		g.locale = options.locale || g.locale;
		g.fallbackLocale = options.fallbackLocale || g.fallbackLocale;
		g.missing = options.missing || g.missing;
		g.silentTranslationWarn = options.silentTranslationWarn || g.silentFallbackWarn;
		g.silentFallbackWarn = options.silentFallbackWarn || g.silentFallbackWarn;
		g.formatFallbackMessages = options.formatFallbackMessages || g.formatFallbackMessages;
		g.postTranslation = options.postTranslation || g.postTranslation;
		g.warnHtmlInMessage = options.warnHtmlInMessage || g.warnHtmlInMessage;
		g.escapeParameterHtml = options.escapeParameterHtml || g.escapeParameterHtml;
		g.sync = options.sync || g.sync;
		g.__composer[SetPluralRulesSymbol](options.pluralizationRules || g.pluralizationRules);
		const messages = getLocaleMessages(g.locale, {
			messages: options.messages,
			__i18n: options.__i18n
		});
		Object.keys(messages).forEach((locale) => g.mergeLocaleMessage(locale, messages[locale]));
		if (options.datetimeFormats) Object.keys(options.datetimeFormats).forEach((locale) => g.mergeDateTimeFormat(locale, options.datetimeFormats[locale]));
		if (options.numberFormats) Object.keys(options.numberFormats).forEach((locale) => g.mergeNumberFormat(locale, options.numberFormats[locale]));
		return g;
	}
	var baseFormatProps = {
		tag: { type: [String, Object] },
		locale: { type: String },
		scope: {
			type: String,
			validator: (val) => val === "parent" || val === "global",
			default: "parent"
		},
		i18n: { type: Object }
	};
	function getInterpolateArg({ slots }, keys) {
		if (keys.length === 1 && keys[0] === "default") return (slots.default ? slots.default() : []).reduce((slot, current) => {
			return [...slot, ...current.type === Fragment ? current.children : [current]];
		}, []);
		else return keys.reduce((arg, key) => {
			const slot = slots[key];
			if (slot) arg[key] = slot();
			return arg;
		}, create());
	}
	function getFragmentableTag() {
		return Fragment;
	}
	/**
	* export the public type for h/tsx inference
	* also to avoid inline import() in generated d.ts files
	*/
	/**
	* Translation Component
	*
	* @remarks
	* See the following items for property about details
	*
	* @VueI18nSee [TranslationProps](component#translationprops)
	* @VueI18nSee [BaseFormatProps](component#baseformatprops)
	* @VueI18nSee [Component Interpolation](../guide/advanced/component)
	*
	* @example
	* ```html
	* <div id="app">
	*   <!-- ... -->
	*   <i18n keypath="term" tag="label" for="tos">
	*     <a :href="url" target="_blank">{{ $t('tos') }}</a>
	*   </i18n>
	*   <!-- ... -->
	* </div>
	* ```
	* ```js
	* import { createApp } from 'vue'
	* import { createI18n } from 'vue-i18n'
	*
	* const messages = {
	*   en: {
	*     tos: 'Term of Service',
	*     term: 'I accept xxx {0}.'
	*   },
	*   ja: {
	*     tos: '利用規約',
	*     term: '私は xxx の{0}に同意します。'
	*   }
	* }
	*
	* const i18n = createI18n({
	*   locale: 'en',
	*   messages
	* })
	*
	* const app = createApp({
	*   data: {
	*     url: '/term'
	*   }
	* }).use(i18n).mount('#app')
	* ```
	*
	* @VueI18nComponent
	*/
	var Translation = /* @__PURE__ */ defineComponent({
		name: "i18n-t",
		props: assign({
			keypath: {
				type: String,
				required: true
			},
			plural: {
				type: [Number, String],
				validator: (val) => isNumber$1(val) || !isNaN(val)
			}
		}, baseFormatProps),
		setup(props, context) {
			const { slots, attrs } = context;
			const i18n = props.i18n || useI18n({
				useScope: props.scope,
				__useComponent: true
			});
			return () => {
				const keys = Object.keys(slots).filter((key) => key !== "_");
				const options = create();
				if (props.locale) options.locale = props.locale;
				if (props.plural !== void 0) options.plural = isString(props.plural) ? +props.plural : props.plural;
				const arg = getInterpolateArg(context, keys);
				const children = i18n[TranslateVNodeSymbol](props.keypath, arg, options);
				const assignedAttrs = assign(create(), attrs);
				return h(isString(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag(), assignedAttrs, children);
			};
		}
	});
	function isVNode(target) {
		return isArray(target) && !isString(target[0]);
	}
	function renderFormatter(props, context, slotKeys, partFormatter) {
		const { slots, attrs } = context;
		return () => {
			const options = { part: true };
			let overrides = create();
			if (props.locale) options.locale = props.locale;
			if (isString(props.format)) options.key = props.format;
			else if (isObject$1(props.format)) {
				if (isString(props.format.key)) options.key = props.format.key;
				overrides = Object.keys(props.format).reduce((options, prop) => {
					return slotKeys.includes(prop) ? assign(create(), options, { [prop]: props.format[prop] }) : options;
				}, create());
			}
			const parts = partFormatter(...[
				props.value,
				options,
				overrides
			]);
			let children = [options.key];
			if (isArray(parts)) children = parts.map((part, index) => {
				const slot = slots[part.type];
				const node = slot ? slot({
					[part.type]: part.value,
					index,
					parts
				}) : [part.value];
				if (isVNode(node)) node[0].key = `${part.type}-${index}`;
				return node;
			});
			else if (isString(parts)) children = [parts];
			const assignedAttrs = assign(create(), attrs);
			return h(isString(props.tag) || isObject$1(props.tag) ? props.tag : getFragmentableTag(), assignedAttrs, children);
		};
	}
	/**
	* export the public type for h/tsx inference
	* also to avoid inline import() in generated d.ts files
	*/
	/**
	* Number Format Component
	*
	* @remarks
	* See the following items for property about details
	*
	* @VueI18nSee [FormattableProps](component#formattableprops)
	* @VueI18nSee [BaseFormatProps](component#baseformatprops)
	* @VueI18nSee [Custom Formatting](../guide/essentials/number#custom-formatting)
	*
	* @VueI18nDanger
	* Not supported IE, due to no support `Intl.NumberFormat#formatToParts` in [IE](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/formatToParts)
	*
	* If you want to use it, you need to use [polyfill](https://github.com/formatjs/formatjs/tree/main/packages/intl-numberformat)
	*
	* @VueI18nComponent
	*/
	var NumberFormat = /* @__PURE__ */ defineComponent({
		name: "i18n-n",
		props: assign({
			value: {
				type: Number,
				required: true
			},
			format: { type: [String, Object] }
		}, baseFormatProps),
		setup(props, context) {
			const i18n = props.i18n || useI18n({
				useScope: props.scope,
				__useComponent: true
			});
			return renderFormatter(props, context, NUMBER_FORMAT_OPTIONS_KEYS, (...args) => i18n[NumberPartsSymbol](...args));
		}
	});
	/**
	* Datetime Format Component
	*
	* @remarks
	* See the following items for property about details
	*
	* @VueI18nSee [FormattableProps](component#formattableprops)
	* @VueI18nSee [BaseFormatProps](component#baseformatprops)
	* @VueI18nSee [Custom Formatting](../guide/essentials/datetime#custom-formatting)
	*
	* @VueI18nDanger
	* Not supported IE, due to no support `Intl.DateTimeFormat#formatToParts` in [IE](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts)
	*
	* If you want to use it, you need to use [polyfill](https://github.com/formatjs/formatjs/tree/main/packages/intl-datetimeformat)
	*
	* @VueI18nComponent
	*/
	var DatetimeFormat = /* @__PURE__ */ defineComponent({
		name: "i18n-d",
		props: assign({
			value: {
				type: [Number, Date],
				required: true
			},
			format: { type: [String, Object] }
		}, baseFormatProps),
		setup(props, context) {
			const i18n = props.i18n || useI18n({
				useScope: props.scope,
				__useComponent: true
			});
			return renderFormatter(props, context, DATETIME_FORMAT_OPTIONS_KEYS, (...args) => i18n[DatetimePartsSymbol](...args));
		}
	});
	function getComposer$1(i18n, instance) {
		const i18nInternal = i18n;
		if (i18n.mode === "composition") return i18nInternal.__getInstance(instance) || i18n.global;
		else {
			const vueI18n = i18nInternal.__getInstance(instance);
			return vueI18n != null ? vueI18n.__composer : i18n.global.__composer;
		}
	}
	function vTDirective(i18n) {
		const _process = (binding) => {
			const { instance, value } = binding;
			/* istanbul ignore if */
			if (!instance || !instance.$) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			const composer = getComposer$1(i18n, instance.$);
			const parsedValue = parseValue(value);
			return [Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]), composer];
		};
		const register = (el, binding) => {
			const [textContent, composer] = _process(binding);
			if (inBrowser && i18n.global === composer) el.__i18nWatcher = watch(composer.locale, () => {
				binding.instance && binding.instance.$forceUpdate();
			});
			el.__composer = composer;
			el.textContent = textContent;
		};
		const unregister = (el) => {
			if (inBrowser && el.__i18nWatcher) {
				el.__i18nWatcher();
				el.__i18nWatcher = void 0;
				delete el.__i18nWatcher;
			}
			if (el.__composer) {
				el.__composer = void 0;
				delete el.__composer;
			}
		};
		const update = (el, { value }) => {
			if (el.__composer) {
				const composer = el.__composer;
				const parsedValue = parseValue(value);
				el.textContent = Reflect.apply(composer.t, composer, [...makeParams(parsedValue)]);
			}
		};
		const getSSRProps = (binding) => {
			const [textContent] = _process(binding);
			return { textContent };
		};
		return {
			created: register,
			unmounted: unregister,
			beforeUpdate: update,
			getSSRProps
		};
	}
	function parseValue(value) {
		if (isString(value)) return { path: value };
		else if (isPlainObject$1(value)) {
			if (!("path" in value)) throw createI18nError(I18nErrorCodes.REQUIRED_VALUE, "path");
			return value;
		} else throw createI18nError(I18nErrorCodes.INVALID_VALUE);
	}
	function makeParams(value) {
		const { path, locale, args, choice, plural } = value;
		const options = {};
		const named = args || {};
		if (isString(locale)) options.locale = locale;
		if (isNumber$1(choice)) options.plural = choice;
		if (isNumber$1(plural)) options.plural = plural;
		return [
			path,
			named,
			options
		];
	}
	function apply(app, i18n, ...options) {
		const pluginOptions = isPlainObject$1(options[0]) ? options[0] : {};
		if (isBoolean(pluginOptions.globalInstall) ? pluginOptions.globalInstall : true) {
			[Translation.name, "I18nT"].forEach((name) => app.component(name, Translation));
			[NumberFormat.name, "I18nN"].forEach((name) => app.component(name, NumberFormat));
			[DatetimeFormat.name, "I18nD"].forEach((name) => app.component(name, DatetimeFormat));
		}
		app.directive("t", vTDirective(i18n));
	}
	/**
	* Injection key for {@link useI18n}
	*
	* @remarks
	* The global injection key for I18n instances with `useI18n`. this injection key is used in Web Components.
	* Specify the i18n instance created by {@link createI18n} together with `provide` function.
	*
	* @VueI18nGeneral
	*/
	var I18nInjectionKey = /* #__PURE__*/ makeSymbol("global-vue-i18n");
	function createI18n(options = {}, VueI18nLegacy) {
		const __legacyMode = __VUE_I18N_LEGACY_API__ && isBoolean(options.legacy) ? options.legacy : __VUE_I18N_LEGACY_API__;
		const __globalInjection = isBoolean(options.globalInjection) ? options.globalInjection : true;
		const __instances = /* @__PURE__ */ new Map();
		const [globalScope, __global] = createGlobal(options, __legacyMode);
		const symbol = /* #__PURE__*/ makeSymbol(process.env.NODE_ENV !== "production" ? "vue-i18n" : "");
		function __getInstance(component) {
			return __instances.get(component) || null;
		}
		function __setInstance(component, instance) {
			__instances.set(component, instance);
		}
		function __deleteInstance(component) {
			__instances.delete(component);
		}
		const i18n = {
			get mode() {
				return __VUE_I18N_LEGACY_API__ && __legacyMode ? "legacy" : "composition";
			},
			async install(app, ...options) {
				if ((process.env.NODE_ENV !== "production" || false) && true) app.__VUE_I18N__ = i18n;
				app.__VUE_I18N_SYMBOL__ = symbol;
				app.provide(app.__VUE_I18N_SYMBOL__, i18n);
				if (isPlainObject$1(options[0])) {
					const opts = options[0];
					i18n.__composerExtend = opts.__composerExtend;
					i18n.__vueI18nExtend = opts.__vueI18nExtend;
				}
				let globalReleaseHandler = null;
				if (!__legacyMode && __globalInjection) globalReleaseHandler = injectGlobalFields(app, i18n.global);
				if (__VUE_I18N_FULL_INSTALL__) apply(app, i18n, ...options);
				if (__VUE_I18N_LEGACY_API__ && __legacyMode) app.mixin(defineMixin(__global, __global.__composer, i18n));
				const unmountApp = app.unmount;
				app.unmount = () => {
					globalReleaseHandler && globalReleaseHandler();
					i18n.dispose();
					unmountApp();
				};
				if ((process.env.NODE_ENV !== "production" || false) && true) {
					if (!await enableDevTools(app, i18n)) throw createI18nError(I18nErrorCodes.CANNOT_SETUP_VUE_DEVTOOLS_PLUGIN);
					const emitter = createEmitter();
					if (__legacyMode) {
						const _vueI18n = __global;
						_vueI18n.__enableEmitter && _vueI18n.__enableEmitter(emitter);
					} else {
						const _composer = __global;
						_composer[EnableEmitter] && _composer[EnableEmitter](emitter);
					}
					emitter.on("*", addTimelineEvent);
				}
			},
			get global() {
				return __global;
			},
			dispose() {
				globalScope.stop();
			},
			__instances,
			__getInstance,
			__setInstance,
			__deleteInstance
		};
		return i18n;
	}
	function useI18n(options = {}) {
		const instance = getCurrentInstance();
		if (instance == null) throw createI18nError(I18nErrorCodes.MUST_BE_CALL_SETUP_TOP);
		if (!instance.isCE && instance.appContext.app != null && !instance.appContext.app.__VUE_I18N_SYMBOL__) throw createI18nError(I18nErrorCodes.NOT_INSTALLED);
		const i18n = getI18nInstance(instance);
		const gl = getGlobalComposer(i18n);
		const componentOptions = getComponentOptions(instance);
		const scope = getScope(options, componentOptions);
		if (scope === "global") {
			adjustI18nResources(gl, options, componentOptions);
			return gl;
		}
		if (scope === "parent") {
			let composer = getComposer(i18n, instance, options.__useComponent);
			if (composer == null) {
				if (process.env.NODE_ENV !== "production") warn(getWarnMessage(I18nWarnCodes.NOT_FOUND_PARENT_SCOPE));
				composer = gl;
			}
			return composer;
		}
		const i18nInternal = i18n;
		let composer = i18nInternal.__getInstance(instance);
		if (composer == null) {
			const composerOptions = assign({}, options);
			if ("__i18n" in componentOptions) composerOptions.__i18n = componentOptions.__i18n;
			if (gl) composerOptions.__root = gl;
			composer = createComposer(composerOptions);
			if (i18nInternal.__composerExtend) composer[DisposeSymbol] = i18nInternal.__composerExtend(composer);
			setupLifeCycle(i18nInternal, instance, composer);
			i18nInternal.__setInstance(instance, composer);
		}
		return composer;
	}
	function createGlobal(options, legacyMode, VueI18nLegacy) {
		const scope = effectScope();
		const obj = __VUE_I18N_LEGACY_API__ && legacyMode ? scope.run(() => createVueI18n(options)) : scope.run(() => createComposer(options));
		if (obj == null) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
		return [scope, obj];
	}
	function getI18nInstance(instance) {
		const i18n = inject(!instance.isCE ? instance.appContext.app.__VUE_I18N_SYMBOL__ : I18nInjectionKey);
		/* istanbul ignore if */
		if (!i18n) throw createI18nError(!instance.isCE ? I18nErrorCodes.UNEXPECTED_ERROR : I18nErrorCodes.NOT_INSTALLED_WITH_PROVIDE);
		return i18n;
	}
	function getScope(options, componentOptions) {
		return isEmptyObject(options) ? "__i18n" in componentOptions ? "local" : "global" : !options.useScope ? "local" : options.useScope;
	}
	function getGlobalComposer(i18n) {
		return i18n.mode === "composition" ? i18n.global : i18n.global.__composer;
	}
	function getComposer(i18n, target, useComponent = false) {
		let composer = null;
		const root = target.root;
		let current = getParentComponentInstance(target, useComponent);
		while (current != null) {
			const i18nInternal = i18n;
			if (i18n.mode === "composition") composer = i18nInternal.__getInstance(current);
			else if (__VUE_I18N_LEGACY_API__) {
				const vueI18n = i18nInternal.__getInstance(current);
				if (vueI18n != null) {
					composer = vueI18n.__composer;
					if (useComponent && composer && !composer[InejctWithOptionSymbol]) composer = null;
				}
			}
			if (composer != null) break;
			if (root === current) break;
			current = current.parent;
		}
		return composer;
	}
	function getParentComponentInstance(target, useComponent = false) {
		if (target == null) return null;
		return !useComponent ? target.parent : target.vnode.ctx || target.parent;
	}
	function setupLifeCycle(i18n, target, composer) {
		let emitter = null;
		onMounted(() => {
			if ((process.env.NODE_ENV !== "production" || false) && target.vnode.el) {
				target.vnode.el.__VUE_I18N__ = composer;
				emitter = createEmitter();
				const _composer = composer;
				_composer[EnableEmitter] && _composer[EnableEmitter](emitter);
				emitter.on("*", addTimelineEvent);
			}
		}, target);
		onUnmounted(() => {
			const _composer = composer;
			if ((process.env.NODE_ENV !== "production" || false) && target.vnode.el && target.vnode.el.__VUE_I18N__) {
				emitter && emitter.off("*", addTimelineEvent);
				_composer[DisableEmitter] && _composer[DisableEmitter]();
				delete target.vnode.el.__VUE_I18N__;
			}
			i18n.__deleteInstance(target);
			const dispose = _composer[DisposeSymbol];
			if (dispose) {
				dispose();
				delete _composer[DisposeSymbol];
			}
		}, target);
	}
	var globalExportProps = [
		"locale",
		"fallbackLocale",
		"availableLocales"
	];
	var globalExportMethods = [
		"t",
		"rt",
		"d",
		"n",
		"tm",
		"te"
	];
	function injectGlobalFields(app, composer) {
		const i18n = Object.create(null);
		globalExportProps.forEach((prop) => {
			const desc = Object.getOwnPropertyDescriptor(composer, prop);
			if (!desc) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			const wrap = /* @__PURE__ */ isRef(desc.value) ? {
				get() {
					return desc.value.value;
				},
				set(val) {
					desc.value.value = val;
				}
			} : { get() {
				return desc.get && desc.get();
			} };
			Object.defineProperty(i18n, prop, wrap);
		});
		app.config.globalProperties.$i18n = i18n;
		globalExportMethods.forEach((method) => {
			const desc = Object.getOwnPropertyDescriptor(composer, method);
			if (!desc || !desc.value) throw createI18nError(I18nErrorCodes.UNEXPECTED_ERROR);
			Object.defineProperty(app.config.globalProperties, `$${method}`, desc);
		});
		const dispose = () => {
			delete app.config.globalProperties.$i18n;
			globalExportMethods.forEach((method) => {
				delete app.config.globalProperties[`$${method}`];
			});
		};
		return dispose;
	}
	initFeatureFlags();
	registerMessageCompiler(compile);
	registerMessageResolver(resolveValue);
	registerLocaleFallbacker(fallbackWithLocaleChain);
	if (process.env.NODE_ENV !== "production" || __INTLIFY_PROD_DEVTOOLS__) {
		const target = getGlobalThis();
		target.__INTLIFY__ = true;
		setDevToolsHook(target.__INTLIFY_DEVTOOLS_GLOBAL_HOOK__);
	}
	if (process.env.NODE_ENV !== "production");
	var ar_default = {
		app: {
			"name": "SwiftAxis",
			"logistics": "لوجستيك",
			"tagline": "نظام إدارة مناديب الشحن بالعمولة"
		},
		common: {
			"search": "بحث…",
			"loading": "جارٍ التحميل…",
			"day": "اليوم",
			"month": "الشهر",
			"year": "السنة",
			"today": "اليوم",
			"thisMonth": "هذا الشهر",
			"thisYear": "هذه السنة",
			"target": "الهدف",
			"actual": "الفعلي",
			"notifications": "الإشعارات",
			"profile": "الملف الشخصي",
			"logout": "تسجيل الخروج",
			"riyal": "ر.س",
			"vsPrev": "مقارنة بالفترة السابقة",
			"viewAll": "عرض الكل",
			"noData": "لا توجد بيانات",
			"orders": "أوردر",
			"collapse": "طيّ القائمة",
			"switchRole": "تبديل الدور (تجربة)",
			"upload": "ارفع ملفًا أو اسحبه هنا",
			"save": "حفظ",
			"cancel": "إلغاء",
			"add": "إضافة",
			"edit": "تعديل",
			"delete": "حذف",
			"export": "تصدير",
			"print": "طباعة / PDF",
			"actions": "إجراءات",
			"all": "الكل",
			"date": "التاريخ",
			"amount": "المبلغ",
			"total": "الإجمالي",
			"notes": "ملاحظات",
			"reason": "السبب",
			"status": "الحالة",
			"active": "نشط",
			"inactive": "غير نشط",
			"from": "من",
			"to": "إلى",
			"apply": "تطبيق",
			"reset": "إعادة تعيين",
			"review": "مراجعة",
			"approve": "اعتماد",
			"saved": "تم الحفظ بنجاح",
			"none": "لا شيء",
			"required": "مطلوب",
			"clear": "مسح"
		},
		roles: {
			"manager": "مدير النظام",
			"supervisor": "مشرف",
			"accountant": "محاسب",
			"rider": "مندوب"
		},
		datepicker: {
			"selectDate": "اختر التاريخ",
			"selectRange": "اختر الفترة",
			"today": "اليوم",
			"last7": "آخر ٧ أيام",
			"last30": "آخر ٣٠ يومًا",
			"thisMonth": "هذا الشهر",
			"prev": "السابق",
			"next": "التالي"
		},
		nav: {
			"dashboard": "الرئيسية",
			"riders": "المناديب",
			"contracts": "العقود",
			"orders": "الأوردرات اليومية",
			"commissions": "العمولات",
			"wallets": "محافظ الكاش",
			"vehicles": "السيارات والمصروفات",
			"reports": "التقارير",
			"ledger": "دفتر الأستاذ",
			"purchases": "المشتريات و VAT",
			"users": "المستخدمون والصلاحيات",
			"settings": "الإعدادات"
		},
		login: {
			"title": "مرحبًا بعودتك",
			"subtitle": "سجّل الدخول إلى مساحة عمل SwiftAxis",
			"username": "اسم المستخدم",
			"password": "كلمة المرور",
			"submit": "دخول",
			"signingIn": "جارٍ تسجيل الدخول…",
			"remember": "إبقائي مسجّلًا للدخول",
			"forgot": "نسيت كلمة المرور؟",
			"showPassword": "إظهار كلمة المرور",
			"hidePassword": "إخفاء كلمة المرور",
			"demoHint": "وضع التجربة — اختر دورًا للاستكشاف",
			"loginAs": "الدخول كـ",
			"showcaseTitle": "كل مندوب، وكل ريال — في حركة دائمة.",
			"showcaseSubtitle": "مركز التحكّم لعمليات التوصيل في جدة — الأوردرات والعمولات ومحافظ الكاش في مكان واحد.",
			"features": {
				"orders": "تتبّع مباشر للأوردرات",
				"ordersDesc": "تابع كل عملية توصيل لحظة بلحظة",
				"commissions": "عمولات آلية",
				"commissionsDesc": "مستحقات عادلة وشفافة للمناديب",
				"wallets": "إدارة محافظ الكاش",
				"walletsDesc": "أرصدة مطابقة في الوقت الفعلي"
			},
			"stat": {
				"orders": "أوردرات اليوم",
				"onTime": "نسبة الالتزام",
				"riders": "مناديب نشطون"
			},
			"live": "مباشر",
			"delivered": "تم التوصيل",
			"min": "دقيقة",
			"preview": {
				"title": "أداء اليوم",
				"topRider": "الأعلى اليوم"
			}
		},
		dashboard: {
			"welcome": "مرحبًا، {name}",
			"subtitleManager": "نظرة عامة على أداء الفريق والعمولات",
			"subtitleRider": "ملخص أدائك ومحفظتك",
			"kpi": {
				"totalOrders": "إجمالي الأوردرات",
				"commissionsDue": "العمولات المستحقة",
				"activeRiders": "المناديب النشطون",
				"avgOrders": "متوسط الأوردرات/مندوب",
				"myOrders": "أوردراتي",
				"myCommission": "عمولتي المتوقعة",
				"walletBalance": "رصيد المحفظة",
				"goalProgress": "التقدم نحو الهدف"
			},
			"trendTitle": "تطور الأوردرات والعمولات",
			"trendOrders": "الأوردرات",
			"trendCommissions": "العمولات (ر.س)",
			"ridersTitle": "أداء المناديب",
			"topRidersTitle": "أفضل المناديب",
			"compareTitle": "مقارنة أداء المناديب",
			"alertsTitle": "التنبيهات",
			"weeklyTitle": "أوردراتي هذا الأسبوع",
			"lastMovement": "آخر حركة",
			"goalReached": "تجاوزت هدفك اليومي! 🎉",
			"table": {
				"rider": "المندوب",
				"contract": "العقد",
				"orders": "الأوردرات",
				"progress": "التقدم",
				"commission": "العمولة",
				"status": "الحالة"
			},
			"status": {
				"active": "نشط",
				"inactive": "معطّل",
				"warning": "أقل من الهدف"
			},
			"alerts": {
				"walletOver": "رصيد {name} تجاوز الحد ({amount} ر.س)",
				"lowPerformer": "{name} أقل من 70% من الهدف",
				"empty": "لا توجد تنبيهات حالية 👍"
			}
		},
		riders: {
			"title": "المناديب",
			"subtitle": "إدارة مناديب التوصيل وربطهم بالعقود",
			"searchPlaceholder": "ابحث بالاسم أو رقم الهوية…",
			"filters": {
				"all": "الكل",
				"contract": "العقد",
				"status": "الحالة",
				"city": "المدينة"
			},
			"stats": {
				"total": "إجمالي المناديب",
				"active": "نشط",
				"underperforming": "أقل من الهدف",
				"avgOrders": "متوسط الأوردرات"
			},
			"actions": {
				"add": "إضافة مندوب",
				"export": "تصدير",
				"edit": "تعديل",
				"activate": "تفعيل",
				"deactivate": "تعطيل"
			},
			"table": {
				"rider": "المندوب",
				"contracts": "العقود",
				"vehicle": "المركبة",
				"orders": "الأوردرات",
				"commission": "العمولة",
				"wallet": "المحفظة",
				"status": "الحالة",
				"actions": "إجراءات"
			},
			"underTarget": "أقل من 70% من الهدف",
			"empty": "لا يوجد مناديب مطابقون للفلاتر",
			"form": {
				"addTitle": "إضافة مندوب جديد",
				"editTitle": "تعديل بيانات المندوب",
				"name": "الاسم الكامل",
				"namePh": "مثال: محمد الغامدي",
				"nationalId": "رقم الهوية",
				"nationalIdPh": "10 أرقام",
				"nationalIdLocked": "لا يمكن تغيير رقم الهوية بعد الإنشاء",
				"mobile": "رقم الجوال",
				"mobilePh": "05xxxxxxxx",
				"city": "المدينة",
				"cityPh": "اختر المدينة",
				"vehicle": "المركبة",
				"vehiclePh": "اختر المركبة من الأسطول",
				"vehicleFree": "متاحة",
				"contracts": "العقود",
				"contractsHint": "اربط المندوب بعقد واحد أو أكثر",
				"activeAccount": "الحساب مفعّل",
				"autoUser": "يُنشأ حساب دخول للمندوب تلقائيًا عند إضافته.",
				"save": "حفظ المندوب",
				"cancel": "إلغاء",
				"errName": "الرجاء إدخال اسم المندوب",
				"errNationalId": "رقم الهوية مطلوب",
				"errNationalIdFormat": "رقم الهوية يجب أن يكون 10 أرقام",
				"errDuplicate": "رقم الهوية هذا موجود مسبقًا في النظام",
				"errMobile": "أدخل رقم جوال صحيح (05xxxxxxxx)",
				"errContract": "اختر عقدًا واحدًا على الأقل"
			}
		},
		contracts: {
			"title": "العقود",
			"subtitle": "عقود شركات التوصيل والمناديب المرتبطين بكل عقد",
			"empty": "لا توجد عقود",
			"add": "إضافة عقد",
			"addTitle": "إضافة عقد جديد",
			"editTitle": "تعديل العقد",
			"company": "الشركة",
			"companyPh": "مثال: هانجر استيشن",
			"amount": "قيمة العقد (ريال)",
			"start": "تاريخ البداية",
			"end": "تاريخ النهاية",
			"ongoing": "مستمر",
			"ridersLinked": "المناديب",
			"status": "الحالة",
			"actions": "إجراءات",
			"save": "حفظ العقد",
			"cancel": "إلغاء",
			"errCompany": "الرجاء إدخال اسم الشركة"
		},
		riderDetail: {
			"back": "رجوع إلى المناديب",
			"orders": "أوردرات (الشهر)",
			"commission": "العمولة",
			"baseSalary": "الراتب الأساسي",
			"target": "التارجت",
			"chartTitle": "الأوردرات اليومية",
			"vehicleTitle": "بيانات المركبة",
			"shift": "الفترة",
			"noVehicle": "لا توجد مركبة مرتبطة",
			"notFound": "المندوب غير موجود"
		},
		users: {
			"title": "المستخدمون والصلاحيات",
			"subtitle": "إدارة المستخدمين والأدوار وسجل العمليات",
			"tabs": {
				"users": "المستخدمون",
				"roles": "الأدوار والصلاحيات",
				"audit": "سجل العمليات"
			},
			"add": "إضافة مستخدم",
			"userTitle": "مستخدم",
			"name": "الاسم",
			"role": "الدور",
			"mobile": "الجوال",
			"matrix": {
				"page": "الصفحة",
				"hint": "ما يمكن لكل دور الوصول إليه (مصفوفة الصلاحيات)"
			},
			"audit": {
				"time": "الوقت",
				"user": "المستخدم",
				"action": "العملية",
				"entity": "العنصر",
				"detail": "التفاصيل",
				"ip": "العنوان",
				"search": "ابحث في السجل…",
				"allActions": "كل العمليات",
				"immutable": "سجل العمليات للقراءة فقط"
			},
			"actions": {
				"login": "دخول",
				"logout": "خروج",
				"create": "إنشاء",
				"update": "تعديل",
				"delete": "حذف"
			},
			"errName": "الاسم مطلوب",
			"saved": "تم الحفظ",
			"empty": "لا توجد سجلات"
		},
		reports: {
			"title": "التقارير",
			"subtitle": "تقارير شهرية شاملة",
			"month": "الشهر",
			"generate": "إنشاء التقرير",
			"refNo": "المرجع",
			"print": "تنزيل PDF",
			"monthlyTitle": "تقرير الأداء الشهري",
			"signature": "التوقيع المعتمد",
			"summary": {
				"title": "الملخص",
				"orders": "إجمالي الأوردرات",
				"commissions": "العمولات",
				"activeRiders": "المناديب النشطون",
				"avgOrders": "متوسط الأوردرات"
			},
			"ridersTitle": "أداء المناديب",
			"vehiclesTitle": "ربحية السيارات",
			"pnlTitle": "الملخص المالي (الأرباح والخسائر)",
			"comparisonTitle": "مقارنة المناديب",
			"tabs": {
				"monthly": "التقرير الشهري",
				"period": "تقرير المناديب خلال فترة",
				"best": "أفضل المناديب"
			},
			"period": {
				"title": "تقرير المناديب خلال فترة",
				"range": "الفترة",
				"from": "من",
				"to": "إلى",
				"rider": "المندوب",
				"vehicle": "السيارة",
				"shift": "الدوام",
				"days": "أيام مسجلة",
				"orders": "عدد الأوردرات",
				"commission": "العمولة",
				"vehicleExpenses": "مصروفات السيارة",
				"sharedNote": "مصروفات السيارة هي إجمالي مصروفات المركبة كاملة؛ علامة * تعني أن المركبة مشتركة بين مندوبين"
			},
			"best": {
				"title": "أفضل المناديب في الشهر",
				"rank": "الترتيب",
				"extraAmount": "العمولة (فوق التارجت)",
				"achievedSalary": "الراتب المحقق"
			}
		},
		purchases: {
			"title": "المشتريات وضريبة القيمة المضافة",
			"subtitle": "تسجيل المشتريات والموردين وضريبة المدخلات",
			"tabs": {
				"purchases": "المشتريات",
				"suppliers": "الموردون",
				"vat": "تقرير الضريبة",
				"byCenter": "حسب مركز التكلفة"
			},
			"addPurchase": "إضافة مشتريات",
			"purchaseTitle": "تسجيل مشتريات",
			"addSupplier": "إضافة مورد",
			"supplierTitle": "مورد",
			"fields": {
				"supplier": "المورد",
				"itemType": "نوع المستلزم",
				"qty": "الكمية",
				"unitPrice": "سعر الوحدة",
				"date": "التاريخ",
				"inclVat": "السعر شامل الضريبة",
				"taxable": "خاضع للضريبة (15%)",
				"costCenter": "مركز التكلفة",
				"invoiceNo": "رقم الفاتورة",
				"preTax": "قبل الضريبة",
				"vat": "الضريبة",
				"total": "الإجمالي",
				"receipt": "الفاتورة / الإيصال",
				"vehicle": "السيارة",
				"noVehicle": "غير مرتبطة بسيارة",
				"derivedCostCenter": "مركز التكلفة (من السيارة)",
				"supplierTaxNo": "الرقم الضريبي للمورد"
			},
			"supplier": {
				"name": "اسم المورد",
				"taxNo": "الرقم الضريبي",
				"mobile": "الجوال",
				"category": "الفئة",
				"purchases": "المشتريات",
				"errTax": "الرقم الضريبي 15 خانة يبدأ وينتهي بـ 3",
				"errName": "الاسم مطلوب"
			},
			"vat": {
				"invoice": "الفاتورة",
				"taxNo": "الرقم الضريبي",
				"preTax": "قبل الضريبة",
				"amount": "الضريبة",
				"total": "إجمالي الضريبة"
			},
			"center": {
				"name": "مركز التكلفة",
				"budget": "الميزانية",
				"spent": "المصروف",
				"variance": "الانحراف"
			},
			"saved": "تم الحفظ",
			"empty": "لا توجد سجلات"
		},
		vehicles: {
			"title": "السيارات والمصروفات",
			"subtitle": "مصروفات الأسطول وربحية كل سيارة",
			"tabs": {
				"vehicles": "السيارات",
				"expenses": "المصروفات",
				"profitability": "الربحية"
			},
			"plate": "اللوحة",
			"type": "النوع",
			"rider": "المناديب",
			"riders": {
				"morning": "مندوب الفترة الصباحية",
				"evening": "مندوب الفترة المسائية"
			},
			"statusLabel": "الحالة",
			"statusFrom": "من",
			"statusTo": "إلى",
			"errSameRider": "لا يمكن ربط نفس المندوب بالفترتين",
			"unassigned": "غير مرتبطة",
			"addVehicle": "إضافة سيارة",
			"vehicleTitle": "سيارة",
			"addExpense": "إضافة مصروف",
			"expenseTitle": "مصروف سيارة",
			"fields": {
				"vehicle": "السيارة",
				"type": "نوع المصروف",
				"amount": "المبلغ",
				"date": "التاريخ",
				"invoiceNo": "رقم الفاتورة",
				"note": "ملاحظة",
				"receipt": "الإيصال",
				"value": "قيمة السيارة (ريال)"
			},
			"charts": {
				"title": "تحليل المصروفات",
				"subtitle": "لمعرفة أي نوع مصروف يرفع التكاليف",
				"granularity": {
					"day": "يومي",
					"month": "شهري",
					"year": "سنوي"
				},
				"allVehicles": "كل السيارات",
				"byType": "الإجمالي حسب النوع"
			},
			"prof": {
				"vehicle": "السيارة",
				"revenue": "الإيراد",
				"expenses": "المصروفات",
				"net": "الصافي",
				"margin": "الهامش"
			},
			"saved": "تم الحفظ",
			"empty": "لا توجد سجلات"
		},
		wallets: {
			"title": "محافظ الكاش",
			"subtitle": "متابعة الكاش المحصّل وعمليات التسليم لكل مندوب",
			"balance": "الرصيد",
			"over": "تجاوز الحد",
			"handover": "تسجيل تسليم",
			"handoverTitle": "تسجيل تسليم كاش",
			"amount": "المبلغ",
			"note": "ملاحظة الإيصال / التوقيع",
			"recorded": "تم تسجيل التسليم",
			"invalidAmount": "أدخل مبلغًا صحيحًا",
			"statement": "كشف الحساب",
			"statementTitle": "كشف المحفظة — {name}",
			"deposit": "إيداع",
			"handoverType": "تسليم",
			"runningBalance": "الرصيد",
			"type": "النوع",
			"allTypes": "كل الحركات",
			"empty": "لا توجد حركات",
			"searchPlaceholder": "ابحث عن مندوب…"
		},
		commissions: {
			"title": "العمولات",
			"subtitle": "معادلات العمولة المرنة ومراجعة الصرف الشهري",
			"tabs": {
				"formulas": "المعادلات",
				"monthly": "المراجعة الشهرية"
			},
			"formula": {
				"contract": "العقد",
				"target": "الهدف (أوردر)",
				"base": "الراتب الأساسي",
				"perOrder": "لكل أوردر إضافي",
				"riders": "المناديب",
				"editTitle": "تعديل معادلة العمولة",
				"preview": "معاينة حية",
				"previewHint": "أدخل عدد أوردرات لمعاينة العمولة",
				"ordersLabel": "الأوردرات",
				"saved": "تم تحديث المعادلة",
				"tiers": "الشرائح",
				"tierUpTo": "حتى (أوردر)",
				"tierPerOrder": "لكل أوردر (ريال)",
				"tierUnlimited": "بلا حد",
				"addTier": "إضافة شريحة",
				"removeTier": "حذف شريحة"
			},
			"monthly": {
				"month": "الشهر",
				"rider": "المندوب",
				"orders": "الأوردرات",
				"base": "الأساسي",
				"extra": "الزيادة",
				"extraAmount": "قيمة الزيادة",
				"total": "الإجمالي",
				"locked": "مُقفل",
				"approve": "اعتماد وترحيل",
				"approveTitle": "اعتماد الشهر",
				"approveHint": "سيتم إنشاء قيد محاسبي متوازن (مدين مصروف العمولات / دائن ذمم المناديب) وقفل الشهر.",
				"approved": "تم اعتماد الشهر وترحيله",
				"empty": "لا توجد بيانات"
			},
			"history": {
				"title": "سجل تعديلات المعادلة",
				"empty": "لا توجد تعديلات بعد"
			}
		},
		orders: {
			"title": "الأوردرات اليومية",
			"subtitle": "تسجيل ومراجعة أوردرات المناديب اليومية",
			"entryTitle": "تسجيل أوردرات اليوم",
			"myLogs": "سجلاتي الأخيرة",
			"allLogs": "سجل الأوردرات",
			"fields": {
				"date": "التاريخ",
				"orders": "عدد الأوردرات",
				"cash": "الكاش المحصّل",
				"hours": "ساعات العمل",
				"notes": "ملاحظات (اختياري)"
			},
			"preview": {
				"title": "العمولة المتوقعة",
				"base": "الراتب الأساسي",
				"extra": "الزيادة ({n} أوردر)",
				"total": "الإجمالي"
			},
			"save": "حفظ السجل",
			"futureDate": "لا يمكن تسجيل تاريخ مستقبلي",
			"filterRider": "المندوب",
			"allRiders": "كل المناديب",
			"edit": "تعديل",
			"editTitle": "تعديل سجل الأوردرات",
			"reason": "سبب التعديل",
			"reasonRequired": "السبب مطلوب",
			"outOfWindow": "خارج مدة التعديل المسموحة",
			"editedBy": "عُدّل بواسطة {name}",
			"import": "استيراد تقرير",
			"importTitle": "استيراد الأوردرات (هانجر استيشن)",
			"importHint": "ارفع تقرير PDF/Excel لاستخراج البيانات",
			"review": "مراجعة البيانات المستخرجة",
			"conflict": "تعارض مع إدخال يدوي",
			"confirmImport": "اعتماد الاستيراد",
			"imported": "تم استيراد {n} سجل",
			"saved": "تم حفظ السجل",
			"empty": "لا توجد سجلات أوردرات"
		},
		ledger: {
			"title": "دفتر الأستاذ العام",
			"subtitle": "القيود المحاسبية، ميزان المراجعة، الأرباح والخسائر ومراكز التكلفة",
			"tabs": {
				"journal": "القيود",
				"trial": "ميزان المراجعة",
				"pnl": "الأرباح والخسائر",
				"costCenters": "مراكز التكلفة"
			},
			"newEntry": "قيد جديد",
			"ref": "المرجع",
			"source": "المصدر",
			"description": "البيان",
			"account": "الحساب",
			"costCenter": "مركز التكلفة",
			"allCenters": "كل مراكز التكلفة",
			"debit": "مدين",
			"credit": "دائن",
			"balance": "الرصيد",
			"totalDebit": "إجمالي المدين",
			"totalCredit": "إجمالي الدائن",
			"addLine": "إضافة سطر",
			"balanced": "متوازن",
			"unbalanced": "يجب أن يتساوى المدين مع الدائن",
			"entrySaved": "تم ترحيل القيد",
			"vehicleWarning": "تنبيه: مركز التكلفة يخص المركبة {plate} وهي {status} من {from} إلى {to} — يُراعى ذلك عند توزيع التكاليف آخر الشهر",
			"vehicleWarningOpenEnded": "تنبيه: مركز التكلفة يخص المركبة {plate} وهي {status} منذ {from} — يُراعى ذلك عند توزيع التكاليف آخر الشهر",
			"vehicleWarningNoPeriod": "تنبيه: مركز التكلفة يخص المركبة {plate} وهي حاليًا {status}",
			"empty": "لا توجد قيود في هذه الفترة",
			"pnl": {
				"revenue": "الإيرادات",
				"expenses": "المصروفات",
				"net": "صافي الربح",
				"totalRevenue": "إجمالي الإيرادات",
				"totalExpense": "إجمالي المصروفات"
			},
			"cc": {
				"name": "مركز التكلفة",
				"budget": "الميزانية",
				"actual": "الفعلي",
				"variance": "الانحراف",
				"add": "إضافة مركز تكلفة",
				"addTitle": "إضافة مركز تكلفة",
				"editTitle": "تعديل مركز التكلفة",
				"over": "تجاوز الميزانية",
				"errName": "الاسم مطلوب"
			},
			"form": {
				"addTitle": "قيد محاسبي جديد",
				"save": "ترحيل القيد",
				"descriptionPh": "مثال: عمولات يونيو"
			}
		},
		settings: {
			"title": "الإعدادات",
			"subtitle": "إعدادات النظام",
			"company": "اسم الشركة",
			"walletThreshold": "حد تحذير المحفظة (ر.س)",
			"vatRate": "نسبة الضريبة (%)",
			"notifications": "الإشعارات",
			"notifyWhatsapp": "تنبيهات واتساب/SMS لحدود المحفظة",
			"notifyLowPerformer": "تنبيه عند ضعف أداء المناديب",
			"saved": "تم حفظ الإعدادات"
		},
		profile: {
			"title": "ملفي الشخصي",
			"subtitle": "تفاصيل حسابك",
			"name": "الاسم",
			"role": "الدور",
			"mobile": "الجوال",
			"saved": "تم تحديث الملف"
		},
		placeholder: {
			"comingSoon": "قيد التطوير",
			"description": "هذه الصفحة ({title}) ستُبنى في المرحلة القادمة."
		},
		styleguide: {
			"title": "دليل التصميم",
			"colors": "الألوان",
			"buttons": "الأزرار",
			"badges": "الشارات",
			"cards": "البطاقات"
		}
	};
	var en_default = {
		app: {
			"name": "SwiftAxis",
			"logistics": "LOGISTICS",
			"tagline": "Delivery Rider Commission Management"
		},
		common: {
			"search": "Search…",
			"loading": "Loading…",
			"day": "Day",
			"month": "Month",
			"year": "Year",
			"today": "Today",
			"thisMonth": "This month",
			"thisYear": "This year",
			"target": "Target",
			"actual": "Actual",
			"notifications": "Notifications",
			"profile": "Profile",
			"logout": "Log out",
			"riyal": "SAR",
			"vsPrev": "vs previous period",
			"viewAll": "View all",
			"noData": "No data",
			"orders": "orders",
			"collapse": "Collapse",
			"switchRole": "Switch role (demo)",
			"upload": "Upload a file or drag it here",
			"save": "Save",
			"cancel": "Cancel",
			"add": "Add",
			"edit": "Edit",
			"delete": "Delete",
			"export": "Export",
			"print": "Print / PDF",
			"actions": "Actions",
			"all": "All",
			"date": "Date",
			"amount": "Amount",
			"total": "Total",
			"notes": "Notes",
			"reason": "Reason",
			"status": "Status",
			"active": "Active",
			"inactive": "Inactive",
			"from": "From",
			"to": "To",
			"apply": "Apply",
			"reset": "Reset",
			"review": "Review",
			"approve": "Approve",
			"saved": "Saved successfully",
			"none": "None",
			"required": "Required",
			"clear": "Clear"
		},
		roles: {
			"manager": "System Manager",
			"supervisor": "Supervisor",
			"accountant": "Accountant",
			"rider": "Rider"
		},
		datepicker: {
			"selectDate": "Pick a date",
			"selectRange": "Pick a range",
			"today": "Today",
			"last7": "Last 7 days",
			"last30": "Last 30 days",
			"thisMonth": "This month",
			"prev": "Previous",
			"next": "Next"
		},
		nav: {
			"dashboard": "Dashboard",
			"riders": "Riders",
			"contracts": "Contracts",
			"orders": "Daily Orders",
			"commissions": "Commissions",
			"wallets": "Cash Wallets",
			"vehicles": "Vehicles & Expenses",
			"reports": "Reports",
			"ledger": "General Ledger",
			"purchases": "Purchases & VAT",
			"users": "Users & Permissions",
			"settings": "Settings"
		},
		login: {
			"title": "Welcome back",
			"subtitle": "Sign in to your SwiftAxis workspace",
			"username": "Username",
			"password": "Password",
			"submit": "Sign in",
			"signingIn": "Signing in…",
			"remember": "Keep me signed in",
			"forgot": "Forgot password?",
			"showPassword": "Show password",
			"hidePassword": "Hide password",
			"demoHint": "Demo mode — choose a role to explore",
			"loginAs": "Sign in as",
			"showcaseTitle": "Every rider, every riyal — in motion.",
			"showcaseSubtitle": "The command center for delivery operations across Jeddah — orders, commissions, and cash wallets in one place.",
			"features": {
				"orders": "Live order tracking",
				"ordersDesc": "Follow every delivery as it happens",
				"commissions": "Automated commissions",
				"commissionsDesc": "Fair, transparent rider payouts",
				"wallets": "Cash wallet control",
				"walletsDesc": "Balances reconciled in real time"
			},
			"stat": {
				"orders": "Orders today",
				"onTime": "On-time rate",
				"riders": "Active riders"
			},
			"live": "Live",
			"delivered": "Delivered",
			"min": "min",
			"preview": {
				"title": "Today's performance",
				"topRider": "Top rider"
			}
		},
		dashboard: {
			"welcome": "Welcome, {name}",
			"subtitleManager": "Overview of team performance and commissions",
			"subtitleRider": "Summary of your performance and wallet",
			"kpi": {
				"totalOrders": "Total Orders",
				"commissionsDue": "Commissions Due",
				"activeRiders": "Active Riders",
				"avgOrders": "Avg Orders / Rider",
				"myOrders": "My Orders",
				"myCommission": "Expected Commission",
				"walletBalance": "Wallet Balance",
				"goalProgress": "Goal Progress"
			},
			"trendTitle": "Orders & Commissions Trend",
			"trendOrders": "Orders",
			"trendCommissions": "Commissions (SAR)",
			"ridersTitle": "Rider Performance",
			"topRidersTitle": "Top Riders",
			"compareTitle": "Rider Performance Comparison",
			"alertsTitle": "Alerts",
			"weeklyTitle": "My orders this week",
			"lastMovement": "Last movement",
			"goalReached": "You beat your daily goal! 🎉",
			"table": {
				"rider": "Rider",
				"contract": "Contract",
				"orders": "Orders",
				"progress": "Progress",
				"commission": "Commission",
				"status": "Status"
			},
			"status": {
				"active": "Active",
				"inactive": "Inactive",
				"warning": "Below target"
			},
			"alerts": {
				"walletOver": "{name}'s balance exceeded the limit ({amount} SAR)",
				"lowPerformer": "{name} is below 70% of target",
				"empty": "No current alerts 👍"
			}
		},
		riders: {
			"title": "Riders",
			"subtitle": "Manage delivery riders and link them to contracts",
			"searchPlaceholder": "Search by name or national ID…",
			"filters": {
				"all": "All",
				"contract": "Contract",
				"status": "Status",
				"city": "City"
			},
			"stats": {
				"total": "Total riders",
				"active": "Active",
				"underperforming": "Below target",
				"avgOrders": "Avg orders"
			},
			"actions": {
				"add": "Add rider",
				"export": "Export",
				"edit": "Edit",
				"activate": "Activate",
				"deactivate": "Deactivate"
			},
			"table": {
				"rider": "Rider",
				"contracts": "Contracts",
				"vehicle": "Vehicle",
				"orders": "Orders",
				"commission": "Commission",
				"wallet": "Wallet",
				"status": "Status",
				"actions": "Actions"
			},
			"underTarget": "Below 70% of target",
			"empty": "No riders match your filters",
			"form": {
				"addTitle": "Add a new rider",
				"editTitle": "Edit rider",
				"name": "Full name",
				"namePh": "e.g. Mohammed Al-Ghamdi",
				"nationalId": "National ID",
				"nationalIdPh": "10 digits",
				"nationalIdLocked": "National ID can't be changed after creation",
				"mobile": "Mobile number",
				"mobilePh": "05xxxxxxxx",
				"city": "City",
				"cityPh": "Select a city",
				"vehicle": "Vehicle",
				"vehiclePh": "Pick a vehicle from the fleet",
				"vehicleFree": "Available",
				"contracts": "Contracts",
				"contractsHint": "Link the rider to one or more contracts",
				"activeAccount": "Account active",
				"autoUser": "A login account is created automatically for the rider.",
				"save": "Save rider",
				"cancel": "Cancel",
				"errName": "Please enter the rider's name",
				"errNationalId": "National ID is required",
				"errNationalIdFormat": "National ID must be 10 digits",
				"errDuplicate": "This national ID already exists in the system",
				"errMobile": "Enter a valid mobile (05xxxxxxxx)",
				"errContract": "Select at least one contract"
			}
		},
		contracts: {
			"title": "Contracts",
			"subtitle": "Delivery company contracts and the riders linked to each",
			"empty": "No contracts yet",
			"add": "Add contract",
			"addTitle": "Add a new contract",
			"editTitle": "Edit contract",
			"company": "Company",
			"companyPh": "e.g. Hunger Station",
			"amount": "Contract value (SAR)",
			"start": "Start date",
			"end": "End date",
			"ongoing": "Ongoing",
			"ridersLinked": "Riders",
			"status": "Status",
			"actions": "Actions",
			"save": "Save contract",
			"cancel": "Cancel",
			"errCompany": "Please enter the company name"
		},
		riderDetail: {
			"back": "Back to riders",
			"orders": "Orders (month)",
			"commission": "Commission",
			"baseSalary": "Base salary",
			"target": "Target",
			"chartTitle": "Daily orders",
			"vehicleTitle": "Vehicle details",
			"shift": "Shift",
			"noVehicle": "No vehicle assigned",
			"notFound": "Rider not found"
		},
		users: {
			"title": "Users & Permissions",
			"subtitle": "Manage users, roles and the audit trail",
			"tabs": {
				"users": "Users",
				"roles": "Roles & Access",
				"audit": "Audit Log"
			},
			"add": "Add user",
			"userTitle": "User",
			"name": "Name",
			"role": "Role",
			"mobile": "Mobile",
			"matrix": {
				"page": "Page",
				"hint": "What each role can access (from the access matrix)"
			},
			"audit": {
				"time": "Time",
				"user": "User",
				"action": "Action",
				"entity": "Entity",
				"detail": "Detail",
				"ip": "IP",
				"search": "Search log…",
				"allActions": "All actions",
				"immutable": "Audit entries are read-only"
			},
			"actions": {
				"login": "Login",
				"logout": "Logout",
				"create": "Create",
				"update": "Update",
				"delete": "Delete"
			},
			"errName": "Name is required",
			"saved": "Saved",
			"empty": "No records"
		},
		reports: {
			"title": "Reports",
			"subtitle": "Comprehensive monthly reporting",
			"month": "Month",
			"generate": "Generate report",
			"refNo": "Reference",
			"print": "Download PDF",
			"monthlyTitle": "Monthly Performance Report",
			"signature": "Authorized signature",
			"summary": {
				"title": "Summary",
				"orders": "Total orders",
				"commissions": "Commissions",
				"activeRiders": "Active riders",
				"avgOrders": "Avg orders"
			},
			"ridersTitle": "Rider performance",
			"vehiclesTitle": "Vehicle profitability",
			"pnlTitle": "Financial summary (P&L)",
			"comparisonTitle": "Rider comparison",
			"tabs": {
				"monthly": "Monthly report",
				"period": "Riders period report",
				"best": "Best riders"
			},
			"period": {
				"title": "Riders report for a period",
				"range": "Period",
				"from": "From",
				"to": "To",
				"rider": "Rider",
				"vehicle": "Vehicle",
				"shift": "Shift",
				"days": "Logged days",
				"orders": "Orders",
				"commission": "Commission",
				"vehicleExpenses": "Vehicle expenses",
				"sharedNote": "Vehicle expenses are the full vehicle total; a * marks a vehicle shared by two riders"
			},
			"best": {
				"title": "Best riders of the month",
				"rank": "Rank",
				"extraAmount": "Commission (above target)",
				"achievedSalary": "Achieved salary"
			}
		},
		purchases: {
			"title": "Purchases & VAT",
			"subtitle": "Record purchases, suppliers, and input VAT",
			"tabs": {
				"purchases": "Purchases",
				"suppliers": "Suppliers",
				"vat": "VAT Report",
				"byCenter": "By Cost Center"
			},
			"addPurchase": "Add purchase",
			"purchaseTitle": "Record purchase",
			"addSupplier": "Add supplier",
			"supplierTitle": "Supplier",
			"fields": {
				"supplier": "Supplier",
				"itemType": "Item type",
				"qty": "Qty",
				"unitPrice": "Unit price",
				"date": "Date",
				"inclVat": "Price includes VAT",
				"taxable": "Subject to VAT (15%)",
				"costCenter": "Cost center",
				"invoiceNo": "Invoice no.",
				"preTax": "Pre-tax",
				"vat": "VAT",
				"total": "Total",
				"receipt": "Invoice / receipt",
				"vehicle": "Vehicle",
				"noVehicle": "Not linked to a vehicle",
				"derivedCostCenter": "Cost center (from vehicle)",
				"supplierTaxNo": "Supplier tax no."
			},
			"supplier": {
				"name": "Supplier name",
				"taxNo": "Tax registration no.",
				"mobile": "Mobile",
				"category": "Category",
				"purchases": "Purchases",
				"errTax": "Tax no. must be 15 digits, start & end with 3",
				"errName": "Name is required"
			},
			"vat": {
				"invoice": "Invoice",
				"taxNo": "Tax no.",
				"preTax": "Pre-tax",
				"amount": "VAT",
				"total": "Total VAT"
			},
			"center": {
				"name": "Cost center",
				"budget": "Budget",
				"spent": "Spent",
				"variance": "Variance"
			},
			"saved": "Saved",
			"empty": "No records"
		},
		vehicles: {
			"title": "Vehicles & Expenses",
			"subtitle": "Fleet expenses and per-vehicle profitability",
			"tabs": {
				"vehicles": "Vehicles",
				"expenses": "Expenses",
				"profitability": "Profitability"
			},
			"plate": "Plate",
			"type": "Type",
			"rider": "Riders",
			"riders": {
				"morning": "Morning rider",
				"evening": "Evening rider"
			},
			"statusLabel": "Status",
			"statusFrom": "From",
			"statusTo": "To",
			"errSameRider": "The same rider cannot take both shifts",
			"unassigned": "Unassigned",
			"addVehicle": "Add vehicle",
			"vehicleTitle": "Vehicle",
			"addExpense": "Add expense",
			"expenseTitle": "Vehicle expense",
			"fields": {
				"vehicle": "Vehicle",
				"type": "Expense type",
				"amount": "Amount",
				"date": "Date",
				"invoiceNo": "Invoice no.",
				"note": "Note",
				"receipt": "Receipt",
				"value": "Vehicle value (SAR)"
			},
			"charts": {
				"title": "Expense breakdown",
				"subtitle": "Spot which expense type is inflating costs",
				"granularity": {
					"day": "Daily",
					"month": "Monthly",
					"year": "Yearly"
				},
				"allVehicles": "All vehicles",
				"byType": "Totals by type"
			},
			"prof": {
				"vehicle": "Vehicle",
				"revenue": "Revenue",
				"expenses": "Expenses",
				"net": "Net",
				"margin": "Margin"
			},
			"saved": "Saved",
			"empty": "No records"
		},
		wallets: {
			"title": "Cash Wallets",
			"subtitle": "Track collected cash and handovers per rider",
			"balance": "Balance",
			"over": "Over limit",
			"handover": "Record handover",
			"handoverTitle": "Record cash handover",
			"amount": "Amount",
			"note": "Receipt / signature note",
			"recorded": "Handover recorded",
			"invalidAmount": "Enter a valid amount",
			"statement": "Statement",
			"statementTitle": "Wallet statement — {name}",
			"deposit": "Deposit",
			"handoverType": "Handover",
			"runningBalance": "Balance",
			"type": "Type",
			"allTypes": "All movements",
			"empty": "No wallet movements",
			"searchPlaceholder": "Search rider…"
		},
		commissions: {
			"title": "Commissions",
			"subtitle": "Flexible commission formulas and monthly payout review",
			"tabs": {
				"formulas": "Formulas",
				"monthly": "Monthly Review"
			},
			"formula": {
				"contract": "Contract",
				"target": "Target (orders)",
				"base": "Base salary",
				"perOrder": "Per extra order",
				"riders": "Riders",
				"editTitle": "Edit commission formula",
				"preview": "Live preview",
				"previewHint": "Enter an order count to preview the payout",
				"ordersLabel": "Orders",
				"saved": "Formula updated",
				"tiers": "Tiers",
				"tierUpTo": "Up to (orders)",
				"tierPerOrder": "Per order (SAR)",
				"tierUnlimited": "Unlimited",
				"addTier": "Add tier",
				"removeTier": "Remove tier"
			},
			"monthly": {
				"month": "Month",
				"rider": "Rider",
				"orders": "Orders",
				"base": "Base",
				"extra": "Extra",
				"extraAmount": "Extra amount",
				"total": "Total",
				"locked": "Locked",
				"approve": "Approve & post",
				"approveTitle": "Approve month",
				"approveHint": "This posts a balanced journal entry (Dr Commissions expense / Cr Riders payable) and locks the month.",
				"approved": "Month approved and posted",
				"empty": "No data"
			},
			"history": {
				"title": "Formula change history",
				"empty": "No changes yet"
			}
		},
		orders: {
			"title": "Daily Orders",
			"subtitle": "Log and review riders' daily deliveries",
			"entryTitle": "Log today's orders",
			"myLogs": "My recent logs",
			"allLogs": "Order logs",
			"fields": {
				"date": "Date",
				"orders": "Orders",
				"cash": "Cash collected",
				"hours": "Work hours",
				"notes": "Notes (optional)"
			},
			"preview": {
				"title": "Expected commission",
				"base": "Base",
				"extra": "Extra ({n} orders)",
				"total": "Total"
			},
			"save": "Save log",
			"futureDate": "Can't log a future date",
			"filterRider": "Rider",
			"allRiders": "All riders",
			"edit": "Edit",
			"editTitle": "Edit order log",
			"reason": "Reason for edit",
			"reasonRequired": "A reason is required",
			"outOfWindow": "Outside the allowed edit window",
			"editedBy": "Edited by {name}",
			"import": "Import report",
			"importTitle": "Import orders (Hunger Station)",
			"importHint": "Upload the PDF/Excel report to extract rows",
			"review": "Review extracted rows",
			"conflict": "Conflicts with a manual entry",
			"confirmImport": "Approve import",
			"imported": "{n} rows imported",
			"saved": "Order log saved",
			"empty": "No order logs"
		},
		ledger: {
			"title": "General Ledger",
			"subtitle": "Journal entries, trial balance, P&L and cost centers",
			"tabs": {
				"journal": "Journal",
				"trial": "Trial Balance",
				"pnl": "Profit & Loss",
				"costCenters": "Cost Centers"
			},
			"newEntry": "New entry",
			"ref": "Ref",
			"source": "Source",
			"description": "Description",
			"account": "Account",
			"costCenter": "Cost center",
			"allCenters": "All cost centers",
			"debit": "Debit",
			"credit": "Credit",
			"balance": "Balance",
			"totalDebit": "Total debit",
			"totalCredit": "Total credit",
			"addLine": "Add line",
			"balanced": "Balanced",
			"unbalanced": "Debits must equal credits",
			"entrySaved": "Journal entry posted",
			"vehicleWarning": "Warning: this cost center belongs to vehicle {plate}, which is {status} from {from} to {to} — remember this when allocating month-end costs",
			"vehicleWarningOpenEnded": "Warning: this cost center belongs to vehicle {plate}, which is {status} since {from} — remember this when allocating month-end costs",
			"vehicleWarningNoPeriod": "Warning: this cost center belongs to vehicle {plate}, which is currently {status}",
			"empty": "No entries for this period",
			"pnl": {
				"revenue": "Revenue",
				"expenses": "Expenses",
				"net": "Net profit",
				"totalRevenue": "Total revenue",
				"totalExpense": "Total expenses"
			},
			"cc": {
				"name": "Cost center",
				"budget": "Budget",
				"actual": "Actual",
				"variance": "Variance",
				"add": "Add cost center",
				"addTitle": "Add cost center",
				"editTitle": "Edit cost center",
				"over": "Over budget",
				"errName": "Name is required"
			},
			"form": {
				"addTitle": "New journal entry",
				"save": "Post entry",
				"descriptionPh": "e.g. June commissions"
			}
		},
		settings: {
			"title": "Settings",
			"subtitle": "System configuration",
			"company": "Company name",
			"walletThreshold": "Wallet warning threshold (SAR)",
			"vatRate": "VAT rate (%)",
			"notifications": "Notifications",
			"notifyWhatsapp": "WhatsApp/SMS alerts for wallet limits",
			"notifyLowPerformer": "Alert on under-performing riders",
			"saved": "Settings saved"
		},
		profile: {
			"title": "My Profile",
			"subtitle": "Your account details",
			"name": "Name",
			"role": "Role",
			"mobile": "Mobile",
			"saved": "Profile updated"
		},
		placeholder: {
			"comingSoon": "Coming soon",
			"description": "This page ({title}) will be built in the next phase."
		},
		styleguide: {
			"title": "Design System",
			"colors": "Colors",
			"buttons": "Buttons",
			"badges": "Badges",
			"cards": "Cards"
		}
	};
	//#endregion
	//#region src/i18n.js
	var STORAGE_KEY = "swiftaxis.locale";
	var SUPPORTED_LOCALES = ["ar", "en"];
	var RTL_LOCALES = ["ar"];
	function getStoredLocale() {
		const stored = localStorage.getItem(STORAGE_KEY);
		return SUPPORTED_LOCALES.includes(stored) ? stored : "ar";
	}
	var i18n = createI18n({
		legacy: false,
		globalInjection: true,
		locale: getStoredLocale(),
		fallbackLocale: "en",
		messages: {
			ar: ar_default,
			en: en_default
		}
	});
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/shared/src/utils/hasA11yProp.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var hasA11yProp = (props) => {
		for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
		return false;
	};
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/shared/src/utils/isEmptyString.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var isEmptyString = (value) => value === "";
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/shared/src/utils/mergeClasses.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var mergeClasses = (...classes) => classes.filter((className, index, array) => {
		return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
	}).join(" ").trim();
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/shared/src/utils/toKebabCase.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/shared/src/utils/toCamelCase.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/shared/src/utils/toPascalCase.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var toPascalCase = (string) => {
		const camelCase = toCamelCase(string);
		return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
	};
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/defaultAttributes.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var defaultAttributes = {
		xmlns: "http://www.w3.org/2000/svg",
		width: 24,
		height: 24,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": 2,
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	};
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/Icon.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var Icon = ({ name, iconNode, absoluteStrokeWidth, "absolute-stroke-width": absoluteStrokeWidthKebabCase, strokeWidth, "stroke-width": strokeWidthKebabCase, size = defaultAttributes.width, color = defaultAttributes.stroke, ...props }, { slots }) => {
		return h("svg", {
			...defaultAttributes,
			...props,
			width: size,
			height: size,
			stroke: color,
			"stroke-width": isEmptyString(absoluteStrokeWidth) || isEmptyString(absoluteStrokeWidthKebabCase) || absoluteStrokeWidth === true || absoluteStrokeWidthKebabCase === true ? Number(strokeWidth || strokeWidthKebabCase || defaultAttributes["stroke-width"]) * 24 / Number(size) : strokeWidth || strokeWidthKebabCase || defaultAttributes["stroke-width"],
			class: mergeClasses("lucide", props.class, ...name ? [`lucide-${toKebabCase(toPascalCase(name))}-icon`, `lucide-${toKebabCase(name)}`] : ["lucide-icon"]),
			...!slots.default && !hasA11yProp(props) && { "aria-hidden": "true" }
		}, [...iconNode.map((child) => h(...child)), ...slots.default ? [slots.default()] : []]);
	};
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/createLucideIcon.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var createLucideIcon = (iconName, iconNode) => (props, { slots, attrs }) => h(Icon, {
		...attrs,
		...props,
		iconNode,
		name: iconName
	}, slots);
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/icons/calendar.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var Calendar = createLucideIcon("calendar", [
		["path", {
			d: "M8 2v4",
			key: "1cmpym"
		}],
		["path", {
			d: "M16 2v4",
			key: "4m81vk"
		}],
		["rect", {
			width: "18",
			height: "18",
			x: "3",
			y: "4",
			rx: "2",
			key: "1hopcy"
		}],
		["path", {
			d: "M3 10h18",
			key: "8toen8"
		}]
	]);
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/icons/chevron-left.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var ChevronLeft = createLucideIcon("chevron-left", [["path", {
		d: "m15 18-6-6 6-6",
		key: "1wnfg3"
	}]]);
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/icons/chevron-right.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var ChevronRight = createLucideIcon("chevron-right", [["path", {
		d: "m9 18 6-6-6-6",
		key: "mthhwq"
	}]]);
	//#endregion
	//#region node_modules/lucide-vue-next/dist/esm/icons/x.js
	/**
	* @license lucide-vue-next v1.0.0 - ISC
	*
	* This source code is licensed under the ISC license.
	* See the LICENSE file in the root directory of this source tree.
	*/
	var X = createLucideIcon("x", [["path", {
		d: "M18 6 6 18",
		key: "1bl5f8"
	}], ["path", {
		d: "m6 6 12 12",
		key: "d8bk6v"
	}]]);
	//#endregion
	//#region node_modules/reka-ui/dist/shared/createContext.js
	/**
	* @param providerComponentName - The name(s) of the component(s) providing the context.
	*
	* There are situations where context can come from multiple components. In such cases, you might need to give an array of component names to provide your context, instead of just a single string.
	*
	* @param contextName The description for injection key symbol.
	*/
	function createContext(providerComponentName, contextName) {
		const symbolDescription = typeof providerComponentName === "string" && !contextName ? `${providerComponentName}Context` : contextName;
		const injectionKey = Symbol(symbolDescription);
		/**
		* @param fallback The context value to return if the injection fails.
		*
		* @throws When context injection failed and no fallback is specified.
		* This happens when the component injecting the context is not a child of the root component providing the context.
		*/
		const injectContext = (fallback) => {
			const context = inject(injectionKey, fallback);
			if (context) return context;
			if (context === null) return context;
			throw new Error(`Injection \`${injectionKey.toString()}\` not found. Component must be used within ${Array.isArray(providerComponentName) ? `one of the following components: ${providerComponentName.join(", ")}` : `\`${providerComponentName}\``}`);
		};
		const provideContext = (contextValue) => {
			provide(injectionKey, contextValue);
			return contextValue;
		};
		return [injectContext, provideContext];
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/getActiveElement.js
	function getActiveElement() {
		let activeElement = document.activeElement;
		if (activeElement == null) return null;
		while (activeElement != null && activeElement.shadowRoot != null && activeElement.shadowRoot.activeElement != null) activeElement = activeElement.shadowRoot.activeElement;
		return activeElement;
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/handleAndDispatchCustomEvent.js
	function handleAndDispatchCustomEvent(name, handler, detail) {
		const target = detail.originalEvent.target;
		const event = new CustomEvent(name, {
			bubbles: false,
			cancelable: true,
			detail
		});
		if (handler) target.addEventListener(name, handler, { once: true });
		target.dispatchEvent(event);
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/nullish.js
	function isNullish(value) {
		return value === null || value === void 0;
	}
	//#endregion
	//#region node_modules/@vueuse/shared/dist/index.js
	/**
	* Call onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing
	*
	* @param fn
	*/
	function tryOnScopeDispose(fn, failSilently) {
		if (getCurrentScope()) {
			onScopeDispose(fn, failSilently);
			return true;
		}
		return false;
	}
	/**
	* Keep states in the global scope to be reusable across Vue instances.
	*
	* @see https://vueuse.org/createGlobalState
	* @param stateFactory A factory function to create the state
	*
	* @__NO_SIDE_EFFECTS__
	*/
	function createGlobalState(stateFactory) {
		let initialized = false;
		let state;
		const scope = effectScope(true);
		return ((...args) => {
			if (!initialized) {
				state = scope.run(() => stateFactory(...args));
				initialized = true;
			}
			return state;
		});
	}
	var isClient = typeof window !== "undefined" && typeof document !== "undefined";
	typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
	var isDef = (val) => typeof val !== "undefined";
	var toString = Object.prototype.toString;
	var isObject = (val) => toString.call(val) === "[object Object]";
	var isIOS = /* @__PURE__ */ getIsIOS();
	function getIsIOS() {
		var _window, _window2, _window3;
		return isClient && !!((_window = window) === null || _window === void 0 || (_window = _window.navigator) === null || _window === void 0 ? void 0 : _window.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((_window2 = window) === null || _window2 === void 0 || (_window2 = _window2.navigator) === null || _window2 === void 0 ? void 0 : _window2.maxTouchPoints) > 2 && /iPad|Macintosh/.test((_window3 = window) === null || _window3 === void 0 ? void 0 : _window3.navigator.userAgent));
	}
	function toArray(value) {
		return Array.isArray(value) ? value : [value];
	}
	function getLifeCycleTarget(target) {
		return target || getCurrentInstance();
	}
	/**
	* Make a composable function usable with multiple Vue instances.
	*
	* @see https://vueuse.org/createSharedComposable
	*
	* @__NO_SIDE_EFFECTS__
	*/
	function createSharedComposable(composable) {
		if (!isClient) return composable;
		let subscribers = 0;
		let state;
		let scope;
		const dispose = () => {
			subscribers -= 1;
			if (scope && subscribers <= 0) {
				scope.stop();
				state = void 0;
				scope = void 0;
			}
		};
		return ((...args) => {
			subscribers += 1;
			if (!scope) {
				scope = effectScope(true);
				state = scope.run(() => composable(...args));
			}
			tryOnScopeDispose(dispose);
			return state;
		});
	}
	/**
	* Call onBeforeUnmount() if it's inside a component lifecycle, if not, do nothing
	*
	* @param fn
	* @param target
	*/
	function tryOnBeforeUnmount(fn, target) {
		if (getLifeCycleTarget(target)) onBeforeUnmount(fn, target);
	}
	/**
	* Shorthand for watching value with {immediate: true}
	*
	* @see https://vueuse.org/watchImmediate
	*/
	function watchImmediate(source, cb, options) {
		return watch(source, cb, {
			...options,
			immediate: true
		});
	}
	//#endregion
	//#region node_modules/@vueuse/core/dist/index.js
	var defaultWindow = isClient ? window : void 0;
	isClient && window.document;
	isClient && window.navigator;
	isClient && window.location;
	/**
	* Get the dom element of a ref of element or Vue component instance
	*
	* @param elRef
	*/
	function unrefElement(elRef) {
		var _$el;
		const plain = toValue$1(elRef);
		return (_$el = plain === null || plain === void 0 ? void 0 : plain.$el) !== null && _$el !== void 0 ? _$el : plain;
	}
	function useEventListener(...args) {
		const register = (el, event, listener, options) => {
			el.addEventListener(event, listener, options);
			return () => el.removeEventListener(event, listener, options);
		};
		const firstParamTargets = computed(() => {
			const test = toArray(toValue$1(args[0])).filter((e) => e != null);
			return test.every((e) => typeof e !== "string") ? test : void 0;
		});
		return watchImmediate(() => {
			var _firstParamTargets$va, _firstParamTargets$va2;
			return [
				(_firstParamTargets$va = (_firstParamTargets$va2 = firstParamTargets.value) === null || _firstParamTargets$va2 === void 0 ? void 0 : _firstParamTargets$va2.map((e) => unrefElement(e))) !== null && _firstParamTargets$va !== void 0 ? _firstParamTargets$va : [defaultWindow].filter((e) => e != null),
				toArray(toValue$1(firstParamTargets.value ? args[1] : args[0])),
				toArray(unref(firstParamTargets.value ? args[2] : args[1])),
				toValue$1(firstParamTargets.value ? args[3] : args[2])
			];
		}, ([raw_targets, raw_events, raw_listeners, raw_options], _, onCleanup) => {
			if (!(raw_targets === null || raw_targets === void 0 ? void 0 : raw_targets.length) || !(raw_events === null || raw_events === void 0 ? void 0 : raw_events.length) || !(raw_listeners === null || raw_listeners === void 0 ? void 0 : raw_listeners.length)) return;
			const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options;
			const cleanups = raw_targets.flatMap((el) => raw_events.flatMap((event) => raw_listeners.map((listener) => register(el, event, listener, optionsClone))));
			onCleanup(() => {
				cleanups.forEach((fn) => fn());
			});
		}, { flush: "post" });
	}
	/**
	* Mounted state in ref.
	*
	* @see https://vueuse.org/useMounted
	*
	* @__NO_SIDE_EFFECTS__
	*/
	function useMounted() {
		const isMounted = /* @__PURE__ */ shallowRef(false);
		const instance = getCurrentInstance();
		if (instance) onMounted(() => {
			isMounted.value = true;
		}, instance);
		return isMounted;
	}
	function createKeyPredicate(keyFilter) {
		if (typeof keyFilter === "function") return keyFilter;
		else if (typeof keyFilter === "string") return (event) => event.key === keyFilter;
		else if (Array.isArray(keyFilter)) return (event) => keyFilter.includes(event.key);
		return () => true;
	}
	function onKeyStroke(...args) {
		let key;
		let handler;
		let options = {};
		if (args.length === 3) {
			key = args[0];
			handler = args[1];
			options = args[2];
		} else if (args.length === 2) if (typeof args[1] === "object") {
			key = true;
			handler = args[0];
			options = args[1];
		} else {
			key = args[0];
			handler = args[1];
		}
		else {
			key = true;
			handler = args[0];
		}
		const { target = defaultWindow, eventName = "keydown", passive = false, dedupe = false } = options;
		const predicate = createKeyPredicate(key);
		const listener = (e) => {
			if (e.repeat && toValue$1(dedupe)) return;
			if (predicate(e)) handler(e);
		};
		return useEventListener(target, eventName, listener, passive);
	}
	function cloneFnJSON(source) {
		return JSON.parse(JSON.stringify(source));
	}
	Number.POSITIVE_INFINITY;
	/**
	* Shorthand for v-model binding, props + emit -> ref
	*
	* @see https://vueuse.org/useVModel
	* @param props
	* @param key (default 'modelValue')
	* @param emit
	* @param options
	*
	* @__NO_SIDE_EFFECTS__
	*/
	function useVModel(props, key, emit, options = {}) {
		var _vm$$emit, _vm$proxy;
		const { clone = false, passive = false, eventName, deep = false, defaultValue, shouldEmit } = options;
		const vm = getCurrentInstance();
		const _emit = emit || (vm === null || vm === void 0 ? void 0 : vm.emit) || (vm === null || vm === void 0 || (_vm$$emit = vm.$emit) === null || _vm$$emit === void 0 ? void 0 : _vm$$emit.bind(vm)) || (vm === null || vm === void 0 || (_vm$proxy = vm.proxy) === null || _vm$proxy === void 0 || (_vm$proxy = _vm$proxy.$emit) === null || _vm$proxy === void 0 ? void 0 : _vm$proxy.bind(vm === null || vm === void 0 ? void 0 : vm.proxy));
		let event = eventName;
		if (!key) key = "modelValue";
		event = event || `update:${key.toString()}`;
		const cloneFn = (val) => !clone ? val : typeof clone === "function" ? clone(val) : cloneFnJSON(val);
		const getValue = () => isDef(props[key]) ? cloneFn(props[key]) : defaultValue;
		const triggerEmit = (value) => {
			if (shouldEmit) {
				if (shouldEmit(value)) _emit(event, value);
			} else _emit(event, value);
		};
		if (passive) {
			const proxy = /* @__PURE__ */ ref(getValue());
			let isUpdating = false;
			watch(() => props[key], (v) => {
				if (!isUpdating) {
					isUpdating = true;
					proxy.value = cloneFn(v);
					nextTick(() => isUpdating = false);
				}
			});
			watch(proxy, (v) => {
				if (!isUpdating && (v !== props[key] || deep)) triggerEmit(v);
			}, { deep });
			return proxy;
		} else return computed({
			get() {
				return getValue();
			},
			set(value) {
				triggerEmit(value);
			}
		});
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/renderSlotFragments.js
	function renderSlotFragments(children) {
		if (!children) return [];
		return children.flatMap((child) => {
			if (child.type === Fragment) return renderSlotFragments(child.children);
			return [child];
		});
	}
	//#endregion
	//#region node_modules/reka-ui/dist/ConfigProvider/ConfigProvider.js
	var [injectConfigProviderContext, provideConfigProviderContext] = /*#__PURE__*/ createContext("ConfigProvider");
	//#endregion
	//#region node_modules/defu/dist/defu.mjs
	function isPlainObject(value) {
		if (value === null || typeof value !== "object") return false;
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) return false;
		if (Symbol.iterator in value) return false;
		if (Symbol.toStringTag in value) return Object.prototype.toString.call(value) === "[object Module]";
		return true;
	}
	function _defu(baseObject, defaults, namespace = ".", merger) {
		if (!isPlainObject(defaults)) return _defu(baseObject, {}, namespace, merger);
		const object = { ...defaults };
		for (const key of Object.keys(baseObject)) {
			if (key === "__proto__" || key === "constructor") continue;
			const value = baseObject[key];
			if (value === null || value === void 0) continue;
			if (merger && merger(object, key, value, namespace)) continue;
			if (Array.isArray(value) && Array.isArray(object[key])) object[key] = [...value, ...object[key]];
			else if (isPlainObject(value) && isPlainObject(object[key])) object[key] = _defu(value, object[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
			else object[key] = value;
		}
		return object;
	}
	function createDefu(merger) {
		return (...arguments_) => arguments_.reduce((p, c) => _defu(p, c, "", merger), {});
	}
	var defu = createDefu();
	//#endregion
	//#region node_modules/reka-ui/dist/shared/useBodyScrollLock.js
	var useBodyLockStackCount = createSharedComposable(() => {
		const map = /* @__PURE__ */ ref(/* @__PURE__ */ new Map());
		const initialOverflow = /* @__PURE__ */ ref();
		const locked = computed(() => {
			for (const value of map.value.values()) if (value) return true;
			return false;
		});
		const context = injectConfigProviderContext({ scrollBody: /* @__PURE__ */ ref(true) });
		let stopTouchMoveListener = null;
		const resetBodyStyle = () => {
			document.body.style.paddingRight = "";
			document.body.style.marginRight = "";
			document.body.style.pointerEvents = "";
			document.documentElement.style.removeProperty("--scrollbar-width");
			document.body.style.overflow = initialOverflow.value ?? "";
			isIOS && stopTouchMoveListener?.();
			initialOverflow.value = void 0;
		};
		watch(locked, (val, oldVal) => {
			if (!isClient) return;
			if (!val) {
				if (oldVal) resetBodyStyle();
				return;
			}
			if (initialOverflow.value === void 0) initialOverflow.value = document.body.style.overflow;
			const verticalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
			const defaultConfig = {
				padding: verticalScrollbarWidth,
				margin: 0
			};
			const config = context.scrollBody?.value ? typeof context.scrollBody.value === "object" ? defu({
				padding: context.scrollBody.value.padding === true ? verticalScrollbarWidth : context.scrollBody.value.padding,
				margin: context.scrollBody.value.margin === true ? verticalScrollbarWidth : context.scrollBody.value.margin
			}, defaultConfig) : defaultConfig : {
				padding: 0,
				margin: 0
			};
			if (verticalScrollbarWidth > 0) {
				document.body.style.paddingRight = typeof config.padding === "number" ? `${config.padding}px` : String(config.padding);
				document.body.style.marginRight = typeof config.margin === "number" ? `${config.margin}px` : String(config.margin);
				document.documentElement.style.setProperty("--scrollbar-width", `${verticalScrollbarWidth}px`);
				document.body.style.overflow = "hidden";
			}
			if (isIOS) stopTouchMoveListener = useEventListener(document, "touchmove", (e) => preventDefault(e), { passive: false });
			nextTick(() => {
				if (!locked.value) return;
				document.body.style.pointerEvents = "none";
				document.body.style.overflow = "hidden";
			});
		}, {
			immediate: true,
			flush: "sync"
		});
		return map;
	});
	function useBodyScrollLock(initialState) {
		const id = Math.random().toString(36).substring(2, 7);
		const map = useBodyLockStackCount();
		map.value.set(id, initialState ?? false);
		const locked = computed({
			get: () => map.value.get(id) ?? false,
			set: (value) => map.value.set(id, value)
		});
		tryOnBeforeUnmount(() => {
			map.value.delete(id);
		});
		return locked;
	}
	function checkOverflowScroll(ele) {
		const style = window.getComputedStyle(ele);
		if (style.overflowX === "scroll" || style.overflowY === "scroll" || style.overflowX === "auto" && ele.clientWidth < ele.scrollWidth || style.overflowY === "auto" && ele.clientHeight < ele.scrollHeight) return true;
		else {
			const parent = ele.parentNode;
			if (!(parent instanceof Element) || parent.tagName === "BODY") return false;
			return checkOverflowScroll(parent);
		}
	}
	function preventDefault(rawEvent) {
		const e = rawEvent || window.event;
		const _target = e.target;
		if (_target instanceof Element && checkOverflowScroll(_target)) return false;
		if (e.touches.length > 1) return true;
		if (e.preventDefault && e.cancelable) e.preventDefault();
		return false;
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/useEmitAsProps.js
	/**
	* The `useEmitAsProps` function is a TypeScript utility that converts emitted events into props for a
	* Vue component.
	*
	* @template Name - The event name string union type.
	* @template Fn - The emit function type.
	*
	* @param emit - The `emit` parameter is a function that is used to emit events from a component. It
	*
	* takes two parameters: `name` which is the name of the event to be emitted, and `...args` which are
	* the arguments to be passed along with the event.
	* @returns The function `useEmitAsProps` returns an object that maps event names to functions that
	* call the `emit` function with the corresponding event name and arguments.
	*/
	function useEmitAsProps(emit) {
		const vm = getCurrentInstance();
		const events = vm?.type.emits;
		const result = {};
		if (!events?.length) console.warn(`No emitted event found. Please check component: ${vm?.type.__name}`);
		events?.forEach((ev) => {
			result[toHandlerKey(camelize$1(ev))] = (...arg) => emit(ev, ...arg);
		});
		return result;
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/useForwardExpose.js
	function useForwardExpose() {
		const instance = getCurrentInstance();
		const currentRef = /* @__PURE__ */ ref();
		const currentElement = computed(() => resolveCurrentElement());
		onUpdated(() => {
			if (currentElement.value !== resolveCurrentElement()) triggerRef(currentRef);
		});
		function resolveCurrentElement() {
			return currentRef.value && "$el" in currentRef.value && ["#text", "#comment"].includes(currentRef.value.$el.nodeName) ? currentRef.value.$el.nextElementSibling : unrefElement(currentRef);
		}
		const localExpose = Object.assign({}, instance.exposed);
		const ret = {};
		for (const key in instance.props) Object.defineProperty(ret, key, {
			enumerable: true,
			configurable: true,
			get: () => instance.props[key]
		});
		if (Object.keys(localExpose).length > 0) for (const key in localExpose) Object.defineProperty(ret, key, {
			enumerable: true,
			configurable: true,
			get: () => localExpose[key]
		});
		Object.defineProperty(ret, "$el", {
			enumerable: true,
			configurable: true,
			get: () => instance.vnode.el
		});
		instance.exposed = ret;
		function forwardRef(ref$1) {
			currentRef.value = ref$1;
			if (!ref$1) return;
			Object.defineProperty(ret, "$el", {
				enumerable: true,
				configurable: true,
				get: () => ref$1 instanceof Element ? ref$1 : ref$1.$el
			});
			if (!(ref$1 instanceof Element) && !Object.hasOwn(ref$1, "$el")) {
				const childExposed = ref$1.$.exposed;
				const merged = Object.assign({}, ret);
				for (const key in childExposed) Object.defineProperty(merged, key, {
					enumerable: true,
					configurable: true,
					get: () => childExposed[key]
				});
				instance.exposed = merged;
			}
		}
		return {
			forwardRef,
			currentRef,
			currentElement
		};
	}
	//#endregion
	//#region node_modules/aria-hidden/dist/es2015/index.js
	var getDefaultParent = function(originalTarget) {
		if (typeof document === "undefined") return null;
		return (Array.isArray(originalTarget) ? originalTarget[0] : originalTarget).ownerDocument.body;
	};
	var counterMap = /* @__PURE__ */ new WeakMap();
	var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
	var markerMap = {};
	var lockCount = 0;
	var unwrapHost = function(node) {
		return node && (node.host || unwrapHost(node.parentNode));
	};
	var correctTargets = function(parent, targets) {
		return targets.map(function(target) {
			if (parent.contains(target)) return target;
			var correctedTarget = unwrapHost(target);
			if (correctedTarget && parent.contains(correctedTarget)) return correctedTarget;
			console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
			return null;
		}).filter(function(x) {
			return Boolean(x);
		});
	};
	/**
	* Marks everything except given node(or nodes) as aria-hidden
	* @param {Element | Element[]} originalTarget - elements to keep on the page
	* @param [parentNode] - top element, defaults to document.body
	* @param {String} [markerName] - a special attribute to mark every node
	* @param {String} [controlAttribute] - html Attribute to control
	* @return {Undo} undo command
	*/
	var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
		var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
		if (!markerMap[markerName]) markerMap[markerName] = /* @__PURE__ */ new WeakMap();
		var markerCounter = markerMap[markerName];
		var hiddenNodes = [];
		var elementsToKeep = /* @__PURE__ */ new Set();
		var elementsToStop = new Set(targets);
		var keep = function(el) {
			if (!el || elementsToKeep.has(el)) return;
			elementsToKeep.add(el);
			keep(el.parentNode);
		};
		targets.forEach(keep);
		var deep = function(parent) {
			if (!parent || elementsToStop.has(parent)) return;
			Array.prototype.forEach.call(parent.children, function(node) {
				if (elementsToKeep.has(node)) deep(node);
				else try {
					var attr = node.getAttribute(controlAttribute);
					var alreadyHidden = attr !== null && attr !== "false";
					var counterValue = (counterMap.get(node) || 0) + 1;
					var markerValue = (markerCounter.get(node) || 0) + 1;
					counterMap.set(node, counterValue);
					markerCounter.set(node, markerValue);
					hiddenNodes.push(node);
					if (counterValue === 1 && alreadyHidden) uncontrolledNodes.set(node, true);
					if (markerValue === 1) node.setAttribute(markerName, "true");
					if (!alreadyHidden) node.setAttribute(controlAttribute, "true");
				} catch (e) {
					console.error("aria-hidden: cannot operate on ", node, e);
				}
			});
		};
		deep(parentNode);
		elementsToKeep.clear();
		lockCount++;
		return function() {
			hiddenNodes.forEach(function(node) {
				var counterValue = counterMap.get(node) - 1;
				var markerValue = markerCounter.get(node) - 1;
				counterMap.set(node, counterValue);
				markerCounter.set(node, markerValue);
				if (!counterValue) {
					if (!uncontrolledNodes.has(node)) node.removeAttribute(controlAttribute);
					uncontrolledNodes.delete(node);
				}
				if (!markerValue) node.removeAttribute(markerName);
			});
			lockCount--;
			if (!lockCount) {
				counterMap = /* @__PURE__ */ new WeakMap();
				counterMap = /* @__PURE__ */ new WeakMap();
				uncontrolledNodes = /* @__PURE__ */ new WeakMap();
				markerMap = {};
			}
		};
	};
	/**
	* Marks everything except given node(or nodes) as aria-hidden
	* @param {Element | Element[]} originalTarget - elements to keep on the page
	* @param [parentNode] - top element, defaults to document.body
	* @param {String} [markerName] - a special attribute to mark every node
	* @return {Undo} undo command
	*/
	var hideOthers = function(originalTarget, parentNode, markerName) {
		if (markerName === void 0) markerName = "data-aria-hidden";
		var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
		var activeParentNode = parentNode || getDefaultParent(originalTarget);
		if (!activeParentNode) return function() {
			return null;
		};
		targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
		return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
	};
	//#endregion
	//#region node_modules/reka-ui/dist/shared/useHideOthers.js
	/**
	* The `useHideOthers` function is a TypeScript function that takes a target element reference and
	* hides all other elements in ARIA when the target element is present, and restores the visibility of the
	* hidden elements when the target element is removed.
	* @param {MaybeElementRef} target - The `target` parameter is a reference to the element that you want
	* to hide other elements when it is clicked or focused.
	*/
	function useHideOthers(target) {
		let undo;
		watch(() => unrefElement(target), (el) => {
			let isInsideClosedPopover = false;
			try {
				isInsideClosedPopover = !!el?.closest("[popover]:not(:popover-open)");
			} catch {}
			if (el && !isInsideClosedPopover) undo = hideOthers(el);
			else if (undo) undo();
		});
		onUnmounted(() => {
			if (undo) undo();
		});
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/useId.js
	var count = 0;
	/**
	* The `useId` function generates a unique identifier using a provided deterministic ID,
	* a configured `<ConfigProvider>` ID source, Vue's native `useId`, or a fallback counter.
	* @param {string | null | undefined} [deterministicId] - The `useId` function you provided takes an
	* optional parameter `deterministicId`, which can be a string, null, or undefined. If
	* `deterministicId` is provided, the function will return it. Otherwise, it will generate an id using
	* the configured ID source.
	*/
	function useId(deterministicId, prefix = "reka") {
		if (deterministicId) return deterministicId;
		let id;
		const configProviderContext = injectConfigProviderContext({ useId: void 0 });
		if (configProviderContext.useId) id = configProviderContext.useId();
		else if ("useId" in vue_runtime_esm_bundler_exports) id = useId$1?.();
		else id = `${++count}`;
		return prefix ? `${prefix}-${id}` : id;
	}
	//#endregion
	//#region node_modules/reka-ui/dist/shared/useStateMachine.js
	/**
	* The `useStateMachine` function is a TypeScript function that creates a state machine and returns the
	* current state and a dispatch function to update the state based on events.
	* @param initialState - The `initialState` parameter is the initial state of the state machine. It
	* represents the starting point of the state machine's state.
	* @param machine - The `machine` parameter is an object that represents a state machine. It should
	* have keys that correspond to the possible states of the machine, and the values should be objects
	* that represent the possible events and their corresponding next states.
	* @returns The `useStateMachine` function returns an object with two properties: `state` and
	* `dispatch`.
	*/
	function useStateMachine(initialState, machine) {
		const state = /* @__PURE__ */ ref(initialState);
		function reducer(event) {
			return machine[state.value][event] ?? state.value;
		}
		const dispatch = (event) => {
			state.value = reducer(event);
		};
		return {
			state,
			dispatch
		};
	}
	//#endregion
	//#region node_modules/reka-ui/dist/Presence/usePresence.js
	function usePresence(present, node) {
		const stylesRef = /* @__PURE__ */ ref({});
		const prevAnimationNameRef = /* @__PURE__ */ ref("none");
		const prevPresentRef = /* @__PURE__ */ ref(present);
		const initialState = present.value ? "mounted" : "unmounted";
		let timeoutId;
		const ownerWindow = node.value?.ownerDocument.defaultView ?? defaultWindow;
		const { state, dispatch } = useStateMachine(initialState, {
			mounted: {
				UNMOUNT: "unmounted",
				ANIMATION_OUT: "unmountSuspended"
			},
			unmountSuspended: {
				MOUNT: "mounted",
				ANIMATION_END: "unmounted"
			},
			unmounted: { MOUNT: "mounted" }
		});
		const dispatchCustomEvent = (name) => {
			if (isClient) {
				const customEvent = new CustomEvent(name, {
					bubbles: false,
					cancelable: false
				});
				node.value?.dispatchEvent(customEvent);
			}
		};
		watch(present, async (currentPresent, prevPresent) => {
			const hasPresentChanged = prevPresent !== currentPresent;
			await nextTick();
			if (hasPresentChanged) {
				const prevAnimationName = prevAnimationNameRef.value;
				const currentAnimationName = getAnimationName(node.value);
				if (currentPresent) {
					dispatch("MOUNT");
					dispatchCustomEvent("enter");
					if (currentAnimationName === "none") dispatchCustomEvent("after-enter");
				} else if (currentAnimationName === "none" || currentAnimationName === "undefined" || stylesRef.value?.display === "none") {
					dispatch("UNMOUNT");
					dispatchCustomEvent("leave");
					dispatchCustomEvent("after-leave");
				} else if (prevPresent && prevAnimationName !== currentAnimationName) {
					dispatch("ANIMATION_OUT");
					dispatchCustomEvent("leave");
				} else {
					dispatch("UNMOUNT");
					dispatchCustomEvent("after-leave");
				}
			}
		}, { immediate: true });
		/**
		* Triggering an ANIMATION_OUT during an ANIMATION_IN will fire an `animationcancel`
		* event for ANIMATION_IN after we have entered `unmountSuspended` state. So, we
		* make sure we only trigger ANIMATION_END for the currently active animation.
		*/
		const handleAnimationEnd = (event) => {
			const currentAnimationName = getAnimationName(node.value);
			const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
			const directionName = state.value === "mounted" ? "enter" : "leave";
			if (event.target === node.value && isCurrentAnimation) {
				dispatchCustomEvent(`after-${directionName}`);
				dispatch("ANIMATION_END");
				if (!prevPresentRef.value) {
					const currentFillMode = node.value.style.animationFillMode;
					node.value.style.animationFillMode = "forwards";
					timeoutId = ownerWindow?.setTimeout(() => {
						if (node.value?.style.animationFillMode === "forwards") node.value.style.animationFillMode = currentFillMode;
					});
				}
			}
			if (event.target === node.value && currentAnimationName === "none") dispatch("ANIMATION_END");
		};
		const handleAnimationStart = (event) => {
			if (event.target === node.value) prevAnimationNameRef.value = getAnimationName(node.value);
		};
		const watcher = watch(node, (newNode, oldNode) => {
			if (newNode) {
				stylesRef.value = getComputedStyle(newNode);
				newNode.addEventListener("animationstart", handleAnimationStart);
				newNode.addEventListener("animationcancel", handleAnimationEnd);
				newNode.addEventListener("animationend", handleAnimationEnd);
			} else {
				dispatch("ANIMATION_END");
				if (timeoutId !== void 0) ownerWindow?.clearTimeout(timeoutId);
				oldNode?.removeEventListener("animationstart", handleAnimationStart);
				oldNode?.removeEventListener("animationcancel", handleAnimationEnd);
				oldNode?.removeEventListener("animationend", handleAnimationEnd);
			}
		}, { immediate: true });
		const stateWatcher = watch(state, () => {
			const currentAnimationName = getAnimationName(node.value);
			prevAnimationNameRef.value = state.value === "mounted" ? currentAnimationName : "none";
		});
		onUnmounted(() => {
			watcher();
			stateWatcher();
			if (node.value) {
				node.value.removeEventListener("animationstart", handleAnimationStart);
				node.value.removeEventListener("animationcancel", handleAnimationEnd);
				node.value.removeEventListener("animationend", handleAnimationEnd);
			}
			if (timeoutId !== void 0) ownerWindow?.clearTimeout(timeoutId);
		});
		return { isPresent: computed(() => ["mounted", "unmountSuspended"].includes(state.value)) };
	}
	function getAnimationName(node) {
		return node ? getComputedStyle(node).animationName || "none" : "none";
	}
	//#endregion
	//#region node_modules/reka-ui/dist/Presence/Presence.js
	var Presence_default = /*#__PURE__*/ defineComponent({
		name: "Presence",
		props: {
			present: {
				type: Boolean,
				required: true
			},
			forceMount: { type: Boolean }
		},
		slots: {},
		setup(props, { slots, expose }) {
			const { present, forceMount } = /* @__PURE__ */ toRefs(props);
			const node = /* @__PURE__ */ ref();
			const { isPresent } = usePresence(present, node);
			expose({ present: isPresent });
			let children = slots.default({ present: isPresent.value });
			children = renderSlotFragments(children || []);
			const instance = getCurrentInstance();
			if (children && children?.length > 1) {
				const componentName = instance?.parent?.type.name ? `<${instance.parent.type.name} />` : "component";
				throw new Error([
					`Detected an invalid children for \`${componentName}\` for  \`Presence\` component.`,
					"",
					"Note: Presence works similarly to `v-if` directly, but it waits for animation/transition to finished before unmounting. So it expect only one direct child of valid VNode type.",
					"You can apply a few solutions:",
					["Provide a single child element so that `presence` directive attach correctly.", "Ensure the first child is an actual element instead of a raw text node or comment node."].map((line) => `  - ${line}`).join("\n")
				].join("\n"));
			}
			return () => {
				if (forceMount.value || present.value || isPresent.value) return h(slots.default({ present: isPresent.value })[0], { ref: (v) => {
					const el = unrefElement(v);
					if (typeof el?.hasAttribute === "undefined") return el;
					if (el?.hasAttribute("data-reka-popper-content-wrapper")) node.value = el.firstElementChild;
					else node.value = el;
					return el;
				} });
				else return null;
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Primitive/Slot.js
	var Slot = /*#__PURE__*/ defineComponent({
		name: "PrimitiveSlot",
		inheritAttrs: false,
		setup(_, { attrs, slots }) {
			return () => {
				if (!slots.default) return null;
				const children = renderSlotFragments(slots.default());
				const firstNonCommentChildrenIndex = children.findIndex((child) => child.type !== Comment);
				if (firstNonCommentChildrenIndex === -1) return children;
				const firstNonCommentChildren = children[firstNonCommentChildrenIndex];
				delete firstNonCommentChildren.props?.ref;
				const mergedProps = firstNonCommentChildren.props ? mergeProps(attrs, firstNonCommentChildren.props) : attrs;
				const cloned = cloneVNode({
					...firstNonCommentChildren,
					props: {}
				}, mergedProps);
				if (children.length === 1) return cloned;
				children[firstNonCommentChildrenIndex] = cloned;
				return children;
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Primitive/Primitive.js
	var SELF_CLOSING_TAGS = [
		"area",
		"img",
		"input"
	];
	var Primitive = /*#__PURE__*/ defineComponent({
		name: "Primitive",
		inheritAttrs: false,
		props: {
			asChild: {
				type: Boolean,
				default: false
			},
			as: {
				type: [String, Object],
				default: "div"
			}
		},
		setup(props, { attrs, slots }) {
			const asTag = props.asChild ? "template" : props.as;
			if (typeof asTag === "string" && SELF_CLOSING_TAGS.includes(asTag)) return () => h(asTag, attrs);
			if (asTag !== "template") return () => h(props.as, attrs, { default: slots.default });
			return () => h(Slot, attrs, { default: slots.default });
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogRoot.js
	var [injectDialogRootContext, provideDialogRootContext] = /*#__PURE__*/ createContext("DialogRoot");
	var DialogRoot_default = /* @__PURE__ */ defineComponent({
		inheritAttrs: false,
		__name: "DialogRoot",
		props: {
			open: {
				type: Boolean,
				required: false,
				default: void 0
			},
			defaultOpen: {
				type: Boolean,
				required: false,
				default: false
			},
			modal: {
				type: Boolean,
				required: false,
				default: true
			},
			unmountOnHide: {
				type: Boolean,
				required: false,
				default: true
			}
		},
		emits: ["update:open"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const open = useVModel(props, "open", __emit, {
				defaultValue: props.defaultOpen,
				passive: props.open === void 0
			});
			const triggerElement = /* @__PURE__ */ ref();
			const contentElement = /* @__PURE__ */ ref();
			const { modal, unmountOnHide } = /* @__PURE__ */ toRefs(props);
			provideDialogRootContext({
				open,
				modal,
				unmountOnHide,
				openModal: () => {
					open.value = true;
				},
				onOpenChange: (value) => {
					open.value = value;
				},
				onOpenToggle: () => {
					open.value = !open.value;
				},
				contentId: "",
				titleId: "",
				descriptionId: "",
				triggerElement,
				contentElement
			});
			return (_ctx, _cache) => {
				return renderSlot(_ctx.$slots, "default", {
					open: unref(open),
					close: () => open.value = false
				});
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogClose.js
	var DialogClose_default = /* @__PURE__ */ defineComponent({
		__name: "DialogClose",
		props: {
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false,
				default: "button"
			}
		},
		setup(__props) {
			const props = __props;
			useForwardExpose();
			const rootContext = injectDialogRootContext();
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Primitive), mergeProps(props, {
					type: _ctx.as === "button" ? "button" : void 0,
					onClick: _cache[0] || (_cache[0] = ($event) => unref(rootContext).onOpenChange(false))
				}), {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 16, ["type"]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/DismissableLayer/utils.js
	var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
	var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
	function isLayerExist(layerElement, targetElement) {
		if (!(targetElement instanceof Element)) return false;
		const targetLayer = targetElement.closest("[data-dismissable-layer]");
		const mainLayer = layerElement.dataset.dismissableLayer === "" ? layerElement : layerElement.querySelector("[data-dismissable-layer]");
		const nodeList = Array.from(layerElement.ownerDocument.querySelectorAll("[data-dismissable-layer]"));
		if (targetLayer && (mainLayer === targetLayer || nodeList.indexOf(mainLayer) < nodeList.indexOf(targetLayer))) return true;
		else return false;
	}
	/**
	* Listens for `pointerdown` outside a DOM subtree. We use `pointerdown` rather than `pointerup`
	* to mimic layer dismissing behaviour present in OS.
	* Returns props to pass to the node we want to check for outside events.
	*/
	function usePointerDownOutside(onPointerDownOutside, element, enabled = true) {
		const ownerDocument = element?.value?.ownerDocument ?? globalThis?.document;
		const isPointerInsideDOMTree = /* @__PURE__ */ ref(false);
		const handleClickRef = /* @__PURE__ */ ref(() => {});
		watchEffect((cleanupFn) => {
			if (!isClient || !toValue$1(enabled)) return;
			const handlePointerDown = async (event) => {
				const target = event.target;
				if (!element?.value || !target) return;
				if (isLayerExist(element.value, target)) {
					isPointerInsideDOMTree.value = false;
					return;
				}
				if (event.target && !isPointerInsideDOMTree.value) {
					const eventDetail = { originalEvent: event };
					function handleAndDispatchPointerDownOutsideEvent() {
						handleAndDispatchCustomEvent(POINTER_DOWN_OUTSIDE, onPointerDownOutside, eventDetail);
					}
					/**
					* On touch devices, we need to wait for a click event because browsers implement
					* a ~350ms delay between the time the user stops touching the display and when the
					* browser executes events. We need to ensure we don't reactivate pointer-events within
					* this timeframe otherwise the browser may execute events that should have been prevented.
					*
					* Additionally, this also lets us deal automatically with cancellations when a click event
					* isn't raised because the page was considered scrolled/drag-scrolled, long-pressed, etc.
					*
					* This is why we also continuously remove the previous listener, because we cannot be
					* certain that it was raised, and therefore cleaned-up.
					*/
					if (event.pointerType === "touch") {
						ownerDocument.removeEventListener("click", handleClickRef.value);
						handleClickRef.value = handleAndDispatchPointerDownOutsideEvent;
						ownerDocument.addEventListener("click", handleClickRef.value, { once: true });
					} else handleAndDispatchPointerDownOutsideEvent();
				} else ownerDocument.removeEventListener("click", handleClickRef.value);
				isPointerInsideDOMTree.value = false;
			};
			/**
			* if this hook executes in a component that mounts via a `pointerdown` event, the event
			* would bubble up to the document and trigger a `pointerDownOutside` event. We avoid
			* this by delaying the event listener registration on the document.
			* This is how the DOM works, ie:
			* ```
			* button.addEventListener('pointerdown', () => {
			*   console.log('I will log');
			*   document.addEventListener('pointerdown', () => {
			*     console.log('I will also log');
			*   })
			* });
			*/
			const timerId = window.setTimeout(() => {
				ownerDocument.addEventListener("pointerdown", handlePointerDown);
			}, 0);
			cleanupFn(() => {
				window.clearTimeout(timerId);
				ownerDocument.removeEventListener("pointerdown", handlePointerDown);
				ownerDocument.removeEventListener("click", handleClickRef.value);
			});
		});
		return { onPointerDownCapture: () => {
			if (!toValue$1(enabled)) return;
			isPointerInsideDOMTree.value = true;
		} };
	}
	/**
	* Listens for when focus happens outside a DOM subtree.
	* Returns props to pass to the root (node) of the subtree we want to check.
	*/
	function useFocusOutside(onFocusOutside, element, enabled = true) {
		const ownerDocument = element?.value?.ownerDocument ?? globalThis?.document;
		const isFocusInsideDOMTree = /* @__PURE__ */ ref(false);
		watchEffect((cleanupFn) => {
			if (!isClient || !toValue$1(enabled)) return;
			const handleFocus = async (event) => {
				if (!element?.value) return;
				await nextTick();
				await nextTick();
				const target = event.target;
				if (!element.value || !target || isLayerExist(element.value, target)) return;
				if (event.target && !isFocusInsideDOMTree.value) handleAndDispatchCustomEvent(FOCUS_OUTSIDE, onFocusOutside, { originalEvent: event });
			};
			ownerDocument.addEventListener("focusin", handleFocus);
			cleanupFn(() => ownerDocument.removeEventListener("focusin", handleFocus));
		});
		return {
			onFocusCapture: () => {
				if (!toValue$1(enabled)) return;
				isFocusInsideDOMTree.value = true;
			},
			onBlurCapture: () => {
				if (!toValue$1(enabled)) return;
				isFocusInsideDOMTree.value = false;
			}
		};
	}
	//#endregion
	//#region node_modules/reka-ui/dist/DismissableLayer/DismissableLayer.js
	var context = /*#__PURE__*/ reactive({
		layersRoot: /* @__PURE__ */ new Set(),
		layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
		originalBodyPointerEvents: void 0,
		branches: /* @__PURE__ */ new Set()
	});
	var DismissableLayer_default = /* @__PURE__ */ defineComponent({
		__name: "DismissableLayer",
		props: {
			disableOutsidePointerEvents: {
				type: Boolean,
				required: false,
				default: false
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			},
			present: {
				type: Boolean,
				required: false,
				default: true
			}
		},
		emits: [
			"escapeKeyDown",
			"pointerDownOutside",
			"focusOutside",
			"interactOutside",
			"dismiss"
		],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emits = __emit;
			const { forwardRef, currentElement: layerElement } = useForwardExpose();
			const ownerDocument = computed(() => layerElement.value?.ownerDocument ?? globalThis.document);
			const layers = computed(() => context.layersRoot);
			const index = computed(() => {
				return layerElement.value ? Array.from(layers.value).indexOf(layerElement.value) : -1;
			});
			const isBodyPointerEventsDisabled = computed(() => {
				return context.layersWithOutsidePointerEventsDisabled.size > 0;
			});
			const isPointerEventsEnabled = computed(() => {
				const localLayers = Array.from(layers.value);
				const [highestLayerWithOutsidePointerEventsDisabled] = [...context.layersWithOutsidePointerEventsDisabled].slice(-1);
				const highestLayerWithOutsidePointerEventsDisabledIndex = localLayers.indexOf(highestLayerWithOutsidePointerEventsDisabled);
				return index.value >= highestLayerWithOutsidePointerEventsDisabledIndex;
			});
			const pointerDownOutside = usePointerDownOutside(async (event) => {
				const isPointerDownOnBranch = [...context.branches].some((branch) => branch?.contains(event.target));
				if (!props.present || !isPointerEventsEnabled.value || isPointerDownOnBranch) return;
				emits("pointerDownOutside", event);
				emits("interactOutside", event);
				await nextTick();
				if (!event.defaultPrevented) emits("dismiss");
			}, layerElement);
			const focusOutside = useFocusOutside((event) => {
				const isFocusInBranch = [...context.branches].some((branch) => branch?.contains(event.target));
				if (!props.present || isFocusInBranch) return;
				emits("focusOutside", event);
				emits("interactOutside", event);
				if (!event.defaultPrevented) emits("dismiss");
			}, layerElement);
			onKeyStroke("Escape", (event) => {
				if (!props.present) return;
				if (!(index.value === layers.value.size - 1)) return;
				emits("escapeKeyDown", event);
				if (!event.defaultPrevented) emits("dismiss");
			});
			watch([
				layerElement,
				() => props.disableOutsidePointerEvents,
				() => props.present
			], ([element, disableOutsidePointerEvents, present], _, onCleanup) => {
				if (!element || !present) return;
				if (disableOutsidePointerEvents) {
					if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
						context.originalBodyPointerEvents = ownerDocument.value.body.style.pointerEvents;
						ownerDocument.value.body.style.pointerEvents = "none";
					}
					context.layersWithOutsidePointerEventsDisabled.add(element);
					onCleanup(() => {
						context.layersWithOutsidePointerEventsDisabled.delete(element);
						if (context.layersWithOutsidePointerEventsDisabled.size === 0 && !isNullish(context.originalBodyPointerEvents)) ownerDocument.value.body.style.pointerEvents = context.originalBodyPointerEvents;
					});
				}
			}, { immediate: true });
			watch([layerElement, () => props.present], ([element, present], _, onCleanup) => {
				if (!element || !present) return;
				layers.value.add(element);
				onCleanup(() => {
					layers.value.delete(element);
				});
			}, { immediate: true });
			watchEffect((cleanupFn) => {
				cleanupFn(() => {
					if (!layerElement.value) return;
					layers.value.delete(layerElement.value);
					context.layersWithOutsidePointerEventsDisabled.delete(layerElement.value);
				});
			});
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Primitive), {
					ref: unref(forwardRef),
					"as-child": _ctx.asChild,
					as: _ctx.as,
					"data-dismissable-layer": "",
					style: normalizeStyle({ pointerEvents: isBodyPointerEventsDisabled.value ? isPointerEventsEnabled.value ? "auto" : "none" : void 0 }),
					onFocusCapture: unref(focusOutside).onFocusCapture,
					onBlurCapture: unref(focusOutside).onBlurCapture,
					onPointerdownCapture: unref(pointerDownOutside).onPointerDownCapture
				}, {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 8, [
					"as-child",
					"as",
					"style",
					"onFocusCapture",
					"onBlurCapture",
					"onPointerdownCapture"
				]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/FocusScope/stack.js
	var useFocusStackState = createGlobalState(() => {
		return /* @__PURE__ */ ref([]);
	});
	function createFocusScopesStack() {
		/** A stack of focus scopes, with the active one at the top */
		const stack = useFocusStackState();
		return {
			add(focusScope) {
				const activeFocusScope = stack.value[0];
				if (focusScope !== activeFocusScope) activeFocusScope?.pause();
				stack.value = arrayRemove(stack.value, focusScope);
				stack.value.unshift(focusScope);
			},
			remove(focusScope) {
				stack.value = arrayRemove(stack.value, focusScope);
				stack.value[0]?.resume();
			}
		};
	}
	function arrayRemove(array, item) {
		const updatedArray = [...array];
		const index = updatedArray.indexOf(item);
		if (index !== -1) updatedArray.splice(index, 1);
		return updatedArray;
	}
	//#endregion
	//#region node_modules/reka-ui/dist/FocusScope/utils.js
	var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
	var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
	var EVENT_OPTIONS = {
		bubbles: false,
		cancelable: true
	};
	/**
	* Attempts focusing the first element in a list of candidates.
	* Stops when focus has actually moved.
	*/
	function focusFirst(candidates, { select = false } = {}) {
		const previouslyFocusedElement = getActiveElement();
		for (const candidate of candidates) {
			focus(candidate, { select });
			if (getActiveElement() !== previouslyFocusedElement) return true;
		}
	}
	/**
	* Returns the first and last tabbable elements inside a container.
	*/
	function getTabbableEdges(container) {
		const candidates = getTabbableCandidates(container);
		return [findVisible(candidates, container), findVisible(candidates.reverse(), container)];
	}
	/**
	* Returns a list of potential tabbable candidates.
	*
	* NOTE: This is only a close approximation. For example it doesn't take into account cases like when
	* elements are not visible. This cannot be worked out easily by just reading a property, but rather
	* necessitate runtime knowledge (computed styles, etc). We deal with these cases separately.
	*
	* See: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
	* Credit: https://github.com/discord/focus-layers/blob/master/src/util/wrapFocus.tsx#L1
	*/
	function getTabbableCandidates(container) {
		const nodes = [];
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, { acceptNode: (node) => {
			const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
			if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
			return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
		} });
		while (walker.nextNode()) nodes.push(walker.currentNode);
		return nodes;
	}
	/**
	* Returns the first visible element in a list.
	* NOTE: Only checks visibility up to the `container`.
	*/
	function findVisible(elements, container) {
		for (const element of elements) if (!isHidden(element, { upTo: container })) return element;
	}
	function isHidden(node, { upTo }) {
		if (getComputedStyle(node).visibility === "hidden") return true;
		while (node) {
			if (upTo !== void 0 && node === upTo) return false;
			if (getComputedStyle(node).display === "none") return true;
			node = node.parentElement;
		}
		return false;
	}
	function isSelectableInput(element) {
		return element instanceof HTMLInputElement && "select" in element;
	}
	function focus(element, { select = false } = {}) {
		if (element && element.focus) {
			const previouslyFocusedElement = getActiveElement();
			element.focus({ preventScroll: true });
			if (element !== previouslyFocusedElement && isSelectableInput(element) && select) element.select();
		}
	}
	//#endregion
	//#region node_modules/reka-ui/dist/FocusScope/FocusScope.js
	var FocusScope_default = /* @__PURE__ */ defineComponent({
		__name: "FocusScope",
		props: {
			loop: {
				type: Boolean,
				required: false,
				default: false
			},
			trapped: {
				type: Boolean,
				required: false,
				default: false
			},
			present: {
				type: Boolean,
				required: false,
				default: true
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			}
		},
		emits: ["mountAutoFocus", "unmountAutoFocus"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emits = __emit;
			const { currentRef, currentElement } = useForwardExpose();
			const lastFocusedElementRef = /* @__PURE__ */ ref(null);
			const focusScopesStack = createFocusScopesStack();
			const focusScope = /*#__PURE__*/ reactive({
				paused: false,
				pause() {
					this.paused = true;
				},
				resume() {
					this.paused = false;
				}
			});
			watchEffect((cleanupFn) => {
				if (!isClient) return;
				const container = currentElement.value;
				if (!props.trapped) return;
				function handleFocusIn(event) {
					if (focusScope.paused || !container) return;
					const target = event.target;
					if (container.contains(target)) lastFocusedElementRef.value = target;
					else focus(lastFocusedElementRef.value, { select: true });
				}
				function handleFocusOut(event) {
					if (focusScope.paused || !container) return;
					const relatedTarget = event.relatedTarget;
					if (relatedTarget === null) return;
					if (!container.contains(relatedTarget)) focus(lastFocusedElementRef.value, { select: true });
				}
				function handleMutations(mutations) {
					const lastFocusedElement = lastFocusedElementRef.value;
					if (lastFocusedElement === null) return;
					if (!mutations.some((m) => m.removedNodes.length > 0)) return;
					if (!container.contains(lastFocusedElement)) focus(container);
				}
				document.addEventListener("focusin", handleFocusIn);
				document.addEventListener("focusout", handleFocusOut);
				const mutationObserver = new MutationObserver(handleMutations);
				if (container) mutationObserver.observe(container, {
					childList: true,
					subtree: true
				});
				cleanupFn(() => {
					document.removeEventListener("focusin", handleFocusIn);
					document.removeEventListener("focusout", handleFocusOut);
					mutationObserver.disconnect();
				});
			});
			function dispatchMountAutoFocus(container, previouslyFocusedElement) {
				const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
				const handleMountAutoFocus = (ev) => emits("mountAutoFocus", ev);
				container.addEventListener(AUTOFOCUS_ON_MOUNT, handleMountAutoFocus);
				container.dispatchEvent(mountEvent);
				container.removeEventListener(AUTOFOCUS_ON_MOUNT, handleMountAutoFocus);
				if (!mountEvent.defaultPrevented) {
					focusFirst(getTabbableCandidates(container), { select: true });
					if (getActiveElement() === previouslyFocusedElement) focus(container);
				}
			}
			watchEffect(async (cleanupFn) => {
				const container = currentElement.value;
				await nextTick();
				if (!container) return;
				if (props.present !== false) focusScopesStack.add(focusScope);
				const previouslyFocusedElement = getActiveElement();
				if (!container.contains(previouslyFocusedElement) && props.present !== false) dispatchMountAutoFocus(container, previouslyFocusedElement);
				cleanupFn(() => {
					const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
					const unmountEventHandler = (ev) => {
						emits("unmountAutoFocus", ev);
					};
					container.addEventListener(AUTOFOCUS_ON_UNMOUNT, unmountEventHandler);
					container.dispatchEvent(unmountEvent);
					container.setAttribute("data-focus-scope-unmounting", "");
					setTimeout(() => {
						if (!unmountEvent.defaultPrevented) focus(previouslyFocusedElement ?? document.body, { select: true });
						container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, unmountEventHandler);
						focusScopesStack.remove(focusScope);
						container.removeAttribute("data-focus-scope-unmounting");
					}, 0);
				});
			});
			watch(() => props.present, async (present, prevPresent) => {
				if (!isClient) return;
				if (present === false && prevPresent === true) {
					focusScopesStack.remove(focusScope);
					return;
				}
				if (present !== true || prevPresent !== false) return;
				focusScopesStack.add(focusScope);
				await nextTick();
				const container = currentElement.value;
				if (!container) return;
				const previouslyFocusedElement = getActiveElement();
				if (!container.contains(previouslyFocusedElement)) dispatchMountAutoFocus(container, previouslyFocusedElement);
			});
			function handleKeyDown(event) {
				if (!props.loop && !props.trapped) return;
				if (focusScope.paused) return;
				const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
				const focusedElement = getActiveElement();
				if (isTabKey && focusedElement) {
					const container = event.currentTarget;
					const [first, last] = getTabbableEdges(container);
					if (!(first && last)) {
						if (focusedElement === container) event.preventDefault();
					} else if (!event.shiftKey && focusedElement === last) {
						event.preventDefault();
						if (props.loop) focus(first, { select: true });
					} else if (event.shiftKey && focusedElement === first) {
						event.preventDefault();
						if (props.loop) focus(last, { select: true });
					}
				}
			}
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Primitive), {
					ref_key: "currentRef",
					ref: currentRef,
					tabindex: "-1",
					"as-child": _ctx.asChild,
					as: _ctx.as,
					onKeydown: handleKeyDown
				}, {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 8, ["as-child", "as"]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Menu/utils.js
	var SELECTION_KEYS = ["Enter", " "];
	var FIRST_KEYS = [
		"ArrowDown",
		"PageUp",
		"Home"
	];
	var LAST_KEYS = [
		"ArrowUp",
		"PageDown",
		"End"
	];
	[...FIRST_KEYS, ...LAST_KEYS];
	[...SELECTION_KEYS], [...SELECTION_KEYS];
	function getOpenState(open) {
		return open ? "open" : "closed";
	}
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/utils.js
	var DEFAULT_TITLE_NAME = "DialogTitle";
	var DEFAULT_CONTENT_NAME = "DialogContent";
	function useWarning({ titleName = DEFAULT_TITLE_NAME, contentName = DEFAULT_CONTENT_NAME, componentLink = "dialog.html#title", titleId, descriptionId, contentElement }) {
		const TITLE_MESSAGE = `Warning: \`${contentName}\` requires a \`${titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://www.reka-ui.com/docs/components/${componentLink}`;
		const DESCRIPTION_MESSAGE = `Warning: Missing \`Description\` or \`aria-describedby="undefined"\` for ${contentName}.`;
		onMounted(() => {
			if (!document.getElementById(titleId)) console.warn(TITLE_MESSAGE);
			const describedById = contentElement.value?.getAttribute("aria-describedby");
			if (descriptionId && describedById) {
				if (!document.getElementById(descriptionId)) console.warn(DESCRIPTION_MESSAGE);
			}
		});
	}
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogContentImpl.js
	var DialogContentImpl_default = /* @__PURE__ */ defineComponent({
		__name: "DialogContentImpl",
		props: {
			forceMount: {
				type: Boolean,
				required: false
			},
			trapFocus: {
				type: Boolean,
				required: false
			},
			disableOutsidePointerEvents: {
				type: Boolean,
				required: false
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			},
			present: {
				type: Boolean,
				required: false
			}
		},
		emits: [
			"escapeKeyDown",
			"pointerDownOutside",
			"focusOutside",
			"interactOutside",
			"openAutoFocus",
			"closeAutoFocus"
		],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emits = __emit;
			const rootContext = injectDialogRootContext();
			const { forwardRef, currentElement: contentElement } = useForwardExpose();
			rootContext.titleId ||= useId(void 0, "reka-dialog-title");
			rootContext.descriptionId ||= useId(void 0, "reka-dialog-description");
			onMounted(() => {
				rootContext.contentElement = contentElement;
				if (getActiveElement() !== document.body) rootContext.triggerElement.value = getActiveElement();
			});
			if (process.env.NODE_ENV !== "production") useWarning({
				titleName: "DialogTitle",
				contentName: "DialogContent",
				componentLink: "dialog.html#title",
				titleId: rootContext.titleId,
				descriptionId: rootContext.descriptionId,
				contentElement
			});
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(FocusScope_default), {
					"as-child": "",
					loop: "",
					trapped: props.trapFocus,
					present: props.present,
					onMountAutoFocus: _cache[5] || (_cache[5] = ($event) => emits("openAutoFocus", $event)),
					onUnmountAutoFocus: _cache[6] || (_cache[6] = ($event) => emits("closeAutoFocus", $event))
				}, {
					default: withCtx(() => [createVNode(unref(DismissableLayer_default), mergeProps({
						id: unref(rootContext).contentId,
						ref: unref(forwardRef),
						as: _ctx.as,
						"as-child": _ctx.asChild,
						present: props.present,
						"disable-outside-pointer-events": _ctx.disableOutsidePointerEvents,
						role: "dialog",
						"aria-describedby": unref(rootContext).descriptionId,
						"aria-labelledby": unref(rootContext).titleId,
						"data-state": unref(getOpenState)(unref(rootContext).open.value)
					}, _ctx.$attrs, {
						onDismiss: _cache[0] || (_cache[0] = ($event) => unref(rootContext).onOpenChange(false)),
						onEscapeKeyDown: _cache[1] || (_cache[1] = ($event) => emits("escapeKeyDown", $event)),
						onFocusOutside: _cache[2] || (_cache[2] = ($event) => emits("focusOutside", $event)),
						onInteractOutside: _cache[3] || (_cache[3] = ($event) => emits("interactOutside", $event)),
						onPointerDownOutside: _cache[4] || (_cache[4] = ($event) => emits("pointerDownOutside", $event))
					}), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
						_: 3
					}, 16, [
						"id",
						"as",
						"as-child",
						"present",
						"disable-outside-pointer-events",
						"aria-describedby",
						"aria-labelledby",
						"data-state"
					])]),
					_: 3
				}, 8, ["trapped", "present"]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogContentModal.js
	var DialogContentModal_default = /* @__PURE__ */ defineComponent({
		__name: "DialogContentModal",
		props: {
			forceMount: {
				type: Boolean,
				required: false
			},
			trapFocus: {
				type: Boolean,
				required: false
			},
			disableOutsidePointerEvents: {
				type: Boolean,
				required: false,
				default: true
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			},
			present: {
				type: Boolean,
				required: true
			}
		},
		emits: [
			"escapeKeyDown",
			"pointerDownOutside",
			"focusOutside",
			"interactOutside",
			"openAutoFocus",
			"closeAutoFocus"
		],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emits = __emit;
			const rootContext = injectDialogRootContext();
			const emitsAsProps = useEmitAsProps(emits);
			const { forwardRef, currentElement } = useForwardExpose();
			useHideOthers(computed(() => props.present ? currentElement.value : void 0));
			const forwardedProps = computed(() => {
				const { present: _, ...rest } = props;
				return rest;
			});
			watch(() => props.present, (isPresent, wasPresent) => {
				if (!isPresent && wasPresent) rootContext.triggerElement.value?.focus();
			});
			return (_ctx, _cache) => {
				return openBlock(), createBlock(DialogContentImpl_default, mergeProps({
					...forwardedProps.value,
					...unref(emitsAsProps)
				}, {
					ref: unref(forwardRef),
					present: _ctx.present,
					"trap-focus": unref(rootContext).open.value,
					"disable-outside-pointer-events": props.disableOutsidePointerEvents,
					onCloseAutoFocus: _cache[0] || (_cache[0] = (event) => {
						if (!event.defaultPrevented) {
							event.preventDefault();
							unref(rootContext).triggerElement.value?.focus();
						}
					}),
					onPointerDownOutside: _cache[1] || (_cache[1] = (event) => {
						const originalEvent = event.detail.originalEvent;
						const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
						if (originalEvent.button === 2 || ctrlLeftClick) event.preventDefault();
					}),
					onFocusOutside: _cache[2] || (_cache[2] = (event) => {
						event.preventDefault();
					})
				}), {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 16, [
					"present",
					"trap-focus",
					"disable-outside-pointer-events"
				]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogContentNonModal.js
	var DialogContentNonModal_default = /* @__PURE__ */ defineComponent({
		__name: "DialogContentNonModal",
		props: {
			forceMount: {
				type: Boolean,
				required: false
			},
			trapFocus: {
				type: Boolean,
				required: false
			},
			disableOutsidePointerEvents: {
				type: Boolean,
				required: false
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			},
			present: {
				type: Boolean,
				required: true
			}
		},
		emits: [
			"escapeKeyDown",
			"pointerDownOutside",
			"focusOutside",
			"interactOutside",
			"openAutoFocus",
			"closeAutoFocus"
		],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emitsAsProps = useEmitAsProps(__emit);
			useForwardExpose();
			const rootContext = injectDialogRootContext();
			const hasInteractedOutsideRef = /* @__PURE__ */ ref(false);
			const hasPointerDownOutsideRef = /* @__PURE__ */ ref(false);
			const forwardedProps = computed(() => {
				const { present: _, ...rest } = props;
				return rest;
			});
			watch(() => props.present, (isPresent, wasPresent) => {
				if (!isPresent && wasPresent) {
					if (!hasInteractedOutsideRef.value) rootContext.triggerElement.value?.focus();
					hasInteractedOutsideRef.value = false;
					hasPointerDownOutsideRef.value = false;
				}
			});
			return (_ctx, _cache) => {
				return openBlock(), createBlock(DialogContentImpl_default, mergeProps({
					...forwardedProps.value,
					...unref(emitsAsProps)
				}, {
					present: _ctx.present,
					"trap-focus": false,
					"disable-outside-pointer-events": false,
					onCloseAutoFocus: _cache[0] || (_cache[0] = (event) => {
						if (!event.defaultPrevented) {
							if (!hasInteractedOutsideRef.value) unref(rootContext).triggerElement.value?.focus();
							event.preventDefault();
						}
						hasInteractedOutsideRef.value = false;
						hasPointerDownOutsideRef.value = false;
					}),
					onInteractOutside: _cache[1] || (_cache[1] = (event) => {
						if (!event.defaultPrevented) {
							hasInteractedOutsideRef.value = true;
							if (event.detail.originalEvent.type === "pointerdown") hasPointerDownOutsideRef.value = true;
						}
						const target = event.target;
						if (unref(rootContext).triggerElement.value?.contains(target)) event.preventDefault();
						if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.value) event.preventDefault();
					})
				}), {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 16, ["present"]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogContent.js
	var DialogContent_default = /* @__PURE__ */ defineComponent({
		__name: "DialogContent",
		props: {
			forceMount: {
				type: Boolean,
				required: false
			},
			disableOutsidePointerEvents: {
				type: Boolean,
				required: false,
				default: void 0
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			}
		},
		emits: [
			"escapeKeyDown",
			"pointerDownOutside",
			"focusOutside",
			"interactOutside",
			"openAutoFocus",
			"closeAutoFocus"
		],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emits = __emit;
			const rootContext = injectDialogRootContext();
			const emitsAsProps = useEmitAsProps(emits);
			const { forwardRef } = useForwardExpose();
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Presence_default), {
					present: _ctx.forceMount || unref(rootContext).open.value,
					"force-mount": _ctx.forceMount || !unref(rootContext).unmountOnHide.value
				}, {
					default: withCtx(({ present }) => [unref(rootContext).modal.value ? withDirectives((openBlock(), createBlock(DialogContentModal_default, mergeProps({
						key: 0,
						ref: unref(forwardRef),
						present: unref(rootContext).unmountOnHide.value || present
					}, {
						...props,
						...unref(emitsAsProps),
						..._ctx.$attrs
					}), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
						_: 2
					}, 1040, ["present"])), [[vShow, unref(rootContext).unmountOnHide.value || present]]) : withDirectives((openBlock(), createBlock(DialogContentNonModal_default, mergeProps({
						key: 1,
						ref: unref(forwardRef),
						present: unref(rootContext).unmountOnHide.value || present
					}, {
						...props,
						...unref(emitsAsProps),
						..._ctx.$attrs
					}), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
						_: 2
					}, 1040, ["present"])), [[vShow, unref(rootContext).unmountOnHide.value || present]])]),
					_: 3
				}, 8, ["present", "force-mount"]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogDescription.js
	var DialogDescription_default = /* @__PURE__ */ defineComponent({
		__name: "DialogDescription",
		props: {
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false,
				default: "p"
			}
		},
		setup(__props) {
			const props = __props;
			useForwardExpose();
			const rootContext = injectDialogRootContext();
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Primitive), mergeProps(props, { id: unref(rootContext).descriptionId }), {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 16, ["id"]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogOverlayImpl.js
	var DialogOverlayImpl_default = /* @__PURE__ */ defineComponent({
		__name: "DialogOverlayImpl",
		props: {
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			},
			present: {
				type: Boolean,
				required: false,
				default: true
			}
		},
		setup(__props) {
			const props = __props;
			const rootContext = injectDialogRootContext();
			const scrollLocked = useBodyScrollLock(props.present);
			watch(() => props.present, (val) => scrollLocked.value = val);
			useForwardExpose();
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Primitive), {
					as: _ctx.as,
					"as-child": _ctx.asChild,
					"data-state": unref(rootContext).open.value ? "open" : "closed",
					style: { "pointer-events": "auto" },
					onPointerdown: _cache[0] || (_cache[0] = withModifiers(() => {}, [
						"left",
						"self",
						"prevent"
					]))
				}, {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 8, [
					"as",
					"as-child",
					"data-state"
				]);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogOverlay.js
	var DialogOverlay_default = /* @__PURE__ */ defineComponent({
		__name: "DialogOverlay",
		props: {
			forceMount: {
				type: Boolean,
				required: false
			},
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false
			}
		},
		setup(__props) {
			const rootContext = injectDialogRootContext();
			const { forwardRef } = useForwardExpose();
			return (_ctx, _cache) => {
				return unref(rootContext)?.modal.value ? (openBlock(), createBlock(unref(Presence_default), {
					key: 0,
					present: _ctx.forceMount || unref(rootContext).open.value,
					"force-mount": _ctx.forceMount || !unref(rootContext).unmountOnHide.value
				}, {
					default: withCtx(({ present }) => [withDirectives(createVNode(DialogOverlayImpl_default, mergeProps(_ctx.$attrs, {
						ref: unref(forwardRef),
						as: _ctx.as,
						"as-child": _ctx.asChild,
						present: unref(rootContext).unmountOnHide.value || present
					}), {
						default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
						_: 2
					}, 1040, [
						"as",
						"as-child",
						"present"
					]), [[vShow, unref(rootContext).unmountOnHide.value || present]])]),
					_: 3
				}, 8, ["present", "force-mount"])) : createCommentVNode("v-if", true);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Teleport/Teleport.js
	var Teleport_default = /* @__PURE__ */ defineComponent({
		__name: "Teleport",
		props: {
			to: {
				type: null,
				required: false
			},
			disabled: {
				type: Boolean,
				required: false
			},
			defer: {
				type: Boolean,
				required: false
			},
			forceMount: {
				type: Boolean,
				required: false
			}
		},
		setup(__props) {
			const props = __props;
			const configContext = injectConfigProviderContext({});
			const target = computed(() => props.to ?? configContext.teleportTo?.value ?? "body");
			const isMounted = useMounted();
			return (_ctx, _cache) => {
				return unref(isMounted) || _ctx.forceMount ? (openBlock(), createBlock(Teleport, {
					key: 0,
					to: target.value,
					disabled: _ctx.disabled,
					defer: _ctx.defer
				}, [renderSlot(_ctx.$slots, "default")], 8, [
					"to",
					"disabled",
					"defer"
				])) : createCommentVNode("v-if", true);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogPortal.js
	var DialogPortal_default = /* @__PURE__ */ defineComponent({
		__name: "DialogPortal",
		props: {
			to: {
				type: null,
				required: false
			},
			disabled: {
				type: Boolean,
				required: false
			},
			defer: {
				type: Boolean,
				required: false
			},
			forceMount: {
				type: Boolean,
				required: false
			}
		},
		setup(__props) {
			const props = __props;
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Teleport_default), normalizeProps(guardReactiveProps(props)), {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 16);
			};
		}
	});
	//#endregion
	//#region node_modules/reka-ui/dist/Dialog/DialogTitle.js
	var DialogTitle_default = /* @__PURE__ */ defineComponent({
		__name: "DialogTitle",
		props: {
			asChild: {
				type: Boolean,
				required: false
			},
			as: {
				type: null,
				required: false,
				default: "h2"
			}
		},
		setup(__props) {
			const props = __props;
			const rootContext = injectDialogRootContext();
			useForwardExpose();
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(Primitive), mergeProps(props, { id: unref(rootContext).titleId }), {
					default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
					_: 3
				}, 16, ["id"]);
			};
		}
	});
	//#endregion
	//#region \0plugin-vue:export-helper
	var _plugin_vue_export_helper_default = (sfc, props) => {
		const target = sfc.__vccOpts || sfc;
		for (const [key, val] of props) target[key] = val;
		return target;
	};
	//#endregion
	//#region src/components/ui/dialog/Dialog.vue
	var _hoisted_1$1 = {
		key: 0,
		class: "flex items-start justify-between gap-4 border-b p-5"
	};
	var _hoisted_2$1 = { class: "min-w-0" };
	var _hoisted_3$1 = { class: "overflow-y-auto p-5" };
	var _hoisted_4$1 = {
		key: 1,
		class: "bg-muted/30 flex shrink-0 items-center justify-end gap-2 border-t p-4"
	};
	var Dialog_default = /*#__PURE__*/ _plugin_vue_export_helper_default({
		__name: "Dialog",
		props: {
			open: {
				type: Boolean,
				default: false
			},
			title: {
				type: String,
				default: ""
			},
			description: {
				type: String,
				default: ""
			},
			size: {
				type: String,
				default: "md"
			}
		},
		emits: ["update:open"],
		setup(__props, { emit: __emit }) {
			const emit = __emit;
			const SIZES = {
				sm: "sm:max-w-sm",
				md: "sm:max-w-lg",
				lg: "sm:max-w-2xl"
			};
			return (_ctx, _cache) => {
				return openBlock(), createBlock(unref(DialogRoot_default), {
					open: __props.open,
					"onUpdate:open": _cache[0] || (_cache[0] = ($event) => emit("update:open", $event))
				}, {
					default: withCtx(() => [createVNode(unref(DialogPortal_default), null, {
						default: withCtx(() => [createVNode(unref(DialogOverlay_default), { class: "modal-overlay bg-navy/50 fixed inset-0 z-50 backdrop-blur-sm" }), createVNode(unref(DialogContent_default), { class: normalizeClass(["modal-panel bg-card text-card-foreground fixed z-50 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden border shadow-2xl outline-none inset-x-0 bottom-0 rounded-t-2xl sm:bottom-auto sm:inset-x-auto sm:start-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl rtl:sm:translate-x-1/2 sm:max-h-[calc(100dvh-4rem)]", SIZES[__props.size]]) }, {
							default: withCtx(() => [
								__props.title || __props.description || _ctx.$slots.header ? (openBlock(), createElementBlock("div", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [renderSlot(_ctx.$slots, "header", {}, () => [createVNode(unref(DialogTitle_default), { class: "text-lg font-bold tracking-tight" }, {
									default: withCtx(() => [createTextVNode(toDisplayString$1(__props.title), 1)]),
									_: 1
								}), __props.description ? (openBlock(), createBlock(unref(DialogDescription_default), {
									key: 0,
									class: "text-muted-foreground mt-1 text-sm"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString$1(__props.description), 1)]),
									_: 1
								})) : createCommentVNode("", true)], true)]), createVNode(unref(DialogClose_default), { class: "hover:bg-accent text-muted-foreground hover:text-foreground -me-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors" }, {
									default: withCtx(() => [createVNode(unref(X), { class: "size-4" })]),
									_: 1
								})])) : createCommentVNode("", true),
								createBaseVNode("div", _hoisted_3$1, [renderSlot(_ctx.$slots, "default", {}, void 0, true)]),
								_ctx.$slots.footer ? (openBlock(), createElementBlock("div", _hoisted_4$1, [renderSlot(_ctx.$slots, "footer", {}, void 0, true)])) : createCommentVNode("", true)
							]),
							_: 3
						}, 8, ["class"])]),
						_: 3
					})]),
					_: 3
				}, 8, ["open"]);
			};
		}
	}, [["__scopeId", "data-v-4f9e5232"]]);
	//#endregion
	//#region node_modules/clsx/dist/clsx.mjs
	function r(e) {
		var t, f, n = "";
		if ("string" == typeof e || "number" == typeof e) n += e;
		else if ("object" == typeof e) if (Array.isArray(e)) {
			var o = e.length;
			for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
		} else for (f in e) e[f] && (n && (n += " "), n += f);
		return n;
	}
	function clsx() {
		for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
		return n;
	}
	//#endregion
	//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
	/**
	* Concatenates two arrays faster than the array spread operator.
	*/
	var concatArrays = (array1, array2) => {
		const combinedArray = new Array(array1.length + array2.length);
		for (let i = 0; i < array1.length; i++) combinedArray[i] = array1[i];
		for (let i = 0; i < array2.length; i++) combinedArray[array1.length + i] = array2[i];
		return combinedArray;
	};
	var createClassValidatorObject = (classGroupId, validator) => ({
		classGroupId,
		validator
	});
	var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
		nextPart,
		validators,
		classGroupId
	});
	var CLASS_PART_SEPARATOR = "-";
	var EMPTY_CONFLICTS = [];
	var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
	var createClassGroupUtils = (config) => {
		const classMap = createClassMap(config);
		const { conflictingClassGroups, conflictingClassGroupModifiers } = config;
		const getClassGroupId = (className) => {
			if (className.startsWith("[") && className.endsWith("]")) return getGroupIdForArbitraryProperty(className);
			const classParts = className.split(CLASS_PART_SEPARATOR);
			return getGroupRecursive(classParts, classParts[0] === "" && classParts.length > 1 ? 1 : 0, classMap);
		};
		const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
			if (hasPostfixModifier) {
				const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
				const baseConflicts = conflictingClassGroups[classGroupId];
				if (modifierConflicts) {
					if (baseConflicts) return concatArrays(baseConflicts, modifierConflicts);
					return modifierConflicts;
				}
				return baseConflicts || EMPTY_CONFLICTS;
			}
			return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
		};
		return {
			getClassGroupId,
			getConflictingClassGroupIds
		};
	};
	var getGroupRecursive = (classParts, startIndex, classPartObject) => {
		if (classParts.length - startIndex === 0) return classPartObject.classGroupId;
		const currentClassPart = classParts[startIndex];
		const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
		if (nextClassPartObject) {
			const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
			if (result) return result;
		}
		const validators = classPartObject.validators;
		if (validators === null) return;
		const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
		const validatorsLength = validators.length;
		for (let i = 0; i < validatorsLength; i++) {
			const validatorObj = validators[i];
			if (validatorObj.validator(classRest)) return validatorObj.classGroupId;
		}
	};
	/**
	* Get the class group ID for an arbitrary property.
	*
	* @param className - The class name to get the group ID for. Is expected to be string starting with `[` and ending with `]`.
	*/
	var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
		const content = className.slice(1, -1);
		const colonIndex = content.indexOf(":");
		const property = content.slice(0, colonIndex);
		return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
	})();
	/**
	* Exported for testing only
	*/
	var createClassMap = (config) => {
		const { theme, classGroups } = config;
		return processClassGroups(classGroups, theme);
	};
	var processClassGroups = (classGroups, theme) => {
		const classMap = createClassPartObject();
		for (const classGroupId in classGroups) {
			const group = classGroups[classGroupId];
			processClassesRecursively(group, classMap, classGroupId, theme);
		}
		return classMap;
	};
	var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
		const len = classGroup.length;
		for (let i = 0; i < len; i++) {
			const classDefinition = classGroup[i];
			processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
		}
	};
	var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
		if (typeof classDefinition === "string") {
			processStringDefinition(classDefinition, classPartObject, classGroupId);
			return;
		}
		if (typeof classDefinition === "function") {
			processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
			return;
		}
		processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
	};
	var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
		const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
		classPartObjectToEdit.classGroupId = classGroupId;
	};
	var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
		if (isThemeGetter(classDefinition)) {
			processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
			return;
		}
		if (classPartObject.validators === null) classPartObject.validators = [];
		classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
	};
	var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
		const entries = Object.entries(classDefinition);
		const len = entries.length;
		for (let i = 0; i < len; i++) {
			const [key, value] = entries[i];
			processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
		}
	};
	var getPart = (classPartObject, path) => {
		let current = classPartObject;
		const parts = path.split(CLASS_PART_SEPARATOR);
		const len = parts.length;
		for (let i = 0; i < len; i++) {
			const part = parts[i];
			let next = current.nextPart.get(part);
			if (!next) {
				next = createClassPartObject();
				current.nextPart.set(part, next);
			}
			current = next;
		}
		return current;
	};
	var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
	var createLruCache = (maxCacheSize) => {
		if (maxCacheSize < 1) return {
			get: () => void 0,
			set: () => {}
		};
		let cacheSize = 0;
		let cache = Object.create(null);
		let previousCache = Object.create(null);
		const update = (key, value) => {
			cache[key] = value;
			cacheSize++;
			if (cacheSize > maxCacheSize) {
				cacheSize = 0;
				previousCache = cache;
				cache = Object.create(null);
			}
		};
		return {
			get(key) {
				let value = cache[key];
				if (value !== void 0) return value;
				if ((value = previousCache[key]) !== void 0) {
					update(key, value);
					return value;
				}
			},
			set(key, value) {
				if (key in cache) cache[key] = value;
				else update(key, value);
			}
		};
	};
	var IMPORTANT_MODIFIER = "!";
	var MODIFIER_SEPARATOR = ":";
	var EMPTY_MODIFIERS = [];
	var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
		modifiers,
		hasImportantModifier,
		baseClassName,
		maybePostfixModifierPosition,
		isExternal
	});
	var createParseClassName = (config) => {
		const { prefix, experimentalParseClassName } = config;
		/**
		* Parse class name into parts.
		*
		* Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
		* @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
		*/
		let parseClassName = (className) => {
			const modifiers = [];
			let bracketDepth = 0;
			let parenDepth = 0;
			let modifierStart = 0;
			let postfixModifierPosition;
			const len = className.length;
			for (let index = 0; index < len; index++) {
				const currentCharacter = className[index];
				if (bracketDepth === 0 && parenDepth === 0) {
					if (currentCharacter === MODIFIER_SEPARATOR) {
						modifiers.push(className.slice(modifierStart, index));
						modifierStart = index + 1;
						continue;
					}
					if (currentCharacter === "/") {
						postfixModifierPosition = index;
						continue;
					}
				}
				if (currentCharacter === "[") bracketDepth++;
				else if (currentCharacter === "]") bracketDepth--;
				else if (currentCharacter === "(") parenDepth++;
				else if (currentCharacter === ")") parenDepth--;
			}
			const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
			let baseClassName = baseClassNameWithImportantModifier;
			let hasImportantModifier = false;
			if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
				baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
				hasImportantModifier = true;
			} else if (baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)) {
				baseClassName = baseClassNameWithImportantModifier.slice(1);
				hasImportantModifier = true;
			}
			const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
			return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
		};
		if (prefix) {
			const fullPrefix = prefix + MODIFIER_SEPARATOR;
			const parseClassNameOriginal = parseClassName;
			parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
		}
		if (experimentalParseClassName) {
			const parseClassNameOriginal = parseClassName;
			parseClassName = (className) => experimentalParseClassName({
				className,
				parseClassName: parseClassNameOriginal
			});
		}
		return parseClassName;
	};
	/**
	* Sorts modifiers according to following schema:
	* - Predefined modifiers are sorted alphabetically
	* - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
	*/
	var createSortModifiers = (config) => {
		const modifierWeights = /* @__PURE__ */ new Map();
		config.orderSensitiveModifiers.forEach((mod, index) => {
			modifierWeights.set(mod, 1e6 + index);
		});
		return (modifiers) => {
			const result = [];
			let currentSegment = [];
			for (let i = 0; i < modifiers.length; i++) {
				const modifier = modifiers[i];
				const isArbitrary = modifier[0] === "[";
				const isOrderSensitive = modifierWeights.has(modifier);
				if (isArbitrary || isOrderSensitive) {
					if (currentSegment.length > 0) {
						currentSegment.sort();
						result.push(...currentSegment);
						currentSegment = [];
					}
					result.push(modifier);
				} else currentSegment.push(modifier);
			}
			if (currentSegment.length > 0) {
				currentSegment.sort();
				result.push(...currentSegment);
			}
			return result;
		};
	};
	var createConfigUtils = (config) => ({
		cache: createLruCache(config.cacheSize),
		parseClassName: createParseClassName(config),
		sortModifiers: createSortModifiers(config),
		postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config),
		...createClassGroupUtils(config)
	});
	var createPostfixLookupClassGroupIds = (config) => {
		const lookup = Object.create(null);
		const classGroupIds = config.postfixLookupClassGroups;
		if (classGroupIds) for (let i = 0; i < classGroupIds.length; i++) lookup[classGroupIds[i]] = true;
		return lookup;
	};
	var SPLIT_CLASSES_REGEX = /\s+/;
	var mergeClassList = (classList, configUtils) => {
		const { parseClassName, getClassGroupId, getConflictingClassGroupIds, sortModifiers, postfixLookupClassGroupIds } = configUtils;
		/**
		* Set of classGroupIds in following format:
		* `{importantModifier}{variantModifiers}{classGroupId}`
		* @example 'float'
		* @example 'hover:focus:bg-color'
		* @example 'md:!pr'
		*/
		const classGroupsInConflict = [];
		const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
		let result = "";
		for (let index = classNames.length - 1; index >= 0; index -= 1) {
			const originalClassName = classNames[index];
			const { isExternal, modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition } = parseClassName(originalClassName);
			if (isExternal) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			let hasPostfixModifier = !!maybePostfixModifierPosition;
			let classGroupId;
			if (hasPostfixModifier) {
				classGroupId = getClassGroupId(baseClassName.substring(0, maybePostfixModifierPosition));
				const classGroupIdWithPostfix = classGroupId && postfixLookupClassGroupIds[classGroupId] ? getClassGroupId(baseClassName) : void 0;
				if (classGroupIdWithPostfix && classGroupIdWithPostfix !== classGroupId) {
					classGroupId = classGroupIdWithPostfix;
					hasPostfixModifier = false;
				}
			} else classGroupId = getClassGroupId(baseClassName);
			if (!classGroupId) {
				if (!hasPostfixModifier) {
					result = originalClassName + (result.length > 0 ? " " + result : result);
					continue;
				}
				classGroupId = getClassGroupId(baseClassName);
				if (!classGroupId) {
					result = originalClassName + (result.length > 0 ? " " + result : result);
					continue;
				}
				hasPostfixModifier = false;
			}
			const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
			const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
			const classId = modifierId + classGroupId;
			if (classGroupsInConflict.indexOf(classId) > -1) continue;
			classGroupsInConflict.push(classId);
			const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
			for (let i = 0; i < conflictGroups.length; ++i) {
				const group = conflictGroups[i];
				classGroupsInConflict.push(modifierId + group);
			}
			result = originalClassName + (result.length > 0 ? " " + result : result);
		}
		return result;
	};
	/**
	* The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
	*
	* Specifically:
	* - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
	* - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
	*
	* Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
	*/
	var twJoin = (...classLists) => {
		let index = 0;
		let argument;
		let resolvedValue;
		let string = "";
		while (index < classLists.length) if (argument = classLists[index++]) {
			if (resolvedValue = toValue(argument)) {
				string && (string += " ");
				string += resolvedValue;
			}
		}
		return string;
	};
	var toValue = (mix) => {
		if (typeof mix === "string") return mix;
		let resolvedValue;
		let string = "";
		for (let k = 0; k < mix.length; k++) if (mix[k]) {
			if (resolvedValue = toValue(mix[k])) {
				string && (string += " ");
				string += resolvedValue;
			}
		}
		return string;
	};
	var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
		let configUtils;
		let cacheGet;
		let cacheSet;
		let functionToCall;
		const initTailwindMerge = (classList) => {
			configUtils = createConfigUtils(createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst()));
			cacheGet = configUtils.cache.get;
			cacheSet = configUtils.cache.set;
			functionToCall = tailwindMerge;
			return tailwindMerge(classList);
		};
		const tailwindMerge = (classList) => {
			const cachedResult = cacheGet(classList);
			if (cachedResult) return cachedResult;
			const result = mergeClassList(classList, configUtils);
			cacheSet(classList, result);
			return result;
		};
		functionToCall = initTailwindMerge;
		return (...args) => functionToCall(twJoin(...args));
	};
	var fallbackThemeArr = [];
	var fromTheme = (key) => {
		const themeGetter = (theme) => theme[key] || fallbackThemeArr;
		themeGetter.isThemeGetter = true;
		return themeGetter;
	};
	var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
	var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
	var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
	var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
	var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
	var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
	var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
	var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
	var isFraction = (value) => fractionRegex.test(value);
	var isNumber = (value) => !!value && !Number.isNaN(Number(value));
	var isInteger = (value) => !!value && Number.isInteger(Number(value));
	var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
	var isTshirtSize = (value) => tshirtUnitRegex.test(value);
	var isAny = () => true;
	var isLengthOnly = (value) => lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
	var isNever = () => false;
	var isShadow = (value) => shadowRegex.test(value);
	var isImage = (value) => imageRegex.test(value);
	var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
	var isNamedContainerQuery = (value) => value.startsWith("@container") && (value[10] === "/" && value[11] !== void 0 || value[11] === "s" && value[16] !== void 0 && value.startsWith("-size/", 10) || value[11] === "n" && value[18] !== void 0 && value.startsWith("-normal/", 10));
	var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
	var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
	var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
	var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
	var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
	var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
	var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
	var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
	var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
	var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
	var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
	var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
	var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
	var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
	var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
	var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
	var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
	var getIsArbitraryValue = (value, testLabel, testValue) => {
		const result = arbitraryValueRegex.exec(value);
		if (result) {
			if (result[1]) return testLabel(result[1]);
			return testValue(result[2]);
		}
		return false;
	};
	var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
		const result = arbitraryVariableRegex.exec(value);
		if (result) {
			if (result[1]) return testLabel(result[1]);
			return shouldMatchNoLabel;
		}
		return false;
	};
	var isLabelPosition = (label) => label === "position" || label === "percentage";
	var isLabelImage = (label) => label === "image" || label === "url";
	var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
	var isLabelLength = (label) => label === "length";
	var isLabelNumber = (label) => label === "number";
	var isLabelFamilyName = (label) => label === "family-name";
	var isLabelWeight = (label) => label === "number" || label === "weight";
	var isLabelShadow = (label) => label === "shadow";
	var getDefaultConfig = () => {
		/**
		* Theme getters for theme variable namespaces
		* @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
		*/
		const themeColor = fromTheme("color");
		const themeFont = fromTheme("font");
		const themeText = fromTheme("text");
		const themeFontWeight = fromTheme("font-weight");
		const themeTracking = fromTheme("tracking");
		const themeLeading = fromTheme("leading");
		const themeBreakpoint = fromTheme("breakpoint");
		const themeContainer = fromTheme("container");
		const themeSpacing = fromTheme("spacing");
		const themeRadius = fromTheme("radius");
		const themeShadow = fromTheme("shadow");
		const themeInsetShadow = fromTheme("inset-shadow");
		const themeTextShadow = fromTheme("text-shadow");
		const themeDropShadow = fromTheme("drop-shadow");
		const themeBlur = fromTheme("blur");
		const themePerspective = fromTheme("perspective");
		const themeAspect = fromTheme("aspect");
		const themeEase = fromTheme("ease");
		const themeAnimate = fromTheme("animate");
		/**
		* Helpers to avoid repeating the same scales
		*
		* We use functions that create a new array every time they're called instead of static arrays.
		* This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
		*/
		const scaleBreak = () => [
			"auto",
			"avoid",
			"all",
			"avoid-page",
			"page",
			"left",
			"right",
			"column"
		];
		const scalePosition = () => [
			"center",
			"top",
			"bottom",
			"left",
			"right",
			"top-left",
			"left-top",
			"top-right",
			"right-top",
			"bottom-right",
			"right-bottom",
			"bottom-left",
			"left-bottom"
		];
		const scalePositionWithArbitrary = () => [
			...scalePosition(),
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleOverflow = () => [
			"auto",
			"hidden",
			"clip",
			"visible",
			"scroll"
		];
		const scaleOverscroll = () => [
			"auto",
			"contain",
			"none"
		];
		const scaleUnambiguousSpacing = () => [
			isArbitraryVariable,
			isArbitraryValue,
			themeSpacing
		];
		const scaleInset = () => [
			isFraction,
			"full",
			"auto",
			...scaleUnambiguousSpacing()
		];
		const scaleGridTemplateColsRows = () => [
			isInteger,
			"none",
			"subgrid",
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleGridColRowStartAndEnd = () => [
			"auto",
			{ span: [
				"full",
				isInteger,
				isArbitraryVariable,
				isArbitraryValue
			] },
			isInteger,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleGridColRowStartOrEnd = () => [
			isInteger,
			"auto",
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleGridAutoColsRows = () => [
			"auto",
			"min",
			"max",
			"fr",
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleAlignPrimaryAxis = () => [
			"start",
			"end",
			"center",
			"between",
			"around",
			"evenly",
			"stretch",
			"baseline",
			"center-safe",
			"end-safe"
		];
		const scaleAlignSecondaryAxis = () => [
			"start",
			"end",
			"center",
			"stretch",
			"center-safe",
			"end-safe"
		];
		const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
		const scaleSizing = () => [
			isFraction,
			"auto",
			"full",
			"dvw",
			"dvh",
			"lvw",
			"lvh",
			"svw",
			"svh",
			"min",
			"max",
			"fit",
			...scaleUnambiguousSpacing()
		];
		const scaleSizingInline = () => [
			isFraction,
			"screen",
			"full",
			"dvw",
			"lvw",
			"svw",
			"min",
			"max",
			"fit",
			...scaleUnambiguousSpacing()
		];
		const scaleSizingBlock = () => [
			isFraction,
			"screen",
			"full",
			"lh",
			"dvh",
			"lvh",
			"svh",
			"min",
			"max",
			"fit",
			...scaleUnambiguousSpacing()
		];
		const scaleColor = () => [
			themeColor,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleBgPosition = () => [
			...scalePosition(),
			isArbitraryVariablePosition,
			isArbitraryPosition,
			{ position: [isArbitraryVariable, isArbitraryValue] }
		];
		const scaleBgRepeat = () => ["no-repeat", { repeat: [
			"",
			"x",
			"y",
			"space",
			"round"
		] }];
		const scaleBgSize = () => [
			"auto",
			"cover",
			"contain",
			isArbitraryVariableSize,
			isArbitrarySize,
			{ size: [isArbitraryVariable, isArbitraryValue] }
		];
		const scaleGradientStopPosition = () => [
			isPercent,
			isArbitraryVariableLength,
			isArbitraryLength
		];
		const scaleRadius = () => [
			"",
			"none",
			"full",
			themeRadius,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleBorderWidth = () => [
			"",
			isNumber,
			isArbitraryVariableLength,
			isArbitraryLength
		];
		const scaleLineStyle = () => [
			"solid",
			"dashed",
			"dotted",
			"double"
		];
		const scaleBlendMode = () => [
			"normal",
			"multiply",
			"screen",
			"overlay",
			"darken",
			"lighten",
			"color-dodge",
			"color-burn",
			"hard-light",
			"soft-light",
			"difference",
			"exclusion",
			"hue",
			"saturation",
			"color",
			"luminosity"
		];
		const scaleMaskImagePosition = () => [
			isNumber,
			isPercent,
			isArbitraryVariablePosition,
			isArbitraryPosition
		];
		const scaleBlur = () => [
			"",
			"none",
			themeBlur,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleRotate = () => [
			"none",
			isNumber,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleScale = () => [
			"none",
			isNumber,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleSkew = () => [
			isNumber,
			isArbitraryVariable,
			isArbitraryValue
		];
		const scaleTranslate = () => [
			isFraction,
			"full",
			...scaleUnambiguousSpacing()
		];
		return {
			cacheSize: 500,
			theme: {
				animate: [
					"spin",
					"ping",
					"pulse",
					"bounce"
				],
				aspect: ["video"],
				blur: [isTshirtSize],
				breakpoint: [isTshirtSize],
				color: [isAny],
				container: [isTshirtSize],
				"drop-shadow": [isTshirtSize],
				ease: [
					"in",
					"out",
					"in-out"
				],
				font: [isAnyNonArbitrary],
				"font-weight": [
					"thin",
					"extralight",
					"light",
					"normal",
					"medium",
					"semibold",
					"bold",
					"extrabold",
					"black"
				],
				"inset-shadow": [isTshirtSize],
				leading: [
					"none",
					"tight",
					"snug",
					"normal",
					"relaxed",
					"loose"
				],
				perspective: [
					"dramatic",
					"near",
					"normal",
					"midrange",
					"distant",
					"none"
				],
				radius: [isTshirtSize],
				shadow: [isTshirtSize],
				spacing: ["px", isNumber],
				text: [isTshirtSize],
				"text-shadow": [isTshirtSize],
				tracking: [
					"tighter",
					"tight",
					"normal",
					"wide",
					"wider",
					"widest"
				]
			},
			classGroups: {
				/**
				* Aspect Ratio
				* @see https://tailwindcss.com/docs/aspect-ratio
				*/
				aspect: [{ aspect: [
					"auto",
					"square",
					isFraction,
					isArbitraryValue,
					isArbitraryVariable,
					themeAspect
				] }],
				/**
				* Container
				* @see https://tailwindcss.com/docs/container
				* @deprecated since Tailwind CSS v4.0.0
				*/
				container: ["container"],
				/**
				* Container Type
				* @see https://tailwindcss.com/docs/responsive-design#container-queries
				*/
				"container-type": [{ "@container": [
					"",
					"normal",
					"size",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Container Name
				* @see https://tailwindcss.com/docs/responsive-design#named-containers
				*/
				"container-named": [isNamedContainerQuery],
				/**
				* Columns
				* @see https://tailwindcss.com/docs/columns
				*/
				columns: [{ columns: [
					isNumber,
					isArbitraryValue,
					isArbitraryVariable,
					themeContainer
				] }],
				/**
				* Break After
				* @see https://tailwindcss.com/docs/break-after
				*/
				"break-after": [{ "break-after": scaleBreak() }],
				/**
				* Break Before
				* @see https://tailwindcss.com/docs/break-before
				*/
				"break-before": [{ "break-before": scaleBreak() }],
				/**
				* Break Inside
				* @see https://tailwindcss.com/docs/break-inside
				*/
				"break-inside": [{ "break-inside": [
					"auto",
					"avoid",
					"avoid-page",
					"avoid-column"
				] }],
				/**
				* Box Decoration Break
				* @see https://tailwindcss.com/docs/box-decoration-break
				*/
				"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
				/**
				* Box Sizing
				* @see https://tailwindcss.com/docs/box-sizing
				*/
				box: [{ box: ["border", "content"] }],
				/**
				* Display
				* @see https://tailwindcss.com/docs/display
				*/
				display: [
					"block",
					"inline-block",
					"inline",
					"flex",
					"inline-flex",
					"table",
					"inline-table",
					"table-caption",
					"table-cell",
					"table-column",
					"table-column-group",
					"table-footer-group",
					"table-header-group",
					"table-row-group",
					"table-row",
					"flow-root",
					"grid",
					"inline-grid",
					"contents",
					"list-item",
					"hidden"
				],
				/**
				* Screen Reader Only
				* @see https://tailwindcss.com/docs/display#screen-reader-only
				*/
				sr: ["sr-only", "not-sr-only"],
				/**
				* Floats
				* @see https://tailwindcss.com/docs/float
				*/
				float: [{ float: [
					"right",
					"left",
					"none",
					"start",
					"end"
				] }],
				/**
				* Clear
				* @see https://tailwindcss.com/docs/clear
				*/
				clear: [{ clear: [
					"left",
					"right",
					"both",
					"none",
					"start",
					"end"
				] }],
				/**
				* Isolation
				* @see https://tailwindcss.com/docs/isolation
				*/
				isolation: ["isolate", "isolation-auto"],
				/**
				* Object Fit
				* @see https://tailwindcss.com/docs/object-fit
				*/
				"object-fit": [{ object: [
					"contain",
					"cover",
					"fill",
					"none",
					"scale-down"
				] }],
				/**
				* Object Position
				* @see https://tailwindcss.com/docs/object-position
				*/
				"object-position": [{ object: scalePositionWithArbitrary() }],
				/**
				* Overflow
				* @see https://tailwindcss.com/docs/overflow
				*/
				overflow: [{ overflow: scaleOverflow() }],
				/**
				* Overflow X
				* @see https://tailwindcss.com/docs/overflow
				*/
				"overflow-x": [{ "overflow-x": scaleOverflow() }],
				/**
				* Overflow Y
				* @see https://tailwindcss.com/docs/overflow
				*/
				"overflow-y": [{ "overflow-y": scaleOverflow() }],
				/**
				* Overscroll Behavior
				* @see https://tailwindcss.com/docs/overscroll-behavior
				*/
				overscroll: [{ overscroll: scaleOverscroll() }],
				/**
				* Overscroll Behavior X
				* @see https://tailwindcss.com/docs/overscroll-behavior
				*/
				"overscroll-x": [{ "overscroll-x": scaleOverscroll() }],
				/**
				* Overscroll Behavior Y
				* @see https://tailwindcss.com/docs/overscroll-behavior
				*/
				"overscroll-y": [{ "overscroll-y": scaleOverscroll() }],
				/**
				* Position
				* @see https://tailwindcss.com/docs/position
				*/
				position: [
					"static",
					"fixed",
					"absolute",
					"relative",
					"sticky"
				],
				/**
				* Inset
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				inset: [{ inset: scaleInset() }],
				/**
				* Inset Inline
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				"inset-x": [{ "inset-x": scaleInset() }],
				/**
				* Inset Block
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				"inset-y": [{ "inset-y": scaleInset() }],
				/**
				* Inset Inline Start
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				* @todo class group will be renamed to `inset-s` in next major release
				*/
				start: [{
					"inset-s": scaleInset(),
					/**
					* @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
					* @see https://github.com/tailwindlabs/tailwindcss/pull/19613
					*/
					start: scaleInset()
				}],
				/**
				* Inset Inline End
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				* @todo class group will be renamed to `inset-e` in next major release
				*/
				end: [{
					"inset-e": scaleInset(),
					/**
					* @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
					* @see https://github.com/tailwindlabs/tailwindcss/pull/19613
					*/
					end: scaleInset()
				}],
				/**
				* Inset Block Start
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				"inset-bs": [{ "inset-bs": scaleInset() }],
				/**
				* Inset Block End
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				"inset-be": [{ "inset-be": scaleInset() }],
				/**
				* Top
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				top: [{ top: scaleInset() }],
				/**
				* Right
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				right: [{ right: scaleInset() }],
				/**
				* Bottom
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				bottom: [{ bottom: scaleInset() }],
				/**
				* Left
				* @see https://tailwindcss.com/docs/top-right-bottom-left
				*/
				left: [{ left: scaleInset() }],
				/**
				* Visibility
				* @see https://tailwindcss.com/docs/visibility
				*/
				visibility: [
					"visible",
					"invisible",
					"collapse"
				],
				/**
				* Z-Index
				* @see https://tailwindcss.com/docs/z-index
				*/
				z: [{ z: [
					isInteger,
					"auto",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Flex Basis
				* @see https://tailwindcss.com/docs/flex-basis
				*/
				basis: [{ basis: [
					isFraction,
					"full",
					"auto",
					themeContainer,
					...scaleUnambiguousSpacing()
				] }],
				/**
				* Flex Direction
				* @see https://tailwindcss.com/docs/flex-direction
				*/
				"flex-direction": [{ flex: [
					"row",
					"row-reverse",
					"col",
					"col-reverse"
				] }],
				/**
				* Flex Wrap
				* @see https://tailwindcss.com/docs/flex-wrap
				*/
				"flex-wrap": [{ flex: [
					"nowrap",
					"wrap",
					"wrap-reverse"
				] }],
				/**
				* Flex
				* @see https://tailwindcss.com/docs/flex
				*/
				flex: [{ flex: [
					isNumber,
					isFraction,
					"auto",
					"initial",
					"none",
					isArbitraryValue
				] }],
				/**
				* Flex Grow
				* @see https://tailwindcss.com/docs/flex-grow
				*/
				grow: [{ grow: [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Flex Shrink
				* @see https://tailwindcss.com/docs/flex-shrink
				*/
				shrink: [{ shrink: [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Order
				* @see https://tailwindcss.com/docs/order
				*/
				order: [{ order: [
					isInteger,
					"first",
					"last",
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Grid Template Columns
				* @see https://tailwindcss.com/docs/grid-template-columns
				*/
				"grid-cols": [{ "grid-cols": scaleGridTemplateColsRows() }],
				/**
				* Grid Column Start / End
				* @see https://tailwindcss.com/docs/grid-column
				*/
				"col-start-end": [{ col: scaleGridColRowStartAndEnd() }],
				/**
				* Grid Column Start
				* @see https://tailwindcss.com/docs/grid-column
				*/
				"col-start": [{ "col-start": scaleGridColRowStartOrEnd() }],
				/**
				* Grid Column End
				* @see https://tailwindcss.com/docs/grid-column
				*/
				"col-end": [{ "col-end": scaleGridColRowStartOrEnd() }],
				/**
				* Grid Template Rows
				* @see https://tailwindcss.com/docs/grid-template-rows
				*/
				"grid-rows": [{ "grid-rows": scaleGridTemplateColsRows() }],
				/**
				* Grid Row Start / End
				* @see https://tailwindcss.com/docs/grid-row
				*/
				"row-start-end": [{ row: scaleGridColRowStartAndEnd() }],
				/**
				* Grid Row Start
				* @see https://tailwindcss.com/docs/grid-row
				*/
				"row-start": [{ "row-start": scaleGridColRowStartOrEnd() }],
				/**
				* Grid Row End
				* @see https://tailwindcss.com/docs/grid-row
				*/
				"row-end": [{ "row-end": scaleGridColRowStartOrEnd() }],
				/**
				* Grid Auto Flow
				* @see https://tailwindcss.com/docs/grid-auto-flow
				*/
				"grid-flow": [{ "grid-flow": [
					"row",
					"col",
					"dense",
					"row-dense",
					"col-dense"
				] }],
				/**
				* Grid Auto Columns
				* @see https://tailwindcss.com/docs/grid-auto-columns
				*/
				"auto-cols": [{ "auto-cols": scaleGridAutoColsRows() }],
				/**
				* Grid Auto Rows
				* @see https://tailwindcss.com/docs/grid-auto-rows
				*/
				"auto-rows": [{ "auto-rows": scaleGridAutoColsRows() }],
				/**
				* Gap
				* @see https://tailwindcss.com/docs/gap
				*/
				gap: [{ gap: scaleUnambiguousSpacing() }],
				/**
				* Gap X
				* @see https://tailwindcss.com/docs/gap
				*/
				"gap-x": [{ "gap-x": scaleUnambiguousSpacing() }],
				/**
				* Gap Y
				* @see https://tailwindcss.com/docs/gap
				*/
				"gap-y": [{ "gap-y": scaleUnambiguousSpacing() }],
				/**
				* Justify Content
				* @see https://tailwindcss.com/docs/justify-content
				*/
				"justify-content": [{ justify: [...scaleAlignPrimaryAxis(), "normal"] }],
				/**
				* Justify Items
				* @see https://tailwindcss.com/docs/justify-items
				*/
				"justify-items": [{ "justify-items": [...scaleAlignSecondaryAxis(), "normal"] }],
				/**
				* Justify Self
				* @see https://tailwindcss.com/docs/justify-self
				*/
				"justify-self": [{ "justify-self": ["auto", ...scaleAlignSecondaryAxis()] }],
				/**
				* Align Content
				* @see https://tailwindcss.com/docs/align-content
				*/
				"align-content": [{ content: ["normal", ...scaleAlignPrimaryAxis()] }],
				/**
				* Align Items
				* @see https://tailwindcss.com/docs/align-items
				*/
				"align-items": [{ items: [...scaleAlignSecondaryAxis(), { baseline: ["", "last"] }] }],
				/**
				* Align Self
				* @see https://tailwindcss.com/docs/align-self
				*/
				"align-self": [{ self: [
					"auto",
					...scaleAlignSecondaryAxis(),
					{ baseline: ["", "last"] }
				] }],
				/**
				* Place Content
				* @see https://tailwindcss.com/docs/place-content
				*/
				"place-content": [{ "place-content": scaleAlignPrimaryAxis() }],
				/**
				* Place Items
				* @see https://tailwindcss.com/docs/place-items
				*/
				"place-items": [{ "place-items": [...scaleAlignSecondaryAxis(), "baseline"] }],
				/**
				* Place Self
				* @see https://tailwindcss.com/docs/place-self
				*/
				"place-self": [{ "place-self": ["auto", ...scaleAlignSecondaryAxis()] }],
				/**
				* Padding
				* @see https://tailwindcss.com/docs/padding
				*/
				p: [{ p: scaleUnambiguousSpacing() }],
				/**
				* Padding Inline
				* @see https://tailwindcss.com/docs/padding
				*/
				px: [{ px: scaleUnambiguousSpacing() }],
				/**
				* Padding Block
				* @see https://tailwindcss.com/docs/padding
				*/
				py: [{ py: scaleUnambiguousSpacing() }],
				/**
				* Padding Inline Start
				* @see https://tailwindcss.com/docs/padding
				*/
				ps: [{ ps: scaleUnambiguousSpacing() }],
				/**
				* Padding Inline End
				* @see https://tailwindcss.com/docs/padding
				*/
				pe: [{ pe: scaleUnambiguousSpacing() }],
				/**
				* Padding Block Start
				* @see https://tailwindcss.com/docs/padding
				*/
				pbs: [{ pbs: scaleUnambiguousSpacing() }],
				/**
				* Padding Block End
				* @see https://tailwindcss.com/docs/padding
				*/
				pbe: [{ pbe: scaleUnambiguousSpacing() }],
				/**
				* Padding Top
				* @see https://tailwindcss.com/docs/padding
				*/
				pt: [{ pt: scaleUnambiguousSpacing() }],
				/**
				* Padding Right
				* @see https://tailwindcss.com/docs/padding
				*/
				pr: [{ pr: scaleUnambiguousSpacing() }],
				/**
				* Padding Bottom
				* @see https://tailwindcss.com/docs/padding
				*/
				pb: [{ pb: scaleUnambiguousSpacing() }],
				/**
				* Padding Left
				* @see https://tailwindcss.com/docs/padding
				*/
				pl: [{ pl: scaleUnambiguousSpacing() }],
				/**
				* Margin
				* @see https://tailwindcss.com/docs/margin
				*/
				m: [{ m: scaleMargin() }],
				/**
				* Margin Inline
				* @see https://tailwindcss.com/docs/margin
				*/
				mx: [{ mx: scaleMargin() }],
				/**
				* Margin Block
				* @see https://tailwindcss.com/docs/margin
				*/
				my: [{ my: scaleMargin() }],
				/**
				* Margin Inline Start
				* @see https://tailwindcss.com/docs/margin
				*/
				ms: [{ ms: scaleMargin() }],
				/**
				* Margin Inline End
				* @see https://tailwindcss.com/docs/margin
				*/
				me: [{ me: scaleMargin() }],
				/**
				* Margin Block Start
				* @see https://tailwindcss.com/docs/margin
				*/
				mbs: [{ mbs: scaleMargin() }],
				/**
				* Margin Block End
				* @see https://tailwindcss.com/docs/margin
				*/
				mbe: [{ mbe: scaleMargin() }],
				/**
				* Margin Top
				* @see https://tailwindcss.com/docs/margin
				*/
				mt: [{ mt: scaleMargin() }],
				/**
				* Margin Right
				* @see https://tailwindcss.com/docs/margin
				*/
				mr: [{ mr: scaleMargin() }],
				/**
				* Margin Bottom
				* @see https://tailwindcss.com/docs/margin
				*/
				mb: [{ mb: scaleMargin() }],
				/**
				* Margin Left
				* @see https://tailwindcss.com/docs/margin
				*/
				ml: [{ ml: scaleMargin() }],
				/**
				* Space Between X
				* @see https://tailwindcss.com/docs/margin#adding-space-between-children
				*/
				"space-x": [{ "space-x": scaleUnambiguousSpacing() }],
				/**
				* Space Between X Reverse
				* @see https://tailwindcss.com/docs/margin#adding-space-between-children
				*/
				"space-x-reverse": ["space-x-reverse"],
				/**
				* Space Between Y
				* @see https://tailwindcss.com/docs/margin#adding-space-between-children
				*/
				"space-y": [{ "space-y": scaleUnambiguousSpacing() }],
				/**
				* Space Between Y Reverse
				* @see https://tailwindcss.com/docs/margin#adding-space-between-children
				*/
				"space-y-reverse": ["space-y-reverse"],
				/**
				* Size
				* @see https://tailwindcss.com/docs/width#setting-both-width-and-height
				*/
				size: [{ size: scaleSizing() }],
				/**
				* Inline Size
				* @see https://tailwindcss.com/docs/width
				*/
				"inline-size": [{ inline: ["auto", ...scaleSizingInline()] }],
				/**
				* Min-Inline Size
				* @see https://tailwindcss.com/docs/min-width
				*/
				"min-inline-size": [{ "min-inline": ["auto", ...scaleSizingInline()] }],
				/**
				* Max-Inline Size
				* @see https://tailwindcss.com/docs/max-width
				*/
				"max-inline-size": [{ "max-inline": ["none", ...scaleSizingInline()] }],
				/**
				* Block Size
				* @see https://tailwindcss.com/docs/height
				*/
				"block-size": [{ block: ["auto", ...scaleSizingBlock()] }],
				/**
				* Min-Block Size
				* @see https://tailwindcss.com/docs/min-height
				*/
				"min-block-size": [{ "min-block": ["auto", ...scaleSizingBlock()] }],
				/**
				* Max-Block Size
				* @see https://tailwindcss.com/docs/max-height
				*/
				"max-block-size": [{ "max-block": ["none", ...scaleSizingBlock()] }],
				/**
				* Width
				* @see https://tailwindcss.com/docs/width
				*/
				w: [{ w: [
					themeContainer,
					"screen",
					...scaleSizing()
				] }],
				/**
				* Min-Width
				* @see https://tailwindcss.com/docs/min-width
				*/
				"min-w": [{ "min-w": [
					themeContainer,
					"screen",
					"none",
					...scaleSizing()
				] }],
				/**
				* Max-Width
				* @see https://tailwindcss.com/docs/max-width
				*/
				"max-w": [{ "max-w": [
					themeContainer,
					"screen",
					"none",
					"prose",
					{ screen: [themeBreakpoint] },
					...scaleSizing()
				] }],
				/**
				* Height
				* @see https://tailwindcss.com/docs/height
				*/
				h: [{ h: [
					"screen",
					"lh",
					...scaleSizing()
				] }],
				/**
				* Min-Height
				* @see https://tailwindcss.com/docs/min-height
				*/
				"min-h": [{ "min-h": [
					"screen",
					"lh",
					"none",
					...scaleSizing()
				] }],
				/**
				* Max-Height
				* @see https://tailwindcss.com/docs/max-height
				*/
				"max-h": [{ "max-h": [
					"screen",
					"lh",
					...scaleSizing()
				] }],
				/**
				* Font Size
				* @see https://tailwindcss.com/docs/font-size
				*/
				"font-size": [{ text: [
					"base",
					themeText,
					isArbitraryVariableLength,
					isArbitraryLength
				] }],
				/**
				* Font Smoothing
				* @see https://tailwindcss.com/docs/font-smoothing
				*/
				"font-smoothing": ["antialiased", "subpixel-antialiased"],
				/**
				* Font Style
				* @see https://tailwindcss.com/docs/font-style
				*/
				"font-style": ["italic", "not-italic"],
				/**
				* Font Weight
				* @see https://tailwindcss.com/docs/font-weight
				*/
				"font-weight": [{ font: [
					themeFontWeight,
					isArbitraryVariableWeight,
					isArbitraryWeight
				] }],
				/**
				* Font Stretch
				* @see https://tailwindcss.com/docs/font-stretch
				*/
				"font-stretch": [{ "font-stretch": [
					"ultra-condensed",
					"extra-condensed",
					"condensed",
					"semi-condensed",
					"normal",
					"semi-expanded",
					"expanded",
					"extra-expanded",
					"ultra-expanded",
					isPercent,
					isArbitraryValue
				] }],
				/**
				* Font Family
				* @see https://tailwindcss.com/docs/font-family
				*/
				"font-family": [{ font: [
					isArbitraryVariableFamilyName,
					isArbitraryFamilyName,
					themeFont
				] }],
				/**
				* Font Feature Settings
				* @see https://tailwindcss.com/docs/font-feature-settings
				*/
				"font-features": [{ "font-features": [isArbitraryValue] }],
				/**
				* Font Variant Numeric
				* @see https://tailwindcss.com/docs/font-variant-numeric
				*/
				"fvn-normal": ["normal-nums"],
				/**
				* Font Variant Numeric
				* @see https://tailwindcss.com/docs/font-variant-numeric
				*/
				"fvn-ordinal": ["ordinal"],
				/**
				* Font Variant Numeric
				* @see https://tailwindcss.com/docs/font-variant-numeric
				*/
				"fvn-slashed-zero": ["slashed-zero"],
				/**
				* Font Variant Numeric
				* @see https://tailwindcss.com/docs/font-variant-numeric
				*/
				"fvn-figure": ["lining-nums", "oldstyle-nums"],
				/**
				* Font Variant Numeric
				* @see https://tailwindcss.com/docs/font-variant-numeric
				*/
				"fvn-spacing": ["proportional-nums", "tabular-nums"],
				/**
				* Font Variant Numeric
				* @see https://tailwindcss.com/docs/font-variant-numeric
				*/
				"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
				/**
				* Letter Spacing
				* @see https://tailwindcss.com/docs/letter-spacing
				*/
				tracking: [{ tracking: [
					themeTracking,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Line Clamp
				* @see https://tailwindcss.com/docs/line-clamp
				*/
				"line-clamp": [{ "line-clamp": [
					isNumber,
					"none",
					isArbitraryVariable,
					isArbitraryNumber
				] }],
				/**
				* Line Height
				* @see https://tailwindcss.com/docs/line-height
				*/
				leading: [{ leading: [themeLeading, ...scaleUnambiguousSpacing()] }],
				/**
				* List Style Image
				* @see https://tailwindcss.com/docs/list-style-image
				*/
				"list-image": [{ "list-image": [
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* List Style Position
				* @see https://tailwindcss.com/docs/list-style-position
				*/
				"list-style-position": [{ list: ["inside", "outside"] }],
				/**
				* List Style Type
				* @see https://tailwindcss.com/docs/list-style-type
				*/
				"list-style-type": [{ list: [
					"disc",
					"decimal",
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Text Alignment
				* @see https://tailwindcss.com/docs/text-align
				*/
				"text-alignment": [{ text: [
					"left",
					"center",
					"right",
					"justify",
					"start",
					"end"
				] }],
				/**
				* Placeholder Color
				* @deprecated since Tailwind CSS v3.0.0
				* @see https://v3.tailwindcss.com/docs/placeholder-color
				*/
				"placeholder-color": [{ placeholder: scaleColor() }],
				/**
				* Text Color
				* @see https://tailwindcss.com/docs/text-color
				*/
				"text-color": [{ text: scaleColor() }],
				/**
				* Text Decoration
				* @see https://tailwindcss.com/docs/text-decoration
				*/
				"text-decoration": [
					"underline",
					"overline",
					"line-through",
					"no-underline"
				],
				/**
				* Text Decoration Style
				* @see https://tailwindcss.com/docs/text-decoration-style
				*/
				"text-decoration-style": [{ decoration: [...scaleLineStyle(), "wavy"] }],
				/**
				* Text Decoration Thickness
				* @see https://tailwindcss.com/docs/text-decoration-thickness
				*/
				"text-decoration-thickness": [{ decoration: [
					isNumber,
					"from-font",
					"auto",
					isArbitraryVariable,
					isArbitraryLength
				] }],
				/**
				* Text Decoration Color
				* @see https://tailwindcss.com/docs/text-decoration-color
				*/
				"text-decoration-color": [{ decoration: scaleColor() }],
				/**
				* Text Underline Offset
				* @see https://tailwindcss.com/docs/text-underline-offset
				*/
				"underline-offset": [{ "underline-offset": [
					isNumber,
					"auto",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Text Transform
				* @see https://tailwindcss.com/docs/text-transform
				*/
				"text-transform": [
					"uppercase",
					"lowercase",
					"capitalize",
					"normal-case"
				],
				/**
				* Text Overflow
				* @see https://tailwindcss.com/docs/text-overflow
				*/
				"text-overflow": [
					"truncate",
					"text-ellipsis",
					"text-clip"
				],
				/**
				* Text Wrap
				* @see https://tailwindcss.com/docs/text-wrap
				*/
				"text-wrap": [{ text: [
					"wrap",
					"nowrap",
					"balance",
					"pretty"
				] }],
				/**
				* Text Indent
				* @see https://tailwindcss.com/docs/text-indent
				*/
				indent: [{ indent: scaleUnambiguousSpacing() }],
				/**
				* Tab Size
				* @see https://tailwindcss.com/docs/tab-size
				*/
				"tab-size": [{ tab: [
					isInteger,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Vertical Alignment
				* @see https://tailwindcss.com/docs/vertical-align
				*/
				"vertical-align": [{ align: [
					"baseline",
					"top",
					"middle",
					"bottom",
					"text-top",
					"text-bottom",
					"sub",
					"super",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Whitespace
				* @see https://tailwindcss.com/docs/whitespace
				*/
				whitespace: [{ whitespace: [
					"normal",
					"nowrap",
					"pre",
					"pre-line",
					"pre-wrap",
					"break-spaces"
				] }],
				/**
				* Word Break
				* @see https://tailwindcss.com/docs/word-break
				*/
				break: [{ break: [
					"normal",
					"words",
					"all",
					"keep"
				] }],
				/**
				* Overflow Wrap
				* @see https://tailwindcss.com/docs/overflow-wrap
				*/
				wrap: [{ wrap: [
					"break-word",
					"anywhere",
					"normal"
				] }],
				/**
				* Hyphens
				* @see https://tailwindcss.com/docs/hyphens
				*/
				hyphens: [{ hyphens: [
					"none",
					"manual",
					"auto"
				] }],
				/**
				* Content
				* @see https://tailwindcss.com/docs/content
				*/
				content: [{ content: [
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Background Attachment
				* @see https://tailwindcss.com/docs/background-attachment
				*/
				"bg-attachment": [{ bg: [
					"fixed",
					"local",
					"scroll"
				] }],
				/**
				* Background Clip
				* @see https://tailwindcss.com/docs/background-clip
				*/
				"bg-clip": [{ "bg-clip": [
					"border",
					"padding",
					"content",
					"text"
				] }],
				/**
				* Background Origin
				* @see https://tailwindcss.com/docs/background-origin
				*/
				"bg-origin": [{ "bg-origin": [
					"border",
					"padding",
					"content"
				] }],
				/**
				* Background Position
				* @see https://tailwindcss.com/docs/background-position
				*/
				"bg-position": [{ bg: scaleBgPosition() }],
				/**
				* Background Repeat
				* @see https://tailwindcss.com/docs/background-repeat
				*/
				"bg-repeat": [{ bg: scaleBgRepeat() }],
				/**
				* Background Size
				* @see https://tailwindcss.com/docs/background-size
				*/
				"bg-size": [{ bg: scaleBgSize() }],
				/**
				* Background Image
				* @see https://tailwindcss.com/docs/background-image
				*/
				"bg-image": [{ bg: [
					"none",
					{
						linear: [
							{ to: [
								"t",
								"tr",
								"r",
								"br",
								"b",
								"bl",
								"l",
								"tl"
							] },
							isInteger,
							isArbitraryVariable,
							isArbitraryValue
						],
						radial: [
							"",
							isArbitraryVariable,
							isArbitraryValue
						],
						conic: [
							isInteger,
							isArbitraryVariable,
							isArbitraryValue
						]
					},
					isArbitraryVariableImage,
					isArbitraryImage
				] }],
				/**
				* Background Color
				* @see https://tailwindcss.com/docs/background-color
				*/
				"bg-color": [{ bg: scaleColor() }],
				/**
				* Gradient Color Stops From Position
				* @see https://tailwindcss.com/docs/gradient-color-stops
				*/
				"gradient-from-pos": [{ from: scaleGradientStopPosition() }],
				/**
				* Gradient Color Stops Via Position
				* @see https://tailwindcss.com/docs/gradient-color-stops
				*/
				"gradient-via-pos": [{ via: scaleGradientStopPosition() }],
				/**
				* Gradient Color Stops To Position
				* @see https://tailwindcss.com/docs/gradient-color-stops
				*/
				"gradient-to-pos": [{ to: scaleGradientStopPosition() }],
				/**
				* Gradient Color Stops From
				* @see https://tailwindcss.com/docs/gradient-color-stops
				*/
				"gradient-from": [{ from: scaleColor() }],
				/**
				* Gradient Color Stops Via
				* @see https://tailwindcss.com/docs/gradient-color-stops
				*/
				"gradient-via": [{ via: scaleColor() }],
				/**
				* Gradient Color Stops To
				* @see https://tailwindcss.com/docs/gradient-color-stops
				*/
				"gradient-to": [{ to: scaleColor() }],
				/**
				* Border Radius
				* @see https://tailwindcss.com/docs/border-radius
				*/
				rounded: [{ rounded: scaleRadius() }],
				/**
				* Border Radius Start
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-s": [{ "rounded-s": scaleRadius() }],
				/**
				* Border Radius End
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-e": [{ "rounded-e": scaleRadius() }],
				/**
				* Border Radius Top
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-t": [{ "rounded-t": scaleRadius() }],
				/**
				* Border Radius Right
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-r": [{ "rounded-r": scaleRadius() }],
				/**
				* Border Radius Bottom
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-b": [{ "rounded-b": scaleRadius() }],
				/**
				* Border Radius Left
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-l": [{ "rounded-l": scaleRadius() }],
				/**
				* Border Radius Start Start
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-ss": [{ "rounded-ss": scaleRadius() }],
				/**
				* Border Radius Start End
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-se": [{ "rounded-se": scaleRadius() }],
				/**
				* Border Radius End End
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-ee": [{ "rounded-ee": scaleRadius() }],
				/**
				* Border Radius End Start
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-es": [{ "rounded-es": scaleRadius() }],
				/**
				* Border Radius Top Left
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-tl": [{ "rounded-tl": scaleRadius() }],
				/**
				* Border Radius Top Right
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-tr": [{ "rounded-tr": scaleRadius() }],
				/**
				* Border Radius Bottom Right
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-br": [{ "rounded-br": scaleRadius() }],
				/**
				* Border Radius Bottom Left
				* @see https://tailwindcss.com/docs/border-radius
				*/
				"rounded-bl": [{ "rounded-bl": scaleRadius() }],
				/**
				* Border Width
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w": [{ border: scaleBorderWidth() }],
				/**
				* Border Width Inline
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-x": [{ "border-x": scaleBorderWidth() }],
				/**
				* Border Width Block
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-y": [{ "border-y": scaleBorderWidth() }],
				/**
				* Border Width Inline Start
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-s": [{ "border-s": scaleBorderWidth() }],
				/**
				* Border Width Inline End
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-e": [{ "border-e": scaleBorderWidth() }],
				/**
				* Border Width Block Start
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-bs": [{ "border-bs": scaleBorderWidth() }],
				/**
				* Border Width Block End
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-be": [{ "border-be": scaleBorderWidth() }],
				/**
				* Border Width Top
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-t": [{ "border-t": scaleBorderWidth() }],
				/**
				* Border Width Right
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-r": [{ "border-r": scaleBorderWidth() }],
				/**
				* Border Width Bottom
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-b": [{ "border-b": scaleBorderWidth() }],
				/**
				* Border Width Left
				* @see https://tailwindcss.com/docs/border-width
				*/
				"border-w-l": [{ "border-l": scaleBorderWidth() }],
				/**
				* Divide Width X
				* @see https://tailwindcss.com/docs/border-width#between-children
				*/
				"divide-x": [{ "divide-x": scaleBorderWidth() }],
				/**
				* Divide Width X Reverse
				* @see https://tailwindcss.com/docs/border-width#between-children
				*/
				"divide-x-reverse": ["divide-x-reverse"],
				/**
				* Divide Width Y
				* @see https://tailwindcss.com/docs/border-width#between-children
				*/
				"divide-y": [{ "divide-y": scaleBorderWidth() }],
				/**
				* Divide Width Y Reverse
				* @see https://tailwindcss.com/docs/border-width#between-children
				*/
				"divide-y-reverse": ["divide-y-reverse"],
				/**
				* Border Style
				* @see https://tailwindcss.com/docs/border-style
				*/
				"border-style": [{ border: [
					...scaleLineStyle(),
					"hidden",
					"none"
				] }],
				/**
				* Divide Style
				* @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
				*/
				"divide-style": [{ divide: [
					...scaleLineStyle(),
					"hidden",
					"none"
				] }],
				/**
				* Border Color
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color": [{ border: scaleColor() }],
				/**
				* Border Color Inline
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-x": [{ "border-x": scaleColor() }],
				/**
				* Border Color Block
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-y": [{ "border-y": scaleColor() }],
				/**
				* Border Color Inline Start
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-s": [{ "border-s": scaleColor() }],
				/**
				* Border Color Inline End
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-e": [{ "border-e": scaleColor() }],
				/**
				* Border Color Block Start
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-bs": [{ "border-bs": scaleColor() }],
				/**
				* Border Color Block End
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-be": [{ "border-be": scaleColor() }],
				/**
				* Border Color Top
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-t": [{ "border-t": scaleColor() }],
				/**
				* Border Color Right
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-r": [{ "border-r": scaleColor() }],
				/**
				* Border Color Bottom
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-b": [{ "border-b": scaleColor() }],
				/**
				* Border Color Left
				* @see https://tailwindcss.com/docs/border-color
				*/
				"border-color-l": [{ "border-l": scaleColor() }],
				/**
				* Divide Color
				* @see https://tailwindcss.com/docs/divide-color
				*/
				"divide-color": [{ divide: scaleColor() }],
				/**
				* Outline Style
				* @see https://tailwindcss.com/docs/outline-style
				*/
				"outline-style": [{ outline: [
					...scaleLineStyle(),
					"none",
					"hidden"
				] }],
				/**
				* Outline Offset
				* @see https://tailwindcss.com/docs/outline-offset
				*/
				"outline-offset": [{ "outline-offset": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Outline Width
				* @see https://tailwindcss.com/docs/outline-width
				*/
				"outline-w": [{ outline: [
					"",
					isNumber,
					isArbitraryVariableLength,
					isArbitraryLength
				] }],
				/**
				* Outline Color
				* @see https://tailwindcss.com/docs/outline-color
				*/
				"outline-color": [{ outline: scaleColor() }],
				/**
				* Box Shadow
				* @see https://tailwindcss.com/docs/box-shadow
				*/
				shadow: [{ shadow: [
					"",
					"none",
					themeShadow,
					isArbitraryVariableShadow,
					isArbitraryShadow
				] }],
				/**
				* Box Shadow Color
				* @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
				*/
				"shadow-color": [{ shadow: scaleColor() }],
				/**
				* Inset Box Shadow
				* @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
				*/
				"inset-shadow": [{ "inset-shadow": [
					"none",
					themeInsetShadow,
					isArbitraryVariableShadow,
					isArbitraryShadow
				] }],
				/**
				* Inset Box Shadow Color
				* @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
				*/
				"inset-shadow-color": [{ "inset-shadow": scaleColor() }],
				/**
				* Ring Width
				* @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
				*/
				"ring-w": [{ ring: scaleBorderWidth() }],
				/**
				* Ring Width Inset
				* @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
				* @deprecated since Tailwind CSS v4.0.0
				* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
				*/
				"ring-w-inset": ["ring-inset"],
				/**
				* Ring Color
				* @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
				*/
				"ring-color": [{ ring: scaleColor() }],
				/**
				* Ring Offset Width
				* @see https://v3.tailwindcss.com/docs/ring-offset-width
				* @deprecated since Tailwind CSS v4.0.0
				* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
				*/
				"ring-offset-w": [{ "ring-offset": [isNumber, isArbitraryLength] }],
				/**
				* Ring Offset Color
				* @see https://v3.tailwindcss.com/docs/ring-offset-color
				* @deprecated since Tailwind CSS v4.0.0
				* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
				*/
				"ring-offset-color": [{ "ring-offset": scaleColor() }],
				/**
				* Inset Ring Width
				* @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
				*/
				"inset-ring-w": [{ "inset-ring": scaleBorderWidth() }],
				/**
				* Inset Ring Color
				* @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
				*/
				"inset-ring-color": [{ "inset-ring": scaleColor() }],
				/**
				* Text Shadow
				* @see https://tailwindcss.com/docs/text-shadow
				*/
				"text-shadow": [{ "text-shadow": [
					"none",
					themeTextShadow,
					isArbitraryVariableShadow,
					isArbitraryShadow
				] }],
				/**
				* Text Shadow Color
				* @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
				*/
				"text-shadow-color": [{ "text-shadow": scaleColor() }],
				/**
				* Opacity
				* @see https://tailwindcss.com/docs/opacity
				*/
				opacity: [{ opacity: [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Mix Blend Mode
				* @see https://tailwindcss.com/docs/mix-blend-mode
				*/
				"mix-blend": [{ "mix-blend": [
					...scaleBlendMode(),
					"plus-darker",
					"plus-lighter"
				] }],
				/**
				* Background Blend Mode
				* @see https://tailwindcss.com/docs/background-blend-mode
				*/
				"bg-blend": [{ "bg-blend": scaleBlendMode() }],
				/**
				* Mask Clip
				* @see https://tailwindcss.com/docs/mask-clip
				*/
				"mask-clip": [{ "mask-clip": [
					"border",
					"padding",
					"content",
					"fill",
					"stroke",
					"view"
				] }, "mask-no-clip"],
				/**
				* Mask Composite
				* @see https://tailwindcss.com/docs/mask-composite
				*/
				"mask-composite": [{ mask: [
					"add",
					"subtract",
					"intersect",
					"exclude"
				] }],
				/**
				* Mask Image
				* @see https://tailwindcss.com/docs/mask-image
				*/
				"mask-image-linear-pos": [{ "mask-linear": [isNumber] }],
				"mask-image-linear-from-pos": [{ "mask-linear-from": scaleMaskImagePosition() }],
				"mask-image-linear-to-pos": [{ "mask-linear-to": scaleMaskImagePosition() }],
				"mask-image-linear-from-color": [{ "mask-linear-from": scaleColor() }],
				"mask-image-linear-to-color": [{ "mask-linear-to": scaleColor() }],
				"mask-image-t-from-pos": [{ "mask-t-from": scaleMaskImagePosition() }],
				"mask-image-t-to-pos": [{ "mask-t-to": scaleMaskImagePosition() }],
				"mask-image-t-from-color": [{ "mask-t-from": scaleColor() }],
				"mask-image-t-to-color": [{ "mask-t-to": scaleColor() }],
				"mask-image-r-from-pos": [{ "mask-r-from": scaleMaskImagePosition() }],
				"mask-image-r-to-pos": [{ "mask-r-to": scaleMaskImagePosition() }],
				"mask-image-r-from-color": [{ "mask-r-from": scaleColor() }],
				"mask-image-r-to-color": [{ "mask-r-to": scaleColor() }],
				"mask-image-b-from-pos": [{ "mask-b-from": scaleMaskImagePosition() }],
				"mask-image-b-to-pos": [{ "mask-b-to": scaleMaskImagePosition() }],
				"mask-image-b-from-color": [{ "mask-b-from": scaleColor() }],
				"mask-image-b-to-color": [{ "mask-b-to": scaleColor() }],
				"mask-image-l-from-pos": [{ "mask-l-from": scaleMaskImagePosition() }],
				"mask-image-l-to-pos": [{ "mask-l-to": scaleMaskImagePosition() }],
				"mask-image-l-from-color": [{ "mask-l-from": scaleColor() }],
				"mask-image-l-to-color": [{ "mask-l-to": scaleColor() }],
				"mask-image-x-from-pos": [{ "mask-x-from": scaleMaskImagePosition() }],
				"mask-image-x-to-pos": [{ "mask-x-to": scaleMaskImagePosition() }],
				"mask-image-x-from-color": [{ "mask-x-from": scaleColor() }],
				"mask-image-x-to-color": [{ "mask-x-to": scaleColor() }],
				"mask-image-y-from-pos": [{ "mask-y-from": scaleMaskImagePosition() }],
				"mask-image-y-to-pos": [{ "mask-y-to": scaleMaskImagePosition() }],
				"mask-image-y-from-color": [{ "mask-y-from": scaleColor() }],
				"mask-image-y-to-color": [{ "mask-y-to": scaleColor() }],
				"mask-image-radial": [{ "mask-radial": [isArbitraryVariable, isArbitraryValue] }],
				"mask-image-radial-from-pos": [{ "mask-radial-from": scaleMaskImagePosition() }],
				"mask-image-radial-to-pos": [{ "mask-radial-to": scaleMaskImagePosition() }],
				"mask-image-radial-from-color": [{ "mask-radial-from": scaleColor() }],
				"mask-image-radial-to-color": [{ "mask-radial-to": scaleColor() }],
				"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
				"mask-image-radial-size": [{ "mask-radial": [{
					closest: ["side", "corner"],
					farthest: ["side", "corner"]
				}] }],
				"mask-image-radial-pos": [{ "mask-radial-at": scalePosition() }],
				"mask-image-conic-pos": [{ "mask-conic": [isNumber] }],
				"mask-image-conic-from-pos": [{ "mask-conic-from": scaleMaskImagePosition() }],
				"mask-image-conic-to-pos": [{ "mask-conic-to": scaleMaskImagePosition() }],
				"mask-image-conic-from-color": [{ "mask-conic-from": scaleColor() }],
				"mask-image-conic-to-color": [{ "mask-conic-to": scaleColor() }],
				/**
				* Mask Mode
				* @see https://tailwindcss.com/docs/mask-mode
				*/
				"mask-mode": [{ mask: [
					"alpha",
					"luminance",
					"match"
				] }],
				/**
				* Mask Origin
				* @see https://tailwindcss.com/docs/mask-origin
				*/
				"mask-origin": [{ "mask-origin": [
					"border",
					"padding",
					"content",
					"fill",
					"stroke",
					"view"
				] }],
				/**
				* Mask Position
				* @see https://tailwindcss.com/docs/mask-position
				*/
				"mask-position": [{ mask: scaleBgPosition() }],
				/**
				* Mask Repeat
				* @see https://tailwindcss.com/docs/mask-repeat
				*/
				"mask-repeat": [{ mask: scaleBgRepeat() }],
				/**
				* Mask Size
				* @see https://tailwindcss.com/docs/mask-size
				*/
				"mask-size": [{ mask: scaleBgSize() }],
				/**
				* Mask Type
				* @see https://tailwindcss.com/docs/mask-type
				*/
				"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
				/**
				* Mask Image
				* @see https://tailwindcss.com/docs/mask-image
				*/
				"mask-image": [{ mask: [
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Filter
				* @see https://tailwindcss.com/docs/filter
				*/
				filter: [{ filter: [
					"",
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Blur
				* @see https://tailwindcss.com/docs/blur
				*/
				blur: [{ blur: scaleBlur() }],
				/**
				* Brightness
				* @see https://tailwindcss.com/docs/brightness
				*/
				brightness: [{ brightness: [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Contrast
				* @see https://tailwindcss.com/docs/contrast
				*/
				contrast: [{ contrast: [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Drop Shadow
				* @see https://tailwindcss.com/docs/drop-shadow
				*/
				"drop-shadow": [{ "drop-shadow": [
					"",
					"none",
					themeDropShadow,
					isArbitraryVariableShadow,
					isArbitraryShadow
				] }],
				/**
				* Drop Shadow Color
				* @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
				*/
				"drop-shadow-color": [{ "drop-shadow": scaleColor() }],
				/**
				* Grayscale
				* @see https://tailwindcss.com/docs/grayscale
				*/
				grayscale: [{ grayscale: [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Hue Rotate
				* @see https://tailwindcss.com/docs/hue-rotate
				*/
				"hue-rotate": [{ "hue-rotate": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Invert
				* @see https://tailwindcss.com/docs/invert
				*/
				invert: [{ invert: [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Saturate
				* @see https://tailwindcss.com/docs/saturate
				*/
				saturate: [{ saturate: [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Sepia
				* @see https://tailwindcss.com/docs/sepia
				*/
				sepia: [{ sepia: [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Filter
				* @see https://tailwindcss.com/docs/backdrop-filter
				*/
				"backdrop-filter": [{ "backdrop-filter": [
					"",
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Blur
				* @see https://tailwindcss.com/docs/backdrop-blur
				*/
				"backdrop-blur": [{ "backdrop-blur": scaleBlur() }],
				/**
				* Backdrop Brightness
				* @see https://tailwindcss.com/docs/backdrop-brightness
				*/
				"backdrop-brightness": [{ "backdrop-brightness": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Contrast
				* @see https://tailwindcss.com/docs/backdrop-contrast
				*/
				"backdrop-contrast": [{ "backdrop-contrast": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Grayscale
				* @see https://tailwindcss.com/docs/backdrop-grayscale
				*/
				"backdrop-grayscale": [{ "backdrop-grayscale": [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Hue Rotate
				* @see https://tailwindcss.com/docs/backdrop-hue-rotate
				*/
				"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Invert
				* @see https://tailwindcss.com/docs/backdrop-invert
				*/
				"backdrop-invert": [{ "backdrop-invert": [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Opacity
				* @see https://tailwindcss.com/docs/backdrop-opacity
				*/
				"backdrop-opacity": [{ "backdrop-opacity": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Saturate
				* @see https://tailwindcss.com/docs/backdrop-saturate
				*/
				"backdrop-saturate": [{ "backdrop-saturate": [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backdrop Sepia
				* @see https://tailwindcss.com/docs/backdrop-sepia
				*/
				"backdrop-sepia": [{ "backdrop-sepia": [
					"",
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Border Collapse
				* @see https://tailwindcss.com/docs/border-collapse
				*/
				"border-collapse": [{ border: ["collapse", "separate"] }],
				/**
				* Border Spacing
				* @see https://tailwindcss.com/docs/border-spacing
				*/
				"border-spacing": [{ "border-spacing": scaleUnambiguousSpacing() }],
				/**
				* Border Spacing X
				* @see https://tailwindcss.com/docs/border-spacing
				*/
				"border-spacing-x": [{ "border-spacing-x": scaleUnambiguousSpacing() }],
				/**
				* Border Spacing Y
				* @see https://tailwindcss.com/docs/border-spacing
				*/
				"border-spacing-y": [{ "border-spacing-y": scaleUnambiguousSpacing() }],
				/**
				* Table Layout
				* @see https://tailwindcss.com/docs/table-layout
				*/
				"table-layout": [{ table: ["auto", "fixed"] }],
				/**
				* Caption Side
				* @see https://tailwindcss.com/docs/caption-side
				*/
				caption: [{ caption: ["top", "bottom"] }],
				/**
				* Transition Property
				* @see https://tailwindcss.com/docs/transition-property
				*/
				transition: [{ transition: [
					"",
					"all",
					"colors",
					"opacity",
					"shadow",
					"transform",
					"none",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Transition Behavior
				* @see https://tailwindcss.com/docs/transition-behavior
				*/
				"transition-behavior": [{ transition: ["normal", "discrete"] }],
				/**
				* Transition Duration
				* @see https://tailwindcss.com/docs/transition-duration
				*/
				duration: [{ duration: [
					isNumber,
					"initial",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Transition Timing Function
				* @see https://tailwindcss.com/docs/transition-timing-function
				*/
				ease: [{ ease: [
					"linear",
					"initial",
					themeEase,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Transition Delay
				* @see https://tailwindcss.com/docs/transition-delay
				*/
				delay: [{ delay: [
					isNumber,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Animation
				* @see https://tailwindcss.com/docs/animation
				*/
				animate: [{ animate: [
					"none",
					themeAnimate,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Backface Visibility
				* @see https://tailwindcss.com/docs/backface-visibility
				*/
				backface: [{ backface: ["hidden", "visible"] }],
				/**
				* Perspective
				* @see https://tailwindcss.com/docs/perspective
				*/
				perspective: [{ perspective: [
					themePerspective,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Perspective Origin
				* @see https://tailwindcss.com/docs/perspective-origin
				*/
				"perspective-origin": [{ "perspective-origin": scalePositionWithArbitrary() }],
				/**
				* Rotate
				* @see https://tailwindcss.com/docs/rotate
				*/
				rotate: [{ rotate: scaleRotate() }],
				/**
				* Rotate X
				* @see https://tailwindcss.com/docs/rotate
				*/
				"rotate-x": [{ "rotate-x": scaleRotate() }],
				/**
				* Rotate Y
				* @see https://tailwindcss.com/docs/rotate
				*/
				"rotate-y": [{ "rotate-y": scaleRotate() }],
				/**
				* Rotate Z
				* @see https://tailwindcss.com/docs/rotate
				*/
				"rotate-z": [{ "rotate-z": scaleRotate() }],
				/**
				* Scale
				* @see https://tailwindcss.com/docs/scale
				*/
				scale: [{ scale: scaleScale() }],
				/**
				* Scale X
				* @see https://tailwindcss.com/docs/scale
				*/
				"scale-x": [{ "scale-x": scaleScale() }],
				/**
				* Scale Y
				* @see https://tailwindcss.com/docs/scale
				*/
				"scale-y": [{ "scale-y": scaleScale() }],
				/**
				* Scale Z
				* @see https://tailwindcss.com/docs/scale
				*/
				"scale-z": [{ "scale-z": scaleScale() }],
				/**
				* Scale 3D
				* @see https://tailwindcss.com/docs/scale
				*/
				"scale-3d": ["scale-3d"],
				/**
				* Skew
				* @see https://tailwindcss.com/docs/skew
				*/
				skew: [{ skew: scaleSkew() }],
				/**
				* Skew X
				* @see https://tailwindcss.com/docs/skew
				*/
				"skew-x": [{ "skew-x": scaleSkew() }],
				/**
				* Skew Y
				* @see https://tailwindcss.com/docs/skew
				*/
				"skew-y": [{ "skew-y": scaleSkew() }],
				/**
				* Transform
				* @see https://tailwindcss.com/docs/transform
				*/
				transform: [{ transform: [
					isArbitraryVariable,
					isArbitraryValue,
					"",
					"none",
					"gpu",
					"cpu"
				] }],
				/**
				* Transform Origin
				* @see https://tailwindcss.com/docs/transform-origin
				*/
				"transform-origin": [{ origin: scalePositionWithArbitrary() }],
				/**
				* Transform Style
				* @see https://tailwindcss.com/docs/transform-style
				*/
				"transform-style": [{ transform: ["3d", "flat"] }],
				/**
				* Translate
				* @see https://tailwindcss.com/docs/translate
				*/
				translate: [{ translate: scaleTranslate() }],
				/**
				* Translate X
				* @see https://tailwindcss.com/docs/translate
				*/
				"translate-x": [{ "translate-x": scaleTranslate() }],
				/**
				* Translate Y
				* @see https://tailwindcss.com/docs/translate
				*/
				"translate-y": [{ "translate-y": scaleTranslate() }],
				/**
				* Translate Z
				* @see https://tailwindcss.com/docs/translate
				*/
				"translate-z": [{ "translate-z": scaleTranslate() }],
				/**
				* Translate None
				* @see https://tailwindcss.com/docs/translate
				*/
				"translate-none": ["translate-none"],
				/**
				* Zoom
				* @see https://tailwindcss.com/docs/zoom
				*/
				zoom: [{ zoom: [
					isInteger,
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Accent Color
				* @see https://tailwindcss.com/docs/accent-color
				*/
				accent: [{ accent: scaleColor() }],
				/**
				* Appearance
				* @see https://tailwindcss.com/docs/appearance
				*/
				appearance: [{ appearance: ["none", "auto"] }],
				/**
				* Caret Color
				* @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
				*/
				"caret-color": [{ caret: scaleColor() }],
				/**
				* Color Scheme
				* @see https://tailwindcss.com/docs/color-scheme
				*/
				"color-scheme": [{ scheme: [
					"normal",
					"dark",
					"light",
					"light-dark",
					"only-dark",
					"only-light"
				] }],
				/**
				* Cursor
				* @see https://tailwindcss.com/docs/cursor
				*/
				cursor: [{ cursor: [
					"auto",
					"default",
					"pointer",
					"wait",
					"text",
					"move",
					"help",
					"not-allowed",
					"none",
					"context-menu",
					"progress",
					"cell",
					"crosshair",
					"vertical-text",
					"alias",
					"copy",
					"no-drop",
					"grab",
					"grabbing",
					"all-scroll",
					"col-resize",
					"row-resize",
					"n-resize",
					"e-resize",
					"s-resize",
					"w-resize",
					"ne-resize",
					"nw-resize",
					"se-resize",
					"sw-resize",
					"ew-resize",
					"ns-resize",
					"nesw-resize",
					"nwse-resize",
					"zoom-in",
					"zoom-out",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Field Sizing
				* @see https://tailwindcss.com/docs/field-sizing
				*/
				"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
				/**
				* Pointer Events
				* @see https://tailwindcss.com/docs/pointer-events
				*/
				"pointer-events": [{ "pointer-events": ["auto", "none"] }],
				/**
				* Resize
				* @see https://tailwindcss.com/docs/resize
				*/
				resize: [{ resize: [
					"none",
					"",
					"y",
					"x"
				] }],
				/**
				* Scroll Behavior
				* @see https://tailwindcss.com/docs/scroll-behavior
				*/
				"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
				/**
				* Scrollbar Thumb Color
				* @see https://tailwindcss.com/docs/scrollbar-color
				*/
				"scrollbar-thumb-color": [{ "scrollbar-thumb": scaleColor() }],
				/**
				* Scrollbar Track Color
				* @see https://tailwindcss.com/docs/scrollbar-color
				*/
				"scrollbar-track-color": [{ "scrollbar-track": scaleColor() }],
				/**
				* Scrollbar Gutter
				* @see https://tailwindcss.com/docs/scrollbar-gutter
				*/
				"scrollbar-gutter": [{ "scrollbar-gutter": [
					"auto",
					"stable",
					"both"
				] }],
				/**
				* Scrollbar Width
				* @see https://tailwindcss.com/docs/scrollbar-width
				*/
				"scrollbar-w": [{ scrollbar: [
					"auto",
					"thin",
					"none"
				] }],
				/**
				* Scroll Margin
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-m": [{ "scroll-m": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Inline
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-mx": [{ "scroll-mx": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Block
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-my": [{ "scroll-my": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Inline Start
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-ms": [{ "scroll-ms": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Inline End
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-me": [{ "scroll-me": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Block Start
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-mbs": [{ "scroll-mbs": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Block End
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-mbe": [{ "scroll-mbe": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Top
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-mt": [{ "scroll-mt": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Right
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-mr": [{ "scroll-mr": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Bottom
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-mb": [{ "scroll-mb": scaleUnambiguousSpacing() }],
				/**
				* Scroll Margin Left
				* @see https://tailwindcss.com/docs/scroll-margin
				*/
				"scroll-ml": [{ "scroll-ml": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-p": [{ "scroll-p": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Inline
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-px": [{ "scroll-px": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Block
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-py": [{ "scroll-py": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Inline Start
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-ps": [{ "scroll-ps": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Inline End
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pe": [{ "scroll-pe": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Block Start
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pbs": [{ "scroll-pbs": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Block End
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pbe": [{ "scroll-pbe": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Top
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pt": [{ "scroll-pt": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Right
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pr": [{ "scroll-pr": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Bottom
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pb": [{ "scroll-pb": scaleUnambiguousSpacing() }],
				/**
				* Scroll Padding Left
				* @see https://tailwindcss.com/docs/scroll-padding
				*/
				"scroll-pl": [{ "scroll-pl": scaleUnambiguousSpacing() }],
				/**
				* Scroll Snap Align
				* @see https://tailwindcss.com/docs/scroll-snap-align
				*/
				"snap-align": [{ snap: [
					"start",
					"end",
					"center",
					"align-none"
				] }],
				/**
				* Scroll Snap Stop
				* @see https://tailwindcss.com/docs/scroll-snap-stop
				*/
				"snap-stop": [{ snap: ["normal", "always"] }],
				/**
				* Scroll Snap Type
				* @see https://tailwindcss.com/docs/scroll-snap-type
				*/
				"snap-type": [{ snap: [
					"none",
					"x",
					"y",
					"both"
				] }],
				/**
				* Scroll Snap Type Strictness
				* @see https://tailwindcss.com/docs/scroll-snap-type
				*/
				"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
				/**
				* Touch Action
				* @see https://tailwindcss.com/docs/touch-action
				*/
				touch: [{ touch: [
					"auto",
					"none",
					"manipulation"
				] }],
				/**
				* Touch Action X
				* @see https://tailwindcss.com/docs/touch-action
				*/
				"touch-x": [{ "touch-pan": [
					"x",
					"left",
					"right"
				] }],
				/**
				* Touch Action Y
				* @see https://tailwindcss.com/docs/touch-action
				*/
				"touch-y": [{ "touch-pan": [
					"y",
					"up",
					"down"
				] }],
				/**
				* Touch Action Pinch Zoom
				* @see https://tailwindcss.com/docs/touch-action
				*/
				"touch-pz": ["touch-pinch-zoom"],
				/**
				* User Select
				* @see https://tailwindcss.com/docs/user-select
				*/
				select: [{ select: [
					"none",
					"text",
					"all",
					"auto"
				] }],
				/**
				* Will Change
				* @see https://tailwindcss.com/docs/will-change
				*/
				"will-change": [{ "will-change": [
					"auto",
					"scroll",
					"contents",
					"transform",
					isArbitraryVariable,
					isArbitraryValue
				] }],
				/**
				* Fill
				* @see https://tailwindcss.com/docs/fill
				*/
				fill: [{ fill: ["none", ...scaleColor()] }],
				/**
				* Stroke Width
				* @see https://tailwindcss.com/docs/stroke-width
				*/
				"stroke-w": [{ stroke: [
					isNumber,
					isArbitraryVariableLength,
					isArbitraryLength,
					isArbitraryNumber
				] }],
				/**
				* Stroke
				* @see https://tailwindcss.com/docs/stroke
				*/
				stroke: [{ stroke: ["none", ...scaleColor()] }],
				/**
				* Forced Color Adjust
				* @see https://tailwindcss.com/docs/forced-color-adjust
				*/
				"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
			},
			conflictingClassGroups: {
				"container-named": ["container-type"],
				overflow: ["overflow-x", "overflow-y"],
				overscroll: ["overscroll-x", "overscroll-y"],
				inset: [
					"inset-x",
					"inset-y",
					"inset-bs",
					"inset-be",
					"start",
					"end",
					"top",
					"right",
					"bottom",
					"left"
				],
				"inset-x": ["right", "left"],
				"inset-y": ["top", "bottom"],
				flex: [
					"basis",
					"grow",
					"shrink"
				],
				gap: ["gap-x", "gap-y"],
				p: [
					"px",
					"py",
					"ps",
					"pe",
					"pbs",
					"pbe",
					"pt",
					"pr",
					"pb",
					"pl"
				],
				px: ["pr", "pl"],
				py: ["pt", "pb"],
				m: [
					"mx",
					"my",
					"ms",
					"me",
					"mbs",
					"mbe",
					"mt",
					"mr",
					"mb",
					"ml"
				],
				mx: ["mr", "ml"],
				my: ["mt", "mb"],
				size: ["w", "h"],
				"font-size": ["leading"],
				"fvn-normal": [
					"fvn-ordinal",
					"fvn-slashed-zero",
					"fvn-figure",
					"fvn-spacing",
					"fvn-fraction"
				],
				"fvn-ordinal": ["fvn-normal"],
				"fvn-slashed-zero": ["fvn-normal"],
				"fvn-figure": ["fvn-normal"],
				"fvn-spacing": ["fvn-normal"],
				"fvn-fraction": ["fvn-normal"],
				"line-clamp": ["display", "overflow"],
				rounded: [
					"rounded-s",
					"rounded-e",
					"rounded-t",
					"rounded-r",
					"rounded-b",
					"rounded-l",
					"rounded-ss",
					"rounded-se",
					"rounded-ee",
					"rounded-es",
					"rounded-tl",
					"rounded-tr",
					"rounded-br",
					"rounded-bl"
				],
				"rounded-s": ["rounded-ss", "rounded-es"],
				"rounded-e": ["rounded-se", "rounded-ee"],
				"rounded-t": ["rounded-tl", "rounded-tr"],
				"rounded-r": ["rounded-tr", "rounded-br"],
				"rounded-b": ["rounded-br", "rounded-bl"],
				"rounded-l": ["rounded-tl", "rounded-bl"],
				"border-spacing": ["border-spacing-x", "border-spacing-y"],
				"border-w": [
					"border-w-x",
					"border-w-y",
					"border-w-s",
					"border-w-e",
					"border-w-bs",
					"border-w-be",
					"border-w-t",
					"border-w-r",
					"border-w-b",
					"border-w-l"
				],
				"border-w-x": ["border-w-r", "border-w-l"],
				"border-w-y": ["border-w-t", "border-w-b"],
				"border-color": [
					"border-color-x",
					"border-color-y",
					"border-color-s",
					"border-color-e",
					"border-color-bs",
					"border-color-be",
					"border-color-t",
					"border-color-r",
					"border-color-b",
					"border-color-l"
				],
				"border-color-x": ["border-color-r", "border-color-l"],
				"border-color-y": ["border-color-t", "border-color-b"],
				translate: [
					"translate-x",
					"translate-y",
					"translate-none"
				],
				"translate-none": [
					"translate",
					"translate-x",
					"translate-y",
					"translate-z"
				],
				"scroll-m": [
					"scroll-mx",
					"scroll-my",
					"scroll-ms",
					"scroll-me",
					"scroll-mbs",
					"scroll-mbe",
					"scroll-mt",
					"scroll-mr",
					"scroll-mb",
					"scroll-ml"
				],
				"scroll-mx": ["scroll-mr", "scroll-ml"],
				"scroll-my": ["scroll-mt", "scroll-mb"],
				"scroll-p": [
					"scroll-px",
					"scroll-py",
					"scroll-ps",
					"scroll-pe",
					"scroll-pbs",
					"scroll-pbe",
					"scroll-pt",
					"scroll-pr",
					"scroll-pb",
					"scroll-pl"
				],
				"scroll-px": ["scroll-pr", "scroll-pl"],
				"scroll-py": ["scroll-pt", "scroll-pb"],
				touch: [
					"touch-x",
					"touch-y",
					"touch-pz"
				],
				"touch-x": ["touch"],
				"touch-y": ["touch"],
				"touch-pz": ["touch"]
			},
			conflictingClassGroupModifiers: { "font-size": ["leading"] },
			postfixLookupClassGroups: ["container-type"],
			orderSensitiveModifiers: [
				"*",
				"**",
				"after",
				"backdrop",
				"before",
				"details-content",
				"file",
				"first-letter",
				"first-line",
				"marker",
				"placeholder",
				"selection"
			]
		};
	};
	var twMerge = /*#__PURE__*/ createTailwindMerge(getDefaultConfig);
	//#endregion
	//#region src/lib/utils.js
	/** Merge conditional class names, de-duplicating Tailwind conflicts. */
	function cn(...inputs) {
		return twMerge(clsx(inputs));
	}
	//#endregion
	//#region src/components/ui/datepicker/DatePicker.vue
	var _hoisted_1 = [
		"disabled",
		"aria-expanded",
		"aria-controls"
	];
	var _hoisted_2 = ["dir"];
	var _hoisted_3 = ["aria-label"];
	var _hoisted_4 = ["id", "dir"];
	var _hoisted_5 = { class: "mb-2 flex items-center gap-1" };
	var _hoisted_6 = ["disabled", "aria-label"];
	var _hoisted_7 = ["disabled", "aria-label"];
	var _hoisted_8 = { key: 0 };
	var _hoisted_9 = { class: "text-muted-foreground mb-1 grid grid-cols-7 gap-0.5 text-center text-[0.68rem] font-medium" };
	var _hoisted_10 = [
		"data-iso",
		"disabled",
		"aria-current",
		"aria-selected",
		"onClick",
		"onMouseenter"
	];
	var _hoisted_11 = {
		key: 0,
		class: "bg-primary absolute inset-x-0 bottom-1 mx-auto size-1 rounded-full"
	};
	var _hoisted_12 = {
		key: 1,
		class: "grid grid-cols-3 gap-1.5"
	};
	var _hoisted_13 = ["onClick"];
	var _hoisted_14 = {
		key: 2,
		class: "grid grid-cols-3 gap-1.5"
	};
	var _hoisted_15 = ["onClick"];
	var _hoisted_16 = {
		key: 3,
		class: "mt-3 flex flex-wrap gap-1.5 border-t pt-3"
	};
	var _hoisted_17 = ["onClick"];
	var _hoisted_18 = { class: "mt-3 flex items-center justify-between border-t pt-2.5" };
	var DatePicker_default = /*#__PURE__*/ _plugin_vue_export_helper_default(/* @__PURE__ */ Object.assign({ inheritAttrs: false }, {
		__name: "DatePicker",
		props: {
			modelValue: {
				type: [
					String,
					Array,
					null
				],
				default: ""
			},
			range: {
				type: Boolean,
				default: false
			},
			min: {
				type: String,
				default: ""
			},
			max: {
				type: String,
				default: ""
			},
			placeholder: {
				type: String,
				default: ""
			},
			disabled: {
				type: Boolean,
				default: false
			},
			invalid: {
				type: Boolean,
				default: false
			},
			clearable: {
				type: Boolean,
				default: true
			},
			presets: {
				type: Boolean,
				default: true
			},
			weekStart: {
				type: Number,
				default: 0
			},
			class: {
				type: null,
				default: ""
			},
			contentClass: {
				type: null,
				default: ""
			}
		},
		emits: ["update:modelValue", "change"],
		setup(__props, { emit: __emit }) {
			const props = __props;
			const emit = __emit;
			const { t, locale } = useI18n();
			const isRtl = computed(() => RTL_LOCALES.includes(locale.value));
			const intlLocale = computed(() => locale.value === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-US");
			const pad = (n) => String(n).padStart(2, "0");
			const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
			const isISO = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
			const fromISO = (s) => {
				if (!isISO(s)) return null;
				const [y, m, d] = s.split("-").map(Number);
				const dt = new Date(y, m - 1, d);
				return Number.isNaN(dt.getTime()) ? null : dt;
			};
			const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
			const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
			const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
			const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
			const sameDay = (a, b) => a && b && toISO(a) === toISO(b);
			const todayISO = () => toISO(/* @__PURE__ */ new Date());
			const selectedStart = computed(() => props.range ? fromISO(props.modelValue?.[0]) : fromISO(props.modelValue));
			const selectedEnd = computed(() => props.range ? fromISO(props.modelValue?.[1]) : null);
			const hasValue = computed(() => props.range ? !!(props.modelValue?.[0] || props.modelValue?.[1]) : !!fromISO(props.modelValue));
			const fmtDay = (d) => new Intl.DateTimeFormat(intlLocale.value, {
				day: "2-digit",
				month: "short",
				year: "numeric"
			}).format(d);
			const triggerLabel = computed(() => {
				if (!hasValue.value) return "";
				if (!props.range) return fmtDay(selectedStart.value);
				return `${selectedStart.value ? fmtDay(selectedStart.value) : "…"} — ${selectedEnd.value ? fmtDay(selectedEnd.value) : "…"}`;
			});
			const placeholderText = computed(() => props.placeholder || t(props.range ? "datepicker.selectRange" : "datepicker.selectDate"));
			const panelId = useId$1();
			const open = /* @__PURE__ */ ref(false);
			const view = /* @__PURE__ */ ref("days");
			const cursor = /* @__PURE__ */ ref(startOfMonth(/* @__PURE__ */ new Date()));
			const focusDate = /* @__PURE__ */ ref(null);
			const hoverDate = /* @__PURE__ */ ref(null);
			const pendingStart = /* @__PURE__ */ ref(null);
			const slide = /* @__PURE__ */ ref("next");
			const placement = /* @__PURE__ */ ref("bottom");
			const panelStyle = /* @__PURE__ */ ref({});
			const triggerEl = /* @__PURE__ */ ref(null);
			const panelEl = /* @__PURE__ */ ref(null);
			const minDate = computed(() => fromISO(props.min));
			const maxDate = computed(() => fromISO(props.max));
			function isDisabledDay(d) {
				if (minDate.value && d < minDate.value) return true;
				if (maxDate.value && d > maxDate.value) return true;
				return false;
			}
			const weekdays = computed(() => {
				const fmt = new Intl.DateTimeFormat(intlLocale.value, { weekday: "short" });
				return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + (i + props.weekStart) % 7)));
			});
			const days = computed(() => {
				const first = startOfMonth(cursor.value);
				const lead = (first.getDay() - props.weekStart + 7) % 7;
				const start = addDays(first, -lead);
				const month = cursor.value.getMonth();
				return Array.from({ length: 42 }, (_, i) => {
					const d = addDays(start, i);
					return {
						date: d,
						iso: toISO(d),
						label: d.getDate(),
						outside: d.getMonth() !== month,
						disabled: isDisabledDay(d)
					};
				});
			});
			const monthNames = computed(() => {
				const fmt = new Intl.DateTimeFormat(intlLocale.value, { month: "long" });
				return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2024, m, 1)));
			});
			const headerLabel = computed(() => new Intl.DateTimeFormat(intlLocale.value, {
				month: "long",
				year: "numeric"
			}).format(cursor.value));
			const yearsPage = computed(() => {
				const base = Math.floor(cursor.value.getFullYear() / 12) * 12;
				return Array.from({ length: 12 }, (_, i) => base + i);
			});
			const rangeEdges = computed(() => {
				if (props.range && pendingStart.value) {
					const other = hoverDate.value ?? pendingStart.value;
					return pendingStart.value <= other ? {
						a: pendingStart.value,
						b: other
					} : {
						a: other,
						b: pendingStart.value
					};
				}
				return {
					a: selectedStart.value,
					b: selectedEnd.value
				};
			});
			function dayState(d) {
				const { a, b } = rangeEdges.value;
				const isStart = sameDay(d, a);
				const isEnd = sameDay(d, b);
				const inRange = props.range && a && b && d > a && d < b;
				return {
					selected: props.range ? isStart || isEnd : sameDay(d, selectedStart.value),
					isStart: props.range && isStart && !!b && !sameDay(a, b),
					isEnd: props.range && isEnd && !!a && !sameDay(a, b),
					inRange,
					today: sameDay(d, /* @__PURE__ */ new Date()),
					focused: sameDay(d, focusDate.value)
				};
			}
			function place() {
				const el = triggerEl.value;
				if (!el) return;
				const r = el.getBoundingClientRect();
				const gap = 8;
				const vw = window.innerWidth;
				const vh = window.innerHeight;
				const below = vh - r.bottom - gap;
				const above = r.top - gap;
				const flip = below < 380 && above > below;
				placement.value = flip ? "top" : "bottom";
				const style = { position: "fixed" };
				if (flip) style.bottom = `${vh - r.top + gap}px`;
				else style.top = `${r.bottom + gap}px`;
				if (isRtl.value) style.right = `${Math.max(8, Math.min(vw - r.right, vw - 320))}px`;
				else style.left = `${Math.max(8, Math.min(r.left, vw - 320))}px`;
				panelStyle.value = style;
			}
			async function openPanel() {
				if (props.disabled || open.value) return;
				open.value = true;
				view.value = "days";
				pendingStart.value = null;
				hoverDate.value = null;
				const anchor = selectedStart.value ?? fromISO(todayISO());
				cursor.value = startOfMonth(anchor);
				focusDate.value = anchor;
				place();
				bind();
				await nextTick();
				place();
				panelEl.value?.focus();
			}
			function closePanel({ focusTrigger = true } = {}) {
				if (!open.value) return;
				open.value = false;
				pendingStart.value = null;
				hoverDate.value = null;
				unbind();
				if (focusTrigger) triggerEl.value?.focus();
			}
			function toggle() {
				open.value ? closePanel() : openPanel();
			}
			function commit(value) {
				emit("update:modelValue", value);
				emit("change", value);
			}
			function pick(day) {
				if (day.disabled) return;
				const d = day.date;
				focusDate.value = d;
				if (day.outside) cursor.value = startOfMonth(d);
				if (!props.range) {
					commit(toISO(d));
					closePanel();
					return;
				}
				if (!pendingStart.value) {
					pendingStart.value = d;
					return;
				}
				const a = pendingStart.value;
				const [from, to] = a <= d ? [a, d] : [d, a];
				pendingStart.value = null;
				commit([toISO(from), toISO(to)]);
				closePanel();
			}
			function clear() {
				pendingStart.value = null;
				commit(props.range ? ["", ""] : "");
				if (open.value) closePanel();
			}
			function goToday() {
				const d = /* @__PURE__ */ new Date();
				cursor.value = startOfMonth(d);
				focusDate.value = d;
				if (!isDisabledDay(d)) pick({
					date: d,
					disabled: false,
					outside: false
				});
			}
			function applyPreset(key) {
				const now = /* @__PURE__ */ new Date();
				let a = now;
				let b = now;
				if (key === "last7") a = addDays(now, -6);
				else if (key === "last30") a = addDays(now, -29);
				else if (key === "thisMonth") {
					a = startOfMonth(now);
					b = endOfMonth(now);
				} else if (key === "thisYear") {
					a = new Date(now.getFullYear(), 0, 1);
					b = new Date(now.getFullYear(), 11, 31);
				}
				pendingStart.value = null;
				commit([toISO(a), toISO(b)]);
				cursor.value = startOfMonth(b);
				closePanel();
			}
			function shiftMonth(n) {
				slide.value = n > 0 ? "next" : "prev";
				cursor.value = addMonths(cursor.value, n);
			}
			function shiftYear(n) {
				slide.value = n > 0 ? "next" : "prev";
				cursor.value = new Date(cursor.value.getFullYear() + n, cursor.value.getMonth(), 1);
			}
			function pickMonth(m) {
				cursor.value = new Date(cursor.value.getFullYear(), m, 1);
				view.value = "days";
			}
			function pickYear(y) {
				cursor.value = new Date(y, cursor.value.getMonth(), 1);
				view.value = "months";
			}
			const canPrev = computed(() => !minDate.value || startOfMonth(cursor.value) > startOfMonth(minDate.value));
			const canNext = computed(() => !maxDate.value || endOfMonth(cursor.value) < startOfMonth(maxDate.value));
			function onDocPointerDown(e) {
				if (panelEl.value?.contains(e.target) || triggerEl.value?.contains(e.target)) return;
				closePanel({ focusTrigger: false });
			}
			function bind() {
				document.addEventListener("pointerdown", onDocPointerDown, true);
				window.addEventListener("scroll", place, true);
				window.addEventListener("resize", place);
			}
			function unbind() {
				document.removeEventListener("pointerdown", onDocPointerDown, true);
				window.removeEventListener("scroll", place, true);
				window.removeEventListener("resize", place);
			}
			onBeforeUnmount(unbind);
			function onTriggerFocusOut(e) {
				if (open.value && panelEl.value?.contains(e.relatedTarget)) e.stopPropagation();
			}
			function moveFocus(days) {
				const base = focusDate.value ?? selectedStart.value ?? /* @__PURE__ */ new Date();
				const next = addDays(base, days);
				focusDate.value = next;
				if (next.getMonth() !== cursor.value.getMonth()) {
					slide.value = days > 0 ? "next" : "prev";
					cursor.value = startOfMonth(next);
				}
			}
			function onKeydown(e) {
				if (props.disabled) return;
				const k = e.key;
				if (!open.value) {
					if (k === "Enter" || k === " " || k === "ArrowDown") {
						e.preventDefault();
						openPanel();
					}
					return;
				}
				if (k === "Escape") {
					e.preventDefault();
					e.stopPropagation();
					closePanel();
					return;
				}
				if (k === "Tab") return;
				const back = isRtl.value ? 1 : -1;
				if (k === "ArrowLeft") {
					e.preventDefault();
					moveFocus(back);
				} else if (k === "ArrowRight") {
					e.preventDefault();
					moveFocus(-back);
				} else if (k === "ArrowUp") {
					e.preventDefault();
					moveFocus(-7);
				} else if (k === "ArrowDown") {
					e.preventDefault();
					moveFocus(7);
				} else if (k === "Home") {
					e.preventDefault();
					moveFocus(-((focusDate.value.getDay() - props.weekStart + 7) % 7));
				} else if (k === "End") {
					e.preventDefault();
					moveFocus(6 - (focusDate.value.getDay() - props.weekStart + 7) % 7);
				} else if (k === "PageUp") {
					e.preventDefault();
					e.shiftKey ? shiftYear(-1) : shiftMonth(-1);
				} else if (k === "PageDown") {
					e.preventDefault();
					e.shiftKey ? shiftYear(1) : shiftMonth(1);
				} else if (k === "Enter" || k === " ") {
					e.preventDefault();
					const d = focusDate.value;
					if (d) pick({
						date: d,
						iso: toISO(d),
						outside: d.getMonth() !== cursor.value.getMonth(),
						disabled: isDisabledDay(d)
					});
				}
			}
			watch(() => props.modelValue, () => {
				if (!open.value) pendingStart.value = null;
			});
			const triggerClasses = computed(() => cn("group relative flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border bg-muted/50 ps-3.5 pe-3 text-sm outline-none transition-all duration-200", "hover:bg-muted focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/15", "disabled:pointer-events-none disabled:opacity-60", open.value && "border-primary bg-background ring-4 ring-primary/15", hasValue.value ? "text-foreground" : "text-muted-foreground", props.invalid ? "border-danger focus-visible:border-danger focus-visible:ring-danger/15" : !open.value && "border-transparent", props.class));
			const PRESETS = [
				"today",
				"last7",
				"last30",
				"thisMonth"
			];
			return (_ctx, _cache) => {
				return openBlock(), createElementBlock(Fragment, null, [createBaseVNode("button", mergeProps({
					ref_key: "triggerEl",
					ref: triggerEl
				}, _ctx.$attrs, {
					type: "button",
					disabled: __props.disabled,
					class: triggerClasses.value,
					"aria-expanded": open.value,
					"aria-haspopup": "dialog",
					"aria-controls": unref(panelId),
					onClick: toggle,
					onKeydown,
					onFocusout: onTriggerFocusOut
				}), [
					createVNode(unref(Calendar), { class: "text-muted-foreground size-4 shrink-0" }),
					createBaseVNode("span", {
						class: "truncate text-start",
						dir: isRtl.value ? "rtl" : "ltr"
					}, toDisplayString$1(triggerLabel.value || placeholderText.value), 9, _hoisted_2),
					__props.clearable && hasValue.value && !__props.disabled ? (openBlock(), createElementBlock("span", {
						key: 0,
						class: "hover:bg-accent hover:text-foreground text-muted-foreground ms-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full transition-colors",
						"aria-label": unref(t)("common.clear"),
						onClick: withModifiers(clear, ["stop"])
					}, [createVNode(unref(X), { class: "size-3.5" })], 8, _hoisted_3)) : createCommentVNode("", true)
				], 16, _hoisted_1), (openBlock(), createBlock(Teleport, { to: "body" }, [createVNode(Transition, { name: placement.value === "top" ? "dp-up" : "dp-down" }, {
					default: withCtx(() => [open.value ? (openBlock(), createElementBlock("div", {
						key: 0,
						id: unref(panelId),
						ref_key: "panelEl",
						ref: panelEl,
						tabindex: "-1",
						role: "dialog",
						style: normalizeStyle(panelStyle.value),
						dir: isRtl.value ? "rtl" : "ltr",
						class: normalizeClass(unref(cn)("bg-popover text-popover-foreground shadow-navy/10 pointer-events-auto z-[70] w-[19.5rem] rounded-xl border p-3 shadow-xl outline-none", placement.value === "top" ? "origin-bottom" : "origin-top", props.contentClass)),
						onPointerdown: _cache[5] || (_cache[5] = withModifiers(() => {}, ["stop"])),
						onMousedown: _cache[6] || (_cache[6] = withModifiers(() => {}, ["stop"])),
						onFocusin: _cache[7] || (_cache[7] = withModifiers(() => {}, ["stop"])),
						onFocusout: _cache[8] || (_cache[8] = withModifiers(() => {}, ["stop"])),
						onClick: _cache[9] || (_cache[9] = withModifiers(() => {}, ["stop"])),
						onKeydown
					}, [
						createBaseVNode("div", _hoisted_5, [
							createBaseVNode("button", {
								type: "button",
								class: "hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40",
								disabled: view.value === "days" && !canPrev.value,
								"aria-label": unref(t)("datepicker.prev"),
								onClick: _cache[0] || (_cache[0] = ($event) => view.value === "days" ? shiftMonth(-1) : view.value === "months" ? shiftYear(-1) : shiftYear(-12))
							}, [(openBlock(), createBlock(resolveDynamicComponent(isRtl.value ? unref(ChevronRight) : unref(ChevronLeft)), { class: "size-4" }))], 8, _hoisted_6),
							createBaseVNode("button", {
								type: "button",
								class: "hover:bg-accent flex-1 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
								onClick: _cache[1] || (_cache[1] = ($event) => view.value = view.value === "days" ? "months" : view.value === "months" ? "years" : "days")
							}, toDisplayString$1(view.value === "days" ? headerLabel.value : view.value === "months" ? cursor.value.getFullYear() : `${yearsPage.value[0]} – ${yearsPage.value[11]}`), 1),
							createBaseVNode("button", {
								type: "button",
								class: "hover:bg-accent text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-lg transition-colors disabled:opacity-40",
								disabled: view.value === "days" && !canNext.value,
								"aria-label": unref(t)("datepicker.next"),
								onClick: _cache[2] || (_cache[2] = ($event) => view.value === "days" ? shiftMonth(1) : view.value === "months" ? shiftYear(1) : shiftYear(12))
							}, [(openBlock(), createBlock(resolveDynamicComponent(isRtl.value ? unref(ChevronLeft) : unref(ChevronRight)), { class: "size-4" }))], 8, _hoisted_7)
						]),
						view.value === "days" ? (openBlock(), createElementBlock("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, [(openBlock(true), createElementBlock(Fragment, null, renderList(weekdays.value, (w) => {
							return openBlock(), createElementBlock("span", {
								key: w,
								class: "py-1"
							}, toDisplayString$1(w), 1);
						}), 128))]), createVNode(Transition, {
							name: slide.value === "next" ? "dp-month-next" : "dp-month-prev",
							mode: "out-in"
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock("div", {
								key: `${cursor.value.getFullYear()}-${cursor.value.getMonth()}`,
								class: "grid grid-cols-7 gap-0.5"
							}, [(openBlock(true), createElementBlock(Fragment, null, renderList(days.value, (d, i) => {
								return openBlock(), createElementBlock("button", {
									key: d.iso,
									type: "button",
									"data-day": "",
									"data-iso": d.iso,
									disabled: d.disabled,
									"aria-current": dayState(d.date).today ? "date" : void 0,
									"aria-selected": dayState(d.date).selected,
									class: normalizeClass(["dp-day relative h-9 rounded-lg text-sm transition-all duration-150 disabled:pointer-events-none disabled:opacity-30", [
										dayState(d.date).selected ? "bg-primary text-primary-foreground font-semibold shadow-sm" : dayState(d.date).inRange ? "bg-primary/10 text-foreground rounded-none" : "hover:bg-accent",
										d.outside && !dayState(d.date).selected && "text-muted-foreground/50",
										dayState(d.date).isStart && "rounded-e-none",
										dayState(d.date).isEnd && "rounded-s-none",
										dayState(d.date).focused && !dayState(d.date).selected && "ring-primary/40 ring-2"
									]]),
									style: normalizeStyle({ animationDelay: `${Math.min(i, 20) * 8}ms` }),
									onClick: ($event) => pick(d),
									onMouseenter: ($event) => hoverDate.value = d.date,
									onMouseleave: _cache[3] || (_cache[3] = ($event) => hoverDate.value = null)
								}, [createTextVNode(toDisplayString$1(d.label) + " ", 1), dayState(d.date).today && !dayState(d.date).selected ? (openBlock(), createElementBlock("span", _hoisted_11)) : createCommentVNode("", true)], 46, _hoisted_10);
							}), 128))]))]),
							_: 1
						}, 8, ["name"])])) : view.value === "months" ? (openBlock(), createElementBlock("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(monthNames.value, (m, i) => {
							return openBlock(), createElementBlock("button", {
								key: m,
								type: "button",
								class: normalizeClass(["dp-cell hover:bg-accent rounded-lg py-2.5 text-sm transition-colors", i === cursor.value.getMonth() && "bg-primary text-primary-foreground font-semibold"]),
								style: normalizeStyle({ animationDelay: `${i * 14}ms` }),
								onClick: ($event) => pickMonth(i)
							}, toDisplayString$1(m), 15, _hoisted_13);
						}), 128))])) : (openBlock(), createElementBlock("div", _hoisted_14, [(openBlock(true), createElementBlock(Fragment, null, renderList(yearsPage.value, (y, i) => {
							return openBlock(), createElementBlock("button", {
								key: y,
								type: "button",
								class: normalizeClass(["dp-cell hover:bg-accent rounded-lg py-2.5 text-sm transition-colors tabular-nums", y === cursor.value.getFullYear() && "bg-primary text-primary-foreground font-semibold"]),
								style: normalizeStyle({ animationDelay: `${i * 14}ms` }),
								onClick: ($event) => pickYear(y)
							}, toDisplayString$1(y), 15, _hoisted_15);
						}), 128))])),
						__props.range && __props.presets ? (openBlock(), createElementBlock("div", _hoisted_16, [(openBlock(), createElementBlock(Fragment, null, renderList(PRESETS, (p) => {
							return createBaseVNode("button", {
								key: p,
								type: "button",
								class: "border-input hover:bg-accent hover:border-primary/40 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
								onClick: ($event) => applyPreset(p)
							}, toDisplayString$1(unref(t)(`datepicker.${p}`)), 9, _hoisted_17);
						}), 64))])) : createCommentVNode("", true),
						createBaseVNode("div", _hoisted_18, [createBaseVNode("button", {
							type: "button",
							class: "text-primary hover:bg-primary/10 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
							onClick: _cache[4] || (_cache[4] = ($event) => __props.range ? applyPreset("today") : goToday())
						}, toDisplayString$1(unref(t)("datepicker.today")), 1), hasValue.value ? (openBlock(), createElementBlock("button", {
							key: 0,
							type: "button",
							class: "text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
							onClick: clear
						}, toDisplayString$1(unref(t)("common.clear")), 1)) : createCommentVNode("", true)])
					], 46, _hoisted_4)) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["name"])]))], 64);
			};
		}
	}), [["__scopeId", "data-v-f9cbe017"]]);
	//#endregion
	//#region ddtest.entry.js
	var single = /* @__PURE__ */ ref("2026-07-01");
	var range = /* @__PURE__ */ ref(["", ""]);
	var dialogOpen = /* @__PURE__ */ ref(true);
	window.__single = single;
	window.__range = range;
	window.__dialogOpen = dialogOpen;
	window.__dialogClosed = false;
	var app = createApp({ setup() {
		return () => [h(DatePicker_default, {
			modelValue: range.value,
			range: true,
			"onUpdate:modelValue": (v) => range.value = v
		}), h(Dialog_default, {
			open: dialogOpen.value,
			title: "قيد يومية",
			"onUpdate:open": (v) => {
				dialogOpen.value = v;
				if (!v) window.__dialogClosed = true;
			}
		}, { default: () => h(DatePicker_default, {
			modelValue: single.value,
			max: "2026-07-15",
			"onUpdate:modelValue": (v) => single.value = v
		}) })];
	} });
	app.use(i18n);
	app.mount("#app");
	window.__mounted = true;
	//#endregion
})();
