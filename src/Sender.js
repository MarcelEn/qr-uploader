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

    navigator.getUserMedia({ audio: false, video: { facingMode: "environment" } }, function (stream) {
      video.src = window.URL.createObjectURL(stream);
      video.play();
      that.initSize();
    }, function (e) {
      that.setState({error: e});
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
    image = {
      height: image.height,
      width: image.width,
      data: [...image.data]
    }
    axios.post('/publish', {
      image,
      target: this.state.token
    })
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
