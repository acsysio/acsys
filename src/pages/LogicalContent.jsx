import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {
  Create as CreateIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysContext } from '../utils/Session/AcsysProvider';
import AddViewDialog from '../components/Dialogs/AddViewDialog';
import EditViewDialog from '../components/Dialogs/EditViewDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

let tempView = [];
let position = 0;

const LogicalContent = (props) => {
  const [viewId, setViewId] = useState('');
  const [name, setName] = useState('');
  const [collectionArr, setCollectionArr] = useState([]);
  const [collection, setCollection] = useState('');
  const [description, setDescription] = useState('');
  const [views, setViews] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const context = useContext(AcsysContext);
  const [projectName, setProjectName] = useState('');

  const setPosition = (pos) => {
    position = pos;
  };

  const setTempName = (value) => {
    tempView['name'] = value;
  };

  const setTempDescription = (value) => {
    tempView['description'] = value;
  };

  const deleteView = async () => {
    setDeleteLoading(true);
    if (viewId.length > 0) {
      await Acsys.deleteView(viewId);
    }
    handleDeleteClose();
    mount();
  };

  const handleChangePage = (event, page) => {
    setPage(page);
  };

  const handleClickOpen = async () => {
    let collections = [];
    await Acsys.getTables().then((json) => {
      collections = json;
      setCollectionArr(collections);
      setOpen(true);
    });
  };

  const handleClose = () => {
    setOpen(false);
    setAddLoading(false);
  };

  const handleEditOpen = (view) => {
    tempView = view;
    position = tempView.position;
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const editView = async () => {
    if (position === tempView.position) {
      await Acsys.updateData('acsys_logical_content', tempView, [
        ['acsys_id', '=', tempView.acsys_id],
      ]);
    } else {
      const oldPosition = tempView['position'];
      tempView['position'] = position;
      await Acsys.repositionViews(tempView, oldPosition, position);
      await sleep(1000);
    }
    const currentView = await Acsys.getData('acsys_logical_content', [], '', [
      'position',
    ]);
    setSaveLoading(false);
    setEditOpen(false);
    setViews(currentView);
  };

  const handleDeleteOpen = async (viewId) => {
    setDeleting(true);
    setViewId(viewId);
  };

  const handleDeleteClose = () => {
    setDeleting(false);
    setDeleteLoading(false);
  };

  const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  useEffect(() => {
    mount();
  }, []);

  const mount = async () => {
    context.setHeader('Content');
    context.setHeld(false);
    tempView = [];
    setLoading(true);
    let projectName = '';

    await Acsys.getProjectName().then((result) => {
      projectName = result;
    });

    let currentView = [];

    currentView = await Acsys.getData('acsys_logical_content', [], '', [
      'position',
    ]);

    setLoading(false);
    setProjectName(projectName);
    setViews(currentView);
    setLoading(false);
  };

  const addView = async () => {
    setAddLoading(true);

    await Acsys.createView(name, description, collection);

    setAddLoading(false);
    handleClose();
    mount();
  };

  const renderTableData = () => {
    return views
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((views, key) => {
        const { name, description, viewId, source_collection, table_keys } =
          views;
        return (
          <TableRow key={key}>
            {table_keys.length < 1 ? (
              <TableCell
                to={{
                  pathname:
                    '/CollectionView/' + source_collection + '/' + viewId,
                }}
                state={{
                  table_keys: [],
                  view: name,
                }}
                component={Link}
                style={{ minWidth: 150 }}
              >
                {name}
              </TableCell>
            ) : (
              <TableCell
                to={{
                  pathname: '/DocumentView',
                }}
                state={{
                  mode: 'update',
                  table_keys: views.table_keys,
                  routed: true,
                  viewId: views.viewId,
                }}
                component={Link}
                style={{ minWidth: 150 }}
              >
                {name}
              </TableCell>
            )}
            {table_keys.length < 1 ? (
              <TableCell
                to={{
                  pathname:
                    '/CollectionView/' + source_collection + '/' + viewId,
                }}
                state={{
                  table_keys: [],
                  view: name,
                }}
                component={Link}
                style={{ width: '100%' }}
              >
                {description}
              </TableCell>
            ) : (
              <TableCell
                to={{
                  pathname: '/DocumentView',
                }}
                state={{
                  mode: 'update',
                  table_keys: views.table_keys,
                  routed: true,
                  viewId: views.viewId,
                }}
                component={Link}
              >
                {description}
              </TableCell>
            )}
            {Acsys.getMode() === 'Administrator' ? (
              <TableCell style={{ minWidth: 70 }} align="right">
                <Tooltip title="Edit View">
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="edit"
                    onClick={() => handleEditOpen(views)}
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
                    onClick={() => handleDeleteOpen(viewId)}
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
              {Acsys.getMode() === 'Administrator' ? (
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
                        onClick={handleClickOpen}
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
                  {Acsys.getMode() === 'Administrator' ? (
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
          />
          <LoadingDialog loading={loading} message={'Loading'} />
          <AddViewDialog
            open={open}
            closeDialog={handleClose}
            title={'Add Logical View'}
            collection={collection}
            setCollection={(value) => setCollection(value)}
            collectionArr={collectionArr}
            setName={(value) => setName(value)}
            setDescription={(value) => setDescription(value)}
            action={addView}
            actionProcess={addLoading}
          />
          <EditViewDialog
            open={editOpen}
            closeDialog={handleEditClose}
            title={'Edit Logical View'}
            position={tempView.position}
            setPosition={setPosition}
            views={views}
            name={tempView.name}
            setName={setTempName}
            description={tempView.description}
            setDescription={setTempDescription}
            action={editView}
            actionProcess={saveLoading}
          />
          <YesNoDialog
            open={deleting}
            closeDialog={handleDeleteClose}
            title={'Delete data?'}
            message={'Are you sure you want to delete this data?'}
            action={deleteView}
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
};
export default LogicalContent;
