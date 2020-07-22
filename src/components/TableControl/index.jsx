import React, { useEffect, useState } from 'react';
import Container from './Container';
export default function SortableStressTest(props) {
  const [shouldRender, setShouldRender] = useState(false);
  useEffect(() => setShouldRender(true), []);
  return (
    <>
      {shouldRender && (
        <Container setName={props.setName} entry={props.entry} />
      )}
    </>
  );
}
