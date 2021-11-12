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
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Delete as DeleteIcon } from '@material-ui/icons';
import React, { useState, useEffect, useContext } from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysContext } from '../utils/Session/AcsysProvider';
import TableControl from '../components/TableControl/TableControl';
import FieldControlDialog from '../components/Dialogs/FieldControlDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import MessageDialog from '../components/Dialogs/MessageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

let tempView = [];
let tableName = '';
let entry = [];

const LogicalContent = (props) => {
  const context = useContext(AcsysContext);
  const [viewId, setviewId] = useState('');
  const [views, setviews] = useState([]);
  const [page, setpage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [message, setmessage] = useState('');
  const [loading, setloading] = useState(false);
  const [deleting, setdeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [openMessage, setopenMessage] = useState(false);
  const [projectName] = useState('');

  const deleteTable = async () => {
    setdeleteLoading(true);
    if (viewId.length > 0) {
      await Acsys.dropTable(viewId);
    }
    handleDeleteClose();
    inDidMount();
  };

  const handleChangePage = (event, page) => {
    setpage(page);
  };

  const handleClickOpen = async () => {
    entry = [];
    entry.push({ dataType: 'string', fieldName: '', value: '' });
    setOpen(true);
  };

  const handleClose = () => {
    tableName = '';
    setOpen(false);
    setAddLoading(false);
  };

  const handleMessageClose = () => {
    setopenMessage(false);
  };

  const editView = async () => {
    await Acsys.updateData('acsys_logical_content', tempView, [
      ['acsys_id', '=', tempView.acsys_id],
    ]);
    const currentView = await Acsys.getData('acsys_logical_content');
    setviews(currentView);
  };

  const handleDeleteOpen = async (viewId) => {
    setdeleting(true);
    setviewId(viewId);
  };

  const handleDeleteClose = () => {
    setdeleting(false);
    setdeleteLoading(false);
  };

  const inDidMount = async () => {
    props.setHeader('Database');
    context.setHeld(false);
    tempView = [];
    setloading(true);
    let projectName = await Acsys.getProjectName();
    let currentView = [];
    currentView = await Acsys.getTableData();
    projectName: projectName, setloading(false);
    setAddLoading(false);
    setviews(currentView);
  };

  useEffect(() => {
    inDidMount();
  }, []);

  const setName = (name) => {
    tableName = name;
  };

  const addTable = async () => {
    setAddLoading(true);
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
      setAddLoading(false);
      setopenMessage(true);
      setmessage('Allfields must be filled before submitting.');
    } else {
      await Acsys.createTable(tableName, newEntry);
      handleClose();
      inDidMount();
    }
  };

  const renderTableData = () => {
    return views
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((views) => {
        const { acsys_id, table, rows } = views;
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
                  onClick={() => handleDeleteOpen(table)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      });
  };
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
                      onClick={handleClickOpen}
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
              <TableBody>{renderTableData()}</TableBody>
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
            onChangePage={handleChangePage}
            // onChangeRowsPerPage={handleChangeRowsPerPage}
          />
          <LoadingDialog loading={loading} message={'Loading'} />
          <FieldControlDialog
            open={open}
            closeDialog={handleClose}
            title={'Add Table'}
            backend={HTML5Backend}
            component={<TableControl setName={setName} entry={entry} />}
            action={addTable}
            actionProcess={addLoading}
          />
          <YesNoDialog
            open={deleting}
            closeDialog={handleDeleteClose}
            title={'Delete data?'}
            message={'Are you sure you want to delete this data?'}
            action={deleteTable}
            actionProcess={deleteLoading}
          />
          <MessageDialog
            open={openMessage}
            closeDialog={handleMessageClose}
            title={'Error'}
            message={message}
          />
        </Paper>
      </div>
    );
  } catch (error) {
    alert(error);
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
};

export default LogicalContent;
