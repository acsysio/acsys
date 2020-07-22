import update from 'immutability-helper';
import React from 'react';
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
export default class Container extends React.Component {
  constructor(props) {
    super(props);
    tempDetails = props.docDetails;
    this.drawFrame = () => {
      const nextState = update(this.state, this.pendingUpdateFn);
      this.setState(nextState);
      this.pendingUpdateFn = undefined;
      this.requestedFrame = undefined;
    };
    this.moveCard = (id, afterId) => {
      const { cardsById, cardsByIndex } = this.state;
      const card = cardsById[id];
      const afterCard = cardsById[afterId];
      const cardIndex = cardsByIndex.indexOf(card);
      const afterIndex = cardsByIndex.indexOf(afterCard);
      startIndex = cardIndex;
      endIndex = afterIndex;
      this.scheduleUpdate({
        cardsByIndex: {
          $splice: [
            [cardIndex, 1],
            [afterIndex, 0, card],
          ],
        },
      });
    };
    this.state = buildCardData(props.docDetails);
  }

  componentWillUnmount() {
    if (this.requestedFrame !== undefined) {
      cancelAnimationFrame(this.requestedFrame);
    }
  }

  render() {
    const { cardsByIndex } = this.state;
    return (
      <>
        <div style={style}>
          {cardsByIndex.map((card, index) => (
            <Card
              key={card.id}
              id={card.id}
              details={tempDetails[index]}
              moveCard={this.moveCard}
            />
          ))}
        </div>
      </>
    );
  }

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
    const tempIndx = tempDetails[startIndex];
    tempDetails[startIndex] = tempDetails[endIndex];
    tempDetails[endIndex] = tempIndx;
  }
}
