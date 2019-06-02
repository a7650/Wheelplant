﻿/**
 * carousel-z v1.0.2
 * (c) 2019 zzp
 */

 //esm

const unit = require('carousel-z/unit')

function Carousel({ width, height, parentNode, img, transitionTime, duration, hover, dots, tip }) {
	if (!(width && height && parentNode && img && duration)) {
		err("please check width&&height&&parentNode&&img&&duration")
	}
	switch (true) {
		case typeof width !== 'number' && typeof width !== 'string': unit.err("'width' error"); break;
		case typeof height !== 'number' && typeof height !== 'string': unit.err("'height' error"); break;
		case typeof duration !== 'number' && typeof duration !== 'string': unit.err("'duration' error"); break;
	}
	let self = this,
		widthUnit = unit.getUnit(width.toString(), "px"),
		heightUnit = unit.getUnit(height.toString(), "px"),
		transitionTimeUnit = unit.getUnit(transitionTime.toString(), "s"),
		content = document.createElement("div"),
		container = document.createElement("div"),
		dotsNode = document.createElement("div");
	this.widthUnit = widthUnit;
	this.width = parseInt(width) + widthUnit;
	this.height = parseInt(height) + heightUnit;
	this.parentNode = parentNode.nodeType === 1 ? parentNode : typeof parentNode === 'string' ? document.querySelector(parentNode) : null;
	(!parentNode) && unit.err("'parentNode' error")
	this.duration = parseInt(duration);
	transitionTime && (this.transitionTime = typeof parseFloat(transitionTime) === 'number' ? parseFloat(transitionTime) + transitionTimeUnit : 0);
	this.timer = null;
	this._index = -1;
	if (Array.isArray(img) && img.length) {
		this.total = img.length;
		img.push(img[0]);
		this.img = img;
	} else {
		err("'img' error")
	}
	this.container = container;
	this.dotsNode = dotsNode;
	unit.setStyle(content, { position: "relative", width: this.width, height: this.height, overflow: "hidden" });
	unit.setStyle(container, { width: parseInt(this.width) * (this.total + 1) + widthUnit, height: this.height, transition: this.transitionTime })
	//生成子元素
	for (let item of this.img) {
		container.appendChild(this.createImg(item))
	}
	container.addEventListener('transitionend', function (e) {
		if (this.dataset.index >= self.total) {
			this.style.transition = "0s";
			this.style.transform = "translateX(0px)";
			this.setAttribute('data-index', 0);
			self.index = 0;
		}
	})
	//hover
	if (hover) {
		if (hover.pause) {
			container.addEventListener("mouseenter", self.picPause.bind(self));
			container.addEventListener("mouseleave", function () {
				self.timer = setTimeout(function () {
					self.picPlay()
				}, self.duration)
			});
		}
	}

	//dotsNode
	if (dots && dots.show) {
		let baseParams = {
			ordinaryColor: "rgba(0,0,0,.5)",
			activeColor: "#fff",
			dotSize: "10px",
			bottomDistance: "20px",
			transition: "0s",
			spacing: "10px",
			turn: true
		}
		let params = unit._extends({}, baseParams, dots),
			dotSizeUnit = unit.getUnit(params.dotSize),
			bottomDistanceUnit = unit.getUnit(params.bottomDistance),
			radius = parseInt(params.dotSize) / 2 + dotSizeUnit;
		this.dotsParams = params;
		unit.setStyle(dotsNode, { width: "100%", textAlign: "center", position: "absolute", bottom: params.bottomDistance, zIndex: 99 });
		//添加子元素
		for (let i = 0; i < this.total; i++) {
			var dot = document.createElement("div");
			dot.index = i;
			unit.setStyle(dot, { display: "inline-block", marginRight: params.spacing, transition: params.transition, width: params.dotSize, height: params.dotSize, borderRadius: radius, backgroundColor: params.ordinaryColor, cursor: params.turn ? "pointer" : '' });
			if (i === this.total - 1) {
				dot.style.marginRight = 0;
			}
			dotsNode.appendChild(dot);
		}
		//turn
		if (params.turn) {
			dotsNode.addEventListener("click", function (e) {
				let cur = e.target,
					index;
				if (cur.index > -1) {
					index = cur.index;
				} else {
					return
				}
				self.timer && clearTimeout(self.timer);
				self.index = index - 1;
				self.picPlay();

			})
		}

		content.appendChild(dotsNode);
	}

	//tip
	if (tip.show) {
		img.forEach(function (item, i) {
			if (!item.tipMes) {
				unit.err("img[" + i + "]'s " + "tipMes is undefined")
			}
			if (typeof item.tipMes !== "string") {
				unit.err("The 'tipMes' attribute is not 'string' type")
			}
		})
		let params = unit._extends({}, { fontColor: "#fff", backgroundColor: "rgba(0,0,0,.5)" }, tip)
		let tipNode = document.createElement("div");
		unit.setStyle(tipNode, { padding: "6px", color: params.fontColor, backgroundColor: params.backgroundColor, display: "none", position: "fixed", zIndex: 100, borderRadius: "3px" });
		container.addEventListener("mouseenter", function (e) {
			let curIndex = self.index == self.total ? 0 : self.index;
			tipNode.innerHTML = img[curIndex].tipMes;
			tipNode.style.display = "block";
		})
		container.addEventListener("mousemove", function (e) {
			tipNode.style.top = `${e.pageY + 30}px`;
			tipNode.style.left = `${e.pageX + 16}px`;
		})
		container.addEventListener("mouseleave", function (e) {
			tipNode.style.display = "none";
		})
		content.appendChild(tipNode);
	}

	Object.defineProperty(self, "index", {
		enumerable: true,
		configurable: false,
		get: function () {
			return self._index
		},
		set: function (val) {
			if (val == self._index) return;
			let _dots = dotsNode.getElementsByTagName("div"),
				lastIndex = self._index == -1 ? 0 : self._index > self.total - 1 ? 0 : self._index,
				curIndex = val > self.total - 1 || val < 0 ? 0 : val;
			_dots[lastIndex].style.backgroundColor = self.dotsParams.ordinaryColor;
			_dots[curIndex].style.backgroundColor = self.dotsParams.activeColor;
			if (val === self.total && !self.transitionTime) {
				self._index = 0;
				return
			}
			self._index = val;

		}
	})
	content.appendChild(container);
	this.parentNode.appendChild(content);
}



Carousel.prototype.createImg = function (img) {
	let a = document.createElement("a");
	let _img = document.createElement("img");
	unit.setStyle(a, { width: this.width, height: this.height, position: "relative", display: "inline-block" });
	unit.setStyle(_img, { width: this.width, height: this.height });
	_img.src = img.src;
	a.href = img.href ? img.href : "";
	a.appendChild(_img)
	return a
}

// Wheelplant.prototype.pushSrc = function (img) {
// 	if (Array.isArray(img)) {
// 		this.img.splice(this.img.length - 1, 0, ...img)
// 	} else if (typeof img === 'string') {
// 		this.img.splice(this.img.length - 1, 0, img)
// 	}
// }

Carousel.prototype.turn = function (index) {
	this.container.style.transition = this.transitionTime;
	let _index = parseInt(index) >= 0 ? index : this.index;
	// console.log(_index)
	this.container.style.transform = `translateX(${-_index * parseInt(this.width) + this.widthUnit})`
}

Carousel.prototype.picPlay = function () {
	this.index++;
	this.container.setAttribute('data-index', this.index);
	this.turn();
	this.timer = setTimeout(() => {
		this.picPlay()
	}, this.duration)
}

Carousel.prototype.picPause = function () {
	let container = this.container;
	this.timer && clearTimeout(this.timer);
	if (container.dataset.index == this.img.length - 1) {
		container.style.transition = "0s";
		container.style.transform = "translateX(0px)";
		container.setAttribute('data-index', 0);
		this.index = 0;
	}
}

export default Wheelplant





