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
            // `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://localhost:3001/ws`
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
                var reader = new FileReader();
                reader.addEventListener("loadend", function () {
                    that.createImage(new Uint8ClampedArray(reader.result))
                });
                reader.readAsArrayBuffer(msg.data);
            }
        }
    }
    createImage(binary) {
        const imageData = this.binaryToImageData(binary);
        console.log(imageData)
        const canvas = document.createElement("canvas");
        canvas.height = imageData.height;
        canvas.width = imageData.width;

        const ctx = canvas.getContext("2d");
        ctx.putImageData(imageData, 0, 0);

        this.setState({
            images: [
                ...this.state.images,
                canvas.toDataURL()
            ]
        })

    }

    binaryToImageData(binary) {
        var width = binary[0] * 255 + binary[1];
        var height = binary[2] * 255 + binary[3];

        var data = new Uint8ClampedArray(width * 4 * height);

        var index = 0;
        for (var i = 4; i < binary.length; i += 3) {
            data[index] = binary[i];
            data[index + 1] = binary[i + 1];
            data[index + 2] = binary[i + 2];
            data[index + 3] = 255;
            index += 4;
        }

        return new ImageData(data, width, height);
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
