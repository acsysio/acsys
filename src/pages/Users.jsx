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
import React from 'react';
import uniqid from 'uniqid';
import * as Acsys from '../utils/Acsys/Acsys';
import NewUserDialog from '../components/Dialogs/NewUserDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

const INITIAL_STATE = {
  userId: 0,
  initialUsers: [],
  message: '',
  name: '',
  collection: '',
  description: '',
  users: [],
  username: '',
  role: 'Administrator',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  page: 0,
  rowsPerPage: 15,
  setOpen: false,
  addLoading: false,
  deleting: false,
  deleteLoading: false,
  error: '',
};

class Users extends React.Component {
  state = { ...INITIAL_STATE };

  setRole = (value) => {
    this.setState({
      role: value,
    });
  };

  setEmail = (value) => {
    this.setState({
      email: value,
    });
  };

  setUsername = (value) => {
    this.setState({
      username: value,
    });
  };

  setPasswordOne = (value) => {
    this.setState({
      passwordOne: value,
    });
  };

  setPasswordTwo = (value) => {
    this.setState({
      passwordTwo: value,
    });
  };

  deleteUser = async () => {
    await Acsys.deleteData('acsys_users', [
      ['acsys_id', '=', this.state.userId],
    ])
      .then(() => {
        this.componentDidMount();
      })
      .catch((error) => this.setState(error));
    this.setState({
      deleting: false,
      deleteLoading: false,
    });
  };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleClickOpen = () => {
    this.setState({
      setOpen: true,
    });
  };

  handleClose = () => {
    this.setState({
      setOpen: false,
    });
  };

  handleDeleteOpen = async (userId) => {
    this.setState({
      deleting: true,
      userId: userId,
    });
  };

  handleDeleteClose = () => {
    this.setState({
      deleting: false,
      deleteLoading: false,
    });
  };

  componentDidMount = async () => {
    this.props.setHeader('Users');
    let projectName = await Acsys.getProjectName();
    let users = [];
    try {
      users = await Acsys.getUsers(Acsys.getUser());
    } catch (error) {}
    this.setState({
      projectName: projectName,
      users: users,
    });
  };
  addUser = async () => {
    const { role, username, email, passwordOne } = this.state;
    this.setState({ loading: true });
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
          this.setState({ ...INITIAL_STATE, loading: false });
          this.componentDidMount();
        } else {
          this.setState({
            loading: false,
            message: result,
          });
        }
      })
      .catch((error) => {
        this.setState({ error });
      });
  };
  renderTableData() {
    const { users, rowsPerPage, page } = this.state;
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
                  onClick={() => this.handleDeleteOpen(acsys_id)}
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
      projectName,
      users,
      rowsPerPage,
      page,
      addLoading,
      deleteLoading,
      message,
      email,
      username,
      passwordOne,
      passwordTwo,
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
                    <Tooltip title="Add New User">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleClickOpen}
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
                <TableBody>{this.renderTableData()}</TableBody>
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
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
            <NewUserDialog
              open={this.state.setOpen}
              closeDialog={this.handleClose}
              message={message}
              setRole={this.setRole}
              email={email}
              setEmail={this.setEmail}
              username={username}
              setUsername={this.setUsername}
              passwordOne={passwordOne}
              setPasswordOne={this.setPasswordOne}
              passwordTwo={passwordTwo}
              setPasswordTwo={this.setPasswordTwo}
              action={this.addUser}
              actionProcess={addLoading}
            />
            <YesNoDialog
              open={this.state.deleting}
              closeDialog={this.handleDeleteClose}
              title={'Delete data?'}
              message={'Are you sure you want to delete this user?'}
              action={this.deleteUser}
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
export default Users;
