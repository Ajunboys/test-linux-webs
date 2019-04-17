window.tools = (function() {
	var tool = this;


	/**
	 * 日志状态
	 */
	this.Logger = {
		debug : false,
		log : false,
		info : false,
		warn : false,
		error : false
	};

	this.Log = {
		d : function(msg) {
			if (tool.Logger.debug || tool.Logger.log ||
				tool.Logger.info || tool.Logger.warn ||
				tool.Logger.error)
				console.debug("[" + new Date().getTime() + "]:" + msg);
		},
		l : function(msg) {
			if (tool.Logger.log || tool.Logger.info ||
				tool.Logger.warn || tool.Logger.error)
				console.log("[" + new Date().getTime() + "]:" + msg);
		},
		i : function(msg) {
			if (tool.Logger.info || tool.Logger.warn || tool.Logger.error)
				console.info("[" + new Date().getTime() + "]:" + msg);
		},
		w : function(msg) {
			if (tool.Logger.warn || tool.Logger.error)
				console.warn("[" + new Date().getTime() + "]:" + msg);
		},
		e : function(msg) {
			if (tool.Logger.error)
				console.error("[" + new Date().getTime() + "]:" + msg);
		}
	};


	window.Log = tool.Log;


	/** 
	 * 
	 * 
	 * device:当前设备情况(OS类型和OS版本; 浏览器类型和版本; 屏幕宽高,浏览器可视区的宽高).
	 *     device.screen         os屏幕(os屏幕宽:device.screen.width ;os屏幕宽:device.screen.height)
	 *     device.window         os浏览器可视化宽高(浏览器可视区域的宽:device.window.width ;浏览器可视区域的高:device.window.height)
	 *     device.browser        浏览器名字
	 *     device.browserVersion 浏览器版本
	 *     device.os             操作系统名称
	 *     device.osVersion      操作系统版本
	 *     
	 *     device.isAndroidAPP() 是否是Android客户端
	 * @constructor
	 */
	this.clientDevice = function clientDevice() {
		var device = this;
		var unknown = 'unknown';

		//browser
		var nVer = window.navigator.appVersion;
		var nAgt = window.navigator.userAgent;
		var browser = window.navigator.appName;
		var version = '' + parseFloat(window.navigator.appVersion);
		var majorVersion = parseInt(window.navigator.appVersion, 10);
		var nameOffset,
			verOffset,
			ix;


		// Opera
		if ((verOffset = nAgt.indexOf('Opera')) != -1) {
			browser = 'Opera';
			version = nAgt.substring(verOffset + 6);
			if ((verOffset = nAgt.indexOf('Version')) != -1) {
				version = nAgt.substring(verOffset + 8);
			}
		}
		// MSIE
		else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
			browser = 'Microsoft Internet Explorer';
			version = nAgt.substring(verOffset + 5);
		}
		// Chrome
		else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
			browser = 'Chrome';
			version = nAgt.substring(verOffset + 7);
		}
		// Safari
		else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
			browser = 'Safari';
			version = nAgt.substring(verOffset + 7);
			if ((verOffset = nAgt.indexOf('Version')) != -1) {
				version = nAgt.substring(verOffset + 8);
			}
		}
		// Firefox
		else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
			browser = 'Firefox';
			version = nAgt.substring(verOffset + 8);
		}
		// Other browsers
		else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
			browser = nAgt.substring(nameOffset, verOffset);
			version = nAgt.substring(verOffset + 1);
			if (browser.toLowerCase() == browser.toUpperCase()) {
				browser = navigator.appName;
			}
		}
		// trim the version string
		if ((ix = version.indexOf(';')) != -1)
			version = version.substring(0, ix);
		if ((ix = version.indexOf(' ')) != -1)
			version = version.substring(0, ix);

		majorVersion = parseInt('' + version, 10);
		if (isNaN(majorVersion)) {
			version = '' + parseFloat(navigator.appVersion);
			majorVersion = parseInt(navigator.appVersion, 10);
		}

		// mobile version
		var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

		// cookie
		var cookieEnabled = (navigator.cookieEnabled) ? true : false;

		if (typeof navigator.cookieEnabled == 'undefined' && !cookieEnabled) {
			document.cookie = 'testcookie';
			cookieEnabled = (document.cookie.indexOf('testcookie') != -1) ? true : false;
		}

		// system
		var os = "OTHER";
		var clientStrings = [
			{
				s : 'PC',
				r : /Win16/
			},
			{
				s : 'PC',
				r : /(Windows 95|Win95|Windows_95)/
			},
			{
				s : 'PC',
				r : /(Win 9x 4.90|Windows ME)/
			},
			{
				s : 'PC',
				r : /(Windows 98|Win98)/
			},
			{
				s : 'PC',
				r : /Windows CE/
			},
			{
				s : 'PC',
				r : /(Windows NT 5.0|Windows 2000)/
			},
			{
				s : 'PC',
				r : /(Windows NT 5.1|Windows XP)/
			},
			{
				s : 'PC',
				r : /Windows NT 5.2/
			},
			{
				s : 'PC',
				r : /Windows NT 6.0/
			},
			{
				s : 'PC',
				r : /(Windows 7|Windows NT 6.1)/
			},
			{
				s : 'PC',
				r : /(Windows 8.1|Windows NT 6.3)/
			},
			{
				s : 'PC',
				r : /(Windows 8|Windows NT 6.2)/
			},
			{
				s : 'PC',
				r : /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
			},
			{
				s : 'OTHER',
				r : /Windows ME/
			},
			{
				s : 'Android',
				r : /Android/
			},
			{
				s : 'PC',
				r : /OpenBSD/
			},
			{
				s : 'PC',
				r : /SunOS/
			},
			{
				s : 'PC',
				r : /(Linux|X11)/
			},
			{
				s : 'iOS',
				r : /(iPhone|iPad|iPod)/
			},
			{
				s : 'PC',
				r : /Mac OS X/
			},
			{
				s : 'PC',
				r : /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
			},
			{
				s : 'OTHER',
				r : /QNX/
			},
			{
				s : 'PC',
				r : /UNIX/
			},
			{
				s : 'OTHER',
				r : /BeOS/
			},
			{
				s : 'OTHER',
				r : /OS\/2/
			},
			{
				s : 'OTHER',
				r : /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
			}
		];
		for (var id in clientStrings) {
			var cs = clientStrings[id];
			if (cs.r.test(nAgt)) {
				os = cs.s;
				break;
			} else {
				os = "OTHER";
			}
		}

		var osVersion = unknown;

		if (/Windows/.test(os)) {
			osVersion = 'unknown';
			os = 'OTHER';
		}

		switch (os) {
		case 'Android':
			osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
			break;

		case 'iOS':
			osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
			osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
			break;

		}
		device = {
			"window" : {
				"width" : window.innerWidth || screen.width,
				"height" : window.innerHeight || screen.height
			},
			"screen" : {
				"width" : screen.width,
				"height" : screen.height
			},
			"browser" : browser,
			"browserVersion" : version,
			"mobile" : mobile,
			"os" : os,
			"osVersion" : osVersion,
			"cookieEnabled" : cookieEnabled
		};
		device.deviceIsPC = function() {
			var touchOrPointerState = !!!!("createTouch" in document && document.hasOwnProperty("ontouchstart")) ||
				!!!!(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints && window.navigator.msMaxTouchPoints > 1);
			return !!!(device.mobile || touchOrPointerState) && (device.os.toLowerCase() == "pc");
		};
		device.deviceIsMobile = function() {
			var touchOrPointerState = !!!!("createTouch" in document && document.hasOwnProperty("ontouchstart")) ||
				!!!!(window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints && window.navigator.msMaxTouchPoints > 1);

			return device.mobile || touchOrPointerState;
		};

		device.isAndroidAPP = function(){
			return device.deviceIsMobile() && tool.isAndroidApp();
		};

		return device;
	};

	window.device = tool.clientDevice();

	this.supportBrowser = function supportBrowser() {
		var isSupportH5 = false;
		var canvas = document.getElementById('test_square');
		if (!!!canvas) {
			canvas = document.createElement('canvas');
		}

		try {
			if (!!!!canvas && !!!!canvas.getContext('2d') && !!!!window.WebSocket) {
				isSupportH5 = true;
			} else {
				isSupportH5 = false;
			}
		} catch (e) {
			isSupportH5 = false;
		}

		return isSupportH5;

	};
	
	window.html5Browser = tool.supportBrowser();
 
	this.validator = {
		strnotnull : function stringNotNull(val) {
			return !!!!val && val != "" && val.length > 0;
		},
		number : function numberValidator(val) {

			if (val != "" && val.length > 0) {
				if (val == 0 || val == "0")
					return true;

				var reg = /^[1-9]+.?[0-9]*$/;
				if (reg.test(val))
					return true;
			}
			return false;
		},
		port : function portValidator(val) {
			if (!!!!val && val != "") {
				var reg = /^[1-9]+.?[0-9]*$/;
				if (reg.test(val))
					return true;
				else
					return false;
			}
			return true;
		},
		ipaddress : function ValidateIPaddress(ipaddress) {
			if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
				return (true)
			}
			return (false)
		},
		stringValueIsTrue : function stringValueIsTrue(value) {
			return !!!!value && value != "" && (value == "true" || value == true);
		}
	};

	this.mxscript = function mxscript(src) {
		var virworkLocation = window.location.href.toLowerCase();
		if(virworkLocation.indexOf("/web") > 0) src = "../" + src;
		document.write('<script src="' + src + '" type="text/javascript"><' + '/' + 'script>');
	};
	this.mxstyle = function mxstyle(href) {
		var virworkLocation = window.location.href.toLowerCase();
		if(virworkLocation.indexOf("/web") > 0) href = "../" + href;
		document.write('<link href="' + href + '" rel="stylesheet" media="screen">');
	};
	  
	this.addEvent = function addEvent(evnt, elem, func) {
		if (elem.addEventListener) // W3C DOM
			elem.addEventListener(evnt, func, false);
		else if (elem.attachEvent) { // IE DOM
			elem.attachEvent("on" + evnt, func);
		} else { // No much to do
			elem[evnt] = func;
		}
	};
	
	this.homeAngularJSScope = function(){
		return angular.element(document.body).scope().$parent;
	};
 
	this.getTokenByNumbers = function getTokenByNumbers(maps) {
		var directorys = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
			'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
			'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
			'_', '|', '+', '-', '*', '%', '!', '$', '?', '^', '&', '(', ')',
			'[', ']', '{', '}', '.', ',', '.', ';', '?', '#', '~', '@', '=',
			':' ];
		if (maps > 0) {
			var tokens = "";
			for (var i = 0; i < maps; i++) {
				tokens += directorys[Math.floor(Math.random() * directorys.length)];
			}
			return tokens;
		}
		return "";
	};

	this.getRamdonCode = function(numberLength) {
		if (null == numberLength) {
			numberLength = 8;
		} else if (numberLength < 6 || numberLength > 16) {
			numberLength = 8;
		}
		var DIRECTORY_1 = [
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
			'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v',
			'w', 'X', 'y', 'z'
		];
		var DIRECTORY_2 = [
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'k',
			'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
			'W', 'X', 'Y', 'Z'
		];
		var DIRECTORY_3 = [
			'2', '3', '4', '5', '6', '7', '8', '9'
		];
		var DIRECTORY_4 = [
			'.', '_', '-'
		];
		var randomCode = '';
		for (var i = 0; i < numberLength; i++) {
			for (var j = 0; j < 8; j++)
				randomCode += DIRECTORY_2[Math.floor(Math.random() * DIRECTORY_2.length)];
			/*
			randomCode += DIRECTORY_2[Math.floor(Math.random()*DIRECTORY_2.length)]; 
			randomCode += DIRECTORY_4[Math.floor(Math.random()*DIRECTORY_4.length)];
			randomCode += DIRECTORY_1[Math.floor(Math.random()*DIRECTORY_1.length)];
			randomCode += DIRECTORY_4[Math.floor(Math.random()*DIRECTORY_4.length)];
			randomCode += DIRECTORY_2[Math.floor(Math.random()*DIRECTORY_2.length)];
			randomCode += DIRECTORY_3[Math.floor(Math.random()*DIRECTORY_3.length)];
			randomCode += DIRECTORY_1[Math.floor(Math.random()*DIRECTORY_1.length)];
			/*randomCode += DIRECTORY_3[Math.floor(Math.random()*DIRECTORY_3.length)];*/
			if (i < numberLength - 1) {
				randomCode += "-";
			}
		}
		return randomCode;
	};
 
	window.PERMISSION_ID = "";
 
	return tool;
})(); 
Logger.info = true;