import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { Delete as DeleteIcon } from '@material-ui/icons';
import React from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import * as Prom from '../../services/Acsys/Acsys';
import { PromConsumer } from '../../services/Session/PromProvider';
import TableControl from '../TableControl';

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
  message: '',
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
let tableName = '';
let entry = [];

class LogicalContent extends React.Component {
  state = { ...INITIAL_STATE };

  setTable = (table) => {
    table = table;
  };

  getTable = () => {
    return table;
  };

  deleteTable = async () => {
    this.setState({ deleteLoading: true });
    if (this.state.viewId.length > 0) {
      await Prom.dropTable(this.state.viewId);
    }
    this.handleDeleteClose();
    this.componentDidMount();
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleClickOpen = async () => {
    entry = [];
    entry.push({ dataType: '', fieldName: '', value: '' });
    this.setState({
      setOpen: true,
    });
  };

  handleClose = () => {
    tableName = '';
    this.setState({
      setOpen: false,
      addLoading: false,
    });
  };

  handleMessageOpen = async () => {
    this.setState({
      openMessage: true,
    });
  };

  handleMessageClose = () => {
    this.setState({
      openMessage: false,
    });
  };

  handleEditOpen = (view) => {
    tempView = view;
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
    await Prom.updateData('prmths_logical_content', tempView, [
      ['id', '=', tempView.id],
    ]);
    const currentView = await Prom.getData('prmths_logical_content');
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

  componentDidMount = async () => {
    this.props.setHeader('Database');
    this.context.setHeld(false);
    tempView = [];
    this.setState({
      loading: true,
    });
    let projectName = await Prom.getProjectName();
    let currentView = [];

    currentView = await Prom.getTableData();

    this.setState({
      projectName: projectName,
      loading: false,
      addLoading: false,
      initialViews: currentView,
      views: currentView,
    });
  };

  setName = (name) => {
    tableName = name;
  };

  addTable = async () => {
    this.setState({ addLoading: true });

    let error = false;

    let newEntry = {};

    entry.forEach((obj) => {
      const field = obj['fieldName'];
      const value = obj['value'];
      if (value.length < 1 || field.length < 1) {
        error = true;
      }
      if (obj['dataType'] === 'string') {
        newEntry[field] = value;
      } else if (obj['dataType'] === 'number') {
        newEntry[field] = parseInt(value);
      } else if (obj['dataType'] === 'boolean') {
        newEntry[field] = 'true' == value;
      }
    });

    if(error || tableName.length < 1) {
      this.setState({
        addLoading: false,
        openMessage: true,
        message: 'All fields must be filled before submitting.'
      })
    }
    else {
      await Prom.createTable(tableName, newEntry);
      this.handleClose();
      this.componentDidMount();
    }
  };

  renderTableData() {
    const { views, rowsPerPage, page } = this.state;
    return views
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((views) => {
        const { id, table, rows, viewId, source_collection, tableKeys } = views;
        return (
          <TableRow key={id}>
            <TableCell>{table}</TableCell>
            <TableCell style={{ width: 50 }}>{rows}</TableCell>
            <TableCell style={{ width: 100 }} align="right">
              <Tooltip title="Delete Table">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="delete"
                  onClick={() => this.handleDeleteOpen(table)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      });
  }
  render() {
    const {
      error,
      projectName,
      views,
      rowsPerPage,
      page,
      message,
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
                    <Tooltip title="Create New Table">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleClickOpen}
                      >
                        Add Table
                      </Button>
                    </Tooltip>
                  </Grid>
                </Grid>
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
                      }}
                    >
                      TABLE NAME
                    </TableCell>
                    <TableCell
                      style={{
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 5,
                        paddingBottom: 5,
                        width: 50,
                      }}
                    >
                      ROWS
                    </TableCell>
                    <TableCell
                      style={{
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 5,
                        paddingBottom: 5,
                        width: 100,
                      }}
                      align="right"
                    >
                      ACTIONS
                    </TableCell>
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
              maxWidth={'lg'}
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
              maxWidth={'md'}
            >
              <DialogTitle id="alert-dialog-title">{'Add Table'}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description"></DialogContentText>
                <DndProvider backend={Backend}>
                  <TableControl setName={this.setName} entry={entry} />
                </DndProvider>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={this.addTable}
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
            >
              <DialogTitle id="alert-dialog-title">
                {'Edit Logical View'}
              </DialogTitle>
              <DialogContent>
                <div class="dialog-input">
                  <input
                    placeholder="Enter view name here"
                    type="text"
                    defaultValue={tempView.name}
                    onChange={(e) => (tempView['name'] = e.target.value)}
                  />
                </div>
                <div class="dialog-input">
                  <input
                    placeholder="Enter description here"
                    type="text"
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
                  onClick={this.deleteTable}
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
              open={this.state.openMessage}
              onClose={this.handleMessageClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{'Error'}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {message}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleMessageClose} color="primary">
                  Okay
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
