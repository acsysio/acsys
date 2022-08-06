import React, { useState } from 'react';
const Context = React.createContext();
const { Provider, Consumer } = Context;

const AcsysProvider = (props) => {
  const [header, setheader] = useState('');
  const [mode, setmode] = useState('');
  const [viewId, setViewId] = useState('');
  const [held, setheld] = useState(false);
  const [routed, setRouted] = useState(false);
  const [isRemovable, setIsRemovable] = useState(false);
  const [page, setpage] = useState(1);
  const [table, settable] = useState('');
  const [keys, setkeys] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);
  const [rowsPerPage, setrowsPerPage] = useState(0);
  const [order, setorder] = useState('');
  const [direction, setdirection] = useState('');
  const [pageDirection, setpageDirection] = useState('');

  return (
    <Provider
      value={{
        page: page,
        viewId,
        routed,
        isRemovable,
        dataKeys,
        setViewId,
        setRouted,
        setIsRemovable,
        setDataKeys,
        setHeader: (header) => {
          setheader(header);
        },
        getHeader: () => {
          return header;
        },
        setMode: (value) => {
          setmode(value);
        },
        getMode: () => {
          return mode;
        },
        setHeld: (value) => {
          setheld(value);
        },
        isHeld: () => {
          return held;
        },
        setPage: (page) => {
          setpage(page);
        },
        setPageData: (table, keys, rowsPerPage, order, direction) => {
          settable(table);
          setkeys(keys);
          setrowsPerPage(rowsPerPage);
          setorder(order);
          setdirection(direction);
        },
        getTable: () => {
          return table;
        },
        getKeys: () => {
          return keys;
        },
        getRowsPerPage: () => {
          return rowsPerPage;
        },
        getOrder: () => {
          return order;
        },
        getDirection: () => {
          return direction;
        },
        setPageDirection: (pageDirection) => {
          setpageDirection(pageDirection);
        },
        getPageDirection: () => {
          return pageDirection;
        },
        incrementPage: () => {
          setpage(page + 1);
        },
        decrementPage: () => {
          setpage(page - 1);
        },
        getPage: () => {
          return page;
        },
        setObject: (object) => {
          setfirstObject(object);
        },
      }}
    >
      {props.children}
    </Provider>
  );
};
export { AcsysProvider, Context as AcsysContext, Consumer as AcsysConsumer };
