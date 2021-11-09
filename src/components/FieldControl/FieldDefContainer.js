import update from 'immutability-helper';
import React, { useEffect } from 'react';
import Card from './FieldDefCard';

let tempDetails;
let startIndex;
let endIndex;
const style = {
  maxWidth: 750,
};
function buildCardData(docDetails) {
  const cardsById = {};
  const cardsByIndex = [];
  for (let i = 0; i < docDetails.length; i += 1) {
    const card = { id: i, details: docDetails[i] };
    cardsById[card.id] = card;
    cardsByIndex[i] = card;
  }
  return {
    cardsById,
    cardsByIndex,
  };
}
const Container = (props) => {
  tempDetails = props.docDetails;
  let state = buildCardData(props.docDetails);
  let pendingUpdateFn = undefined;
  let requestedFrame = undefined;

  const moveCard = (id, afterId) => {
    const { cardsById, cardsByIndex } = state;
    const card = cardsById[id];
    const afterCard = cardsById[afterId];
    const cardIndex = cardsByIndex.indexOf(card);
    const afterIndex = cardsByIndex.indexOf(afterCard);
    startIndex = cardIndex;
    endIndex = afterIndex;
    scheduleUpdate({
      cardsByIndex: {
        $splice: [
          [cardIndex, 1],
          [afterIndex, 0, card],
        ],
      },
    });
  };

  // componentWillUnmount() {
  //
  // }

  useEffect(() => {
    return () => {
      if (requestedFrame !== undefined) {
        cancelAnimationFrame(requestedFrame);
      }
    };
  }, []);

  const scheduleUpdate = (updateFn) => {
    pendingUpdateFn = updateFn;
    if (!requestedFrame) {
      requestedFrame = requestAnimationFrame(drawFrame, updateDetails());
    }
  };

  const updateDetails = () => {
    const tempIndx = tempDetails[startIndex];
    tempDetails[startIndex] = tempDetails[endIndex];
    tempDetails[endIndex] = tempIndx;
  };

  const { cardsByIndex } = state;
  return (
    <>
      <div style={style}>
        {cardsByIndex.map((card, index) => (
          <Card
            key={card.id}
            id={card.id}
            details={tempDetails[index]}
            moveCard={moveCard}
          />
        ))}
      </div>
    </>
  );
};

export default Container;
