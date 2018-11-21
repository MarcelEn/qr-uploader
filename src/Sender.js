import React, { Component } from 'react';
import jsQR from "jsqr";
import axios from "axios";
import qr from './qr.png';

class Sender extends Component {
  constructor(props) {
    super(props);

    this.state = {
      updateCanvas: true,
      token: null,
      error: null
    }

    this.ctx = null;

    this.videoRef = React.createRef();
    this.canvasRef = React.createRef();
    this.initSize = this.initSize.bind(this);
    this.getCodeByQr = this.getCodeByQr.bind(this);
    this.updateCanvasLoop = this.updateCanvasLoop.bind(this);
    this.sendImage = this.sendImage.bind(this);
  }

  componentDidMount() {
    const video = this.videoRef.current;
    const that = this;

    navigator.getUserMedia({ audio: false, video: { facingMode: "environment", height: {ideal: 80000}, width: {ideal: 80000} } }, function (stream) {
      video.src = window.URL.createObjectURL(stream);
      video.play();
      that.initSize();
    }, function (e) {
      that.setState({ error: e });
      console.error('Rejected!', e);
    });

  }

  initSize() {
    const video = this.videoRef.current;
    if (video.videoHeight === 0) {
      setTimeout(this.initSize, 100);
    } else {
      const canvas = this.canvasRef.current;
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      this.ctx = this.canvasRef.current.getContext("2d")
      this.updateCanvasLoop();
      this.getCodeByQr();
    }
  }

  getCodeByQr() {
    const imageData = this.ctx.getImageData(0, 0, this.videoRef.current.videoWidth, this.videoRef.current.videoHeight);
    const result = jsQR(imageData.data, imageData.width, imageData.height);
    if (result) {
      this.setState({ token: result.data })
    } else {
      setTimeout(this.initSize, 100);
    }
  }

  updateCanvasLoop() {
    if (this.state.updateCanvas) {
      const ctx = this.canvasRef.current.getContext("2d");
      ctx.drawImage(this.videoRef.current, 0, 0);
    }
    setTimeout(this.updateCanvasLoop, 50);
  }

  sendImage() {
    if (!this.state.token)
      return;

    let image = this.ctx.getImageData(0, 0, this.videoRef.current.videoWidth, this.videoRef.current.videoHeight);
    axios.post(`/publish?target=${this.state.token}`, this.imageDataToBinary(image))
  }

  imageDataToBinary(imageData) {
    var data = new Uint8Array((imageData.data.length / 4 * 3) + 4);
    var height = this.get16BitValue(imageData.height);
    var width = this.get16BitValue(imageData.width);

    data[0] = width[0];
    data[1] = width[1];
    data[2] = height[0];
    data[3] = height[1];

    var index = 4;

    for (var i = 0; i < imageData.data.length; i += 4) {
      data[index] = imageData.data[i];
      data[index + 1] = imageData.data[i + 1];
      data[index + 2] = imageData.data[i + 2];
      index += 3;
    }

    return data;
  }

  get16BitValue(value) {
    var data = new Uint8Array(2);
    data[0] = Math.floor(value / 255)
    data[1] = value - Math.floor(value / 255) * 255
    return data;
  }

  render() {
    return (
      <div>
        <canvas ref={this.canvasRef}></canvas>
        <video onClick={this.sendImage} ref={this.videoRef}></video>
        {
          !this.state.token ?
            <img src={qr} alt="fancyimage" id="qrimage" />
            : undefined
        }
        {this.state.error ? this.state.error.message : undefined}
      </div>
    );
  }
}

export default Sender;
