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
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Create as CreateIcon, Delete as DeleteIcon } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import uniqid from 'uniqid';
import * as Prom from '../../services/Acsys/Acsys';
import { PromConsumer } from '../../services/Session/PromProvider';

const styles = makeStyles({
  paper: {
    maxWidth: 1236,
    margin: 'auto',
    overflow: 'hidden',
  },
  row: {
    width: '100%',
  },
  searchBar: {
    flexGrow: 1,
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  block: {
    display: 'block',
  },
  contentWrapper: {},
});

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

  deleteView = async () => {
    this.setState({ deleteLoading: true });
    if (this.state.viewId.length > 0) {
      await Prom.deleteView(this.state.viewId);
    }
    this.handleDeleteClose();
    this.componentDidMount();
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleClickOpen = async () => {
    let collections = [];

    await Prom.getTables().then((json) => {
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
      await Prom.updateData('prmths_logical_content', tempView, [
        ['id', '=', tempView.id],
      ]);
    } else {
      const oldPosition = tempView['position'];
      tempView['position'] = position;
      await Prom.repositionViews(tempView, oldPosition, position);
      await this.sleep(1000);
    }
    const currentView = await Prom.getData('prmths_logical_content', [], '', [
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

    await Prom.getProjectName()
              .then((result) => {
                projectName = result;
              });
              
    let currentView = [];

    currentView = await Prom.getData('prmths_logical_content', [], '', [
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
      id: uId,
      isTableMode: true,
      isRemovable: true,
      linkViewId: '',
      linkTable: '',
      orderBy: '',
      viewOrder: '',
      rowNum: 10,
    };
    await Prom.insertData('prmths_views', { ...newView }).then(async () => {
      let newEntry = {
        id: uniqid(),
        name: this.state.name,
        description: this.state.description,
        viewId: uId,
        source_collection: this.state.collection,
        position: this.state.views.length + 1,
        tableKeys: [],
      };
      await Prom.insertData('prmths_logical_content', { ...newEntry });
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
          id,
          name,
          description,
          viewId,
          source_collection,
          tableKeys,
        } = views;
        return (
          <TableRow key={id}>
            {tableKeys.length < 1 ? (
              <TableCell
                to={{
                  pathname:
                    '/CollectionView/' + source_collection + '/' + viewId,
                  state: {
                    tableKeys: [],
                    view: name,
                  },
                }}
                component={Link}
                style={{ width: 150 }}
              >
                {name}
              </TableCell>
            ) : (
              <TableCell
                to={{
                  pathname: '/DocumentView',
                  state: {
                    mode: 'update',
                    tableKeys: views.tableKeys,
                    routed: true,
                    viewId: views.viewId,
                  },
                }}
                component={Link}
                style={{ width: 150 }}
              >
                {name}
              </TableCell>
            )}
            {tableKeys.length < 1 ? (
              <TableCell
                to={{
                  pathname:
                    '/CollectionView/' + source_collection + '/' + viewId,
                  state: {
                    tableKeys: [],
                    view: name,
                  },
                }}
                component={Link}
              >
                {description}
              </TableCell>
            ) : (
              <TableCell
                to={{
                  pathname: '/DocumentView',
                  state: {
                    mode: 'update',
                    tableKeys: views.tableKeys,
                    routed: true,
                    viewId: views.viewId,
                  },
                }}
                component={Link}
              >
                {description}
              </TableCell>
            )}
            {Prom.getMode() === 'Administrator' ? (
              <TableCell style={{ minWidth: 100 }} align="right">
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
                {Prom.getMode() === 'Administrator' ? (
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
                    {Prom.getMode() === 'Administrator' ? (
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
              open={this.state.setOpen}
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              maxWidth={'lg'}
            >
              <DialogTitle id="alert-dialog-title">
                {'Add Logical View'}
              </DialogTitle>
              <DialogContent style={{ width: 400 }}>
                <div class="dialog-input">
                  <Select
                    displayEmpty
                    onChange={(e) => {
                      this.setState({
                        collection: e.target.value,
                      });
                    }}
                    style={{ width: '100%' }}
                  >
                    {this.state.collectionArr.map((value) => {
                      return <MenuItem value={value}>{value}</MenuItem>;
                    })}
                  </Select>
                </div>
                <div class="dialog-input">
                  <input
                    value="Position generated on publish"
                    readonly
                    style={{ width: '97%' }}
                  />
                </div>
                <div class="dialog-input">
                  <input
                    placeholder="Enter view name here"
                    type="text"
                    style={{ width: '97%' }}
                    onChange={(e) =>
                      this.setState({
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div class="dialog-input">
                  <input
                    placeholder="Enter description here"
                    type="text"
                    style={{ width: '97%' }}
                    onChange={(e) =>
                      this.setState({
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.addView}
                  color="primary"
                  autoFocus
                >
                  {addLoading && <CircularProgress size={24} />}
                  {!addLoading && 'Add'}
                </Button>
                <Button
                  onClick={this.handleClose}
                  color="primary"
                  autoFocus
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={this.state.setEditOpen}
              onClose={this.handleEditClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              maxWidth={'lg'}
            >
              <DialogTitle id="alert-dialog-title">
                {'Edit Logical View'}
              </DialogTitle>
              <DialogContent style={{ width: 400 }}>
                <div class="dialog-input">
                  <Select
                    defaultValue={tempView.position}
                    style={{ width: '100%' }}
                    onChange={(e) => this.setPosition(parseInt(e.target.value))}
                  >
                    {Object.values(this.state.views).map((view, index) => {
                      return (
                        <MenuItem value={view.position}>{index + 1}</MenuItem>
                      );
                    })}
                  </Select>
                </div>
                <div class="dialog-input">
                  <input
                    placeholder="Enter view name here"
                    type="text"
                    style={{ width: '97%' }}
                    defaultValue={tempView.name}
                    onChange={(e) => (tempView['name'] = e.target.value)}
                  />
                </div>
                <div class="dialog-input">
                  <input
                    placeholder="Enter description here"
                    type="text"
                    style={{ width: '97%' }}
                    defaultValue={tempView.description}
                    onChange={(e) => (tempView['description'] = e.target.value)}
                  />
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.editView}
                  color="primary"
                  autoFocus
                >
                  {saveLoading && <CircularProgress size={24} />}
                  {!saveLoading && 'Update'}
                </Button>
                <Button
                  onClick={this.handleEditClose}
                  color="primary"
                  autoFocus
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={this.state.deleting}
              onClose={this.handleDeleteClose}
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
                <Button onClick={this.handleDeleteClose} color="primary">
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
          </Paper>
        </div>
      );
    }
    catch (error) {
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
LogicalContent.contextType = PromConsumer;
export default LogicalContent;
