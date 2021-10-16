import {
  Hidden,
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
  FileCopyOutlined as CopyIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@material-ui/icons';
import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Link } from 'react-router-dom';
import uniqid from 'uniqid';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysConsumer } from '../utils/Session/AcsysProvider';
import FieldDef from '../components/FieldControl/FieldDef';
import FieldControlDialog from '../components/Dialogs/FieldControlDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import MessageDialog from '../components/Dialogs/MessageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';
import ViewDialog from '../components/Dialogs/ViewDialog';

const INITIAL_STATE = {
  content_id: '',
  viewId: 0,
  initialViews: [],
  collectionDetails: [],
  documentDetails: [],
  collectionValues: [],
  acsysView: [],
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
  messageTitle: '',
  message: '',
  error: '',
  deleteLoading: false,
};

let published = true;
let lockedValue = true;
let is_removable = true;
let table_keys = [];
let tempDetails = [];
let view_orderField = 'none';
let view_order = 'asc';
let row_num = 10;

class CollectionView extends React.Component {
  state = { ...INITIAL_STATE };

  constructor(props) {
    super(props);
  }

  copy = () => {
    const el = document.createElement('textarea');
    el.value = this.state.apiCall;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  openKeyMessage = () => {
    this.setState({
      openKeyMessage: true,
      messageTitle: 'Error',
      message: 'No keys set. Please set unique key for data.',
    });
  };

  closeKeyMessage = () => {
    this.setState({
      openKeyMessage: false,
    });
  };

  handleViewChange = (value) => {
    published = value;
    let acsys_id = '';
    if (published) {
      acsys_id = this.props.match.params.acsys_id;
    } else {
      acsys_id = 'acsys_' + this.props.match.params.acsys_id;
    }
    this.context.setPageData(
      acsys_id,
      this.context.getKeys(),
      row_num,
      this.state.view_order,
      this.state.orderDir
    );
    this.context.setPage(1);
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
      await Acsys.unlockTable(this.state.documentDetails[0].collection);
      this.setState({
        locked: false,
      });
    } else {
      Acsys.lockTable(this.state.documentDetails[0].collection);
      this.setState({
        locked: true,
      });
    }
  };

  setLockedValue = (value) => {
    lockedValue = value;
  };

  setOrderField = (field) => {
    view_orderField = field;
  };

  setOrder = (order) => {
    view_order = order;
  };

  setEntriesPerPage = (value) => {
    row_num = value;
  };

  setUpdateOnly = (value) => {
    is_removable = value;
  };

  saveViewSettings = async () => {
    this.setState({
      loading: true,
    });
    let tempView = this.state.acsysView;
    if (view_orderField === 'none') {
      tempView['order_by'] = '';
      tempView['view_order'] = '';
    } else {
      tempView['order_by'] = view_orderField;
      tempView['view_order'] = view_order;
    }
    tempView['is_removable'] = is_removable;
    tempView['row_num'] = row_num;
    this.toggleTable(lockedValue);
    this.context.setHeld(false);
    await Acsys.updateData('acsys_views', tempView, [
      ['acsys_id', '=', tempView.acsys_id],
    ]);
    this.setState({
      setViewOpen: false,
      reset: true,
      totalRows: 0,
      page: 1,
    });
    table_keys = [];
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

    if (table_keys[this.state.viewId]) {
      let keys = [];
      for (let i = 0; i < table_keys[this.state.viewId].length; i++) {
        let tKeys = [
          table_keys[this.state.viewId][i].field,
          '=',
          table_keys[this.state.viewId][i].value,
        ];
        keys.push(tKeys);
      }

      await Acsys.getData(documentDetails[0].collection, keys)
        .then(async (result) => {
          if (result.length < 1) {
            await Acsys.deleteData(
              'acsys_' + documentDetails[0].collection,
              keys
            );
          } else {
            await Acsys.deleteData(documentDetails[0].collection, keys);
          }
        })
        .catch(async () => {});
    } else {
      this.openKeyMessage();
    }

    this.handleClose();
    this.setState({
      reset: true,
    });
    table_keys = [];
    this.mount();
    this.setState({ deleteLoading: false });
  };

  handleChangePrevPage = async () => {
    this.setState({
      loading: true,
    });
    let keys = [];
    for (let i = 0; i < table_keys[table_keys.length - 1].length; i++) {
      keys.push([table_keys[0][i].field, '=', table_keys[0][i].value]);
    }
    const currentData = await Acsys.getPage(
      tempDetails[0].collection,
      keys,
      row_num,
      this.state.view_order,
      this.state.orderDir,
      'prev',
      this.state.page
    );
    const apiCall = await Acsys.getOpenPageUrl(
      tempDetails[0].collection,
      keys,
      row_num,
      this.state.view_order,
      this.state.orderDir,
      'prev',
      this.state.page
    );
    this.setState({
      loading: false,
      tableData: currentData,
      apiCall: apiCall,
      page: this.state.page - 1,
    });
    this.context.setHeld(true);
    this.context.setPage(this.state.page);
    this.context.setPageData(
      tempDetails[0].collection,
      keys,
      row_num,
      this.state.view_order,
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
    for (let i = 0; i < table_keys[table_keys.length - 1].length; i++) {
      keys.push([
        table_keys[table_keys.length - 1][i].field,
        '=',
        table_keys[table_keys.length - 1][i].value,
      ]);
    }
    const currentData = await Acsys.getPage(
      tempDetails[0].collection,
      keys,
      row_num,
      this.state.view_order,
      this.state.orderDir,
      'next',
      this.state.page
    );
    const apiCall = await Acsys.getOpenPageUrl(
      tempDetails[0].collection,
      keys,
      row_num,
      this.state.view_order,
      this.state.orderDir,
      'next',
      this.state.page
    );
    this.setState({
      loading: false,
      tableData: currentData,
      apiCall: apiCall,
      page: this.state.page + 1,
    });
    this.context.setHeld(true);
    this.context.setPage(this.state.page);
    this.context.setPageData(
      tempDetails[0].collection,
      keys,
      row_num,
      this.state.view_order,
      this.state.orderDir
    );
    this.context.setPageDirection('next');
    window.scrollTo(0, 0);
  };

  saveSettings = async () => {
    this.setState({ filterLoading: true });
    table_keys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].view_order = i;
      await Acsys.updateData('acsys_document_details', tempDetails[i], [
        ['acsys_id', '=', tempDetails[i].acsys_id],
      ]);
    }
    this.setState({ filterLoading: false });
    this.handleDetailClose();
  };

  scan = async () => {
    this.setState({
      loading: true,
    });
    Acsys.deleteData('acsys_document_details', [
      ['content_id', '=', this.state.content_id],
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
      this.state.content_id !== this.props.match.params.content_id &&
      !this.state.loading
    ) {
      this.mount();
    }
  };

  componentDidMount = async () => {
    this.props.setHeader('Content');
    published = true;
    table_keys = [];
    this.setState({
      loading: true,
    });
    this.mount();
  };

  mount = async () => {
    let page = this.state.page;
    let acsysView;
    let locked = true;
    let details = [];
    let currentData;
    let apiCall;
    let order = [];
    let orderDir = 'asc';
    lockedValue = true;
    is_removable = true;
    view_orderField = 'none';
    view_order = 'asc';
    row_num = 10;
    if (!this.state.reset) {
      table_keys = this.props.location.state.table_keys;
    }
    let acsys_id = '';
    if (published) {
      acsys_id = this.props.match.params.acsys_id;
    } else {
      acsys_id = 'acsys_' + this.props.match.params.acsys_id;
    }

    const content_id = this.props.match.params.content_id;

    const totalRows = await Acsys.getTableSize(acsys_id);

    try {
      acsysView = await Acsys.getData('acsys_views', [
        ['acsys_id', '=', content_id],
      ]);
      is_removable = acsysView[0].is_removable;
      row_num = acsysView[0].row_num;
      if (acsysView[0].order_by.length > 0) {
        view_orderField = acsysView[0].order_by;
        view_order = acsysView[0].view_order;
      }

      let keys = [];

      try {
        for (let i = 0; i < table_keys.length; i++) {
          keys.push([table_keys[i].field, '=', table_keys[i].value]);
        }
      } catch (error) {}

      details = await Acsys.getData('acsys_document_details', [
        ['content_id', '=', content_id],
      ]);

      await Acsys.getData('acsys_open_tables', [['table_name', '=', acsys_id]])
        .then((result) => {
          if (result[0].table_name === acsys_id) {
            locked = false;
            lockedValue = false;
          }
        })
        .catch(() => {});

      if (details.length > 0) {
        details.sort((a, b) => (a.view_order > b.view_order ? 1 : -1));
        if (acsysView[0].order_by.length > 0) {
          order.push(acsysView[0].order_by);
          orderDir = acsysView[0].view_order;
        }
        for (let i = 0; i < details.length; i++) {
          if (Boolean(details[i].is_key)) {
            order.push(details[i].field_name);
          }
        }
        if (this.context.isHeld()) {
          let direction = 'none';
          const dbType = await Acsys.getDatabaseType();
          if (dbType === 'firestore') {
            direction = this.context.getPageDirection();
          }
          currentData = await Acsys.getPage(
            this.context.getTable(),
            this.context.getKeys(),
            this.context.getRowsPerPage(),
            this.context.getOrder(),
            this.context.getDirection(),
            direction,
            this.context.getPage()
          );
          page = this.context.getPage();
        } else {
          currentData = await Acsys.getData(
            acsys_id,
            [],
            row_num,
            order,
            orderDir
          );
          apiCall = await Acsys.getOpenUrl(
            acsys_id,
            [],
            row_num,
            order,
            orderDir
          );
        }
      } else {
        currentData = await Acsys.getData(acsys_id, keys, row_num);
        apiCall = await Acsys.getOpenUrl(acsys_id, keys, row_num);
        await Promise.all(
          Object.keys(currentData[0]).map(async (value, index) => {
            let collectionDetails = {
              acsys_id: uniqid(),
              content_id: content_id,
              collection: acsys_id,
              control: 'none',
              field_name: value,
              is_visible_on_page: true,
              is_visible_on_table: true,
              type: typeof currentData[0][value],
              is_key: false,
              view_order: index,
              width: 12,
            };
            await Acsys.insertData(
              'acsys_document_details',
              collectionDetails
            ).then(() => {
              details.push(collectionDetails);
            });
          })
        ).then(() => {
          details.sort((a, b) => (a.view_order > b.view_order ? 1 : -1));
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
      content_id: content_id,
      initialViews: currentData,
      tableData: currentData,
      apiCall: apiCall,
      acsysView: acsysView[0],
      page: page,
      documentDetails: details,
      totalRows: totalRows,
      view_order: order,
      orderDir: orderDir,
    });
  };

  renderHeader() {
    const details = this.state.documentDetails;
    if (details.length > 0) {
      return (
        <TableRow>
          {Object.values(details).map((value) => {
            if (value.is_visible_on_table) {
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
    const { content_id, tableData, documentDetails, page } = this.state;

    return tableData.map((tableData, rowIndex) => {
      let tempKey = [];
      return (
        <TableRow>
          {Object.values(documentDetails).map((details) => {
            let returnValue = '';
            Object.values(tableData).map((value, index) => {
              if (Object.keys(tableData)[index] == details.field_name) {
                if (Boolean(details.is_key) && value !== undefined) {
                  let tempObj = {
                    field: details.field_name,
                    value: value,
                  };
                  tempKey.push(tempObj);
                  table_keys[rowIndex] = tempKey;
                }
                if (details.is_visible_on_table) {
                  if (details.control == 'dateTimePicker') {
                    const date = new Date(value);
                    const printDate =
                      ('0' + (date.getMonth() + 1)).slice(-2) +
                      '/' +
                      ('0' + date.getDate()).slice(-2) +
                      '/' +
                      date.getFullYear();
                    returnValue = printDate;
                  } else if (details.control == 'timePicker') {
                    const date = new Date(value);
                    let hours = date.getHours();
                    let ampm = ' AM';
                    if (hours > 12) {
                      hours -= 12;
                      ampm = ' PM';
                    }
                    const printDate =
                      hours + ':' + ('0' + date.getMinutes()).slice(-2) + ampm;
                    returnValue = printDate;
                  } else if (details.control == 'dayPicker') {
                    returnValue = value;
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
            if (details.is_visible_on_table) {
              return this.state.acsysView.link_view_id.length > 0 ? (
                <TableCell
                  to={{
                    pathname:
                      '/CollectionView/' +
                      this.state.acsysView.link_table +
                      '/' +
                      this.state.acsysView.link_view_id,
                    state: {
                      table_keys: table_keys[rowIndex],
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
            {table_keys.length > 0 ? (
              <Tooltip title="Edit Entry">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="edit"
                  to={{
                    pathname: '/DocumentView',
                    state: {
                      mode: 'update',
                      is_removable: is_removable,
                      table_keys: table_keys[rowIndex],
                      routed: false,
                      viewId: documentDetails[0].content_id,
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
            {Acsys.getMode() !== 'Viewer' && is_removable ? (
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
      startingElement = page * row_num - row_num + 1;
    }
    const endingElement = page * row_num - row_num + 1 + tableData.length - 1;
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
          {page * row_num < totalRows ? (
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
      acsysView,
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
      projectId = acsysView.acsys_id;
    } catch (error) {}

    try {
      viewTable = tempDetails[0].collection;
    } catch (error) {}

    for (let i = 0; i < documentDetails.length; i++) {
      if (Boolean(documentDetails[i].is_key)) {
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

                {Acsys.getMode() === 'Administrator' ? (
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
                {Acsys.getMode() === 'Administrator' ? (
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
                  {Acsys.getMode() !== 'Viewer' && is_removable ? (
                    <Tooltip title="Add New Entry To Table">
                      <Button
                        to={{
                          pathname: '/DocumentView',
                          state: {
                            mode: 'add',
                            table_keys: tempKeys[0],
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
          <LoadingDialog loading={this.state.loading} message={'Loading'} />
          <MessageDialog
            open={this.state.openKeyMessage}
            closeDialog={this.closeKeyMessage}
            title={this.state.messageTitle}
            message={this.state.message}
          />
          <YesNoDialog
            open={this.state.setOpen}
            closeDialog={this.handleClose}
            title={'Delete data?'}
            message={'Are you sure you want to delete this data?'}
            action={this.deleteView}
            actionProcess={deleteLoading}
          />
          <FieldControlDialog
            open={this.state.setDetailOpen}
            closeDialog={this.handleDetailClose}
            title={'Field Controls'}
            backend={HTML5Backend}
            component={
              <FieldDef
                docDetails={tempDetails}
                handleClick={this.saveSettings}
              />
            }
            action={this.saveSettings}
            actionProcess={filterLoading}
          />
          <ViewDialog
            open={this.state.setViewOpen}
            closeDialog={this.handleViewClose}
            viewOrderField={view_orderField}
            setOrderField={this.setOrderField}
            docDetails={tempDetails}
            viewOrder={view_order}
            setOrder={this.setOrder}
            rowNum={row_num}
            setEntriesPerPage={this.setEntriesPerPage}
            isRemovable={is_removable}
            setUpdateOnly={this.setUpdateOnly}
            viewTable={viewTable}
            locked={locked}
            setLockedValue={this.setLockedValue}
            action={this.saveViewSettings}
            actionProcess={filterLoading}
          />
        </Paper>
        <Hidden smDown implementation="css">
          {!this.state.locked ? (
            <div style={{ clear: 'both' }}>
              API Call:{' '}
              <a className="api-url" href={apiCall} target="_blank">
                {apiCall}
              </a>
              <Tooltip title="Copy To Clipboard">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="edit"
                  onClick={this.copy}
                  style={{ marginLeft: 5 }}
                >
                  <CopyIcon style={{ height: 15 }} />
                </IconButton>
              </Tooltip>
            </div>
          ) : (
            <div />
          )}
        </Hidden>
      </div>
    );
  }
}
CollectionView.contextType = AcsysConsumer;
export default CollectionView;
