import React, { Component } from 'react';
import qrcode from 'qrcode-generator';

class Reciever extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: null,
            images: []
        }
        this.ref = React.createRef();
        this.createSocket();
        this.createImage = this.createImage.bind(this);
    }
    createSocket() {
        const that = this;
        this.socket = new WebSocket(
            `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}/ws`
        );
        this.socket.onmessage = (msg) => {
            if (!that.state.token) {
                that.setState({ token: msg.data })
                let typeNumber = 4;
                let errorCorrectionLevel = 'L';
                let qr = qrcode(typeNumber, errorCorrectionLevel);
                qr.addData(msg.data);
                qr.make();
                that.ref.current.innerHTML = qr.createImgTag(10);
            } else {
                that.createImage(msg.data);
            }
        }
    }
    createImage(msg) {
        const parsedMsg = JSON.parse(msg);
        const canvas = document.createElement("canvas");
        canvas.height = parsedMsg.height;
        canvas.width = parsedMsg.width;

        const ctx = canvas.getContext("2d");
        const data = new ImageData(new Uint8ClampedArray(parsedMsg.data), parsedMsg.width, parsedMsg.height);
        ctx.putImageData(data, 0, 0);

        this.setState({
            images: [
                ...this.state.images,
                canvas.toDataURL()
            ]
        })

    }
    render() {
        return <div>
            <div ref={this.ref} />
            {
                this.state.images.map(
                    (data, i) => <img src={data} alt="fancyimage" key={`image-${i}`} />
                )
            }
        </div >
    }
}

export default Reciever;
