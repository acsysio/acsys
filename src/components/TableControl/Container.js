import IconButton from '@material-ui/core/IconButton';
import AddButton from '@material-ui/icons/AddCircle';
import update from 'immutability-helper';
import React from 'react';
import Card from './Card';

let tName;
let tempDetails;
let startIndex;
let endIndex;
let cardsByIdV = {};
let cardsByIndexV = [];
const style = {
  maxWidth: 750,
};

export default class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldCount: 0,
    };
    tName = props.tableName;
    tempDetails = props.entry;
    this.setTableName = (name) => {
      props.setName(name);
    };
    this.drawFrame = () => {
      const nextState = update(this.state, this.pendingUpdateFn);
      this.setState(nextState);
      this.pendingUpdateFn = undefined;
      this.requestedFrame = undefined;
    };
    this.buildCardData(tempDetails);
  }
  buildCardData = (docDetails) => {
    cardsByIdV = {};
    cardsByIndexV = [];
    for (let i = 0; i < docDetails.length; i += 1) {
      const card = { id: i, details: docDetails[i] };
      cardsByIdV[card.id] = card;
      cardsByIndexV[i] = card;
    }
    this.setState({
      hack: '',
    });
  };
  componentDidUpdate() {
    if (this.state.build) {
      this.setState({
        build: false,
      });
      this.buildCardData(tempDetails);
    }
  }
  render() {
    return (
      <div>
        <div
          style={{
            margin: '15px auto',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <input
            placeholder="Enter Table Name"
            defaultValue={tName}
            onChange={(e) => this.setTableName(e.target.value)}
            type="text"
            style={{ width: '98%' }}
          />
        </div>
        <div>
          {cardsByIndexV.map((card, index) => (
            <Card
              key={card.id}
              id={card.id}
              entry={tempDetails[index]}
              deleteField={this.deleteField}
            />
          ))}
        </div>
        <div style={{ margin: 'auto', justifyContent: 'center', width: 30 }}>
          <IconButton
            edge="start"
            color="primary"
            aria-label="add"
            style={{ padding: 0 }}
            onClick={() => this.addField()}
          >
            <AddButton style={{ fontSize: 50 }} />
          </IconButton>
        </div>
      </div>
    );
  }
  addField() {
    tempDetails.push({ dataType: '', fieldName: '', value: '' });
    this.buildCardData(tempDetails);
  }
  deleteField = (entry) => {
    if (tempDetails.length > 1) {
      const index = tempDetails.indexOf(entry);
      tempDetails.splice(index, 1);
      this.buildCardData([]);
      this.setState({
        build: true,
      });
    }
  };
  scheduleUpdate(updateFn) {
    this.pendingUpdateFn = updateFn;
    if (!this.requestedFrame) {
      this.requestedFrame = requestAnimationFrame(
        this.drawFrame,
        this.updateDetails()
      );
    }
  }
  updateDetails() {
    let tempIndx = tempDetails[startIndex];
    tempDetails[startIndex] = tempDetails[endIndex];
    tempDetails[endIndex] = tempIndx;
  }
}
