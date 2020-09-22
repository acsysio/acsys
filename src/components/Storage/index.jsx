import {
    AppBar,
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
    TableRow
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import {
    CreateNewFolder,
    Delete,
    Description, FolderOpen, KeyboardArrowLeft, Lock,
    LockOpen
} from '@material-ui/icons';
import React from 'react';
import * as Prom from '../../services/Prometheus/Prom';

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
  contentId: '',
  viewId: 0,
  initialViews: [],
  collectionDetails: [],
  documentDetails: [],
  collectionValues: [],
  prmthsView: [],
  views: [],
  draftViews: [],
  page: 0,
  rowsPerPage: 15,
  loading: false,
  syncing: false,
  newFolder: false,
  setOpen: false,
  setDetailOpen: false,
  loading: false,
  filterLoading: false,
  error: '',
  deleteLoading: false,
  deleteing: false,
};

let tempUrl = '';
let tempReference = '';
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

  openDir = async (dir) => {
    this.setState({
      loading: true,
    });
    const parentDir = this.state.files[0].parent;
    const files = await Prom.getData('prmths_storage_items', [
      ['parent', '=', dir],
    ]);
    for (var i = 0; i < files.length; i++) {
      await Prom.getStorageURL(files[i].id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.fileOrder > b.fileOrder ? 1 : -1));
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
      const parent = await Prom.getData(
        'prmths_storage_items',
        [['id', '=', this.state.previousDir]],
        1
      );
      parentFile = parent[0].parent;
      currentDir = '/' + this.state.previousDir;
      files = await Prom.getData('prmths_storage_items', [
        ['parent', '=', this.state.previousDir],
      ]);
    } else {
      currentDir = this.state.previousDir;
      files = await Prom.getData('prmths_storage_items', [
        ['parent', '=', '/'],
      ]);
    }
    for (var i = 0; i < files.length; i++) {
      await Prom.getStorageURL(files[i].id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.fileOrder > b.fileOrder ? 1 : -1));

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
      await Prom.uploadFile(
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
    await Prom.syncFiles();
    let files = await Prom.getData('prmths_storage_items', [
      ['parent', '=', '/'],
    ]);
    for (var i = 0; i < files.length; i++) {
      await Prom.getStorageURL(files[i].id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.fileOrder > b.fileOrder ? 1 : -1));
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
    })
  };

  handleImgClose = () => {
    this.setState({
      openImg: false,
    })
  }

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
    this.setState({
      loading: true,
      newFolder: false,
    });
    await Prom.createNewFolder(newFolderName, this.state.currentDir);
    await this.loadFiles();
    this.setState({
      loading: false,
    });
  };

  makeFilePublic = async (fileName) => {
    this.setState({
      loading: true,
    });
    await Prom.makeFilePublic(fileName)
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
    await Prom.makeFilePrivate(fileName)
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
    await Prom.deleteFile(this.state.fileName)
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
    const files = await Prom.getData('prmths_storage_items', [
      ['parent', '=', dir],
    ]);
    for (var i = 0; i < files.length; i++) {
      await Prom.getStorageURL(files[i].id)
        .then((result) => {
          files[i]['url'] = result;
        })
        .catch((error) => console.log(error));
    }
    files.sort((a, b) => (a.fileOrder > b.fileOrder ? 1 : -1));
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
        const files = await Prom.getData('prmths_storage_items', [
          ['parent', '=', newDir],
        ]).catch();
        for (var i = 0; i < files.length; i++) {
          await Prom.getStorageURL(files[i].id)
            .then((result) => {
              files[i]['url'] = result;
            })
            .catch((error) => console.log(error));
        }
        files.sort((a, b) => (a.fileOrder > b.fileOrder ? 1 : -1));
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
      con = await Prom.isStorageConnected();
      if (!con) {
        this.setState({
          loading: false,
          con: con,
        });
      }
      files = await Prom.getData('prmths_storage_items', [
        ['parent', '=', parent],
      ]);
      for (var i = 0; i < files.length; i++) {
        await Prom.getStorageURL(files[i].id)
          .then((result) => {
            files[i]['url'] = result;
          })
          .catch((error) => console.log(error));
      }
      files.sort((a, b) => (a.fileOrder > b.fileOrder ? 1 : -1));
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
  renderIcon(contentType, url) {
    if (contentType === 'Folder') {
      return (
        <TableCell style={{ width: 40, paddingRight: 0 }}>
          <FolderOpen />
        </TableCell>
      );
    } else if (contentType.includes('image')) {
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
  renderName(id, contentType, name) {
    if (contentType === 'Folder') {
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
            <a 
              onClick={() => this.openDir(id)} 
              style={{ cursor: 'pointer' }}
            >
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
        const { id, name, contentType, updated, isPublic, url } = file;
        if (name.length > 0) {
          return (
            <TableRow>
              {this.renderIcon(contentType, url, name)}
              {this.renderName(id, contentType, name)}
              <TableCell>{contentType}</TableCell>
              <TableCell>{updated}</TableCell>
              {Prom.getMode() !== 'Viewer' ? (
                <TableCell style={{ minWidth: 100 }} align="right">
                  {isPublic ? (
                    <Tooltip title="Public To Internet">
                      <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="make private"
                        onClick={() => this.makeFilePrivate(id)}
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
                        onClick={() => this.makeFilePublic(id)}
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
                      onClick={() => this.handleDeleteOpen(id)}
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
    const { deleteLoading, files, rowsPerPage, page, currentDir, con } = this.state;
    if (con) {
      try {
        return (
          <div>
            <Paper style={{ margin: 'auto', overflow: 'hidden', clear: 'both' }}>
              <AppBar
                position="static"
                elevation={0}
                style={{
                  backgroundColor: '#fafafa',
                  borderBottom: '1px solid #dcdcdc',
                }}
              >
                <Toolbar style={{ margin: 4, paddingLeft: 12, paddingRight: 12 }}>
                  {Prom.getMode() !== 'Viewer' ? (
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
                      {Prom.getMode() !== 'Viewer' ? (
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
                open={this.state.syncing}
                onClose={this.handleSyncClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{'Sync files?'}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to resync files? This operation can require multiple writes.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleSyncClose} color="primary">
                    No
                  </Button>
                  <Button
                    onClick={this.syncFiles}
                    color="primary"
                    autoFocus
                  >
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={this.state.openImg}
                onClose={this.handleImgClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth={'lg'}
              >
                
                <DialogContent
                  style={{
                    
                    margin: 'auto',
                    overflow: 'hidden',
                  }}
                >
                  <div class="image-container">
                    <img
                      src={this.state.imgUrl}
                      style={{ height: '50vh', maxWidth: '50vw' }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={this.state.newFolder}
                onClose={this.newFolderClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth={'md'}
              >
                <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
                  New Folder
                </DialogTitle>
                <DialogContent>
                  <div style={{ width: 600, margin: 'auto' }}>
                    <input
                      placeholder="Enter folder name here"
                      onChange={(e) => this.handleChange(e.target.value)}
                      type="text"
                      style={{ width: '100%', marginBottom: 10 }}
                    />
                    <Grid container spacing={1}>
                      <Grid item xs></Grid>
                      <Grid item>
                        <Button
                          color="primary"
                          component="span"
                          onClick={this.createNewFolder}
                        >
                          Save
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          color="primary"
                          component="span"
                          onClick={this.newFolderClose}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={this.state.deleting}
                onClose={this.handleDeleteClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{'Delete file?'}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this file?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleDeleteClose} color="primary">
                    No
                  </Button>
                  <Button
                    onClick={this.deleteFile}
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
