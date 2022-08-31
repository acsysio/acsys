import {
  FormControl,
  Hidden,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
} from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { FileCopyOutlined as CopyIcon } from '@mui/icons-material';
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HTML5Backend } from 'react-dnd-html5-backend';
import * as Acsys from '../utils/Acsys/Acsys';
import { AcsysContext } from '../utils/Session/AcsysProvider';
import AutoGen from '../components/Controls/AutoGen';
import BooleanSelect from '../components/Controls/BooleanSelect';
import DateTimePicker from '../components/Controls/DateTimePicker';
import ImageReference from '../components/Controls/ImageReference';
import ImageURL from '../components/Controls/ImageURL';
import NumberEditor from '../components/Controls/NumberEditor';
import RichTextEditor from '../components/Controls/RichTextEditor';
import TextField from '../components/Controls/TextField';
import VideoReference from '../components/Controls/VideoReference';
import VideoURL from '../components/Controls/VideoURL';
import FieldDef from '../components/FieldControl/FieldDef';
import FieldControlDialog from '../components/Dialogs/FieldControlDialog';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import StorageDialog from '../components/Dialogs/StorageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';
import DropDown from '../components/Controls/DropDown';

let initLoad = true;
let table_keys = [];
let tempDetails = [];
let tempDocument = [];
let fileDoc = [];
let fileRefs = [];
let mode = '';
let is_removable = true;
let quillRef = null;
let quillIndex = 0;
let quillURL = '';

const DocumentView = (props) => {
  const context = useContext(AcsysContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [collection, setCollection] = useState('');
  const [documentDetails, setdocumentDetails] = useState([]);
  const [fileMode, setfileMode] = useState('');
  const [draft, setdraft] = useState(location.state.draft);
  const [views, setviews] = useState([]);
  const [apiCall, setapiCall] = useState('');
  const [keys, setkeys] = useState([]);
  const [acsysView, setacsysView] = useState([]);
  const [routed, setrouted] = useState(false);
  const [position, setPosition] = useState(0);
  const [locked, setLocked] = useState(true);
  const [loading, setloading] = useState(false);
  const [deleting, setdeleting] = useState(false);
  const [deleteLoading, setdeleteLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setsaving] = useState(false);
  const [fileSelect, setfileSelect] = useState(false);
  const [filterLoading, setfilterLoading] = useState(false);
  const [error, setError] = useState('');
  const [control, setcontrol] = useState('');

  const copy = () => {
    const el = document.createElement('textarea');
    el.value = apiCall;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  const imageHandler = async () => {
    const quill = quillRef.getEditor();
    quillIndex = quill.getSelection().index;
    openSelector('quill', 'quill');
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteOpen = async () => {
    setdeleting(true);
  };

  const handleDeleteClose = () => {
    setdeleting(false);
    setdeleteLoading(false);
  };

  const openSelector = (mode, control) => {
    setfileMode(mode);
    setfileSelect(true);
    setcontrol(control);
  };

  const setQuillRef = (ref) => {
    quillRef = ref;
  };

  const setQuillIndex = (index) => {
    quillIndex = index;
  };

  const setQuillURL = (url) => {
    quillURL = url;
  };

  const setReference = async (name, reference) => {
    const field = control;
    const url = await Acsys.getStorageURL(reference);
    if (fileMode === 'quill') {
      quillURL = url;
    } else if (fileMode === 'ref') {
      fileDoc[field] = reference;
      fileRefs[field] = url;
    } else {
      fileDoc[field] = url;
      fileRefs[field] = url;
    }
    setfileSelect(false);
  };

  const removeFile = (control) => {
    setloading(true);
    tempDocument[control] = '';
    fileRefs[control] = '';
    fileDoc[control] = '';
    setloading(false);
  };

  const handleSelectClose = () => {
    setfileSelect(false);
  };

  const handleChange = (key, event) => {
    tempDocument[key] = event;
  };

  const saveDocument = async () => {
    setsaving(true);
    if (mode === 'update') {
      for (var i = 0; i < tempDetails.length; i++) {
        if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
      }
      const result = await Acsys.updateData(
        'acsys_' + collection,
        { ...tempDocument },
        keys
      );
    } else {
      let uFields = [];
      for (var i = 0; i < tempDetails.length; i++) {
        if (tempDetails[i].control === 'autoGen') {
          uFields.push(tempDetails[i].field_name);
        } else if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else if (tempDetails[i].control === 'dropDown') {
            await Acsys.getData('acsys_details_dropdown', [
              ['acsys_id', '=', tempDetails[i].acsys_id],
              ['field_name', '=', tempDetails[i].field_name],
            ])
              .then(async (result) => {
                if (result.length > 0) {
                  const data = result[0];
                  tempDocument[tempDetails[i].field_name] =
                    data.field.split(',')[0];
                }
              })
              .catch(() => {});
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
      }
      if (uFields.length > 0) {
        const response = await Acsys.insertWithUID(
          'acsys_' + collection,
          {
            ...tempDocument,
          },
          uFields
        );
        if (response.fields) {
          const data = response.fields;
          for (let i = 0; i < data.length; i++) {
            tempDocument[data[i].field] = data[i].value;
          }
        }
      } else {
        await Acsys.insertData('acsys_' + collection, {
          ...tempDocument,
        });
      }
    }
    table_keys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      if (tempDetails[i].is_key) {
        const object = {
          field: tempDetails[i].field_name,
          value: tempDocument[tempDetails[i].field_name],
        };
        table_keys.push(object);
      }
    }
    if (mode !== 'update') {
      mode = 'update';
      is_removable = true;
      mount();
    }
    setsaving(false);
  };

  const publishDocument = async () => {
    setsaving(true);
    if (mode === 'update') {
      for (var i = 0; i < tempDetails.length; i++) {
        if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
      }
      if (draft) {
        for (var i = 0; i < tempDetails.length; i++) {
          const result = await Acsys.updateData(
            'acsys_document_details',
            { ...tempDetails[i] },
            [['acsys_id', '=', tempDetails[i].acsys_id]]
          );
        }
        const result = await Acsys.insertData(
          collection,
          { ...tempDocument },
          keys
        );
        await Acsys.deleteData('acsys_' + collection, keys)
          .then(() => {
            setdraft(false);
          })
          .catch((error) => {});
      } else {
        const result = await Acsys.updateData(
          collection,
          { ...tempDocument },
          keys
        );
      }
    } else {
      let uFields = [];
      for (var i = 0; i < tempDetails.length; i++) {
        if (tempDetails[i].control === 'autoGen') {
          uFields.push(tempDetails[i].field_name);
        } else if (fileDoc[tempDetails[i].field_name] !== undefined) {
          tempDocument[tempDetails[i].field_name] =
            fileDoc[tempDetails[i].field_name];
        } else if (tempDocument[tempDetails[i].field_name] === undefined) {
          if (tempDetails[i].control === 'numberEditor') {
            tempDocument[tempDetails[i].field_name] = 0;
          } else if (tempDetails[i].control === 'booleanSelect') {
            tempDocument[tempDetails[i].field_name] = false;
          } else if (tempDetails[i].control === 'dropDown') {
            await Acsys.getData('acsys_details_dropdown', [
              ['acsys_id', '=', tempDetails[i].acsys_id],
              ['field_name', '=', tempDetails[i].field_name],
            ])
              .then(async (result) => {
                if (result.length > 0) {
                  const data = result[0];
                  tempDocument[tempDetails[i].field_name] =
                    data.field.split(',')[0];
                }
              })
              .catch(() => {});
          } else {
            tempDocument[tempDetails[i].field_name] = '';
          }
        }
      }
      if (uFields.length > 0) {
        const response = await Acsys.insertWithUID(
          collection,
          {
            ...tempDocument,
          },
          uFields
        );
        if (response.fields) {
          const data = response.fields;
          for (let i = 0; i < data.length; i++) {
            tempDocument[data[i].field] = data[i].value;
          }
        }
      } else {
        await Acsys.insertData(collection, {
          ...tempDocument,
        });
      }
    }
    table_keys = [];
    for (var i = 0; i < tempDetails.length; i++) {
      if (tempDetails[i].is_key) {
        const object = {
          field: tempDetails[i].field_name,
          value: tempDocument[tempDetails[i].field_name],
        };
        table_keys.push(object);
      }
    }
    if (mode !== 'update') {
      mode = 'update';
      is_removable = true;
      mount();
    }
    setsaving(false);
  };

  const saveSettings = async () => {
    setfilterLoading(true);

    for (var i = 0; i < tempDetails.length; i++) {
      tempDetails[i].view_order = i;
      if (tempDetails[i].data !== undefined) {
        if (tempDetails[i].data === true) {
          await Acsys.deleteData('acsys_details_dropdown', [
            ['acsys_id', '=', tempDetails[i].acsys_id],
            ['field_name', '=', tempDetails[i].field_name],
          ]);
        } else {
          await Acsys.getData('acsys_details_dropdown', [
            ['acsys_id', '=', tempDetails[i].acsys_id],
            ['field_name', '=', tempDetails[i].field_name],
          ])
            .then(async (result) => {
              const entry = {
                acsys_id: tempDetails[i].acsys_id,
                field_name: tempDetails[i].field_name,
                field: tempDetails[i].data,
              };
              if (result.length > 0) {
                await Acsys.updateData('acsys_details_dropdown', entry, [
                  ['acsys_id', '=', tempDetails[i].acsys_id],
                  ['field_name', '=', tempDetails[i].field_name],
                ]);
              } else {
                await Acsys.insertData('acsys_details_dropdown', entry);
              }
            })
            .catch(() => {});
        }
        delete tempDetails[i].data;
      }
      const result = await Acsys.updateData(
        'acsys_document_details',
        { ...tempDetails[i] },
        [['acsys_id', '=', tempDetails[i].acsys_id]]
      );
    }
    setfilterLoading(false);
    handleClose();
  };

  const saveView = async (value) => {
    setloading(true);

    var tempView = acsysView;

    if (value) {
      tempView['table_keys'] = JSON.stringify(location.state.table_keys);
    } else {
      tempView['table_keys'] = [];
    }

    for (var i = 0; i < tempDetails.length; i++) {
      const result = await Acsys.updateData('acsys_logical_content', tempView, [
        ['viewId', '=', location.state.viewId],
      ]);
    }
    setloading(false);
  };

  const deleteView = async () => {
    setdeleteLoading(true);
    let collection;
    if (draft) {
      collection = 'acsys_' + documentDetails[0].collection;
    } else {
      collection = documentDetails[0].collection;
    }
    await Acsys.deleteData(collection, keys)
      .then(() => {
        handleDeleteClose();
        setdeleteLoading(false);
        navigate(-1);
      })
      .catch((error) => {
        handleDeleteClose();
        setError(error);
        setdeleteLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    initLoad = true;
    table_keys = [];
    tempDetails = [];
    tempDocument = [];
    fileDoc = [];
    fileRefs = [];
    is_removable = true;
    quillRef = null;
    quillIndex = 0;
    quillURL = '';
    try {
      context.setHeader('Content');
      let tempMode = mode;
      let routedLocal = routed;
      const acsysView = await Acsys.getData('acsys_logical_content', [
        ['viewId', '=', location.state.viewId],
      ]);
      if (acsysView[0].table_keys.length > 0) {
        routedLocal = true;
      }
      try {
        mode = location.state.mode;
        is_removable = location.state.is_removable;
        if (routedLocal) {
          table_keys = JSON.parse(location.state.table_keys);
        } else {
          table_keys = location.state.table_keys;
        }
      } catch (error) {
        mode = tempMode;
      }
      setloading(true);
      setrouted(routedLocal);
      setacsysView(acsysView[0]);
      tempDocument = [];
      fileRefs = [];
      mount();
    } catch (error) {}
  };

  const mount = async () => {
    let documentDetails;
    try {
      documentDetails = await Acsys.getData('acsys_document_details', [
        ['content_id', '=', location.state.viewId],
      ]);
    } catch (error) {
      documentDetails = documentDetails;
    }
    let table = documentDetails[0].collection;
    let draft = false;
    let keys = [];
    let apiCall;
    let position = 0;
    let open = false;
    try {
      documentDetails.sort((a, b) => (a.view_order > b.view_order ? 1 : -1));
      tempDetails = documentDetails;

      if (mode === 'update') {
        let pullView;

        for (let i = 0; i < table_keys.length; i++) {
          keys.push([table_keys[i].field, '=', table_keys[i].value]);
        }
        if (draft) {
          await Acsys.getData('acsys_' + table, keys).then((result) => {
            pullView = result;
            draft = true;
          });
        } else {
          await Acsys.getData(table, keys)
            .then((result) => {
              pullView = result;
            })
            .catch(async () => {});
        }
        await Acsys.getData('acsys_open_tables', [['table_name', '=', table]])
          .then(async (result) => {
            if (result[0].table_name === table) {
              open = true;
            }
          })
          .catch(() => {});

        apiCall = await Acsys.getOpenUrl(table, keys);

        let currentView;

        if (pullView[0] === undefined) {
          currentView = pullView;
        } else {
          currentView = pullView[0];
        }

        for (let i = 0; i < documentDetails.length; i++) {
          if (
            documentDetails[i].control === 'imageReference' ||
            documentDetails[i].control === 'videoReference'
          ) {
            fileRefs[documentDetails[i].field_name] = await Acsys.getStorageURL(
              currentView[documentDetails[i].field_name]
            );
            fileDoc[documentDetails[i].field_name] =
              currentView[documentDetails[i].field_name];
          } else if (
            documentDetails[i].control === 'imageURL' ||
            documentDetails[i].control === 'videoURL'
          ) {
            fileRefs[documentDetails[i].field_name] =
              currentView[documentDetails[i].field_name];
            fileDoc[documentDetails[i].field_name] =
              currentView[documentDetails[i].field_name];
          }
        }

        setviews(currentView);
      } else {
        draft = true;
      }
      setloading(false);
      setdraft(draft);
      setsaving(false);
      setdocumentDetails(documentDetails);
      setLocked(!open);
      setCollection(table);
      setapiCall(apiCall);
      setkeys(keys);
      setPosition(position);
    } catch (error) {
      setloading(false);
      console.log(error);
    }
  };

  const renderData = () => {
    if (mode === 'update') {
      return <div>{renderWithId()}</div>;
    } else {
      return <div>{renderNoId()}</div>;
    }
  };

  const renderWithId = () => {
    return (
      <div className="element-container">
        <Grid container spacing={3}>
          {Object.values(documentDetails).map((details, dindex) => {
            return Object.values(views).map((value, index) => {
              let currentKey = Object.keys(views)[index];
              if (initLoad) {
                handleChange(currentKey, value);
                if (documentDetails.length - 1 === dindex) {
                  initLoad = false;
                }
              }
              if (
                currentKey == details.field_name &&
                details.is_visible_on_page
              ) {
                const date = new Date(value);
                return renderComponent(details, currentKey, date);
              }
            });
          })}
        </Grid>
      </div>
    );
  };

  const renderNoId = () => {
    return (
      <div className="element-container">
        <Grid container spacing={3}>
          {Object.values(documentDetails).map((details, dindex) => {
            let currentKey = details.field_name;
            if (details.is_visible_on_page) {
              let date;
              if (initLoad) {
                if (
                  details.control == 'dateTimePicker' ||
                  details.control == 'timePicker'
                ) {
                  date = new Date();
                  handleChange(currentKey, date);
                }
                if (documentDetails.length - 1 === dindex) {
                  initLoad = false;
                }
              } else {
                date = tempDocument[currentKey];
              }
              return renderComponent(details, currentKey, date);
            }
          })}
        </Grid>
      </div>
    );
  };

  const renderComponent = (details, currentKey, date) => {
    if (details.control == 'autoGen') {
      return (
        <AutoGen
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
        />
      );
    } else if (details.control == 'textEditor') {
      return (
        <TextField
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'timePicker') {
      return (
        <DateTimePicker
          width={details.width}
          field_name={details.field_name}
          defaultValue={date}
          handleChange={handleChange}
          currentKey={currentKey}
          dateFormat={false}
        />
      );
    } else if (details.control == 'dateTimePicker') {
      return (
        <DateTimePicker
          width={details.width}
          field_name={details.field_name}
          defaultValue={date}
          handleChange={handleChange}
          currentKey={currentKey}
          dateFormat={true}
        />
      );
    } else if (details.control == 'dropDown') {
      return (
        <DropDown
          width={details.width}
          acsys_id={details.acsys_id}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
          pivot={filterLoading}
        />
      );
    } else if (details.control == 'numberEditor') {
      return (
        <NumberEditor
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'richTextEditor') {
      return (
        <RichTextEditor
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
          imageHandler={imageHandler}
          setQuillRef={setQuillRef}
          setQuillIndex={setQuillIndex}
          setQuillURL={setQuillURL}
          index={quillIndex}
          quillRef={quillRef}
          url={quillURL}
        />
      );
    } else if (details.control == 'booleanSelect') {
      return (
        <BooleanSelect
          width={details.width}
          field_name={details.field_name}
          defaultValue={tempDocument[currentKey]}
          handleChange={handleChange}
          currentKey={currentKey}
        />
      );
    } else if (details.control == 'imageReference') {
      const url = fileRefs[details.field_name];
      return (
        <ImageReference
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    } else if (details.control == 'imageURL') {
      const url = fileRefs[details.field_name];
      return (
        <ImageURL
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    } else if (details.control == 'videoReference') {
      const url = fileRefs[details.field_name];
      return (
        <VideoReference
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    } else if (details.control == 'videoURL') {
      const url = fileRefs[details.field_name];
      return (
        <VideoURL
          width={details.width}
          field_name={details.field_name}
          url={url}
          openSelector={openSelector}
          removeFile={removeFile}
        />
      );
    }
  };

  return (
    <div style={{ minHeight: 600 }}>
      {context.getMode() !== 'Viewer' ? (
        <div>
          {!location.state.routed && is_removable ? (
            <Tooltip title="Delete Entry">
              <Button
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                variant="contained"
                color="primary"
                onClick={handleDeleteOpen}
              >
                Delete
              </Button>
            </Tooltip>
          ) : (
            <div />
          )}
          <Tooltip title="Publish Entry">
            <Button
              style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
              variant="contained"
              color="primary"
              onClick={publishDocument}
            >
              Publish
            </Button>
          </Tooltip>
          {draft ? (
            <Tooltip title="Save Entry As Draft">
              <Button
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                variant="contained"
                color="primary"
                onClick={saveDocument}
              >
                Save Draft
              </Button>
            </Tooltip>
          ) : (
            <div></div>
          )}
          {context.getMode() === 'Administrator' ? (
            <Tooltip title="Change How Data Is Presented">
              <Button
                style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
              >
                Field Controls
              </Button>
            </Tooltip>
          ) : (
            <div />
          )}
          {context.getMode() === 'Administrator' ? (
            <FormControl
              variant="standard"
              sx={{ m: 1, minWidth: 120, float: 'right' }}
            >
              <Select
                defaultValue={location.state.routed}
                onChange={(e) => saveView(e.target.value)}
              >
                <MenuItem value={false}>Accessed From Table</MenuItem>
                <MenuItem value={true}>Accessed From View</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <div />
          )}
        </div>
      ) : (
        <div />
      )}
      <Paper style={{ margin: 'auto', clear: 'both' }}>
        <div>
          {renderData()}
          <div className="element-container">
            <div style={{ height: 40 }}></div>
          </div>
        </div>
        <LoadingDialog loading={loading} message={'Loading'} />
        <LoadingDialog loading={saving} message={'Saving'} />
        <FieldControlDialog
          open={open}
          closeDialog={handleClose}
          title={'Field Controls'}
          backend={HTML5Backend}
          component={
            <FieldDef docDetails={tempDetails} handleClick={saveSettings} />
          }
          action={saveSettings}
          actionProcess={filterLoading}
        />
        <StorageDialog
          open={fileSelect}
          closeDialog={handleSelectClose}
          fileMode={fileMode}
          docDetails={tempDetails}
          control={control}
          setReference={setReference}
        />
        <YesNoDialog
          open={deleting}
          closeDialog={handleDeleteClose}
          title={'Delete data?'}
          message={'Are you sure you want to delete this entry?'}
          action={deleteView}
          actionProcess={deleteLoading}
        />
      </Paper>
      <Hidden smDown implementation="css">
        {!locked ? (
          <div style={{ clear: 'both' }}>
            API Call:{' '}
            <a className="api-url" href={apiCall} target="_blank">
              {apiCall}
            </a>
            <Tooltip title="Copy To Clipboard">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="edit"
                onClick={copy}
                style={{ marginLeft: 5 }}
              >
                <CopyIcon style={{ height: 15 }} />
              </IconButton>
            </Tooltip>
          </div>
        ) : (
          <div />
        )}
      </Hidden>
    </div>
  );
};
export default DocumentView;
