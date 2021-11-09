import IconButton from '@material-ui/core/IconButton';
import AddButton from '@material-ui/icons/AddCircle';
import update from 'immutability-helper';
import React, { useEffect, useState } from 'react';
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

const Container = (props) => {
  const [hack, setHack] = useState('');
  const [build, setBuild] = useState(false);

  tName = props.tableName;
  tempDetails = props.entry;
  let pendingUpdateFn = undefined;
  let requestedFrame = undefined;

  const setTableName = (name) => {
    props.setName(name);
  };

  // drawFrame = () => {
  //   const nextState = update(state, pendingUpdateFn);
  //   setState(nextState);
  //   pendingUpdateFn = undefined;
  //   requestedFrame = undefined;
  // };

  useEffect(() => {
    buildCardData(tempDetails);
  }, []);

  const buildCardData = (docDetails) => {
    cardsByIdV = {};
    cardsByIndexV = [];
    for (let i = 0; i < docDetails.length; i += 1) {
      const card = { id: i, details: docDetails[i] };
      cardsByIdV[card.id] = card;
      cardsByIndexV[i] = card;
    }
    setHack('');
  };

  const addField = () => {
    tempDetails.push({ dataType: '', fieldName: '', value: '' });
    buildCardData(tempDetails);
  };

  const deleteField = (entry) => {
    if (tempDetails.length > 1) {
      const index = tempDetails.indexOf(entry);
      tempDetails.splice(index, 1);
      buildCardData([]);
      setBuild(true);
    }
  };

  const scheduleUpdate = (updateFn) => {
    pendingUpdateFn = updateFn;
    if (!requestedFrame) {
      requestedFrame = requestAnimationFrame(drawFrame(), updateDetails());
    }
  };

  const updateDetails = () => {
    let tempIndx = tempDetails[startIndex];
    tempDetails[startIndex] = tempDetails[endIndex];
    tempDetails[endIndex] = tempIndx;
  };

  useEffect(() => {
    if (build) {
      setBuild(false);

      buildCardData(tempDetails);
    }
  }, [build]);

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
          onChange={(e) => setTableName(e.target.value)}
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
            deleteField={deleteField}
          />
        ))}
      </div>
      <div style={{ margin: 'auto', justifyContent: 'center', width: 30 }}>
        <IconButton
          edge="start"
          color="primary"
          aria-label="add"
          style={{ padding: 0 }}
          onClick={addField}
        >
          <AddButton style={{ fontSize: 50 }} />
        </IconButton>
      </div>
    </div>
  );
};

export default Container;
