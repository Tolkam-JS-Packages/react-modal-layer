# tolkam/react-modal-layer

Predefined modal window scenarios with history support.

## Usage

````tsx
import { PureComponent } from 'react';
import { render } from 'react-dom';
import Layer from '@tolkam/react-modal-layer';

class MyClass extends PureComponent {
    public state = {
        show: false,
    }

    public render() {
        return <>
            <button onClick={() => this.setState({show: !this.state.show})}>show popup</button>
            <Layer
                mode="popup"
                withHistory
                show={this.state.show}
                onCloseRequest={() => this.setState({show: false})}
            >
                I'm a typical popup that needs styling.
                Close me by hitting browser's back button
            </Layer>
        </>;
    }
}

render(<MyClass />, document.getElementById('app'));
````

## Documentation

The code is rather self-explanatory and API is intended to be as simple as possible. Please, read the sources/Docblock if you have any questions. See [Usage](#usage) and [IProps](/src/index.tsx#L199) for quick start.

## License

Proprietary / Unlicensed 🤷
