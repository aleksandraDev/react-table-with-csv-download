import React, { Component } from 'react';
import TableViewer from 'react-js-table-with-csv-dl';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    let headers = ["number", "position", "name"];

    let table = [ {number: 12, name: "Del Piero", position: "ST", success: true},
      {number: 21, name: "Pirlo", position: "MC", success: false},
      {number: 10, name: "Ruiz", position: "MDI"},
      {number: 7, name: "Nesta", position: "RB", success: true},
      {number: 4, name: "Cannavaro", position: "CB"},
      {number: 2, name: "Puyol", position: "CB", success: false},
      {number: 15, name: "Abate", position: "LB"},
      {number: 16, name: "Locatelli", position: "MDI"},
      {number: 1, name: "Buffon", position: "GK"},
      {number: 21, name: "Pirlo", position: "MC"},
      {number: 10, name: "Ruiz", position: "MDI"},
      {number: 7, name: "Nesta", position: "RB"},
      {number: 4, name: "Cannavaro", position: "CB"},
      {number: 2, name: "Puyol", position: "CB"},
      {number: 15, name: "Abate", position: "LB"},
      {number: 16, name: "Locatelli", position: "MDI"},
      {number: 1, name: "Buffon", position: "GK"},
      {number: 21, name: "Pirlo", position: "MC"},
      {number: 10, name: "Ruiz", position: "MDI"},
      {number: 7, name: "Nesta", position: "RB"},
      {number: 4, name: "Cannavaro", position: "CB"},
      {number: 2, name: "Puyol", position: "CB"},
      {number: 15, name: "Abate", position: "LB"},
      {number: 16, name: "Locatelli", position: "MDI"},
      {number: 1, name: "Buffon", position: "GK"},
      {number: 8, name: "Gattusso", position: "MD"}
    ]

    this.state = {
      table: table,
      headers: headers,
      activateDownloadButton:true
    };
    
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Table Component</h1>
        </header>

        <h1> Table example: </h1>
          <TableViewer
            title="Lineup"
            content={this.state.table}
            headers={this.state.headers}
            minHeight={0}

            activateDownloadButton={this.state.activateDownloadButton}
            pagination={4}
          />
      </div>
    );
  }
}

export default App;
