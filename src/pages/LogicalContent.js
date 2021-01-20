import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
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
import { Create as CreateIcon, Delete as DeleteIcon } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import uniqid from 'uniqid';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysConsumer } from '../utils/Session/AcsysProvider';
import AddViewDialog from '../components/Dialogs/AddViewDialog';
import EditViewDialog from '../components/Dialogs/EditViewDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

const INITIAL_STATE = {
  viewId: '',
  initialViews: [],
  name: '',
  collectionArr: [],
  collection: '',
  description: '',
  views: [],
  page: 0,
  rowsPerPage: 15,
  loading: false,
  saving: false,
  deleting: false,
  setOpen: false,
  setEditOpen: false,
  addLoading: false,
  saveLoading: false,
  deleteLoading: false,
  error: '',
};

let tempView = [];
let table = '';
let position = 0;

class LogicalContent extends React.Component {
  state = { ...INITIAL_STATE };

  setTable = (table) => {
    table = table;
  };

  getTable = () => {
    return table;
  };

  setPosition = (pos) => {
    position = pos;
  };

  setCollection = (value) => {
    this.setState({
      collection: value,
    });
  };

  setName = (value) => {
    this.setState({
      name: value,
    });
  };

  setDescription = (value) => {
    this.setState({
      description: value,
    });
  };

  setTempName = (value) => {
    tempView['name'] = value;
  };

  setTempDescription = (value) => {
    tempView['description'] = value;
  };

  deleteView = async () => {
    this.setState({ deleteLoading: true });
    if (this.state.viewId.length > 0) {
      await Acsys.deleteView(this.state.viewId);
    }
    this.handleDeleteClose();
    this.componentDidMount();
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleClickOpen = async () => {
    let collections = [];

    await Acsys.getTables().then((json) => {
      collections = json;
      this.setState({
        collectionArr: collections,
        setOpen: true,
      });
    });
  };

  handleClose = () => {
    this.setState({
      setOpen: false,
      addLoading: false,
    });
  };

  handleEditOpen = (view) => {
    tempView = view;
    position = tempView.position;
    this.setState({
      setEditOpen: true,
    });
  };

  handleEditClose = () => {
    this.setState({
      setEditOpen: false,
    });
  };

  editView = async () => {
    this.setState({
      saving: true,
    });
    if (position === tempView.position) {
      await Acsys.updateData('acsys_logical_content', tempView, [
        ['acsys_id', '=', tempView.acsys_id],
      ]);
    } else {
      const oldPosition = tempView['position'];
      tempView['position'] = position;
      await Acsys.repositionViews(tempView, oldPosition, position);
      await this.sleep(1000);
    }
    const currentView = await Acsys.getData('acsys_logical_content', [], '', [
      'position',
    ]);
    this.setState({
      saving: false,
      saveLoading: false,
      setEditOpen: false,
      views: currentView,
    });
  };

  handleDeleteOpen = async (viewId) => {
    this.setState({
      deleting: true,
      viewId: viewId,
    });
  };

  handleDeleteClose = () => {
    this.setState({
      deleting: false,
      deleteLoading: false,
    });
  };

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  componentDidMount = async () => {
    this.props.setHeader('Content');
    this.context.setHeld(false);
    tempView = [];
    this.setState({
      loading: true,
    });

    let projectName = '';

    await Acsys.getProjectName().then((result) => {
      projectName = result;
    });

    let currentView = [];

    currentView = await Acsys.getData('acsys_logical_content', [], '', [
      'position',
    ]);

    this.setState({
      loading: false,
      projectName: projectName,
      initialViews: currentView,
      views: currentView,
    });
  };

  addView = async () => {
    this.setState({ addLoading: true });

    const uId = uniqid();

    let newView = {
      acsys_id: uId,
      is_table_mode: true,
      is_removable: true,
      link_view_id: '',
      link_table: '',
      order_by: '',
      view_order: '',
      row_num: 10,
    };
    await Acsys.insertData('acsys_views', { ...newView }).then(async () => {
      let newEntry = {
        acsys_id: uniqid(),
        name: this.state.name,
        description: this.state.description,
        viewId: uId,
        source_collection: this.state.collection,
        position: this.state.views.length + 1,
        table_keys: [],
      };
      await Acsys.insertData('acsys_logical_content', { ...newEntry });
    });

    this.setState({ addLoading: false });
    this.handleClose();
    this.componentDidMount();
  };

  renderTableData() {
    const { views, rowsPerPage, page } = this.state;
    return views
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((views) => {
        const {
          acsys_id,
          name,
          description,
          viewId,
          source_collection,
          table_keys,
        } = views;
        return (
          <TableRow key={acsys_id}>
            {table_keys.length < 1 ? (
              <TableCell
                to={{
                  pathname:
                    '/CollectionView/' + source_collection + '/' + viewId,
                  state: {
                    table_keys: [],
                    view: name,
                  },
                }}
                component={Link}
                style={{ minWidth: 150 }}
              >
                {name}
              </TableCell>
            ) : (
              <TableCell
                to={{
                  pathname: '/DocumentView',
                  state: {
                    mode: 'update',
                    table_keys: views.table_keys,
                    routed: true,
                    viewId: views.viewId,
                  },
                }}
                component={Link}
                style={{ minWidth: 150 }}
              >
                {name}
              </TableCell>
            )}
            {table_keys.length < 1 ? (
              <TableCell
                to={{
                  pathname:
                    '/CollectionView/' + source_collection + '/' + viewId,
                  state: {
                    table_keys: [],
                    view: name,
                  },
                }}
                component={Link}
                style={{ width: '100%' }}
              >
                {description}
              </TableCell>
            ) : (
              <TableCell
                to={{
                  pathname: '/DocumentView',
                  state: {
                    mode: 'update',
                    table_keys: views.table_keys,
                    routed: true,
                    viewId: views.viewId,
                  },
                }}
                component={Link}
              >
                {description}
              </TableCell>
            )}
            {Acsys.getMode() === 'Administrator' ? (
              <TableCell style={{ minWidth: 70 }} align="right">
                <Tooltip title="Edit View">
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="edit"
                    onClick={() => this.handleEditOpen(views)}
                    style={{ marginRight: 10 }}
                  >
                    <CreateIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete View">
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="delete"
                    onClick={() => this.handleDeleteOpen(viewId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            ) : (
              <div />
            )}
          </TableRow>
        );
      });
  }
  render() {
    const {
      projectName,
      views,
      rowsPerPage,
      page,
      addLoading,
      saveLoading,
      deleteLoading,
    } = this.state;
    try {
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
                {Acsys.getMode() === 'Administrator' ? (
                  <Grid container spacing={1}>
                    <Grid item xs style={{ overflow: 'hidden' }}>
                      <Typography
                        align="left"
                        variant="subtitle2"
                        noWrap
                        style={{ marginTop: 10, color: '#000000' }}
                      >
                        Project: {projectName}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Add New View For Table">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleClickOpen}
                        >
                          Add View
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={1}>
                    <Grid item xs style={{ overflow: 'hidden' }}>
                      <Typography
                        align="left"
                        variant="subtitle2"
                        noWrap
                        style={{ marginTop: 5, color: '#000000' }}
                      >
                        Project: {projectName}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Toolbar>
            </AppBar>
            <div style={{ margin: 'auto', overflow: 'auto' }}>
              <Table>
                <TableHead style={{ backgroundColor: '#fafafa' }}>
                  <TableRow>
                    <TableCell
                      style={{
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 5,
                        paddingBottom: 5,
                        width: 150,
                      }}
                    >
                      NAME
                    </TableCell>
                    <TableCell
                      style={{
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 5,
                        paddingBottom: 5,
                      }}
                    >
                      DESCRIPTION
                    </TableCell>
                    {Acsys.getMode() === 'Administrator' ? (
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
                    ) : (
                      <div />
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>{this.renderTableData()}</TableBody>
              </Table>
            </div>
            <TablePagination
              rowsPerPageOptions={[25]}
              component="div"
              count={views.length}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{
                'aria-label': 'previous page',
              }}
              nextIconButtonProps={{
                'aria-label': 'next page',
              }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
            <LoadingDialog loading={this.state.loading} message={'Loading'} />
            <AddViewDialog
              open={this.state.setOpen}
              closeDialog={this.handleClose}
              title={'Add Logical View'}
              setCollection={this.setCollection}
              collectionArr={this.state.collectionArr}
              setName={this.setName}
              setDescription={this.setDescription}
              action={this.addView}
              actionProcess={addLoading}
            />
            <EditViewDialog
              open={this.state.setEditOpen}
              closeDialog={this.handleEditClose}
              title={'Edit Logical View'}
              position={tempView.position}
              setPosition={this.setPosition}
              views={this.state.views}
              name={tempView.name}
              setName={this.setTempName}
              description={tempView.description}
              setDescription={this.setTempDescription}
              action={this.editView}
              actionProcess={saveLoading}
            />
            <YesNoDialog
              open={this.state.deleting}
              closeDialog={this.handleDeleteClose}
              title={'Delete data?'}
              message={'Are you sure you want to delete this data?'}
              action={this.deleteView}
              actionProcess={deleteLoading}
            />
          </Paper>
        </div>
      );
    } catch (error) {
      return (
        <div style={{ maxWidth: 1236, margin: 'auto' }}>
          <Paper style={{ height: 40 }}>
            <div style={{ padding: 10, margin: 'auto' }}>
              Please make sure database has been created.
            </div>
          </Paper>
        </div>
      );
    }
  }
}
LogicalContent.contextType = AcsysConsumer;
export default LogicalContent;
