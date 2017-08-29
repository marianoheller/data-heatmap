import React, { Component } from 'react';
import './App.css';

import Heatmap from './Heatmap/Heatmap'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Heatmap />
      </div>
    );
  }
}

export default App;
