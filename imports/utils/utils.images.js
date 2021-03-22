UTILS.images = {
	uploadFile({selectedFile, metaContext}, callback = () => {
	}) {
		UTILS.images.readFile(selectedFile, (dataURL) => {
			UTILS.images.getOrientationFromExif(selectedFile, (orientationProperties) => {
				UTILS.images.resizeAndOrientImage(dataURL, orientationProperties, {x: 500, y: 500}, (newFileBlob) => {
					const uploader = new Slingshot.Upload('image-upload', metaContext);
					newFileBlob.name = selectedFile.name;
					uploader.send(newFileBlob, callback);
				});
			});
		});
	},

	resizeAndOrientImage(dataURL, orientationProperties, maxImageSize = {x: 500, y: 500}, callback) {
		const image = document.createElement('img');
		let mimeType = dataURL.slice(5, dataURL.indexOf(';'));
		image.style.visibility = 'hidden';
		image.style.position = 'absolute';
		image.style.margin = image.style.padding = image.style.border = '0';
		image.src = dataURL;

		image.onload = () => {
			const canvas = document.createElement('canvas');
			const context = canvas.getContext('2d', {preserveDrawingBuffer: true});
			const isPerpendicular = [270, 90].indexOf(orientationProperties.rotate) >= 0;

			let targetWidth = maxImageSize.x;
			let targetHeight = maxImageSize.y;

			if (image.width > image.height)
				targetHeight = image.height / image.width * maxImageSize.y;
			if (image.width < image.height)
				targetWidth = image.width / image.height * maxImageSize.x;

			canvas.width = isPerpendicular ? targetHeight : targetWidth;
			canvas.height = isPerpendicular ? targetWidth : targetHeight;

			context.translate(canvas.width / 2, canvas.height / 2);
			context.scale(orientationProperties.flip ? -1 : 1, 1);
			context.rotate(orientationProperties.rotate * Math.PI / 180);
			context.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);

			const newFileDataURL = canvas.toDataURL(mimeType);
			const newFileBlob = this.dataURLtoBlob(newFileDataURL);

			callback(newFileBlob);
		};
	},

	dataURLtoBlob(dataURL) {
		let arr = dataURL.split(',');
		let mime = arr[0].match(/:(.*?);/)[1];
		let bstr = atob(arr[1]);
		let n = bstr.length;
		let u8arr = new Uint8Array(n);

		while (n--)
			u8arr[n] = bstr.charCodeAt(n);

		return new Blob([u8arr], {type: mime});
	},

	readFile(selectedFile, callback) {
		const reader = new FileReader();

		reader.onload = () => {
			callback(reader.result);
		};

		if (selectedFile)
			reader.readAsDataURL(selectedFile);
	},

	getOrientationFromExif(file, callback) {
		const reader = new FileReader();

		const callbackWrap = (orientationEnum) => {
			const orientationProperties = UTILS.images.getExifOrientationProperties(orientationEnum);

			callback(orientationProperties);
		};

		reader.onload = function (e) {
			let view = new DataView(e.target.result);

			if (view.getUint16(0, false) !== 0xFFD8)
				return callbackWrap(-2);

			let length = view.byteLength, offset = 2;

			while (offset < length) {
				let marker = view.getUint16(offset, false);
				offset += 2;

				if (marker === 0xFFE1) {
					if (view.getUint32(offset += 2, false) !== 0x45786966)
						return callbackWrap(-1);

					let little = view.getUint16(offset += 6, false) === 0x4949;
					offset += view.getUint32(offset + 4, little);

					let tags = view.getUint16(offset, little);
					offset += 2;

					for (let i = 0; i < tags; i++) {
						if (view.getUint16(offset + (i * 12), little) === 0x0112)
							return callbackWrap(view.getUint16(offset + (i * 12) + 8, little));
					}
				}
				else if ((marker & 0xFF00) !== 0xFF00) {
					break;
				}
				else {
					offset += view.getUint16(offset, false);
				}
			}

			return callbackWrap(-1);
		};

		reader.readAsArrayBuffer(file);
	},

	getExifOrientationProperties(orientationEnum) {
		switch (orientationEnum) {
			case this.orientationEnums.FLIP_ROTATE_0:
				return {rotate: 0, flip: true};
			case this.orientationEnums.FLIP_ROTATE_90:
				return {rotate: 90, flip: true};
			case this.orientationEnums.NORMAL_ROTATE_90:
				return {rotate: 90, flip: false};
			case this.orientationEnums.NORMAL_ROTATE_180:
				return {rotate: 180, flip: false};
			case this.orientationEnums.FLIP_ROTATE_180:
				return {rotate: 180, flip: true};
			case this.orientationEnums.FLIP_ROTATE_270:
				return {rotate: 270, flip: true};
			case this.orientationEnums.NORMAL_ROTATE_270:
				return {rotate: 270, flip: false};
			case this.orientationEnums.NORMAL_ROTATE_0:
			case this.orientationEnums.NOT_DEFINED:
			case this.orientationEnums.NOT_JPEG:
			default:
				return {rotate: 0, flip: false};
		}
	},

	checkImageType(type = '') {
		return type === "image/png" || type === "image/jpeg" || type === "image/jpg" || type === "image/gif";
	},

	orientationEnums: {
		NOT_DEFINED: -2,
		NOT_JPEG: -1,
		NORMAL_ROTATE_0: 1,
		FLIP_ROTATE_0: 2,
		NORMAL_ROTATE_180: 3,
		FLIP_ROTATE_180: 4,
		FLIP_ROTATE_90: 5,
		NORMAL_ROTATE_90: 6,
		FLIP_ROTATE_270: 7,
		NORMAL_ROTATE_270: 8,
	}
};
