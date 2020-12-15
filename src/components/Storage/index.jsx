import {
  AppBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import {
  Delete,
  Description,
  FolderOpen,
  KeyboardArrowLeft,
  Lock,
  LockOpen,
} from '@material-ui/icons';
import React from 'react';
import * as Acsys from '../../services/Acsys/Acsys';
import LoadingDialog from '../Dialogs/LoadingDialog';
import MessageDialog from '../Dialogs/MessageDialog';
import ImageDialog from '../Dialogs/ImageDialog';
import YesNoDialog from '../Dialogs/YesNoDialog';
import NewFolderDialog from '../Dialogs/NewFolderDialog';

const INITIAL_STATE = {
  locked: true,
  isDialog: false,
  mode: '',
  type: '',
  project_id: '',
  private_key_id: '',
  private_key: '',
  client_email: '',
  client_id: '',
  auth_uri: '',
  token_uri: '',
  auth_provider_x509_cert_url: '',
  client_x509_cert_url: '',
  con: true,
  previousDir: '',
  currentDir: '/',
  files: [],
  uploadFile: '',
  content_id: '',
  viewId: 0,
  initialViews: [],
  collectionDetails: [],
  documentDetails: [],
  collectionValues: [],
  acsysView: [],
  views: [],
  draftViews: [],
  page: 0,
  rowsPerPage: 15,
  openMessage: false,
  loading: false,
  syncing: false,
  newFolder: false,
  setOpen: false,
  setDetailOpen: false,
  loading: false,
  filterLoading: false,
  messageTitle: '',
  message: '',
  error: '',
  deleteLoading: false,
  deleteing: false,
};

let newFolderName;
class Storage extends React.Component {
  state = { ...INITIAL_STATE };

  constructor(props) {
    super(props);
  }

  set = (name, ref) => {
    try {
      this.props.setFile(name, ref);
    } catch (error) {}
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  closeMessage = () => {
    this.setState({
      openMessage: false,
    });
  };

  openDir = async (dir) => {
    this.setState({
      loading: true,
    });
    const parentDir = this.state.files[0].parent;
    const files = await Acsys.getData('acsys_storage_items', [
      ['parent', '=', dir],
    ]);
    for (var i = 0; i < files.length; i++) {
      await Acsys.getStorageURL(files[i].acsys_id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.file_order > b.file_order ? 1 : -1));
    this.setState({
      loading: false,
      previousDir: parentDir,
      currentDir: '/' + dir,
      files: files,
    });
  };

  openDirPage = async (dir) => {
    this.props.history.push('/Storage?' + dir);
    this.setState({
      locked: false,
    });
  };

  previousDir = async () => {
    this.setState({
      loading: true,
    });
    let parentFile = '/';
    let currentDir;
    let files;
    if (this.state.previousDir !== '/') {
      const parent = await Acsys.getData(
        'acsys_storage_items',
        [['acsys_id', '=', this.state.previousDir]],
        1
      );
      parentFile = parent[0].parent;
      currentDir = '/' + this.state.previousDir;
      files = await Acsys.getData('acsys_storage_items', [
        ['parent', '=', this.state.previousDir],
      ]);
    } else {
      currentDir = this.state.previousDir;
      files = await Acsys.getData('acsys_storage_items', [
        ['parent', '=', '/'],
      ]);
    }
    for (var i = 0; i < files.length; i++) {
      await Acsys.getStorageURL(files[i].acsys_id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.file_order > b.file_order ? 1 : -1));

    this.setState({
      loading: false,
      previousDir: parentFile,
      currentDir: currentDir,
      files: files,
    });
  };

  setRef = (ref) => {
    this.setState({
      uploadFile: ref,
    });
  };

  uploadFile = async () => {
    try {
      this.setState({
        loading: true,
      });
      await Acsys.uploadFile(
        this.state.uploadFile.files[0],
        this.state.currentDir
      ).then(async () => {
        await this.loadFiles();
      });
      this.setState({
        loading: false,
      });
    } catch (error) {}
  };

  syncFiles = async () => {
    this.handleSyncClose();
    this.setState({
      loading: true,
    });
    await Acsys.syncFiles();
    let files = await Acsys.getData('acsys_storage_items', [
      ['parent', '=', '/'],
    ]);
    for (var i = 0; i < files.length; i++) {
      await Acsys.getStorageURL(files[i].acsys_id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.file_order > b.file_order ? 1 : -1));
    this.setState({
      loading: false,
      files: files,
    });
  };

  handleSyncOpen = () => {
    this.setState({
      syncing: true,
    });
  };

  handleSyncClose = () => {
    this.setState({
      syncing: false,
    });
  };

  openImg = (url) => {
    this.setState({
      openImg: true,
      imgUrl: url,
    });
  };

  handleImgClose = () => {
    this.setState({
      openImg: false,
    });
  };

  handleChange = (event) => {
    newFolderName = event;
  };

  newFolderOpen = () => {
    this.setState({
      newFolder: true,
    });
  };

  newFolderClose = () => {
    this.setState({
      newFolder: false,
    });
  };

  createNewFolder = async () => {
    if (newFolderName.indexOf(' ') >= 0) {
      this.setState({
        newFolder: false,
        openMessage: true,
        messageTitle: 'Error',
        message: 'Folder name cannot contain spaces.',
      });
    } else {
      this.setState({
        loading: true,
        newFolder: false,
      });
      await Acsys.createNewFolder(newFolderName, this.state.currentDir);
      await this.loadFiles();
      this.setState({
        loading: false,
      });
    }
  };

  makeFilePublic = async (fileName) => {
    this.setState({
      loading: true,
    });
    await Acsys.makeFilePublic(fileName)
      .then(async () => {
        await this.loadFiles();
      })
      .catch((error) => this.setState(error));
    this.setState({
      loading: false,
    });
  };

  makeFilePrivate = async (fileName) => {
    this.setState({
      loading: true,
    });
    await Acsys.makeFilePrivate(fileName)
      .then(async () => {
        await this.loadFiles();
      })
      .catch((error) => this.setState(error));
    this.setState({
      loading: false,
    });
  };

  deleteFile = async () => {
    this.setState({ deleteLoading: true });
    await Acsys.deleteFile(this.state.fileName)
      .then(async () => {
        await this.loadFiles();
      })
      .catch((error) => this.setState(error));
    this.handleDeleteClose();
  };

  handleDeleteOpen = async (fileName) => {
    this.setState({
      deleting: true,
      fileName: fileName,
    });
  };

  handleDeleteClose = () => {
    this.setState({
      deleting: false,
      deleteLoading: false,
    });
  };

  loadFiles = async () => {
    setTimeout(() => {}, 1000);
    let dir = this.state.currentDir;
    if (dir !== '/') {
      dir = dir.substring(1, dir.length);
    }
    const files = await Acsys.getData('acsys_storage_items', [
      ['parent', '=', dir],
    ]);
    for (var i = 0; i < files.length; i++) {
      await Acsys.getStorageURL(files[i].acsys_id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.file_order > b.file_order ? 1 : -1));
    this.setState({
      files: files,
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

  componentDidUpdate = async () => {
    try {
      if (
        this.props.location.search.substring(1) !==
          this.state.currentDir.substring(1) &&
        !this.state.locked
      ) {
        let newDir = this.props.location.search.substring(1);
        if (newDir.length < 1) {
          newDir = '/';
        }
        this.setState({
          locked: true,
          loading: true,
          openImg: false,
        });
        const files = await Acsys.getData('acsys_storage_items', [
          ['parent', '=', newDir],
        ]).catch();
        for (var i = 0; i < files.length; i++) {
          await Acsys.getStorageURL(files[i].acsys_id)
            .then((result) => {
              files[i]['url'] = result;
            })
            .catch((error) => console.log(error));
        }
        files.sort((a, b) => (a.file_order > b.file_order ? 1 : -1));
        let currentDir = '/';
        if (newDir !== '/') {
          currentDir += newDir;
        }
        this.setState({
          locked: false,
          loading: false,
          currentDir: currentDir,
          files: files,
        });
      }
    } catch (error) {}
  };

  componentDidMount = async () => {
    this.setState({
      loading: true,
    });
    let isDialog = this.state.isDialog;
    let parent = '/';
    let mode = 'standard';

    try {
      if (this.props.mode.length > 0) {
        mode = this.props.mode;
      }
    } catch (error) {
      this.props.setHeader('Storage');
    }
    let con;
    let files;
    try {
      con = await Acsys.isStorageConnected();
      if (!con) {
        this.setState({
          loading: false,
          con: con,
        });
      }
      files = await Acsys.getData('acsys_storage_items', [
        ['parent', '=', parent],
      ]);
      for (var i = 0; i < files.length; i++) {
        await Acsys.getStorageURL(files[i].acsys_id)
          .then((result) => {
            files[i]['url'] = result;
          })
          .catch((error) => console.log(error));
      }
      files.sort((a, b) => (a.file_order > b.file_order ? 1 : -1));
    } catch (error) {}
    this.setState({
      loading: false,
      isDialog: isDialog,
      mode: mode,
      con: con,
      files: files,
    });
  };

  getPrevButton() {
    return this.state.mode !== 'standard' ? (
      <Grid item>
        <Tooltip title="Back">
          <IconButton onClick={() => this.previousDir()}>
            <KeyboardArrowLeft color="inherit" />
          </IconButton>
        </Tooltip>
      </Grid>
    ) : (
      <div></div>
    );
  }
  renderIcon(content_type, url) {
    if (content_type === 'Folder') {
      return (
        <TableCell style={{ width: 40, paddingRight: 0 }}>
          <FolderOpen />
        </TableCell>
      );
    } else if (content_type.includes('image')) {
      return (
        <TableCell style={{ width: 40, paddingRight: 0 }}>
          <img
            src={url}
            style={{ cursor: 'pointer', height: 40, width: 40, margin: 0 }}
            onClick={() => this.openImg(url)}
          />
        </TableCell>
      );
    } else {
      return (
        <TableCell style={{ width: 40, paddingRight: 0 }}>
          <Description
            style={{ cursor: 'pointer', height: 40, width: 40, margin: 0 }}
            onClick={() => window.open(url, '_blank')}
          />
        </TableCell>
      );
    }
  }
  renderName(id, content_type, name) {
    if (content_type === 'Folder') {
      if (this.state.mode === 'standard') {
        return (
          <TableCell>
            <a
              onClick={() => this.openDirPage(id)}
              style={{ cursor: 'pointer' }}
            >
              {name}
            </a>
          </TableCell>
        );
      } else {
        return (
          <TableCell>
            <a onClick={() => this.openDir(id)} style={{ cursor: 'pointer' }}>
              {name}
            </a>
          </TableCell>
        );
      }
    } else {
      if (this.state.mode === 'standard') {
        return (
          <TableCell>
            <a>{name}</a>
          </TableCell>
        );
      } else {
        return (
          <TableCell>
            <a onClick={() => this.set(name, id)} style={{ cursor: 'pointer' }}>
              {name}
            </a>
          </TableCell>
        );
      }
    }
  }
  renderTableData() {
    const { files, rowsPerPage, page } = this.state;
    return files
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((file) => {
        const { acsys_id, name, content_type, updated, is_public, url } = file;
        if (name.length > 0) {
          return (
            <TableRow>
              {this.renderIcon(content_type, url, name)}
              {this.renderName(acsys_id, content_type, name)}
              <TableCell>{content_type}</TableCell>
              <TableCell>{updated}</TableCell>
              {Acsys.getMode() !== 'Viewer' ? (
                <TableCell style={{ minWidth: 100 }} align="right">
                  {is_public ? (
                    <Tooltip title="Public To Internet">
                      <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="make private"
                        onClick={() => this.makeFilePrivate(acsys_id)}
                        style={{ marginRight: 10 }}
                      >
                        <LockOpen />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Not Public">
                      <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="make public"
                        onClick={() => this.makeFilePublic(acsys_id)}
                        style={{ marginRight: 10 }}
                      >
                        <Lock />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete File">
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="delete"
                      onClick={() => this.handleDeleteOpen(acsys_id)}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              ) : (
                <div />
              )}
            </TableRow>
          );
        } else {
          return <div />;
        }
      });
  }
  render() {
    const {
      deleteLoading,
      files,
      rowsPerPage,
      page,
      currentDir,
      con,
    } = this.state;
    if (con) {
      try {
        return (
          <div>
            <Paper
              style={{ margin: 'auto', overflow: 'hidden', clear: 'both' }}
            >
              <AppBar
                position="static"
                elevation={0}
                style={{
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #dcdcdc',
                }}
              >
                <Toolbar
                  style={{ margin: 4, paddingLeft: 12, paddingRight: 12 }}
                >
                  {Acsys.getMode() !== 'Viewer' ? (
                    <Grid container spacing={1}>
                      <Grid item xs style={{ overflow: 'hidden' }}>
                        <Typography
                          align="left"
                          variant="subtitle2"
                          noWrap
                          style={{ marginTop: 10, color: '#000000' }}
                        >
                          {currentDir}
                        </Typography>
                      </Grid>
                      {this.getPrevButton()}
                      <Grid item style={{ minWidth: 20 }}>
                        <Tooltip title="Scan For File Updates">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleSyncOpen}
                          >
                            Scan
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid item style={{ minWidth: 20 }}>
                        <input
                          id="contained-button-file"
                          type="file"
                          style={{ display: 'none' }}
                          ref={this.setRef}
                          onChange={this.uploadFile}
                        />
                        <label htmlFor="contained-button-file">
                          <Tooltip title="Upload File">
                            <Button
                              variant="contained"
                              color="primary"
                              component="span"
                            >
                              Upload
                            </Button>
                          </Tooltip>
                        </label>
                      </Grid>
                      <Grid item style={{ minWidth: 20 }}>
                        <Tooltip title="New Folder">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={this.newFolderOpen}
                          >
                            New Folder
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
                          style={{ marginTop: 10, color: '#000000' }}
                        >
                          {currentDir}
                        </Typography>
                      </Grid>
                      {this.getPrevButton()}
                    </Grid>
                  )}
                </Toolbar>
              </AppBar>
              <div style={{ margin: 'auto', overflow: 'auto' }}>
                <Table>
                  <TableHead style={{ backgroundColor: '#fafafa' }}>
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        style={{
                          paddingLeft: 16,
                          paddingRight: 16,
                          paddingTop: 5,
                          paddingBottom: 5,
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
                          width: 100,
                        }}
                      >
                        TYPE
                      </TableCell>
                      <TableCell
                        style={{
                          paddingLeft: 16,
                          paddingRight: 16,
                          paddingTop: 5,
                          paddingBottom: 5,
                          width: 110,
                        }}
                      >
                        LAST MODIFIED
                      </TableCell>
                      {Acsys.getMode() !== 'Viewer' ? (
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
                count={files.length}
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
              <MessageDialog
                open={this.state.openMessage}
                closeDialog={this.closeMessage}
                title={this.state.messageTitle}
                message={this.state.message}
              />
              <YesNoDialog
                open={this.state.syncing}
                closeDialog={this.handleSyncClose}
                title={'Sync files?'}
                message={
                  'Are you sure you want to resync files? This operation can require multiple writes.'
                }
                action={this.syncFiles}
              />
              <ImageDialog
                open={this.state.openImg}
                closeDialog={this.handleImgClose}
                imgUrl={this.state.imgUrl}
              />
              <NewFolderDialog
                open={this.state.newFolder}
                closeDialog={this.newFolderClose}
                handleChange={this.handleChange}
                createNewFolder={this.createNewFolder}
              />
              <YesNoDialog
                open={this.state.deleting}
                closeDialog={this.handleDeleteClose}
                title={'Delete file?'}
                message={'Are you sure you want to delete this file?'}
                action={this.deleteFile}
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
    } else {
      return (
        <div style={{ maxWidth: 1236, margin: 'auto' }}>
          <Paper style={{ height: 40 }}>
            <div style={{ padding: 10, margin: 'auto' }}>
              Please configure storage.
            </div>
          </Paper>
        </div>
      );
    }
  }
}
export default Storage;
