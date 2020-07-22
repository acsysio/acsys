import React from 'react';
const Context = React.createContext();
const { Provider, Consumer } = Context;

class PromProvider extends React.Component {
  state = {
    header: '',
    mode: '',
    held: false,
    page: 1,
    firstObject: [],
    table: '',
    keys: [],
    rowsPerPage: 0,
    order: '',
    direction: '',
  };
  render() {
    return (
      <Provider
        value={{
          page: this.state.page,
          firstObject: this.state.firstObject,
          setHeader: (header) => {
            this.setState({
              header: header,
            });
          },
          getHeader: () => {
            return this.state.header;
          },
          setMode: (value) => {
            this.setState({
              mode: value,
            });
          },
          getMode: () => {
            return this.state.mode;
          },
          setHeld: (value) => {
            this.setState({
              held: value,
            });
          },
          isHeld: () => {
            return this.state.held;
          },
          setPage: (page) => {
            this.setState({
              page: page,
            });
          },
          setPageData: (table, keys, rowsPerPage, order, direction) => {
            this.setState({
              table: table,
              keys: keys,
              rowsPerPage: rowsPerPage,
              order: order,
              direction: direction,
            });
          },
          getTable: () => {
            return this.state.table;
          },
          getKeys: () => {
            return this.state.keys;
          },
          getRowsPerPage: () => {
            return this.state.rowsPerPage;
          },
          getOrder: () => {
            return this.state.order;
          },
          getDirection: () => {
            return this.state.direction;
          },
          incrementPage: () => {
            this.setState({
              page: this.state.page + 1,
            });
          },
          decrementPage: () => {
            this.setState({
              page: this.state.page - 1,
            });
          },
          getPage: () => {
            return this.state.page;
          },
          setObject: (object) => {
            this.setState({
              firstObject: object,
            });
          },
          getObject: () => {
            return this.state.firstObject;
          },
        }}
      >
        {this.props.children}
      </Provider>
    );
  }
}
export { PromProvider, Context as PromContext, Consumer as PromConsumer };
