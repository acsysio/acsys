import React, { useEffect, useState } from 'react';
import Container from './FieldDefContainer';

export default function SortableStressTest(props) {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => setShouldRender(true), []);
  return (
    <>
      {shouldRender && (
        <Container
          docDetails={props.docDetails}
          handleClick={props.handleClick}
        />
      )}
    </>
  );
}
