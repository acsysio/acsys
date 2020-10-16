import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  NativeSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {
  Create as CreateIcon,
  Delete as DeleteIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@material-ui/icons';
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Link } from 'react-router-dom';
import uniqid from 'uniqid';
import * as Prom from '../../services/Prometheus/Prom';
import { PromConsumer } from '../../services/Session/PromProvider';
import Example from '../FieldControl/FieldDef';

const INITIAL_STATE = {
  contentId: '',
  viewId: 0,
  initialViews: [],
  collectionDetails: [],
  documentDetails: [],
  collectionValues: [],
  prmthsView: [],
  tableData: [],
  apiCall: '',
  draftViews: [],
  totalRows: 0,
  page: 1,
  order: [],
  orderDir: '',
  locked: true,
  reset: false,
  loading: false,
  setOpen: false,
  setDetailOpen: false,
  setViewOpen: false,
  filterLoading: false,
  error: '',
  deleteLoading: false,
};

let published = true;
let lockedValue = true;
let isRemovable = true;
let tableKeys = [];
let tempDetails = [];
let viewOrderField = 'none';
let viewOrder = 'asc';
let rowNum = 10;

class CollectionView extends React.Component {
  state = { ...INITIAL_STATE };

  constructor(props) {
    super(props);
  }

  openKeyMessage = () => {
    this.setState({
      openKeyMessage: true,
    });
  };

  closeKeyMessage = () => {
    this.setState({
      openKeyMessage: false,
    });
  };

  handleViewChange = (value) => {
    published = value;
    this.mount();
  };

  handleClickOpen = (id) => {
    this.setState({
      viewId: id,
      setOpen: true,
    });
  };

  handleClose = () => {
    this.setState({
      setOpen: false,
    });
  };

  handleViewOpen = () => {
    this.setState({
      setViewOpen: true,
    });
  };

  handleViewClose = () => {
    this.setState({
      setViewOpen: false,
    });
  };

  handleDetailOpen = () => {
    this.setState({
      setDetailOpen: true,
    });
  };

  handleDetailClose = () => {
    this.setState({
      setDetailOpen: false,
    });
  };

  toggleTable = async (value) => {
    if (!value) {
      await Prom.unlockTable(this.state.documentDetails[0].collection);
      this.setState({
        locked: false,
      });
    } else {
      Prom.lockTable(this.state.documentDetails[0].collection);
      this.setState({
        locked: true,
      });
    }
  };

  setLockedValue = (value) => {
    lockedValue = value;
  };

  setOrderField = (field) => {
    viewOrderField = field;
  };

  setOrder = (order) => {
    viewOrder = order;
  };

  setEntriesPerPage = (value) => {
    rowNum = value;
  };

  setUpdateOnly = (value) => {
    isRemovable = value;
  };

  saveViewSettings = async () => {
    this.setState({
      loading: true,
    });
    let tempView = this.state.prmthsView;
    if (viewOrderField === 'none') {
      tempView['orderBy'] = '';
      tempView['viewOrder'] = '';
    } else {
      tempView['orderBy'] = viewOrderField;
      tempView['viewOrder'] = viewOrder;
    }
    tempView['isRemovable'] = isRemovable;
    tempView['rowNum'] = rowNum;
    this.toggleTable(lockedValue);
    this.context.setHeld(false);
    await Prom.updateData('prmths_views', tempView, [['id', '=', tempView.id]]);
    this.setState({
      setViewOpen: false,
      reset: true,
      totalRows: 0,
      page: 1,
    });
    tableKeys = [];
    this.mount();
  };

  showPopUp = () => {
    return (
      <div>{Object.values(this.state.tableData).map((value, index) => {})}</div>
    );
  };

  deleteView = async () => {
    const { documentDetails } = this.state;
    this.setState({ deleteLoading: true });

    let keys = [];
    for (let i = 0; i < tableKeys[this.state.viewId].length; i++) {
      let tKeys = [
        tableKeys[this.state.viewId][i].field,
        '=',
        tableKeys[this.state.viewId][i].value,
      ];
      keys.push(tKeys);
    }

    await Prom.getData(documentDetails[0].collection, keys)
      .then(async (result) => {
        if (result.length < 1) {
          await Prom.deleteData(
            'prmths_' + documentDetails[0].collection,
            keys
          );
        } else {
          await Prom.deleteData(documentDetails[0].collection, keys);
        }
      })
      .catch(async () => {});
    this.handleClose();
    this.setState({
      reset: true,
    });
    tableKeys = [];
    this.mount();
    this.setState({ deleteLoading: false });
  };

  handleChangePrevPage = async () => {
    this.setState({
      loading: true,
    });
    let keys = [];
    for (let i = 0; i < tableKeys[tableKeys.length - 1].length; i++) {
      keys.push([tableKeys[0][i].field, '=', tableKeys[0][i].value]);
    }
    const currentData = await Prom.getPage(
      tempDetails[0].collection,
      keys,
      rowNum,
      this.state.viewOrder,
      this.state.orderDir,
      'prev',
      this.state.page,
    );
    this.setState({
      loading: false,
      tableData: currentData,
      page: this.state.page - 1,
    });
    this.context.setHeld(true);
    this.context.setPage(this.state.page);
    this.context.setPageData(
      tempDetails[0].collection,
      keys,
      rowNum,
      this.state.viewOrder,
      this.state.orderDir
    );
    this.context.setPageDirection('prev');
    window.scrollTo(0, 0);
  };

  handleChangeNextPage = async () => {
    this.setState({
      loading: true,
    });
    let keys = [];
    for (let i = 0; i < tableKeys[tableKeys.length - 1].length; i++) {
      keys.push([
        tableKeys[tableKeys.length - 1][i].field,
        '=',
        tableKeys[tableKeys.length - 1][i].value,
      ]);
    }
    const currentData = await Prom.getPage(
      tempDetails[0].collection,
      keys,
      rowNum,
      this.state.viewOrder,
      this.state.orderDir,
      'next',
      this.state.page,
    );
    this.setState({
      loading: false,
      tableData: currentData,
      page: this.state.page + 1,
    });
    this.context.setHeld(true);
    this.context.setPage(this.state.page);
    this.context.setPageData(
      tempDetails[0].collection,
      keys,
      rowNum,
      this.state.viewOrder,
      this.state.orderDir
    );
    this.context.setPageDirection('next');
    window.scrollTo(0, 0);
  };

  saveSettings = async () => {
    this.setState({ filterLoading: true });
    tableKeys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].viewOrder = i;
      await Prom.updateData('prmths_document_details', tempDetails[i], [
        ['id', '=', tempDetails[i].id],
      ]);
    }
    this.setState({ filterLoading: false });
    this.handleDetailClose();
  };

  scan = async () => {
    this.setState({
      loading: true,
    });
    Prom.deleteData('prmths_document_details', [
      ['contentId', '=', this.state.contentId],
    ])
      .then(async () => {
        this.mount();
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  componentDidUpdate = async () => {
    if (
      this.state.contentId !== this.props.match.params.contentId &&
      !this.state.loading
    ) {
      this.mount();
    }
  };

  componentDidMount = async () => {
    this.props.setHeader('Content');
    published = true;
    tableKeys = [];
    this.setState({
      loading: true,
    });
    this.mount();
  };

  mount = async () => {
    let page = this.state.page;
    let prmthsView;
    let locked = true;
    let details = [];
    let currentData;
    let apiCall;
    let order = [];
    let orderDir = 'asc';
    lockedValue = true;
    isRemovable = true;
    viewOrderField = 'none';
    viewOrder = 'asc';
    rowNum = 10;
    if (!this.state.reset) {
      tableKeys = this.props.location.state.tableKeys;
    }
    let id = '';
    if (published) {
      id = this.props.match.params.id;
    } else {
      id = 'prmths_' + this.props.match.params.id;
    }

    const contentId = this.props.match.params.contentId;

    const totalRows = await Prom.getTableSize(id);

    try {
      prmthsView = await Prom.getData('prmths_views', [['id', '=', contentId]]);
      isRemovable = prmthsView[0].isRemovable;
      rowNum = prmthsView[0].rowNum;
      if (prmthsView[0].orderBy.length > 0) {
        viewOrderField = prmthsView[0].orderBy;
        viewOrder = prmthsView[0].viewOrder;
      }

      let keys = [];

      try {
        for (let i = 0; i < tableKeys.length; i++) {
          keys.push([tableKeys[i].field, '=', tableKeys[i].value]);
        }
      } catch (error) {}

      details = await Prom.getData('prmths_document_details', [
        ['contentId', '=', contentId],
      ]);

      await Prom.getData('prmths_open_tables', [['table_name', '=', id]])
        .then((result) => {
          if (result[0].table_name === id) {
            locked = false;
            lockedValue = false;
          }
        })
        .catch(() => {});

      if (details.length > 0) {
        details.sort((a, b) => (a.viewOrder > b.viewOrder ? 1 : -1));
        if (prmthsView[0].orderBy.length > 0) {
          order.push(prmthsView[0].orderBy);
          orderDir = prmthsView[0].viewOrder;
        }
        for (let i = 0; i < details.length; i++) {
          if (Boolean(details[i].isKey)) {
            order.push(details[i].field_name);
          }
        }
        if (this.context.isHeld()) {
          currentData = await Prom.getPage(
            this.context.getTable(),
            this.context.getKeys(),
            this.context.getRowsPerPage(),
            this.context.getOrder(),
            this.context.getDirection(),
            this.context.getPageDirection(),
            this.context.getPage()
          );
          page = this.context.getPage();
        } else {
          currentData = await Prom.getData(id, [], rowNum, order, orderDir);
          if(locked) {
            apiCall = await Prom.getUrl(id, [], rowNum, order, orderDir);
          }
          else {
            apiCall = await Prom.getOpenUrl(id, [], rowNum, order, orderDir);
          }
        }
      } else {
        currentData = await Prom.getData(id, keys, rowNum);
        if(locked) {
          apiCall = await Prom.getUrl(id, keys, rowNum);
        }
        else {
          apiCall = await Prom.getOpenUrl(id, keys, rowNum);
        }
        await Promise.all(
          Object.keys(currentData[0]).map(async (value, index) => {
            let collectionDetails = {
              id: uniqid(),
              contentId: contentId,
              collection: id,
              control: 'none',
              field_name: value,
              isVisibleOnPage: true,
              isVisibleOnTable: true,
              type: typeof currentData[0][value],
              isKey: false,
              viewOrder: index,
              width: 12,
            };
            console.log(currentData[0][value])

            await Prom.insertData(
              'prmths_document_details',
              collectionDetails
            ).then(() => {
              details.push(collectionDetails);
            });
          })
        ).then(() => {
          details.sort((a, b) => (a.viewOrder > b.viewOrder ? 1 : -1));
        });
      }
    } catch (error) {
      console.log(error);
    }

    this.setState({
      reset: false,
      view: this.props.location.state.view,
      loading: false,
      locked: locked,
      contentId: contentId,
      initialViews: currentData,
      tableData: currentData,
      apiCall: apiCall,
      prmthsView: prmthsView[0],
      page: page,
      documentDetails: details,
      totalRows: totalRows,
      viewOrder: order,
      orderDir: orderDir,
    });
  };

  renderHeader() {
    const details = this.state.documentDetails;
    if (details.length > 0) {
      return (
        <TableRow>
          {Object.values(details).map((value) => {
            if (value.isVisibleOnTable) {
              return (
                <TableCell
                  style={{
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}
                >
                  {value.field_name.toUpperCase()}
                </TableCell>
              );
            }
          })}
          <TableCell
            style={{
              paddingLeft: 16,
              paddingRight: 16,
              paddingTop: 5,
              paddingBottom: 5,
            }}
            align="right"
          >
            ACTIONS
          </TableCell>
        </TableRow>
      );
    }
  }

  renderCellData(rowData) {
    return rowData.map((column) => {
      return <TableCell>{column}</TableCell>;
    });
  }
  renderTableData() {
    const { contentId, tableData, documentDetails, page } = this.state;

    return tableData.map((tableData, rowIndex) => {
      let tempKey = [];
      return (
        <TableRow>
          {Object.values(documentDetails).map((details) => {
            let returnValue = '';
            Object.values(tableData).map((value, index) => {
              if (Object.keys(tableData)[index] == details.field_name) {
                if (Boolean(details.isKey) && value !== undefined) {
                  let tempObj = {
                    field: details.field_name,
                    value: value,
                  };
                  tempKey.push(tempObj);
                  tableKeys[rowIndex] = tempKey;
                }
                if (details.isVisibleOnTable) {
                  if (details.control == 'dateTimePicker') {
                    const date = new Date(value);
                    const printDate =
                      ('0' + (date.getMonth() + 1)).slice(-2) +
                      '/' +
                      ('0' + date.getDate()).slice(-2) +
                      '/' +
                      date.getFullYear();
                    returnValue = printDate;
                  } else if (details.control == 'booleanSelect') {
                    const tmpElement = document.createElement('DIV');
                    tmpElement.innerHTML = Boolean(value);
                    const stringLimit = 100;
                    let valueString = tmpElement.innerText;
                    if (valueString.length >= stringLimit) {
                      valueString = valueString.substr(0, stringLimit) + '...';
                    }
                    returnValue = valueString;
                  } else {
                    const tmpElement = document.createElement('DIV');
                    tmpElement.innerHTML = value;
                    const stringLimit = 100;
                    let valueString = tmpElement.innerText;
                    if (valueString.length >= stringLimit) {
                      valueString = valueString.substr(0, stringLimit) + '...';
                    }
                    returnValue = valueString;
                  }
                }
              }
            });
            if (details.isVisibleOnTable) {
              return this.state.prmthsView.linkViewId.length > 0 ? (
                <TableCell
                  to={{
                    pathname:
                      '/CollectionView/' +
                      this.state.prmthsView.linkTable +
                      '/' +
                      this.state.prmthsView.linkViewId,
                    state: {
                      tableKeys: tableKeys[rowIndex],
                    },
                  }}
                  component={Link}
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {returnValue}
                </TableCell>
              ) : (
                <TableCell
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {returnValue}
                </TableCell>
              );
            }
          })}
          <TableCell align="right" style={{ minWidth: 100 }}>
            {tableKeys.length > 0 ? (
              <Tooltip title="Edit Entry">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="edit"
                  to={{
                    pathname: '/DocumentView',
                    state: {
                      mode: 'update',
                      isRemovable: isRemovable,
                      tableKeys: tableKeys[rowIndex],
                      routed: false,
                      viewId: documentDetails[0].contentId,
                    },
                  }}
                  component={Link}
                  style={{ marginRight: 10 }}
                >
                  <CreateIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Edit Entry">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="edit"
                  onClick={() => this.openKeyMessage()}
                  style={{ marginRight: 10 }}
                >
                  <CreateIcon />
                </IconButton>
              </Tooltip>
            )}
            {Prom.getMode() !== 'Viewer' && isRemovable ? (
              <Tooltip title="Delete Entry">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="delete"
                  onClick={(event) => {
                    event.stopPropagation();
                    this.handleClickOpen(rowIndex);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <div />
            )}
          </TableCell>
        </TableRow>
      );
    });
  }
  renderPagination(paginate) {
    const { tableData, page, totalRows } = this.state;
    let startingElement = 0;
    if (totalRows > 0) {
      startingElement = page * rowNum - rowNum + 1;
    }
    const endingElement = page * rowNum - rowNum + 1 + tableData.length - 1;
    return paginate ? (
      <Grid style={{ width: 190, float: 'right' }} container>
        <Grid style={{ float: 'right' }} item xs>
          <Typography variant={'body2'} style={{ margin: '10px auto' }}>
            {startingElement}-{endingElement} of {totalRows}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          {page > 1 ? (
            <IconButton onClick={() => this.handleChangePrevPage()}>
              <KeyboardArrowLeft color="inherit" />
            </IconButton>
          ) : (
            <IconButton>
              <KeyboardArrowLeft
                color="disabled"
                style={{ cursor: 'default' }}
              />
            </IconButton>
          )}
          {page * rowNum < totalRows ? (
            <IconButton onClick={() => this.handleChangeNextPage()}>
              <KeyboardArrowRight color="inherit" />
            </IconButton>
          ) : (
            <IconButton>
              <KeyboardArrowRight
                color="disabled"
                style={{ cursor: 'default' }}
              />
            </IconButton>
          )}
        </Grid>
      </Grid>
    ) : (
      <div>
        <Typography style={{ height: 30, marginTop: 8 }}>
          Please set keys for pagination.
        </Typography>
      </div>
    );
  }
  renderTable(paginate) {
    const { tableData } = this.state;
    let tableDetails = '';
    try {
      tableDetails = tableData.details;
    } catch (error) {}
    if (tableDetails) {
      return <div style={{ margin: 30, overflow: 'auto' }}>{tableDetails}</div>;
    } else {
      try {
        return (
          <div>
            <div style={{ margin: 'auto', overflow: 'auto' }}>
              <Table>
                <TableHead style={{ backgroundColor: '#fafafa' }}>
                  {this.renderHeader()}
                </TableHead>
                <TableBody>{this.renderTableData()}</TableBody>
              </Table>
            </div>
            {this.renderPagination(paginate)}
          </div>
        );
      } catch (error) {}
    }
  }
  render() {
    const {
      locked,
      apiCall,
      view,
      deleteLoading,
      prmthsView,
      filterLoading,
      documentDetails,
    } = this.state;
    tempDetails = documentDetails;
    let projectId = '';
    let viewTable = '';
    let tempKey = [];
    let tempKeys = [];
    let paginate = false;

    try {
      projectId = prmthsView.id;
    } catch (error) {}

    try {
      viewTable = tempDetails[0].collection;
    } catch (error) {}

    for (let i = 0; i < documentDetails.length; i++) {
      if (Boolean(documentDetails[i].isKey)) {
        let tempObj = {
          field: documentDetails[i].field_name,
        };
        tempKey.push(tempObj);
        paginate = true;
      }
    }
    tempKeys[0] = tempKey;
    return (
      <div>
        <Paper
          style={{
            margin: 'auto',
            overflow: 'hidden',
            clear: 'both',
            marginBottom: 20,
          }}
        >
          <AppBar
            position="static"
            elevation={0}
            style={{
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #dcdcdc',
            }}
          >
            <Toolbar style={{ margin: 4, paddingLeft: 12, paddingRight: 12 }}>
              <Grid container spacing={2}>
                <Grid item xs style={{ overflow: 'hidden' }}>
                  <Typography
                    align="left"
                    variant="subtitle2"
                    noWrap
                    style={{ marginTop: 10, color: '#000000' }}
                  >
                    View: {view}
                  </Typography>
                </Grid>
                <Grid item>
                  <Tooltip title="Choose Between Published Or Draft Rows">
                    <NativeSelect
                      onChange={(e) =>
                        this.handleViewChange('true' == e.target.value)
                      }
                    >
                      <option value={true}>Published</option>
                      <option value={false}>Draft</option>
                    </NativeSelect>
                  </Tooltip>
                </Grid>

                {Prom.getMode() === 'Administrator' ? (
                  <Grid item>
                    <Tooltip title="Change How Data Is Presented">
                      <Button
                        onClick={this.handleDetailOpen}
                        variant="contained"
                        color="primary"
                      >
                        Field Controls
                      </Button>
                    </Tooltip>
                  </Grid>
                ) : (
                  <div />
                )}
                {Prom.getMode() === 'Administrator' ? (
                  <Grid item>
                    <Tooltip title="Change How Data Is Organized">
                      <Button
                        onClick={this.handleViewOpen}
                        variant="contained"
                        color="primary"
                      >
                        View Settings
                      </Button>
                    </Tooltip>
                  </Grid>
                ) : (
                  <div />
                )}
                <Grid item>
                  {Prom.getMode() !== 'Viewer' && isRemovable ? (
                    <Tooltip title="Add New Entry To Table">
                      <Button
                        to={{
                          pathname: '/DocumentView',
                          state: {
                            mode: 'add',
                            tableKeys: tempKeys[0],
                            routed: false,
                            viewId: projectId,
                          },
                        }}
                        component={Link}
                        variant="contained"
                        color="primary"
                      >
                        New Entry
                      </Button>
                    </Tooltip>
                  ) : (
                    <div />
                  )}
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          {this.renderTable(paginate)}
          <Dialog
            open={this.state.loading}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
          >
            <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
              Loading
            </DialogTitle>
            <DialogContent
              style={{
                minHeight: 150,
                minWidth: 400,
                margin: 'auto',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: 124, margin: 'auto' }}>
                <CircularProgress size={124} />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={this.state.openKeyMessage}
            onClose={this.closeKeyMessage}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
            style={{
              minHeight: 200,
              minWidth: 1100,
              margin: 'auto',
              overflow: 'hidden',
            }}
          >
            <DialogTitle id="alert-dialog-title">{'Error'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                No keys set. Please set unique key for data.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeKeyMessage} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.setOpen}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{'Delete data?'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete this data?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                No
              </Button>
              <Button
                onClick={this.deleteView}
                color="primary"
                disabled={deleteLoading}
                autoFocus
              >
                {deleteLoading && <CircularProgress size={24} />}
                {!deleteLoading && 'Yes'}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.setDetailOpen}
            onClose={this.handleDetailClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'lg'}
          >
            <DialogTitle id="alert-dialog-title">Field Controls</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description"></DialogContentText>
              <div>
                <DndProvider backend={Backend}>
                  <Example
                    docDetails={tempDetails}
                    handleClick={this.saveSettings}
                  />
                </DndProvider>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.saveSettings} color="primary" autoFocus>
                {filterLoading && <CircularProgress size={24} />}
                {!filterLoading && 'Save'}
              </Button>
              <Button
                onClick={this.handleDetailClose}
                color="primary"
                autoFocus
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.setViewOpen}
            onClose={this.handleViewClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'sm'}
          >
            <DialogTitle id="alert-dialog-title">View Settings</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description"></DialogContentText>
              <div>
                <Grid container spacing={0}>
                  <Grid item xs={3}>
                    <div>
                      <Typography>Order By Field</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <Typography>Order</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <Typography>Entries Per Page</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <Typography>Update Mode</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <NativeSelect
                        defaultValue={viewOrderField}
                        onChange={(e) => this.setOrderField(e.target.value)}
                      >
                        <option value="none">none</option>
                        {Object.values(tempDetails).map((detail) => {
                          return (
                            <option value={detail.field_name}>
                              {detail.field_name}
                            </option>
                          );
                        })}
                      </NativeSelect>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <NativeSelect
                        defaultValue={viewOrder}
                        onChange={(e) => this.setOrder(e.target.value)}
                      >
                        <option value={'asc'}>asc</option>
                        <option value={'desc'}>desc</option>
                      </NativeSelect>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <NativeSelect
                        defaultValue={rowNum}
                        onChange={(e) =>
                          this.setEntriesPerPage(parseInt(e.target.value))
                        }
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </NativeSelect>
                    </div>
                  </Grid>
                  <Grid item xs={3}>
                    <div>
                      <NativeSelect
                        defaultValue={isRemovable}
                        onChange={(e) =>
                          this.setUpdateOnly('true' == e.target.value)
                        }
                        style={{ width: '100%' }}
                      >
                        <option value={true}>Add/Remove</option>
                        <option value={false}>Update Only</option>
                      </NativeSelect>
                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ marginTop: 20 }}>
                    <div>
                      <Typography>Status For Table [{viewTable}]</Typography>
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div>
                      <NativeSelect
                        defaultValue={locked}
                        onChange={(e) =>
                          this.setLockedValue('true' == e.target.value)
                        }
                        style={{ width: '100%' }}
                      >
                        <option value={true}>Locked (No API Access)</option>
                        <option value={false}>Unlocked (API Access)</option>
                      </NativeSelect>
                    </div>
                  </Grid>
                </Grid>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.saveViewSettings} color="primary" autoFocus>
                {filterLoading && <CircularProgress size={24} />}
                {!filterLoading && 'Save'}
              </Button>
              <Button onClick={this.handleViewClose} color="primary" autoFocus>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
        <div style={{clear: 'both'}}>API Call: {apiCall}</div>
      </div>
    );
  }
}
CollectionView.contextType = PromConsumer;
export default CollectionView;
