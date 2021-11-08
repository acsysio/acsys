import React, { useEffect, useState } from 'react';
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
import * as Acsys from '../utils/Acsys/Acsys';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import MessageDialog from '../components/Dialogs/MessageDialog';
import ImageDialog from '../components/Dialogs/ImageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';
import NewFolderDialog from '../components/Dialogs/NewFolderDialog';

const Storage = (props) => {
  const [locked, setlocked] = useState(true);
  const [isDialog, setisDialog] = useState(false);
  const [mode, setmode] = useState('');
  const [imgUrl, setimgUrl] = useState(undefined);
  const [con, setcon] = useState(true);
  const [currentDir, setcurrentDir] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [files, setfiles] = useState([]);
  const [uploadFile, setuploadFile] = useState('');
  const [page, setpage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [openMessage, setopenMessage] = useState(false);
  const [loading, setloading] = useState(false);
  const [syncing, setsyncing] = useState(false);
  const [newFolder, setnewFolder] = useState(false);
  const [isOpenImage, setIsOpenImage] = useState(false);
  const [messageTitle, setmessageTitle] = useState('');
  const [message, setmessage] = useState('');
  const [seterror] = useState('');
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [deleting, setdeleting] = useState(false);

  const set = (name, ref) => {
    try {
      props.setFile(name, ref);
    } catch (error) {}
  };

  const closeMessage = () => {
    setopenMessage(false);
  };

  const openDir = async (dir) => {
    setloading(true);
    const parentDir = files[0].parent;
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
    setloading(false);
    setpreviousDir(parentDir);
    setcurrentDir('/' + dir);
    setfiles(files);
  };

  const openDirPage = async (dir) => {
    props.history.push('/Storage?' + dir);
    setlocked(false);
  };

  const previousDir = async () => {
    setloading(true);
    let parentFile = '/';
    let currentDir;
    let files;
    if (previousDir !== '/') {
      const parent = await Acsys.getData(
        'acsys_storage_items',
        [['acsys_id', '=', previousDir]],
        1
      );
      parentFile = parent[0].parent;
      currentDir = '/' + previousDir;
      files = await Acsys.getData('acsys_storage_items', [
        ['parent', '=', previousDir],
      ]);
    } else {
      currentDir = previousDir;
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

    setloading(false);
    setpreviousDir(parentFile);
    setcurrentDir(currentDir);
    setfiles(files);
  };

  const setRef = (ref) => {
    setuploadFile(ref);
  };

  const uploadFileFunc = async () => {
    try {
      setloading(true);
      await Acsys.uploadFile(uploadFile.files[0], currentDir).then(async () => {
        await loadFiles();
      });
      setloading(false);
    } catch (error) {}
  };

  const syncFiles = async () => {
    handleSyncClose();
    setloading(true);
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
    setloading(false);
    setfiles(files);
  };

  const handleSyncOpen = () => {
    setsyncing(true);
  };

  const handleSyncClose = () => {
    setsyncing(false);
  };

  const openImg = (url) => {
    setIsOpenImage(true);
    setimgUrl(url);
  };

  const handleImgClose = () => {
    setIsOpenImage(false);
  };

  const handleChange = (event) => {
    setNewFolderName(event);
  };

  const newFolderOpen = () => {
    setnewFolder(true);
  };

  const newFolderClose = () => {
    setnewFolder(false);
  };

  const createNewFolder = async () => {
    if (newFolderName.indexOf(' ') >= 0) {
      setnewFolder(false);
      setopenMessage(true);
      setmessageTitle('Error');
      setmessage('Folder name cannot contain spaces.');
    } else {
      setloading(true);
      setnewFolder(false);
      await Acsys.createNewFolder(newFolderName, currentDir);
      await loadFiles();
      setloading(false);
    }
  };

  const makeFilePublic = async (fileName) => {
    setloading(true);
    await Acsys.makeFilePublic(fileName)
      .then(async () => {
        await loadFiles();
      })
      .catch((error) => seterror(error));
    setloading(false);
  };

  const makeFilePrivate = async (fileName) => {
    setloading(true);
    await Acsys.makeFilePrivate(fileName)
      .then(async () => {
        await loadFiles();
      })
      .catch((error) => seterror(error));
    setloading(false);
  };

  const deleteFile = async () => {
    setdeleteLoading(true);
    await Acsys.deleteFile(fileName)
      .then(async () => {
        await loadFiles();
      })
      .catch((error) => seterror(error));
    handleDeleteClose();
  };

  const handleDeleteOpen = async (fileName) => {
    setdeleting(true);
    setfileName(fileName);
  };

  const handleDeleteClose = () => {
    setdeleting(false);
    setdeleteLoading(false);
  };

  const loadFiles = async () => {
    setTimeout(() => {}, 1000);
    let dir = currentDir;
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
    setfiles(files);
  };

  const handleChangePage = (event, page) => {
    setpage(page);
  };

  useEffect(async () => {
    try {
      if (
        props.location.search.substring(1) !== currentDir.substring(1) &&
        !locked
      ) {
        let newDir = props.location.search.substring(1);
        if (newDir.length < 1) {
          newDir = '/';
        }
        setlocked(true);
        setloading(true);
        setIsOpenImage(false);
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
        setlocked(false);
        setloading(false);
        setcurrentDir(currentDir);
        setfiles(files);
      }
    } catch (error) {}
  }, [locked, currentDir, props.location]);

  useEffect(async () => {
    setloading(true);
    let parent = '/';
    let mode = 'standard';

    try {
      if (props.mode.length > 0) {
        mode = props.mode;
      }
    } catch (error) {
      props.setHeader('Storage');
    }
    let con;
    let files;
    try {
      con = await Acsys.isStorageConnected();
      if (!con) {
        setloading(false);
        setcon(con);
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
    setloading(false);
    setisDialog(isDialog);
    setmode(mode);
    setcon(con);
    setfiles(files);
  }, []);

  const getPrevButton = () => {
    return mode !== 'standard' ? (
      <Grid item>
        <Tooltip title="Back">
          <IconButton onClick={() => previousDir()}>
            <KeyboardArrowLeft color="inherit" />
          </IconButton>
        </Tooltip>
      </Grid>
    ) : (
      <div></div>
    );
  };
  const renderIcon = (content_type, url) => {
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
            onClick={() => openImg(url)}
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
  };
  const renderName = (id, content_type, name) => {
    if (content_type === 'Folder') {
      if (mode === 'standard') {
        return (
          <TableCell>
            <a onClick={() => openDirPage(id)} style={{ cursor: 'pointer' }}>
              {name}
            </a>
          </TableCell>
        );
      } else {
        return (
          <TableCell>
            <a onClick={() => openDir(id)} style={{ cursor: 'pointer' }}>
              {name}
            </a>
          </TableCell>
        );
      }
    } else {
      if (mode === 'standard') {
        return (
          <TableCell>
            <a>{name}</a>
          </TableCell>
        );
      } else {
        return (
          <TableCell>
            <a onClick={() => set(name, id)} style={{ cursor: 'pointer' }}>
              {name}
            </a>
          </TableCell>
        );
      }
    }
  };
  const renderTableData = () => {
    return files
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((file, index) => {
        const { acsys_id, name, content_type, updated, is_public, url } = file;
        if (name.length > 0) {
          return (
            <TableRow key={index}>
              {renderIcon(content_type, url, name)}
              {renderName(acsys_id, content_type, name)}
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
                        onClick={() => makeFilePrivate(acsys_id)}
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
                        onClick={() => makeFilePublic(acsys_id)}
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
                      onClick={() => handleDeleteOpen(acsys_id)}
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
  };

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
                    {getPrevButton()}
                    <Grid item style={{ minWidth: 20 }}>
                      <Tooltip title="Scan For File Updates">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSyncOpen}
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
                        ref={setRef}
                        onChange={uploadFileFunc}
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
                          onClick={newFolderOpen}
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
                    {getPrevButton()}
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
                <TableBody>{renderTableData()}</TableBody>
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
              onChangePage={handleChangePage}
              // onChangeRowsPerPage={handleChangeRowsPerPage}
            />
            <LoadingDialog loading={loading} message={'Loading'} />
            <MessageDialog
              open={openMessage}
              closeDialog={closeMessage}
              title={messageTitle}
              message={message}
            />
            <YesNoDialog
              open={syncing}
              closeDialog={handleSyncClose}
              title={'Sync files?'}
              message={
                'Are you sure you want to resync files? This operation can require multiple writes.'
              }
              action={syncFiles}
            />
            <ImageDialog
              open={isOpenImage}
              closeDialog={handleImgClose}
              imgUrl={imgUrl}
            />
            <NewFolderDialog
              open={newFolder}
              closeDialog={newFolderClose}
              handleChange={handleChange}
              createNewFolder={createNewFolder}
            />
            <YesNoDialog
              open={deleting}
              closeDialog={handleDeleteClose}
              title={'Delete file?'}
              message={'Are you sure you want to delete this file?'}
              action={deleteFile}
              actionProcess={deleteLoading}
            />
          </Paper>
        </div>
      );
    } catch (error) {
      console.log('error', error);
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
};
export default Storage;
