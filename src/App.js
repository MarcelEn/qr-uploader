import React, { Component } from 'react';
import Sender from './Sender';
import Reciever from './Reciever';

const STATE = {
    SENDER: "SENDER",
    RECIEVER: "RECIEVER"
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            state: null
        }
    }
    render() {
        switch (this.state.state) {
            case STATE.SENDER:
                return <Sender />
            case STATE.RECIEVER:
                return <Reciever />
            default:
                return (
                    <div>
                        <button onClick={() => this.setState({ state: STATE.SENDER })}>
                            Sender
                        </button>
                        <button onClick={() => this.setState({ state: STATE.RECIEVER })}>
                            Reciever
                        </button>
                    </div>
                );
        }
    }
}

export default App;
