import { Component } from 'react';
import Paths from './components/Paths';

// export default function App(props) {
//   return (
//     <div className="App">
//       <h1>{props.name}'s Music App.</h1>
//     </div>
//   );
// }

// const appDiv = document.getElementById("root")
// WebGL2RenderingContext(<App />, appDiv)

export default class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='center'>
        <Paths />
      </div>
    );
  }
}
