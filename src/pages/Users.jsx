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
import React, { useContext, useState, useEffect } from 'react';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysContext } from '../utils/Session/AcsysProvider';
import NewUserDialog from '../components/Dialogs/NewUserDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

const Users = (props) => {
  const context = useContext(AcsysContext);
  const [userId, setUserId] = useState(0);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Administrator');
  const [email, setEmail] = useState('');
  const [passwordOne, setPasswordOne] = useState('');
  const [passwordTwo, setPasswordTwo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [setOpen, setSetOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [setError] = useState('');
  const [projectName, setProjectName] = useState('');

  const deleteUser = async () => {
    await Acsys.deleteData('acsys_users', [['acsys_id', '=', userId]])
      .then(() => {
        inDidMount();
      })
      .catch((error) => setError(error));
    setDeleting(false);
    setDeleteLoading(false);
  };

  const handleChangePage = (event, page) => {
    setPage(page);
  };

  const handleClickOpen = () => {
    setSetOpen(true);
  };

  const handleClose = () => {
    setSetOpen(false);
  };

  const handleDeleteOpen = async (userId) => {
    setDeleting(true);
    setUserId(userId);
  };

  const handleDeleteClose = () => {
    setDeleting(false);
    setDeleteLoading(false);
  };

  const inDidMount = async () => {
    context.setHeader('Users');
    let projectName = await Acsys.getProjectName();
    let users = [];
    try {
      users = await Acsys.getUsers(Acsys.getUser());
    } catch (error) {}
    setProjectName(projectName);
    setUsers(users);
  };
  const addUser = async () => {
    setAddLoading(true);
    if (
      username.length < 1 ||
      email.length < 1 ||
      passwordOne.length < 1 ||
      passwordTwo.length < 1
    ) {
      setMessage('Please fill all fields.');
    } else if (passwordOne !== passwordTwo) {
      setMessage('Passwords do not match.');
    } else {
      const user = {
        role: role,
        mode: role,
        username: username,
        email: email,
        password: passwordOne,
      };
      await Acsys.createUser(user)
        .then((result) => {
          if (result === true) {
            setSetOpen(false);
            inDidMount();
          } else {
            setMessage(result);
          }
        })
        .catch((error) => {
          setError(error);
        });
      setUsername('');
      setEmail('');
      setPasswordOne('');
      setPasswordTwo('');
      setMessage('');
    }
    setAddLoading(false);
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
            setRole={(value) => setRole(value)}
            email={email}
            setEmail={(value) => setEmail(value)}
            username={username}
            setUsername={(value) => {
              setUsername(value);
            }}
            passwordOne={passwordOne}
            setPasswordOne={(value) => {
              setPasswordOne(value);
            }}
            passwordTwo={passwordTwo}
            setPasswordTwo={(value) => setPasswordTwo(value)}
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
