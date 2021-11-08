import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Tooltip,
} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Delete as DeleteIcon } from '@material-ui/icons';
import React, { useState, useEffect } from 'react';
import uniqid from 'uniqid';
import * as Acsys from '../utils/Acsys/Acsys';
import NewUserDialog from '../components/Dialogs/NewUserDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

const Users = (props) => {
  const [userId, setuserId] = useState(0);
  const [message, setmessage] = useState('');
  const [users, setusers] = useState([]);
  const [username, setusername] = useState('');
  const [role, setrole] = useState('Administrator');
  const [email, setemail] = useState('');
  const [passwordOne, setpasswordOne] = useState('');
  const [passwordTwo, setpasswordTwo] = useState('');
  const [page, setpage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [setOpen, setsetOpen] = useState(false);
  const [addLoading, setaddLoading] = useState(false);
  const [deleting, setdeleting] = useState(false);
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [seterror] = useState('');
  const [projectName, setprojectName] = useState('');

  const setRole = (value) => {
    setrole(value);
  };

  const setEmail = (value) => {
    setemail(value);
  };

  const setUsername = (value) => {
    setusername(value);
  };

  const setPasswordOne = (value) => {
    setpasswordOne(value);
  };

  const setPasswordTwo = (value) => {
    setpasswordTwo(value);
  };

  const deleteUser = async () => {
    await Acsys.deleteData('acsys_users', [['acsys_id', '=', userId]])
      .then(() => {
        inDidMount();
      })
      .catch((error) => seterror(error));
    setdeleting(false);
    setdeleteLoading(false);
  };

  const handleChangePage = (event, page) => {
    setpage(page);
  };

  const handleClickOpen = () => {
    setsetOpen(true);
  };

  const handleClose = () => {
    setsetOpen(false);
  };

  const handleDeleteOpen = async (userId) => {
    setdeleting(true);
    setuserId(userId);
  };

  const handleDeleteClose = () => {
    setdeleting(false);
    setdeleteLoading(false);
  };

  const inDidMount = async () => {
    props.setHeader('Users');
    let projectName = await Acsys.getProjectName();
    let users = [];
    try {
      users = await Acsys.getUsers(Acsys.getUser());
    } catch (error) {}
    setprojectName(projectName);
    setusers(users);
  };
  const addUser = async () => {
    setaddLoading(true);
    const user = {
      acsys_id: uniqid(),
      role: role,
      mode: role,
      username: username,
      email: email,
      password: passwordOne,
    };
    await Acsys.createUser(user)
      .then((result) => {
        if (result === true) {
          setaddLoading(false);
          inDidMount();
        } else {
          setaddLoading(false);
          setmessage(result);
        }
      })
      .catch((error) => {
        seterror(error);
      });
  };

  useEffect(() => {
    inDidMount();
  }, []);

  const renderTableData = () => {
    return users
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((users) => {
        const { acsys_id, username, email, role } = users;
        return (
          <TableRow key={acsys_id}>
            <TableCell>{username}</TableCell>
            <TableCell>{role}</TableCell>
            <TableCell>{email}</TableCell>
            <TableCell align="right">
              <Tooltip title="Remove User">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="delete"
                  onClick={() => handleDeleteOpen(acsys_id)}
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
                  <Tooltip title="Add New User">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleClickOpen}
                    >
                      Add User
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
                    USERNAME
                  </TableCell>
                  <TableCell
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}
                  >
                    ROLE
                  </TableCell>
                  <TableCell
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}
                  >
                    EMAIL
                  </TableCell>
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
              </TableHead>
              <TableBody>{renderTableData()}</TableBody>
            </Table>
          </div>
          <TablePagination
            rowsPerPageOptions={[25]}
            component="div"
            count={users.length}
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
          <NewUserDialog
            open={setOpen}
            closeDialog={handleClose}
            message={message}
            setRole={setRole}
            email={email}
            setEmail={setEmail}
            username={username}
            setUsername={setUsername}
            passwordOne={passwordOne}
            setPasswordOne={setPasswordOne}
            passwordTwo={passwordTwo}
            setPasswordTwo={setPasswordTwo}
            action={addUser}
            actionProcess={addLoading}
          />
          <YesNoDialog
            open={deleting}
            closeDialog={handleDeleteClose}
            title={'Delete data?'}
            message={'Are you sure you want to delete this user?'}
            action={deleteUser}
            actionProcess={deleteLoading}
          />
        </Paper>
      </div>
    );
  } catch (error) {
    console.log(error, 'error');
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
export default Users;
