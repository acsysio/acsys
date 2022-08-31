import IconButton from '@mui/material/IconButton';
import AddButton from '@mui/icons-material/AddCircle';
import React, { useEffect, useState } from 'react';
import Card from './Card';

let tName;
let tempDetails;
let cardsByIdV = {};

const Container = (props) => {
  const [build, setBuild] = useState(false);
  const [cardsByIndexV, setCardsByIndexV] = useState([]);

  tName = props.tableName;
  tempDetails = props.entry;

  const setTableName = (name) => {
    props.setName(name);
  };

  useEffect(() => {
    buildCardData(tempDetails);
  }, [tempDetails]);

  const buildCardData = (docDetails) => {
    cardsByIdV = {};
    let cardsByIndexV = [];
    for (let i = 0; i < docDetails.length; i += 1) {
      const card = { id: i, details: docDetails[i] };
      cardsByIdV[card.id] = card;
      cardsByIndexV[i] = card;
    }
    setCardsByIndexV(cardsByIndexV);
  };

  const addField = () => {
    tempDetails.push({ dataType: 'string', fieldName: '', value: '' });
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
          className="custom-input"
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
