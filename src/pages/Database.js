import {
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
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysConsumer } from '../utils/Session/AcsysProvider';
import TableControl from '../components/TableControl/TableControl';
import FieldControlDialog from '../components/Dialogs/FieldControlDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import MessageDialog from '../components/Dialogs/MessageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

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
      await Acsys.dropTable(this.state.viewId);
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
    await Acsys.updateData('acsys_logical_content', tempView, [
      ['acsys_id', '=', tempView.acsys_id],
    ]);
    const currentView = await Acsys.getData('acsys_logical_content');
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
    let projectName = await Acsys.getProjectName();
    let currentView = [];

    currentView = await Acsys.getTableData();

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

    if (error || tableName.length < 1) {
      this.setState({
        addLoading: false,
        openMessage: true,
        message: 'All fields must be filled before submitting.',
      });
    } else {
      await Acsys.createTable(tableName, newEntry);
      this.handleClose();
      this.componentDidMount();
    }
  };

  renderTableData() {
    const { views, rowsPerPage, page } = this.state;
    return views
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((views) => {
        const {
          acsys_id,
          table,
          rows,
          viewId,
          source_collection,
          table_keys,
        } = views;
        return (
          <TableRow key={acsys_id}>
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
            <LoadingDialog loading={this.state.loading} message={'Loading'} />
            <FieldControlDialog
              open={this.state.setOpen}
              closeDialog={this.handleClose}
              title={'Add Table'}
              backend={HTML5Backend}
              component={<TableControl setName={this.setName} entry={entry} />}
              action={this.addTable}
              actionProcess={addLoading}
            />
            <YesNoDialog
              open={this.state.deleting}
              closeDialog={this.handleDeleteClose}
              title={'Delete data?'}
              message={'Are you sure you want to delete this data?'}
              action={this.deleteTable}
              actionProcess={deleteLoading}
            />
            <MessageDialog
              open={this.state.openMessage}
              closeDialog={this.handleMessageClose}
              title={'Error'}
              message={message}
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
