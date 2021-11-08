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
import React, { useState, useContext, useEffect } from 'react';
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

let published = true;
let lockedValue = true;
let is_removable = true;
let table_keys = [];
let tempDetails = [];
let view_orderField = 'none';
let view_order = 'asc';
let row_num = 10;

const CollectionView = (props) => {
  const context = useContext(AcsysConsumer);
  const [content_id, setcontent_id] = useState('');
  const [viewId, setviewId] = useState(0);
  const [initialViews, setinitialViews] = useState([]);
  const [documentDetails, setdocumentDetails] = useState([]);
  const [acsysView, setacsysView] = useState([]);
  const [tableData, settableData] = useState([]);
  const [apiCall, setapiCall] = useState('');
  const [totalRows, settotalRows] = useState(0);
  const [page, setpage] = useState(1);
  const [orderDir, setorderDir] = useState('');
  const [locked, setlocked] = useState(true);
  const [reset, setreset] = useState(false);
  const [view, setview] = useState(false);
  const [loading, setloading] = useState(false);
  const [openKeyMessage, setopenKeyMessage] = useState(false);
  const [setOpen, setsetOpen] = useState(false);
  const [setDetailOpen, setsetDetailOpen] = useState(false);
  const [setViewOpen, setsetViewOpen] = useState(false);
  const [filterLoading, setfilterLoading] = useState(false);
  const [view_order, setview_order] = useState(false);
  const [messageTitle, setmessageTitle] = useState('');
  const [message, setmessage] = useState('');
  const [deleteLoading, setdeleteLoading] = useState(false);

  const copy = () => {
    const el = document.createElement('textarea');
    el.value = apiCall;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const openKeyMessageFunc = () => {
    setopenKeyMessage(true);
    setmessageTitle('Error');
    setmessage('No keys set. Please set unique key for data.');
  };

  const closeKeyMessage = () => {
    setopenKeyMessage(false);
  };

  const handleViewChange = (value) => {
    published = value;
    let acsys_id = '';
    if (published) {
      acsys_id = props.match.params.acsys_id;
    } else {
      acsys_id = 'acsys_' + props.match.params.acsys_id;
    }
    context.setPageData(
      acsys_id,
      context.getKeys(),
      row_num,
      view_order,
      orderDir
    );
    context.setPage(1);
    mount();
  };

  const handleClickOpen = (id) => {
    setviewId(id);
    setsetOpen(true);
  };

  const handleClose = () => {
    setsetOpen(false);
  };

  const handleViewOpen = () => {
    setsetViewOpen(true);
  };

  const handleViewClose = () => {
    setsetViewOpen(false);
  };

  const handleDetailOpen = () => {
    setsetDetailOpen(true);
  };

  const handleDetailClose = () => {
    setsetDetailOpen(false);
  };

  const toggleTable = async (value) => {
    if (!value) {
      await Acsys.unlockTable(documentDetails[0].collection);
      setlocked(false);
    } else {
      Acsys.lockTable(documentDetails[0].collection);
      setlocked(true);
    }
  };

  const setLockedValue = (value) => {
    lockedValue = value;
  };

  const setOrderField = (field) => {
    view_orderField = field;
  };

  const setOrder = (order) => {
    view_order = order;
  };

  const setEntriesPerPage = (value) => {
    row_num = value;
  };

  const setUpdateOnly = (value) => {
    is_removable = value;
  };

  const saveViewSettings = async () => {
    setloading(true);
    let tempView = acsysView;
    if (view_orderField === 'none') {
      tempView['order_by'] = '';
      tempView['view_order'] = '';
    } else {
      tempView['order_by'] = view_orderField;
      tempView['view_order'] = view_order;
    }
    tempView['is_removable'] = is_removable;
    tempView['row_num'] = row_num;
    toggleTable(lockedValue);
    context.setHeld(false);
    await Acsys.updateData('acsys_views', tempView, [
      ['acsys_id', '=', tempView.acsys_id],
    ]);
    setsetViewOpen(false);
    setreset(true);
    settotalRows(0);
    setpage(1);
    table_keys = [];
    mount();
  };

  const showPopUp = () => {
    return <div>{Object.values(tableData).map((value, index) => {})}</div>;
  };

  const deleteView = async () => {
    setdeleteLoading(true);

    if (table_keys[viewId]) {
      let keys = [];
      for (let i = 0; i < table_keys[viewId].length; i++) {
        let tKeys = [
          table_keys[viewId][i].field,
          '=',
          table_keys[viewId][i].value,
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
      openKeyMessageFunc();
    }

    handleClose();
    setreset(true);
    table_keys = [];
    mount();
    setdeleteLoading(false);
  };

  const handleChangePrevPage = async () => {
    setloading(true);
    let keys = [];
    for (let i = 0; i < table_keys[table_keys.length - 1].length; i++) {
      keys.push([table_keys[0][i].field, '=', table_keys[0][i].value]);
    }
    const currentData = await Acsys.getPage(
      tempDetails[0].collection,
      keys,
      row_num,
      view_order,
      orderDir,
      'prev',
      page
    );
    const apiCall = await Acsys.getOpenPageUrl(
      tempDetails[0].collection,
      keys,
      row_num,
      view_order,
      orderDir,
      'prev',
      page
    );
    setloading(false);
    settableData(currentData);
    setapiCall(apiCall);
    setpage(page - 1);
    context.setHeld(true);
    context.setPage(page);
    context.setPageData(
      tempDetails[0].collection,
      keys,
      row_num,
      view_order,
      orderDir
    );
    context.setPageDirection('prev');
    window.scrollTo(0, 0);
  };

  const handleChangeNextPage = async () => {
    setloading(true);
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
      view_order,
      orderDir,
      'next',
      page
    );
    const apiCall = await Acsys.getOpenPageUrl(
      tempDetails[0].collection,
      keys,
      row_num,
      view_order,
      orderDir,
      'next',
      page
    );
    setloading(false);
    settableData(currentData);
    setapiCall(apiCall);
    setpage(page + 1);
    context.setHeld(true);
    context.setPage(page);
    context.setPageData(
      tempDetails[0].collection,
      keys,
      row_num,
      view_order,
      orderDir
    );
    context.setPageDirection('next');
    window.scrollTo(0, 0);
  };

  const saveSettings = async () => {
    setfilterLoading(true);
    table_keys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].view_order = i;
      await Acsys.updateData('acsys_document_details', tempDetails[i], [
        ['acsys_id', '=', tempDetails[i].acsys_id],
      ]);
    }
    setfilterLoading(false);
    handleDetailClose();
  };

  const scan = async () => {
    setloading(true);
    Acsys.deleteData('acsys_document_details', [
      ['content_id', '=', content_id],
    ])
      .then(async () => {
        mount();
      })
      .catch(() => {
        setloading(false);
      });
  };

  useEffect(() => {
    if (content_id !== props.match.params.content_id && !loading) {
      mount();
    }
  }, [content_id, props.match.params.content_id, loading]);

  useEffect(() => {
    props.setHeader('Content');
    published = true;
    table_keys = [];
    setloading(true);
    mount();
  }, []);

  const mount = async () => {
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
    // view_order = 'asc';
    row_num = 10;
    if (!reset) {
      table_keys = props.location.state.table_keys;
    }
    let acsys_id = '';
    if (published) {
      acsys_id = props.match.params.acsys_id;
    } else {
      acsys_id = 'acsys_' + props.match.params.acsys_id;
    }

    const content_id = props.match.params.content_id;

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
        if (context.isHeld()) {
          let direction = 'none';
          const dbType = await Acsys.getDatabaseType();
          if (dbType === 'firestore') {
            direction = context.getPageDirection();
          }
          currentData = await Acsys.getPage(
            context.getTable(),
            context.getKeys(),
            context.getRowsPerPage(),
            context.getOrder(),
            context.getDirection(),
            direction,
            context.getPage()
          );
          setpage(context.getPage());
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

    setreset(false);
    setview(props.location.state.view);
    setloading(false);
    setlocked(locked);
    setcontent_id(content_id);
    setinitialViews(currentData);
    settableData(currentData);
    setapiCall(apiCall);
    setacsysView(acsysView[0]);
    setpage(page);
    setdocumentDetails(details);
    settotalRows(totalRows);
    setview_order(order);
    setorderDir(orderDir);
  };

  const renderHeader = () => {
    const details = documentDetails;
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
  };

  const renderCellData = (rowData) => {
    return rowData.map((column) => {
      return <TableCell>{column}</TableCell>;
    });
  };
  const renderTableData = () => {
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
              return acsysView.link_view_id.length > 0 ? (
                <TableCell
                  to={{
                    pathname:
                      '/CollectionView/' +
                      acsysView.link_table +
                      '/' +
                      acsysView.link_view_id,
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
                  onClick={() => openKeyMessageFunc()}
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
                    handleClickOpen(rowIndex);
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
  };
  const renderPagination = (paginate) => {
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
            <IconButton onClick={() => handleChangePrevPage()}>
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
            <IconButton onClick={() => handleChangeNextPage()}>
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
  };
  const renderTable = (paginate) => {
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
                  {renderHeader()}
                </TableHead>
                <TableBody>{renderTableData()}</TableBody>
              </Table>
            </div>
            {renderPagination(paginate)}
          </div>
        );
      } catch (error) {}
    }
  };
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
                    onChange={(e) => handleViewChange('true' == e.target.value)}
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
                      onClick={handleDetailOpen}
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
                      onClick={handleViewOpen}
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
        {renderTable(paginate)}
        <LoadingDialog loading={loading} message={'Loading'} />
        <MessageDialog
          open={openKeyMessage}
          closeDialog={closeKeyMessage}
          title={messageTitle}
          message={message}
        />
        <YesNoDialog
          open={setOpen}
          closeDialog={handleClose}
          title={'Delete data?'}
          message={'Are you sure you want to delete this data?'}
          action={deleteView}
          actionProcess={deleteLoading}
        />
        <FieldControlDialog
          open={setDetailOpen}
          closeDialog={handleDetailClose}
          title={'Field Controls'}
          backend={HTML5Backend}
          component={
            <FieldDef docDetails={tempDetails} handleClick={saveSettings} />
          }
          action={saveSettings}
          actionProcess={filterLoading}
        />
        <ViewDialog
          open={setViewOpen}
          closeDialog={handleViewClose}
          viewOrderField={view_orderField}
          setOrderField={setOrderField}
          docDetails={tempDetails}
          viewOrder={view_order}
          setOrder={setOrder}
          rowNum={row_num}
          setEntriesPerPage={setEntriesPerPage}
          isRemovable={is_removable}
          setUpdateOnly={setUpdateOnly}
          viewTable={viewTable}
          locked={locked}
          setLockedValue={setLockedValue}
          action={saveViewSettings}
          actionProcess={filterLoading}
        />
      </Paper>
      <Hidden smDown implementation="css">
        {!locked ? (
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
                onClick={copy}
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
};
export default CollectionView;
